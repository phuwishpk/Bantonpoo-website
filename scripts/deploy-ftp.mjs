#!/usr/bin/env node
/**
 * Deploy ขึ้นโฮสต์ Plesk แบบแชร์ผ่าน FTP — ไม่ต้องใช้ SSH
 *
 *   npm run deploy           อัปเดตเว็บ (ใช้เนื้อหาจริงบนเซิร์ฟเวอร์ตอน build)
 *   npm run deploy:init      ติดตั้งครั้งแรก (ใส่เนื้อหาตั้งต้นให้ด้วย)
 *   npm run deploy:rollback  สลับกลับไปใช้เวอร์ชันก่อนหน้า
 *
 * ค่าที่ต้องมี อ่านจาก .env.deploy.local (อยู่ใน .gitignore) หรือจากตัวแปรสภาพแวดล้อม
 *   FTP_PASSWORD     รหัสผ่านของ system user (ตั้งใน Plesk → Hosting → System user's credentials)
 *
 * ค่าที่ตั้งเพิ่มได้ (มีค่าตั้งต้นแล้ว)
 *   DEPLOY_SITE_URL  โดเมนของเว็บ           ค่าตั้งต้น https://bantonpoo.phuwish.com
 *   DEPLOY_NOINDEX   1 = กัน Google เก็บดัชนี ค่าตั้งต้น 1 (ตั้งเป็น 0 เมื่อเปิดเว็บจริง)
 *   FTP_WORKERS      จำนวนการเชื่อมต่อพร้อมกัน ค่าตั้งต้น 4 (ลดลงถ้าโฮสต์จำกัด)
 *
 * ลำดับการทำงาน
 *   1. ตรวจโค้ด
 *   2. ดาวน์โหลดฐานข้อมูลจริงลงมาอ่าน (ครั้งแรก: สร้างเนื้อหาตั้งต้นแล้วอัปโหลดขึ้นไปแทน)
 *   3. build — แอปปรับโครงสำเนาฐานข้อมูลให้ตรงกับโค้ดเองระหว่างนี้
 *   4. อัปโหลดบิลด์ไปโฟลเดอร์ชั่วคราว แล้วสลับชื่อกับของเดิม
 *      เว็บจริงจึงไม่เคยอยู่ในสภาพไฟล์ครึ่ง ๆ กลาง ๆ และย้อนกลับได้ทันที
 *   5. วางไฟล์ tmp/restart.txt ให้ Passenger รีสตาร์ต — แอปปรับโครงฐานข้อมูลจริงเองตอนเปิด
 *
 * ค่าตั้งของแอป (ฐานข้อมูล กุญแจลับ) อยู่ในไฟล์ bantonpoo-data/app.env บนเซิร์ฟเวอร์
 * เพราะโฮสต์นี้ไม่ส่ง Custom environment variables ของ Plesk มาถึงแอป
 * สคริปต์สร้างไฟล์ให้ครั้งแรก (สุ่ม PAYLOAD_SECRET) และไม่เปลี่ยนกุญแจอีก
 *
 * ไม่มีขั้นตอนไหนเขียนทับฐานข้อมูลจริงบนเซิร์ฟเวอร์ ยกเว้นตอนติดตั้งครั้งแรก
 * ซึ่งจะตรวจก่อนเสมอว่ายังไม่มีไฟล์อยู่
 */
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { cp, lstat, mkdir, mkdtemp, readdir, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { posix } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import { Client } from "basic-ftp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODE = process.argv.includes("--init")
  ? "init"
  : process.argv.includes("--rollback")
    ? "rollback"
    : "update";
const FORCE = process.argv.includes("--force");

/* ------------------------------------------------------------------
   ค่าตั้งต้น
   ------------------------------------------------------------------ */

loadEnvFile(path.join(ROOT, ".env.deploy.local"));

const env = (name, fallback) => {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") fail(`ยังไม่ได้ตั้ง ${name} — ใส่ใน .env.deploy.local`);
  return value;
};

const FTP = {
  // ใช้ชื่อเครื่องแทนไอพี เพราะใบรับรอง TLS ของ FTP ออกให้ชื่อนี้ (ชี้ไอพีเดียวกัน 103.80.48.25)
  host: env("FTP_HOST", "thsv25.hostatom.com"),
  port: Number(process.env.FTP_PORT ?? 21),
  user: env("FTP_USER", "phuwishs"),
  password: env("FTP_PASSWORD"),
  // explicit TLS (FTPS) — ห้ามส่งรหัสผ่านแบบไม่เข้ารหัส
  secure: process.env.FTP_SECURE === "0" ? false : true,
  // ใบรับรองของ FTP บนโฮสต์แชร์มักเป็นของชื่อเครื่อง ไม่ใช่ไอพีที่เราต่อ
  insecureTls: process.env.FTP_INSECURE_TLS === "1",
  workers: Number(process.env.FTP_WORKERS ?? 4),
};

/*
  ชื่อโฟลเดอร์เทียบกับโฟลเดอร์บ้านที่ FTP พาเข้าไปตอนล็อกอิน
  Plesk ขังผู้ใช้ไว้ในบ้าน (`/` คือบ้าน) แต่เซิร์ฟเวอร์ FTP บางตัวไม่ขัง
  จึงอ่านโฟลเดอร์บ้านจริงตอนเชื่อมต่อแล้วค่อยประกอบเป็นเส้นทางเต็ม
*/
const APP_NAME = env("REMOTE_APP", "bantonpoo.phuwish.com").replace(/^\/+/, "");
const DATA_NAME = env("REMOTE_DATA", "bantonpoo-data").replace(/^\/+/, "");
const remote = { home: "/", app: "", data: "", db: "", appEnv: "", release: "", previous: "" };

function resolveRemote(home) {
  remote.home = home;
  remote.app = posix.join(home, APP_NAME);
  remote.data = posix.join(home, DATA_NAME);
  remote.db = posix.join(remote.data, "bantonpoo.db");
  remote.appEnv = posix.join(remote.data, "app.env");
  remote.release = `${remote.app}.release`;
  remote.previous = `${remote.app}.prev`;
}

// ใช้ชื่อขึ้นต้นด้วย DEPLOY_ เพื่อไม่ให้ค่าของเครื่องพัฒนา (เช่น localhost) ติดขึ้นเว็บจริง
const SITE_URL = env("DEPLOY_SITE_URL", "https://bantonpoo.phuwish.com");
const NOINDEX = env("DEPLOY_NOINDEX", "1");
const HEALTH_URL = env("DEPLOY_HEALTH_URL", SITE_URL);

/* ------------------------------------------------------------------
   ตัวช่วย
   ------------------------------------------------------------------ */

function loadEnvFile(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

function fail(message) {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

/** ยกเลิกระหว่างทำงาน — โยน error เพื่อให้ finally ปิดการเชื่อมต่อและลบไฟล์ชั่วคราวก่อน */
class DeployError extends Error {}
function abort(message) {
  throw new DeployError(message);
}

function step(message) {
  console.log(`\n▸ ${message}`);
}

function run(command, args, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: ROOT,
      stdio: "inherit",
      env: { ...process.env, ...extraEnv },
    });
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} ${args.join(" ")} จบด้วยรหัส ${code}`))
    );
  });
}

async function connect() {
  const client = new Client(60_000);
  await client
    .access({
    host: FTP.host,
    port: FTP.port,
    user: FTP.user,
    password: FTP.password,
    secure: FTP.secure,
    /*
      จำกัดไว้ที่ TLS 1.2 — กับ TLS 1.3 เซิร์ฟเวอร์ FTP ของโฮสต์ (ProFTPD) ตัดการเชื่อมต่อข้อมูล
      กลางทางด้วย "SSL alert number 50" เพราะการใช้ session ซ้ำกับ channel ข้อมูลไม่เข้ากัน
      เจอจริงระหว่างอัปโหลดรอบแรก TLS 1.2 ยังเข้ารหัสแข็งแรงตามมาตรฐานปัจจุบัน
    */
    secureOptions: {
      maxVersion: process.env.FTP_TLS13 === "1" ? "TLSv1.3" : "TLSv1.2",
      ...(FTP.insecureTls ? { rejectUnauthorized: false } : {}),
    },
    })
    .catch((error) => {
      const message = String(error.message ?? error);
      if (/login incorrect|authentication failed|password/i.test(message)) {
        abort(`ล็อกอิน FTP ไม่ผ่าน (${message}) — ตรวจ FTP_PASSWORD ใน .env.deploy.local`);
      }
      if (FTP.secure && /please login with user|AUTH|not understood|500|502|504/i.test(message)) {
        abort(`เซิร์ฟเวอร์ FTP ไม่ยอมเปิดการเข้ารหัส (${message}) — ติดต่อโฮสต์ให้เปิด FTPS`);
      }
      if (/certificate|self.signed|altnames|TLS|SSL/i.test(message) && !FTP.insecureTls) {
        abort(
          `ตรวจใบรับรอง TLS ของ FTP ไม่ผ่าน (${message})\n` +
            "  โฮสต์แชร์มักใช้ใบรับรองของชื่อเครื่อง ไม่ตรงกับไอพีที่เราต่อ\n" +
            "  ใส่ FTP_INSECURE_TLS=1 ใน .env.deploy.local (ยังเข้ารหัสอยู่ แค่ไม่ตรวจชื่อ)"
        );
      }
      throw error;
    });
  if (!remote.app) resolveRemote(await client.pwd());
  return client;
}

async function exists(client, remotePath) {
  try {
    await client.size(remotePath);
    return true;
  } catch {
    return false;
  }
}

async function dirExists(client, remotePath) {
  try {
    await client.cd(remotePath);
    await client.cd(remote.home);
    return true;
  } catch {
    return false;
  }
}

/** รายชื่อไฟล์และโฟลเดอร์ทั้งหมดในเครื่อง — เก็บเป็นเส้นทางสัมพัทธ์ */
async function walkLocal(dir, base = dir, out = { dirs: [], files: [] }) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(base, full).split(path.sep).join("/");
    if (entry.isDirectory()) {
      out.dirs.push(rel);
      await walkLocal(full, base, out);
    } else if (entry.isFile()) {
      out.files.push(rel);
    }
  }
  return out;
}

/** รายชื่อไฟล์และโฟลเดอร์ทั้งหมดบนเซิร์ฟเวอร์ */
async function walkRemote(client, dir, out = { dirs: [], files: [] }) {
  for (const entry of await client.list(dir)) {
    if (entry.name === "." || entry.name === "..") continue;
    const full = `${dir}/${entry.name}`;
    if (entry.isDirectory) {
      out.dirs.push(full);
      await walkRemote(client, full, out);
    } else {
      out.files.push(full);
    }
  }
  return out;
}

/**
 * ทำงานกับไฟล์จำนวนมากพร้อมกันหลายการเชื่อมต่อ
 *
 * FTP เปิดการเชื่อมต่อข้อมูลใหม่ทุกไฟล์ บิลด์มีราว 2,300 ไฟล์ ถ้าทำทีละไฟล์จะช้ามาก
 */
async function inParallel(items, label, task) {
  if (items.length === 0) return;
  const queue = [...items];
  let done = 0;
  let lastPrinted = 0;
  let failure = null;

  /*
    แต่ละการเชื่อมต่อลองซ้ำได้ 4 ครั้งต่อไฟล์ ถ้าหลุดจะต่อใหม่ก่อนลองอีกรอบ
    อัปโหลดหลายพันไฟล์ผ่านอินเทอร์เน็ต การหลุดสักครั้งเป็นเรื่องปกติ ไม่ควรทำให้ทั้งรอบล้ม
  */
  const worker = async () => {
    let client = await connect();
    try {
      while (queue.length && !failure) {
        const item = queue.shift();
        for (let attempt = 1; ; attempt += 1) {
          try {
            await task(client, item);
            break;
          } catch (error) {
            if (attempt >= 4) {
              failure = error;
              throw error;
            }
            client.close();
            await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
            client = await connect();
          }
        }
        done += 1;
        const percent = Math.floor((done / items.length) * 100);
        if (percent >= lastPrinted + 10 || done === items.length) {
          lastPrinted = percent;
          process.stdout.write(`  ${label} ${done}/${items.length} (${percent}%)\n`);
        }
      }
    } finally {
      client.close();
    }
  };

  await Promise.all(Array.from({ length: Math.min(FTP.workers, items.length) }, worker));
}

async function uploadTree(client, localDir, remoteDir) {
  const { dirs, files } = await walkLocal(localDir);
  await client.ensureDir(remoteDir);
  // สร้างโฟลเดอร์ก่อนทั้งหมดด้วยการเชื่อมต่อเดียว ไม่งั้นหลายตัวจะแย่งกันสร้าง
  for (const dir of dirs.sort()) {
    await client.send(`MKD ${remoteDir}/${dir}`).catch(() => undefined);
  }
  await client.cd(remote.home);
  await inParallel(files, "อัปโหลด", (worker, rel) =>
    worker.uploadFrom(path.join(localDir, rel), `${remoteDir}/${rel}`)
  );
}

async function removeTree(client, remoteDir) {
  if (!(await dirExists(client, remoteDir))) return;
  const { dirs, files } = await walkRemote(client, remoteDir);
  await inParallel(files, "ลบของเก่า", (worker, file) => worker.remove(file, true));
  // ลบโฟลเดอร์จากชั้นลึกสุดขึ้นมา
  for (const dir of dirs.sort((a, b) => b.length - a.length)) {
    await client.send(`RMD ${dir}`).catch(() => undefined);
  }
  await client.send(`RMD ${remoteDir}`).catch(() => undefined);
  if (await dirExists(client, remoteDir)) {
    abort(`ลบ ${remoteDir} ไม่หมด — ลบเองใน File Manager ของ Plesk แล้วลองใหม่`);
  }
}

async function restartApp(client) {
  const file = path.join(os.tmpdir(), `restart-${Date.now()}.txt`);
  await writeFile(file, new Date().toISOString());
  await client.ensureDir(`${remote.app}/tmp`);
  await client.cd(remote.home);
  await client.uploadFrom(file, `${remote.app}/tmp/restart.txt`);
  await rm(file, { force: true });
}

/**
 * รอจนแอปตอบกลับ
 *
 * ตรวจหน้า /shop ด้วยเสมอ เพราะหน้าแรกถูกสร้างเป็นไฟล์ไว้ล่วงหน้า ตอบ 200 ได้
 * แม้แอปจะเปิดไม่ขึ้น (เช่นลืมตั้ง PAYLOAD_SECRET) ส่วน /shop ต้องอ่านฐานข้อมูลทุกครั้ง
 */
async function waitForSite() {
  const urls = [HEALTH_URL, new URL("/shop", SITE_URL).toString()];
  let last = 0;
  // ครั้งแรกหลังรีสตาร์ตแอปต้องเปิดตัวและปรับโครงฐานข้อมูลก่อน จึงรอได้นานหน่อย
  for (let attempt = 1; attempt <= 12; attempt += 1) {
    try {
      const statuses = await Promise.all(
        urls.map((url) => fetch(url, { redirect: "follow" }).then((response) => response.status))
      );
      last = statuses.find((status) => status !== 200) ?? 200;
      if (last === 200) return 200;
    } catch {
      last = 0;
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  return last;
}

/**
 * เติมไฟล์ native ของ Linux ลงในบิลด์
 *
 * บิลด์ที่ทำบน Mac ได้ไฟล์ native ของ macOS มาเท่านั้น (SQLite กับตัวย่อรูป)
 * แต่เซิร์ฟเวอร์เป็น Linux ถ้าไม่เติม แอปจะโหลดไม่ขึ้นตั้งแต่บรรทัดแรก
 * ใส่ทั้ง x64 และ arm64 เพราะดูสถาปัตยกรรมของโฮสต์แชร์จากภายนอกไม่ได้
 * ไลบรารีจะเลือกตัวที่ตรงกับเครื่องเองตอนโหลด
 */
async function addLinuxNatives(stage) {
  const readJson = (file) => JSON.parse(readFileSync(path.join(ROOT, file), "utf8"));
  const libsql = readJson("node_modules/libsql/package.json");
  const sharp = readJson("node_modules/sharp/package.json");

  const packages = ["x64", "arm64"].flatMap((arch) => [
    [`@libsql/linux-${arch}-gnu`, libsql.optionalDependencies[`@libsql/linux-${arch}-gnu`]],
    [`@img/sharp-linux-${arch}`, sharp.optionalDependencies[`@img/sharp-linux-${arch}`]],
    [`@img/sharp-libvips-linux-${arch}`, sharp.optionalDependencies[`@img/sharp-libvips-linux-${arch}`]],
  ]);

  // เก็บไฟล์ที่ดาวน์โหลดไว้ใช้ซ้ำ รอบหลังจะไม่ต้องโหลดใหม่
  const cache = path.join(ROOT, ".deploy-cache/natives");
  await mkdir(cache, { recursive: true });

  for (const [name, version] of packages) {
    if (!version) abort(`หาเวอร์ชันของ ${name} ไม่เจอ`);
    const tarball = path.join(cache, `${name.replace("@", "").replace("/", "-")}-${version}.tgz`);
    if (!existsSync(tarball)) {
      console.log(`  ดาวน์โหลด ${name}@${version}`);
      await run("npm", ["pack", `${name}@${version}`, "--pack-destination", cache, "--silent"]);
    }
    const target = path.join(stage, "node_modules", name);
    await rm(target, { recursive: true, force: true });
    await mkdir(target, { recursive: true });
    await run("tar", ["-xzf", tarball, "-C", target, "--strip-components=1"]);
  }

  // ของ macOS ไม่มีประโยชน์บนเซิร์ฟเวอร์ ตัดทิ้งให้อัปโหลดน้อยลง
  for (const dir of ["@libsql", "@img"]) {
    const base = path.join(stage, "node_modules", dir);
    for (const name of existsSync(base) ? await readdir(base) : []) {
      if (name.includes("darwin")) await rm(path.join(base, name), { recursive: true, force: true });
    }
  }
}

/** FTP สร้าง symlink ไม่ได้ ถ้ายังเหลืออยู่ในบิลด์ ไฟล์นั้นจะหายเงียบ ๆ ตอนอัปโหลด */
async function assertNoSymlinks(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if ((await lstat(full)).isSymbolicLink()) abort(`ยังมี symlink ในบิลด์: ${path.relative(dir, full)}`);
    if (entry.isDirectory()) await assertNoSymlinks(full);
  }
}

/**
 * ให้เจ้าของ (system user ที่รันแอป) เข้าโฟลเดอร์ข้อมูลได้คนเดียว
 * บนโฮสต์แชร์ กลุ่ม psacln คือลูกค้าทุกคนของเครื่อง สิทธิ์ 755/644 ที่ FTP ตั้งให้จึงกว้างเกินไป
 * เว็บเซิร์ฟเวอร์ไม่ต้องเข้าโฟลเดอร์นี้ — รูปถูกส่งผ่านแอป
 */
async function lockDownData(client) {
  const targets = [
    ["700", remote.data],
    ["700", `${remote.data}/uploads`],
    ["700", `${remote.data}/logs`],
    ["600", remote.db],
    ["600", `${remote.data}/logs/app.log`],
  ];
  for (const [mode, target] of targets) {
    // ไฟล์ที่ยังไม่มี (เช่นครั้งแรก) ข้ามได้ — ส่วนที่มีแล้วแต่ตั้งไม่ได้ให้เตือน
    await client.send(`SITE CHMOD ${mode} ${target}`).catch((error) => {
      if (!/no such file|not found|550/i.test(error.message)) console.log(`  ⚠ ตั้งสิทธิ์ ${target} ไม่ได้ (${error.message})`);
    });
  }
}

function setEnvLine(text, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^\\s*${key}\\s*=.*$`, "m");
  return pattern.test(text) ? text.replace(pattern, () => line) : `${text.replace(/\n*$/, "\n")}${line}\n`;
}

/**
 * ไฟล์ค่าตั้งของแอปบนเซิร์ฟเวอร์ (bantonpoo-data/app.env) — แอปอ่านตอนเริ่มทำงาน
 * ดู src/lib/server/app-env.ts
 *
 * ยังไม่มี: สร้างใหม่พร้อมสุ่ม PAYLOAD_SECRET (กุญแจอยู่บนเซิร์ฟเวอร์ที่เดียว ไม่เก็บในเครื่อง)
 * มีแล้ว: ไม่แตะกุญแจ — เปลี่ยนแล้วทุกคนหลุดจากระบบ — แค่ปรับค่าที่ตามการ build
 * (โดเมนและโหมดกันดัชนี) ให้ตรงกับบิลด์รอบนี้
 */
async function ensureAppEnv(client, work) {
  const local = path.join(work, "app.env");
  const managed = { NEXT_PUBLIC_SITE_URL: SITE_URL, SITE_NOINDEX: NOINDEX };
  let text;

  if (await exists(client, remote.appEnv)) {
    await client.downloadTo(local, remote.appEnv);
    const before = readFileSync(local, "utf8");
    const values = parseEnv(before);
    const missing = ["DATABASE_URI", "UPLOAD_DIR", "PAYLOAD_SECRET"].filter((key) => !values[key]);
    if (missing.length) {
      abort(`${remote.appEnv} ไม่มีค่า ${missing.join(", ")} — เปิดแก้ใน File Manager ของ Plesk`);
    }
    text = Object.entries(managed).reduce((acc, [key, value]) => setEnvLine(acc, key, value), before);
    if (text === before) {
      console.log("  มีครบแล้ว ไม่ต้องแก้");
      return;
    }
    console.log(`  ปรับ ${Object.keys(managed).join(", ")} ให้ตรงกับบิลด์นี้ (กุญแจลับคงเดิม)`);
  } else {
    // เส้นทางนับจากโฟลเดอร์แอป — server.js ย้ายไปทำงานที่นั่นเสมอ
    const data = posix.relative(remote.app, remote.data);
    text = [
      "# ค่าตั้งของเว็บ — แอปอ่านไฟล์นี้ทุกครั้งที่เริ่มทำงาน (src/lib/server/app-env.ts)",
      `# สร้างโดย npm run deploy เมื่อ ${new Date().toISOString()}`,
      "# แก้แล้วต้องกด Restart App ในหน้า Node.js ของ Plesk",
      "# เส้นทางแบบสัมพัทธ์นับจากโฟลเดอร์แอป",
      "# ห้ามเปลี่ยน PAYLOAD_SECRET (ทุกคนจะหลุดจากระบบ) และห้ามส่งไฟล์นี้ให้ใคร",
      `DATABASE_URI=file:${data}/bantonpoo.db`,
      `UPLOAD_DIR=${data}/uploads`,
      `PAYLOAD_SECRET=${randomBytes(32).toString("hex")}`,
      ...Object.entries(managed).map(([key, value]) => `${key}=${value}`),
      "",
    ].join("\n");
    console.log(`  สร้างใหม่พร้อมสุ่ม PAYLOAD_SECRET`);
  }

  await writeFile(local, text, { mode: 0o600 });
  // อัปโหลดชื่อชั่วคราว ตั้งสิทธิ์ให้เจ้าของอ่านได้คนเดียว แล้วค่อยเปลี่ยนชื่อทับ
  const uploading = `${remote.appEnv}.uploading`;
  await client.uploadFrom(local, uploading);
  await client
    .send(`SITE CHMOD 600 ${uploading}`)
    .catch((error) => console.log(`  ⚠ ตั้งสิทธิ์ไฟล์เป็น 600 ไม่ได้ (${error.message})`));
  await client.rename(uploading, remote.appEnv);
  await rm(local, { force: true });
}

/* ------------------------------------------------------------------
   ขั้นตอนหลัก
   ------------------------------------------------------------------ */

async function rollback() {
  const client = await connect();
  try {
    if (!(await dirExists(client, remote.previous))) abort("ไม่มีเวอร์ชันก่อนหน้าให้ย้อนกลับ");
    step("สลับกลับไปใช้เวอร์ชันก่อนหน้า");
    const swap = `${remote.app}.swap`;
    await client.rename(remote.app, swap);
    await client.rename(remote.previous, remote.app);
    await client.rename(swap, remote.previous);
    await restartApp(client);
  } finally {
    client.close();
  }
  const code = await waitForSite();
  console.log(code === 200 ? "\n✓ ย้อนกลับสำเร็จ" : `\n✗ เว็บตอบ HTTP ${code} — กด Restart App ใน Plesk`);
}

async function deploy() {
  const work = await mkdtemp(path.join(os.tmpdir(), "bantonpoo-deploy-"));
  const buildDb = path.join(work, "bantonpoo.db");
  const stage = path.join(work, "stage");

  try {
    step("ตรวจโค้ด");
    await run("npx", ["tsc", "--noEmit"]);
    await run("npx", ["eslint", "."]);
    const migrations = (await readdir(path.join(ROOT, "src/migrations"))).filter((f) => f.endsWith(".ts"));
    if (migrations.length < 2) abort("ไม่พบไฟล์ migration — รัน npm run migrate:create <ชื่อ> ก่อน");

    step(`เชื่อมต่อ FTP ${FTP.user}@${FTP.host}`);
    const client = await connect();
    try {
      await client.ensureDir(`${remote.data}/uploads`).catch((error) =>
        abort(`สร้างโฟลเดอร์ ${remote.data} ไม่ได้ (${error.message}) — ตรวจสิทธิ์ของ system user ใน Plesk`)
      );
      await client.cd(remote.home);
      await lockDownData(client);
      const hasDb = await exists(client, remote.db);

      if (MODE === "init") {
        if (hasDb && !FORCE) {
          abort(
            `มีฐานข้อมูลอยู่แล้วที่ ${remote.db} — ไม่เขียนทับเพื่อป้องกันเนื้อหาจริงหาย\n` +
              "  ถ้าต้องการอัปเดตเว็บ ใช้ npm run deploy แทน"
          );
        }
        step("สร้างเนื้อหาตั้งต้นในเครื่อง");
        const uploads = path.join(work, "uploads");
        await run("npx", ["tsx", "scripts/seed.ts"], {
          NODE_ENV: "production",
          DATABASE_URI: `file:${buildDb}`,
          UPLOAD_DIR: uploads,
          // กุญแจนี้ไม่ถูกเก็บลงข้อมูลใด ๆ บัญชีผู้ดูแลสร้างทีหลังบนเซิร์ฟเวอร์ด้วยกุญแจของเซิร์ฟเวอร์เอง
          PAYLOAD_SECRET: "seed-only-placeholder-secret-0123456789abcdef",
        });

        step("อัปโหลดรูปตั้งต้น");
        await uploadTree(client, uploads, `${remote.data}/uploads`);

        step("อัปโหลดฐานข้อมูลตั้งต้น");
        // อัปโหลดชื่อชั่วคราวก่อนแล้วค่อยเปลี่ยนชื่อ แอปจะไม่เจอไฟล์ครึ่งไฟล์
        await client.uploadFrom(buildDb, `${remote.db}.uploading`);
        await client.rename(`${remote.db}.uploading`, remote.db);
        await lockDownData(client);
      } else {
        if (!hasDb) abort(`ยังไม่มีฐานข้อมูลบนเซิร์ฟเวอร์ — ติดตั้งครั้งแรกด้วย npm run deploy:init`);
        step("ดาวน์โหลดฐานข้อมูลจริงลงมาอ่านตอน build");
        await client.downloadTo(buildDb, remote.db);
        for (const suffix of ["-wal", "-shm"]) {
          if (await exists(client, `${remote.db}${suffix}`)) {
            await client.downloadTo(`${buildDb}${suffix}`, `${remote.db}${suffix}`);
          }
        }
        console.log(`  ขนาด ${((await stat(buildDb)).size / 1024 / 1024).toFixed(1)} MB (สำเนานี้ไม่ถูกส่งกลับขึ้นไป)`);
      }

      step(`ตรวจไฟล์ค่าตั้ง ${remote.appEnv}`);
      await ensureAppEnv(client, work);
    } finally {
      client.close();
    }

    step(`build (SITE_URL=${SITE_URL}, SITE_NOINDEX=${NOINDEX})`);
    // ลบผลลัพธ์ build เก่าให้หมด แต่เว้น .next/dev ไว้ ไม่งั้น npm run dev ที่เปิดอยู่จะพัง
    if (existsSync(path.join(ROOT, ".next"))) {
      for (const name of await readdir(path.join(ROOT, ".next"))) {
        if (name !== "dev") await rm(path.join(ROOT, ".next", name), { recursive: true, force: true });
      }
    }
    await run("npx", ["next", "build"], {
      NODE_ENV: "production",
      DATABASE_URI: `file:${buildDb}`,
      NEXT_PUBLIC_SITE_URL: SITE_URL,
      SITE_NOINDEX: NOINDEX,
      PAYLOAD_SECRET: "build-time-placeholder-secret-0123456789abcdef",
    });

    step("รวมไฟล์ที่ต้องอัปโหลด");
    // standalone ไม่ได้รวม .next/static กับ public มาให้ ต้องคัดลอกเอง
    // dereference: บิลด์ใช้ symlink ชี้แพ็กเกจบางตัว ต้องคัดลอกเนื้อไฟล์จริงแทน
    await cp(path.join(ROOT, ".next/standalone"), stage, { recursive: true, dereference: true });
    await cp(path.join(ROOT, ".next/static"), path.join(stage, ".next/static"), { recursive: true });
    await cp(path.join(ROOT, "public"), path.join(stage, "public"), { recursive: true });
    // ไฟล์ตั้งค่าของเครื่องพัฒนาห้ามหลุดขึ้นไป
    for (const rel of (await walkLocal(stage)).files) {
      const name = path.basename(rel);
      if (name.startsWith(".env") || /\.db(-wal|-shm)?$/.test(name)) {
        await rm(path.join(stage, rel), { force: true });
        console.log(`  ตัดไฟล์ที่ไม่ควรขึ้นเซิร์ฟเวอร์: ${rel}`);
      }
    }
    /*
      ถ้ามีโค้ดฝั่งเซิร์ฟเวอร์อ่านไฟล์ด้วยเส้นทางที่รู้ตอนรันโดยไม่ใส่ turbopackIgnore
      Turbopack จะลากทั้งโปรเจกต์ (ซอร์สโค้ด เอกสาร ฐานข้อมูลเครื่องพัฒนา) เข้าบิลด์
      เจอมาแล้วสองครั้ง จึงหยุดก่อนส่งอะไรขึ้นเซิร์ฟเวอร์
    */
    for (const leak of ["src", "docs", "scripts", ".env.local", "bantonpoo.db"]) {
      if (existsSync(path.join(stage, leak))) {
        abort(
          `บิลด์มี ${leak} ติดมาด้วย — มีโค้ดอ่านไฟล์ด้วยเส้นทางแบบไดนามิก\n` +
            "  ดูคำเตือน \"Dynamic filesystem access\" ในผล build แล้วใส่ /*turbopackIgnore: true*/"
        );
      }
    }
    await addLinuxNatives(stage);
    await assertNoSymlinks(stage);
    await mkdir(path.join(stage, "tmp"), { recursive: true });
    await writeFile(path.join(stage, "tmp/restart.txt"), new Date().toISOString());
    const { files } = await walkLocal(stage);
    console.log(`  ${files.length} ไฟล์`);

    const client2 = await connect();
    try {
      step("ลบเวอร์ชันเก่าที่เก็บไว้ (ถ้ามี)");
      await removeTree(client2, remote.previous);
      await removeTree(client2, remote.release);

      step(`อัปโหลดบิลด์ไป ${remote.release}`);
      await uploadTree(client2, stage, remote.release);

      step("สลับเวอร์ชัน");
      if (await dirExists(client2, remote.app)) await client2.rename(remote.app, remote.previous);
      await client2.rename(remote.release, remote.app);
      await restartApp(client2);
    } finally {
      client2.close();
    }

    step(`ตรวจว่าเว็บตอบกลับ (${HEALTH_URL})`);
    const code = await waitForSite();
    if (code !== 200) {
      abort(
        `เว็บตอบ HTTP ${code}\n` +
          `  • ดูสาเหตุใน ${remote.data}/logs/app.log (เปิดได้ใน File Manager ของ Plesk)\n` +
          "  • กด Restart App ในหน้า Node.js ของ Plesk แล้วลองเปิดเว็บอีกครั้ง\n" +
          "  • ย้อนกลับเวอร์ชันเดิม: npm run deploy:rollback"
      );
    }

    // ถ้า Document Root ยังชี้โฟลเดอร์แอป ไฟล์โค้ดฝั่งเซิร์ฟเวอร์จะถูกดาวน์โหลดได้จากเว็บ
    const exposed = await fetch(`${SITE_URL}/server.js`)
      .then(async (response) => response.status === 200 && (await response.text()).includes("process.chdir"))
      .catch(() => false);
    if (exposed) {
      console.log(
        "\n⚠ ไฟล์ server.js เปิดอ่านได้จากเว็บ — ตั้ง Document Root ในหน้า Node.js ของ Plesk\n" +
          "  เป็น /bantonpoo.phuwish.com/public (ดูคู่มือหัวข้อ 4)"
      );
    }

    console.log(`\n✓ deploy สำเร็จ — ${SITE_URL}`);
    if (NOINDEX === "1") console.log("  (โหมดทดสอบ: กันไม่ให้ Google เก็บดัชนีอยู่)");
    if (MODE === "init") console.log(`  ต่อไป: เปิด ${SITE_URL}/admin เพื่อสร้างบัญชีผู้ดูแลคนแรก`);
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}

(MODE === "rollback" ? rollback() : deploy()).catch((error) => fail(error.message ?? String(error)));

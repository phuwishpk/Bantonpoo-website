import { accessSync, appendFileSync, constants, existsSync, mkdirSync, renameSync, statSync } from "node:fs";
import path from "node:path";

import { defaultDataDir } from "./app-env";

/**
 * บันทึก log ของแอปลงไฟล์ ข้างโฟลเดอร์ฐานข้อมูล (bantonpoo-data/logs/app.log)
 *
 * โฮสต์เป็น Plesk แบบแชร์ ไม่มี SSH และ log ของ Passenger อยู่ในที่ที่ผู้ใช้เปิดไม่ได้
 * ถ้าแอปพัง เราจะไม่มีทางรู้สาเหตุเลย จึงให้แอปเขียนสิ่งที่พิมพ์ออกหน้าจอ
 * ลงไฟล์ที่อ่านได้ผ่าน FTP หรือ File Manager ของ Plesk ด้วย
 *
 * ทำงานเฉพาะโหมด production — ตอนพัฒนาดูในเทอร์มินัลอยู่แล้ว
 */

/** เกินขนาดนี้ย้ายไฟล์เดิมเป็น .1 แล้วเริ่มใหม่ กันไฟล์โตจนเต็มพื้นที่โฮสต์ */
const MAX_BYTES = 5 * 1024 * 1024;

let logFile: string | null = null;

/**
 * ที่อยู่ไฟล์ log เลือกตามลำดับ: APP_LOG_FILE → ข้างไฟล์ฐานข้อมูล (DATABASE_URI)
 * → โฟลเดอร์ bantonpoo-data ข้างโฟลเดอร์แอป (โครงที่ scripts/deploy-ftp.mjs สร้าง)
 *
 * ข้อสุดท้ายกันกรณีโฮสต์ไม่ส่งค่าตั้งมาถึงแอป ซึ่งเป็นตอนที่ต้องการ log มากที่สุด
 */
function resolveLogFile(): string | null {
  // turbopackIgnore: เส้นทางรู้ตอนรันเท่านั้น ถ้าไม่บอก Turbopack จะลากทั้งโปรเจกต์เข้าบิลด์
  const cwd = process.cwd();
  if (process.env.APP_LOG_FILE) {
    return path.resolve(/*turbopackIgnore: true*/ cwd, process.env.APP_LOG_FILE);
  }
  const uri = process.env.DATABASE_URI;
  if (uri?.startsWith("file:")) {
    const db = path.resolve(/*turbopackIgnore: true*/ cwd, uri.slice("file:".length));
    return path.join(path.dirname(db), "logs", "app.log");
  }
  const data = defaultDataDir();
  return existsSync(/*turbopackIgnore: true*/ data) ? path.join(data, "logs", "app.log") : null;
}

function write(stream: string, text: string) {
  if (!logFile) return;
  try {
    const tooBig =
      existsSync(/*turbopackIgnore: true*/ logFile) &&
      statSync(/*turbopackIgnore: true*/ logFile).size > MAX_BYTES;
    if (tooBig) renameSync(/*turbopackIgnore: true*/ logFile, `${logFile}.1`);
    const body = text.endsWith("\n") ? text : `${text}\n`;
    // mode มีผลตอนสร้างไฟล์ — โฮสต์แชร์มีผู้ใช้อื่นอยู่ในกลุ่มเดียวกัน ให้เจ้าของอ่านได้คนเดียว
    appendFileSync(/*turbopackIgnore: true*/ logFile, `[${new Date().toISOString()}] ${stream}: ${body}`, {
      mode: 0o600,
    });
  } catch {
    // เขียน log ไม่ได้ต้องไม่ทำให้แอปพังตาม
  }
}

/** ส่งสำเนาทุกอย่างที่พิมพ์ออก stdout/stderr ไปที่ไฟล์ด้วย (รวม log ของ Payload) */
export function startFileLog(): string | null {
  if (logFile) return logFile;
  const target = resolveLogFile();
  if (!target) return null;
  try {
    mkdirSync(/*turbopackIgnore: true*/ path.dirname(target), { recursive: true, mode: 0o700 });
  } catch {
    return null;
  }
  logFile = target;
  // เขียนทันที ถ้าการตรวจเครื่องทีหลังทำโพรเซสล้ม อย่างน้อยก็รู้ว่าแอปเริ่มแล้ว
  write("startup", `เริ่มโพรเซส pid=${process.pid}`);

  for (const name of ["stdout", "stderr"] as const) {
    const stream = process[name];
    const original = stream.write.bind(stream) as (...args: unknown[]) => boolean;
    stream.write = ((chunk: unknown, ...rest: unknown[]) => {
      write(name, typeof chunk === "string" ? chunk : Buffer.from(chunk as Uint8Array).toString("utf8"));
      return original(chunk, ...rest);
    }) as typeof stream.write;
  }

  // Monitor ไม่เปลี่ยนพฤติกรรมเดิมของ Node — แค่แอบบันทึกก่อนโพรเซสล้ม
  process.on("uncaughtExceptionMonitor", (error) => {
    write("crash", error instanceof Error ? (error.stack ?? error.message) : String(error));
  });

  return logFile;
}

/** บันทึก error ที่เกิดระหว่างตอบคำขอ พร้อมหน้าที่เกิด */
export function logRequestError(error: unknown, request: { method?: string; path?: string }) {
  const detail = error instanceof Error ? (error.stack ?? error.message) : String(error);
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? ` digest=${String((error as { digest: unknown }).digest)}`
      : "";
  write("request-error", `${request.method ?? "GET"} ${request.path ?? "?"}${digest}\n${detail}`);
}

function describeAccess(label: string, target: string) {
  const exists = existsSync(/*turbopackIgnore: true*/ target);
  const can = (mode: number) => {
    try {
      accessSync(/*turbopackIgnore: true*/ target, mode);
      return "ได้";
    } catch {
      return "ไม่ได้";
    }
  };
  return exists
    ? `${label} ${target} — อ่าน${can(constants.R_OK)} เขียน${can(constants.W_OK)}`
    : `${label} ${target} — ไม่มีไฟล์/โฟลเดอร์นี้`;
}

/**
 * ตรวจสภาพเครื่องตอนแอปเริ่มทำงาน แล้วเขียนผลลงไฟล์ log
 *
 * เก็บสิ่งที่ต้องรู้เวลาแอปเปิดไม่ขึ้นบนโฮสต์ที่เข้าไปดูเองไม่ได้: รุ่นของ Node และ glibc
 * ค่าตั้งที่มี/ไม่มี (ไม่เขียนค่าลับลงไฟล์) สิทธิ์ของไฟล์ฐานข้อมูล และไลบรารี native
 * ทุกขั้นห่อ try/catch ไว้ การตรวจพังต้องไม่ทำให้แอปพังตาม
 */
export async function logStartupProbe(notes: string[] = []) {
  const lines: string[] = [...notes];
  try {
    const report = process.report?.getReport?.() as { header?: { glibcVersionRuntime?: string } } | undefined;
    lines.push(
      `node ${process.version} ${process.platform}/${process.arch} glibc=${report?.header?.glibcVersionRuntime ?? "?"} ` +
        `pid=${process.pid} uid=${process.getuid?.() ?? "?"} gid=${process.getgid?.() ?? "?"} cwd=${process.cwd()}`
    );

    const shown = ["NODE_ENV", "DATABASE_URI", "UPLOAD_DIR", "NEXT_PUBLIC_SITE_URL", "SITE_NOINDEX", "HOSTNAME", "PORT"];
    lines.push(shown.map((key) => `${key}=${process.env[key] ?? "(ไม่มี)"}`).join(" "));
    lines.push(`PAYLOAD_SECRET=${process.env.PAYLOAD_SECRET ? `(ตั้งแล้ว ${process.env.PAYLOAD_SECRET.length} ตัวอักษร)` : "(ไม่มี)"}`);

    const uri = process.env.DATABASE_URI ?? "file:./bantonpoo.db";
    if (uri.startsWith("file:")) {
      const db = path.resolve(/*turbopackIgnore: true*/ process.cwd(), uri.slice("file:".length));
      lines.push(describeAccess("ฐานข้อมูล", db));
      lines.push(describeAccess("โฟลเดอร์ฐานข้อมูล", path.dirname(db)));
    }
    if (process.env.UPLOAD_DIR) {
      lines.push(describeAccess("โฟลเดอร์รูป", path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.UPLOAD_DIR)));
    }
  } catch (error) {
    lines.push(`ตรวจข้อมูลเครื่องไม่สำเร็จ: ${String(error)}`);
  }

  try {
    const sharp = (await import("sharp")).default;
    lines.push(`sharp โหลดได้ ${JSON.stringify(sharp.versions)}`);
  } catch (error) {
    lines.push(`sharp โหลดไม่ได้: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`);
  }

  // ไม่มี DATABASE_URI ก็ไม่เปิดค่าเริ่มต้น — libsql จะสร้างไฟล์ว่างขึ้นมาในโฟลเดอร์แอป
  lines.push(
    process.env.DATABASE_URI
      ? await probeSqlite(process.env.DATABASE_URI)
      : "ข้ามการตรวจ SQLite เพราะไม่มี DATABASE_URI"
  );

  write("startup", lines.join("\n"));
}

async function probeSqlite(url: string) {
  try {
    const { createClient } = await import("@libsql/client");
    const client = createClient({ url });
    const result = await client.execute(
      "select count(*) as n from sqlite_master where type = 'table'"
    );
    client.close();
    return `SQLite เปิดได้ มี ${String(result.rows[0]?.n)} ตาราง`;
  } catch (error) {
    return `SQLite เปิดไม่ได้: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`;
  }
}

/**
 * ตรวจการเปลี่ยนสีจากหน้าเว็บตั้งแต่ต้นจนจบ
 *
 * สร้างผู้ใช้ทดสอบชั่วคราว → ล็อกอิน → เปิดโหมดดูตัวอย่าง → เปลี่ยนสีส่วน/แบนเนอร์/ทั้งหน้า/แถบเมนู →
 * ตรวจว่าผู้เข้าชมทั่วไปยังไม่เห็น → ตรวจคำขอที่ต้องถูกปฏิเสธ → เผยแพร่ธีม → คืนค่าเดิม → ลบผู้ใช้ทดสอบ
 *
 * รันด้วย: npm run check:styles  (ต้องมี npm run dev ทำงานอยู่)
 *
 * สคริปต์นี้แก้สีจริงชั่วคราวและกดเผยแพร่ธีมหนึ่งครั้ง
 * ถ้ามีฉบับร่างของธีมค้างอยู่ ฉบับร่างนั้นจะถูกเผยแพร่ไปด้วย
 */
import { getPayload } from "payload";
import config from "../src/payload.config";

const BASE = process.env.CHECK_BASE_URL ?? "http://localhost:3100";
const EMAIL = "style-check@example.invalid";
const PASSWORD = "StyleCheck!2569";

let passed = 0;
let failed = 0;

function check(name: string, ok: boolean, extra = "") {
  if (ok) {
    passed++;
    console.log(`  ok   ${name}`);
  } else {
    failed++;
    console.log(`  FAIL ${name} ${extra}`);
  }
}

function cookiesFrom(response: Response): string[] {
  return response.headers.getSetCookie().map((line) => line.split(";")[0]);
}

type Payload = Awaited<ReturnType<typeof getPayload>>;
type Doc = Record<string, unknown>;

/** กลุ่มฟิลด์ที่สคริปต์นี้แตะ — เก็บไว้ทั้งกลุ่มแล้วเขียนคืนทั้งกลุ่ม */
const TOUCHED = {
  "home-page": ["sections", "hero", "pageStyle"],
  theme: ["header"],
} as const;

type Slug = keyof typeof TOUCHED;

async function readGroups(payload: Payload, slug: Slug, draft: boolean): Promise<Doc> {
  const doc = (await payload.findGlobal({ slug, depth: 0, locale: "th", draft })) as unknown as Doc;
  return Object.fromEntries(TOUCHED[slug].map((key) => [key, structuredClone(doc[key] ?? null)]));
}

async function writeGroups(payload: Payload, slug: Slug, groups: Doc, draft: boolean) {
  // ฉบับเผยแพร่ต้องระบุสถานะเอง — ไม่งั้น Payload ยึดสถานะจากฉบับร่างล่าสุด
  const status = draft ? {} : { _status: "published" };
  await payload.updateGlobal({ slug, data: { ...groups, ...status } as never, locale: "th", draft });
}

async function main() {
  const payload = await getPayload({ config });
  let restore: (() => Promise<void>) | null = null;

  const existing = await payload.find({ collection: "users", where: { email: { equals: EMAIL } }, limit: 1 });
  for (const user of existing.docs) await payload.delete({ collection: "users", id: user.id });
  const user = await payload.create({
    collection: "users",
    data: { email: EMAIL, password: PASSWORD, name: "ตรวจระบบสี", role: "editor" },
  });

  try {
    const login = await fetch(`${BASE}/payload-api/users/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const authCookie = cookiesFrom(login).find((c) => c.startsWith("payload-token="));
    check("ล็อกอินหลังบ้านได้", login.ok && Boolean(authCookie));
    if (!authCookie) throw new Error("ไม่ได้คุกกี้ล็อกอิน");

    const anon = await fetch(`${BASE}/api/inline-edit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "style", at: "g:home-page:pageStyle", values: { accentColor: "#000000" } }),
    });
    check("ผู้ไม่ได้ล็อกอินเปลี่ยนสีไม่ได้ (401)", anon.status === 401, `ได้ ${anon.status}`);

    const preview = await fetch(`${BASE}/api/preview?path=/`, { headers: { cookie: authCookie }, redirect: "manual" });
    const jar = [authCookie, ...cookiesFrom(preview)].join("; ");
    const html = async (path: string, withCookie: boolean) =>
      (await fetch(`${BASE}${path}`, { headers: withCookie ? { cookie: jar } : {} })).text();

    // ---------- เก็บค่าเดิม ----------
    const snapshot = {
      home: { draft: await readGroups(payload, "home-page", true), published: await readGroups(payload, "home-page", false) },
      theme: { draft: await readGroups(payload, "theme", true), published: await readGroups(payload, "theme", false) },
    };
    restore = async () => {
      await writeGroups(payload, "home-page", snapshot.home.draft, true);
      await writeGroups(payload, "home-page", snapshot.home.published, false);
      await writeGroups(payload, "theme", snapshot.theme.draft, true);
      await writeGroups(payload, "theme", snapshot.theme.published, false);
    };

    const sections = (snapshot.home.draft.sections ?? []) as Doc[];
    const index = sections.findIndex((row) => row.type === "featured-products");
    check("หน้าแรกมีส่วนสินค้าแนะนำให้ทดสอบ", index >= 0);
    if (index < 0) throw new Error("ไม่พบส่วนสินค้าแนะนำ");

    const style = (at: string, values: Doc) =>
      fetch(`${BASE}/api/inline-edit`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie: jar },
        body: JSON.stringify({ action: "style", at, values }),
      });

    // ---------- เปลี่ยนสีของส่วน ----------
    const sectionAt = `g:home-page:sections.${index}`;
    const save = await style(sectionAt, {
      background: "custom",
      backgroundColor: "#123020",
      accentColor: "#c2410c",
      cardColor: "#1d3557",
    });
    const saveBody = (await save.json()) as { ok?: boolean; scope?: string; message?: string };
    check("เปลี่ยนสีของส่วนได้", save.ok && saveBody.ok === true, saveBody.message ?? "");
    check("คืนขอบเขตของเอกสารที่แก้", saveBody.scope === "g:home-page", String(saveBody.scope));

    const draftHome = await html("/", true);
    check("ฉบับร่างใช้สีพื้นใหม่", draftHome.includes("#123020"));
    check("ฉบับร่างใช้สีการ์ดใหม่", draftHome.includes("has-card-color") && draftHome.includes("#1d3557"));
    check("โหมดแก้ไขแสดงปุ่มเปลี่ยนสี", draftHome.includes("เปลี่ยนสีส่วนสินค้าแนะนำ"));
    const publicHome = await html("/", false);
    check("ผู้เข้าชมทั่วไปยังไม่เห็นสีใหม่", !publicHome.includes("#1d3557"));
    check("ผู้เข้าชมทั่วไปไม่เห็นปุ่มเปลี่ยนสี", !publicHome.includes("เปลี่ยนสีส่วน"));

    const reset = await style(sectionAt, { cardColor: null });
    const afterReset = (await payload.findGlobal({ slug: "home-page", depth: 0, locale: "th", draft: true })) as unknown as {
      sections: Doc[];
    };
    check("ล้างสีการ์ดกลับเป็นค่าเดิมได้", reset.ok && !afterReset.sections[index].cardColor);
    check("ช่องอื่นในแถวเดียวกันไม่หาย", afterReset.sections[index].type === "featured-products");

    // ---------- แบนเนอร์และสีทั้งหน้า ----------
    const heroSave = await style("g:home-page:hero", { background: "custom", backgroundColor: "#fdf8e7" });
    check("เปลี่ยนสีแบนเนอร์ได้", heroSave.ok);
    const pageSave = await style("g:home-page:pageStyle", { accentColor: "#7c3aed" });
    check("เปลี่ยนสีของทั้งหน้าได้", pageSave.ok);
    const draftAgain = await html("/", true);
    check("ฉบับร่างใช้สีทั้งหน้า", draftAgain.includes('id="page-style"') && draftAgain.includes("#7c3aed"));
    check("ฉบับร่างใช้สีแบนเนอร์", draftAgain.includes("#fdf8e7"));
    const stillTitle = (await payload.findGlobal({ slug: "home-page", depth: 0, locale: "th", draft: true })) as unknown as {
      hero: Doc;
    };
    check("ข้อความในแบนเนอร์ไม่หาย", Boolean(stillTitle.hero.subtitle));

    // ---------- แถบเมนูในธีม ----------
    const headerSave = await style("g:theme:header", { background: "custom", backgroundColor: "#f2ede6" });
    const headerBody = (await headerSave.json()) as { ok?: boolean; scope?: string; message?: string };
    check("เปลี่ยนสีแถบเมนูได้", headerSave.ok && headerBody.ok === true, headerBody.message ?? "");
    check("ขอบเขตของแถบเมนูคือธีม", headerBody.scope === "g:theme", String(headerBody.scope));
    check("ฉบับร่างใช้สีแถบเมนู", (await html("/about", true)).includes("#f2ede6 94%"));

    // ---------- คำขอที่ต้องถูกปฏิเสธ ----------
    const cases: [string, Doc, number][] = [
      ["ช่องที่ไม่ใช่สี", { action: "style", at: sectionAt, values: { type: "cta" } }, 400],
      ["ข้อความในกลุ่มที่มีสี", { action: "style", at: "g:home-page:cta", values: { title: "x" } }, 400],
      ["รหัสสีผิดรูปแบบ", { action: "style", at: sectionAt, values: { backgroundColor: "red" } }, 400],
      ["รหัสสีแฝงคำสั่ง", { action: "style", at: sectionAt, values: { accentColor: "#000;}body{" } }, 400],
      ["ตัวเลือกที่ไม่มีในรายการ", { action: "style", at: sectionAt, values: { background: "purple" } }, 400],
      ["ไม่ระบุค่าเลย", { action: "style", at: sectionAt, values: {} }, 400],
      ["แถวที่ยังไม่มี", { action: "style", at: "g:home-page:sections.99", values: { background: "dark" } }, 400],
      ["CSS เพิ่มเติมของธีม", { action: "style", at: "g:theme:header", values: { customCss: "x" } }, 400],
      ["ช่องอื่นของธีม", { action: "style", at: "g:theme:header", values: { palette: "custom" } }, 400],
      ["แก้ข้อความในธีม", { at: "g:theme:header.backgroundColor", value: "#000000" }, 400],
      ["เอกสารนอกรายการอนุญาต", { action: "style", at: "g:site-settings:logo", values: { background: "dark" } }, 400],
      ["ผู้ใช้", { action: "style", at: "c:users:1:role", values: { background: "dark" } }, 400],
    ];
    for (const [name, body, status] of cases) {
      const response = await fetch(`${BASE}/api/inline-edit`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie: jar },
        body: JSON.stringify(body),
      });
      check(`ปฏิเสธ: ${name}`, response.status === status, `ได้ ${response.status}`);
    }

    // ---------- เผยแพร่ธีม ----------
    const publish = await fetch(`${BASE}/api/inline-edit`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: jar },
      body: JSON.stringify({ action: "publish", scopes: ["g:theme"] }),
    });
    const publishBody = (await publish.json()) as { ok?: boolean; done?: string[]; failed?: { message: string }[] };
    check(
      "เผยแพร่สีแถบเมนูได้",
      publish.ok && publishBody.ok === true && (publishBody.done ?? []).length === 1,
      JSON.stringify(publishBody)
    );
    check("ผู้เข้าชมทั่วไปเห็นสีแถบเมนูหลังเผยแพร่", (await html("/about", false)).includes("#f2ede6 94%"));

    // ---------- คืนค่าเดิม ----------
    await restore();
    restore = null;
    const home = await readGroups(payload, "home-page", false);
    const theme = await readGroups(payload, "theme", false);
    check(
      "คืนค่าเดิมเรียบร้อย",
      JSON.stringify(home.pageStyle) === JSON.stringify(snapshot.home.published.pageStyle) &&
        JSON.stringify(theme.header) === JSON.stringify(snapshot.theme.published.header)
    );
  } finally {
    if (restore) {
      await restore();
      console.log("คืนค่าสีเดิมหลังเกิดข้อผิดพลาดแล้ว");
    }
    await payload.delete({ collection: "users", id: user.id });
    console.log("\nลบผู้ใช้ทดสอบแล้ว");
  }

  console.log(`\nผ่าน ${passed} · ไม่ผ่าน ${failed}`);
  process.exit(failed === 0 ? 0 : 1);
}

void main();

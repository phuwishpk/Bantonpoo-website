/**
 * ตรวจการแก้ข้อความบนหน้าเว็บตั้งแต่ต้นจนจบ
 *
 * สร้างผู้ใช้ทดสอบชั่วคราว → ล็อกอิน → เปิดโหมดดูตัวอย่าง → แก้ข้อความ →
 * ตรวจว่าผู้เข้าชมทั่วไปยังไม่เห็น → เผยแพร่ → ตรวจว่าเห็นแล้ว → คืนค่าเดิม → ลบผู้ใช้ทดสอบ
 *
 * รันด้วย: npm run check:inline  (ต้องมี npm run dev ทำงานอยู่)
 *
 * สคริปต์นี้แก้เนื้อหาจริงชั่วคราวและกดเผยแพร่หน้าแรกหนึ่งครั้ง
 * ถ้ามีฉบับร่างของหน้าแรกค้างอยู่ ฉบับร่างนั้นจะถูกเผยแพร่ไปด้วย
 */
import { getPayload } from "payload";
import config from "../src/payload.config";

const BASE = process.env.CHECK_BASE_URL ?? "http://localhost:3100";
const EMAIL = "inline-check@example.invalid";
const PASSWORD = "InlineCheck!2569";

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

async function readCta(payload: Payload, draft: boolean): Promise<Record<string, unknown>> {
  const doc = (await payload.findGlobal({ slug: "home-page", depth: 0, locale: "th", draft })) as {
    cta?: Record<string, unknown>;
  };
  return { ...(doc.cta ?? {}) };
}

async function writeCta(payload: Payload, cta: Record<string, unknown>, draft: boolean) {
  // ฉบับเผยแพร่ต้องระบุสถานะเอง — ไม่งั้น Payload ยึดสถานะจากฉบับร่างล่าสุด แล้วได้ฉบับร่างอีกฉบับแทน
  const status = draft ? {} : { _status: "published" };
  await payload.updateGlobal({ slug: "home-page", data: { cta, ...status } as never, locale: "th", draft });
}

async function main() {
  const payload = await getPayload({ config });
  let restoreCta: (() => Promise<void>) | null = null;

  // ---------- ผู้ใช้ทดสอบ ----------
  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: EMAIL } },
    limit: 1,
  });
  for (const user of existing.docs) {
    await payload.delete({ collection: "users", id: user.id });
  }
  const user = await payload.create({
    collection: "users",
    data: { email: EMAIL, password: PASSWORD, name: "ตรวจระบบ", role: "editor" },
  });

  try {
    // ---------- ล็อกอิน ----------
    const login = await fetch(`${BASE}/payload-api/users/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const authCookie = cookiesFrom(login).find((c) => c.startsWith("payload-token="));
    check("ล็อกอินหลังบ้านได้", login.ok && Boolean(authCookie));
    if (!authCookie) throw new Error("ไม่ได้คุกกี้ล็อกอิน");

    // ---------- ปฏิเสธคำขอที่ไม่ได้ล็อกอิน ----------
    const anonSave = await fetch(`${BASE}/api/inline-edit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ at: "g:home-page:cta.title", value: "ห้ามผ่าน" }),
    });
    check("ผู้ไม่ได้ล็อกอินบันทึกไม่ได้ (401)", anonSave.status === 401, `ได้ ${anonSave.status}`);

    // ---------- เปิดโหมดดูตัวอย่าง ----------
    const preview = await fetch(`${BASE}/api/preview?path=/`, {
      headers: { cookie: authCookie },
      redirect: "manual",
    });
    const draftCookies = cookiesFrom(preview);
    const jar = [authCookie, ...draftCookies].join("; ");
    check("เปิดโหมดดูตัวอย่างได้", draftCookies.length > 0, `ได้ ${preview.status}`);

    const editingHtml = await (await fetch(`${BASE}/`, { headers: { cookie: jar } })).text();
    check("โหมดแก้ไขแสดงช่องแก้ข้อความ", editingHtml.includes("inline-edit"));
    check("โหมดแก้ไขแสดงแถบเครื่องมือ", editingHtml.includes("แก้ไขหน้านี้"));

    // ---------- บันทึกฉบับร่าง ----------
    /*
      เก็บกลุ่ม cta ทั้งกลุ่มไว้ ไม่ใช่แค่หัวเรื่อง เพราะการเขียนกลับทีละฟิลด์
      เสี่ยงทำให้ฟิลด์อื่นในกลุ่มหายไป และคืนค่าใน finally เสมอ
      ถ้าสคริปต์พังกลางทาง ข้อความทดสอบจะได้ไม่ค้างอยู่บนเว็บจริง
    */
    const snapshot = {
      draft: await readCta(payload, true),
      published: await readCta(payload, false),
    };
    restoreCta = async () => {
      await writeCta(payload, snapshot.draft, true);
      await writeCta(payload, snapshot.published, false);
    };
    const original = snapshot.draft.title as string | undefined;
    const marker = `ทดสอบแก้ในหน้าเว็บ ${Date.now()}`;

    const save = await fetch(`${BASE}/api/inline-edit`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: jar },
      body: JSON.stringify({ at: "g:home-page:cta.title", value: marker }),
    });
    const saveBody = (await save.json()) as { ok?: boolean; scope?: string; message?: string };
    check("บันทึกข้อความจากหน้าเว็บได้", save.ok && saveBody.ok === true, saveBody.message ?? "");
    check("คืนขอบเขตของเอกสารที่แก้", saveBody.scope === "g:home-page", String(saveBody.scope));

    const draftHtml = await (await fetch(`${BASE}/`, { headers: { cookie: jar } })).text();
    check("ฉบับร่างแสดงข้อความใหม่", draftHtml.includes(marker));

    const publicHtml = await (await fetch(`${BASE}/`)).text();
    check("ผู้เข้าชมทั่วไปยังไม่เห็นฉบับร่าง", !publicHtml.includes(marker));

    // ---------- คำขอที่ต้องถูกปฏิเสธ ----------
    const cases: [string, Record<string, unknown>, number][] = [
      ["เอกสารนอกรายการอนุญาต", { at: "g:theme:customCss", value: "body{display:none}" }, 400],
      ["ผู้ใช้นอกรายการอนุญาต", { at: "c:users:1:email", value: "x@example.com" }, 400],
      ["เส้นทางแปลกปลอม", { at: "g:home-page:../../etc", value: "x" }, 400],
      ["ช่องที่ไม่ใช่ข้อความ", { at: "g:home-page:highlights", value: "x" }, 400],
      ["ช่องที่ไม่มีอยู่จริง", { at: "g:home-page:notAField", value: "x" }, 400],
    ];
    for (const [name, body, status] of cases) {
      const response = await fetch(`${BASE}/api/inline-edit`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie: jar },
        body: JSON.stringify(body),
      });
      check(`ปฏิเสธ: ${name}`, response.status === status, `ได้ ${response.status}`);
    }

    const crossOrigin = await fetch(`${BASE}/api/inline-edit`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: jar, origin: "https://evil.example" },
      body: JSON.stringify({ at: "g:home-page:cta.title", value: "ห้ามผ่าน" }),
    });
    check("ปฏิเสธคำขอจากโดเมนอื่น (403)", crossOrigin.status === 403, `ได้ ${crossOrigin.status}`);

    // ---------- กรอกช่องที่ยังว่าง ----------
    const spotlight = ((await payload.findGlobal({
      slug: "home-page",
      depth: 0,
      locale: "th",
      draft: true,
    })) as { spotlight?: Record<string, unknown> }).spotlight ?? {};
    const keptAttribution = spotlight.attribution;
    await payload.updateGlobal({
      slug: "home-page",
      data: { spotlight: { ...spotlight, attribution: null } } as never,
      locale: "th",
      draft: true,
    });
    const fill = await fetch(`${BASE}/api/inline-edit`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: jar },
      body: JSON.stringify({ at: "g:home-page:spotlight.attribution", value: "ทดสอบกรอกช่องว่าง" }),
    });
    const fillBody = (await fill.json()) as { ok?: boolean; message?: string };
    check("กรอกช่องที่ยังว่างได้", fill.ok && fillBody.ok === true, fillBody.message ?? "");
    await payload.updateGlobal({
      slug: "home-page",
      data: { spotlight: { ...spotlight, attribution: keptAttribution ?? null } } as never,
      locale: "th",
      draft: true,
    });

    const badRow = await fetch(`${BASE}/api/inline-edit`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: jar },
      body: JSON.stringify({ at: "g:home-page:highlights.99.title", value: "แถวที่ไม่มีอยู่" }),
    });
    check("ปฏิเสธ: แถวในอาร์เรย์ที่ยังไม่มี", badRow.status === 400, `ได้ ${badRow.status}`);

    // ---------- เผยแพร่ ----------
    const publish = await fetch(`${BASE}/api/inline-edit`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: jar },
      body: JSON.stringify({ action: "publish", scopes: ["g:home-page"] }),
    });
    const publishBody = (await publish.json()) as { ok?: boolean; failed?: { message: string }[] };
    check("เผยแพร่ได้", publish.ok && publishBody.ok === true, JSON.stringify(publishBody.failed ?? []));

    const publishedHtml = await (await fetch(`${BASE}/`)).text();
    check("ผู้เข้าชมทั่วไปเห็นข้อความใหม่หลังเผยแพร่", publishedHtml.includes(marker));

    // ---------- คืนค่าเดิม ----------
    await restoreCta();
    restoreCta = null;
    const after = await readCta(payload, false);
    check(
      "คืนค่าเดิมเรียบร้อย",
      after.title === snapshot.published.title && after.title !== marker,
      String(after.title)
    );
    void original;
  } finally {
    // คืนค่าให้ได้เสมอ แม้การตรวจจะพังกลางทาง
    if (restoreCta) {
      await restoreCta();
      console.log("คืนค่าเนื้อหาเดิมหลังเกิดข้อผิดพลาดแล้ว");
    }
    await payload.delete({ collection: "users", id: user.id });
    console.log("\nลบผู้ใช้ทดสอบแล้ว");
  }

  console.log(`\nผ่าน ${passed} · ไม่ผ่าน ${failed}`);
  process.exit(failed === 0 ? 0 : 1);
}

void main();

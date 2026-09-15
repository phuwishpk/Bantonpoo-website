/**
 * ตรวจหน้าที่ผู้ดูแลสร้างเองตั้งแต่ต้นจนจบ
 *
 * สร้างหน้าทดสอบที่มีบล็อกครบทุกชนิด → เปิดดูจริง → ตรวจว่าเนื้อหาและสไตล์มาครบ
 * → ตรวจว่าที่อยู่ที่จองไว้ถูกปฏิเสธ → ลบทิ้ง
 *
 * รันด้วย: npm run check:pages  (ต้องมี npm run dev ทำงานอยู่)
 */
import { getPayload } from "payload";
import config from "../src/payload.config";

const BASE = process.env.CHECK_BASE_URL ?? "http://localhost:3100";
const SLUG = "หน้าทดสอบระบบ";

let pass = 0;
let fail = 0;

function check(name: string, ok: boolean, extra = "") {
  if (ok) {
    pass++;
    console.log(`  ok   ${name}`);
  } else {
    fail++;
    console.log(`  FAIL ${name} ${extra}`);
  }
}

/**
 * ลองแก้ข้อความในบล็อกซ้อนผ่าน /api/inline-edit ด้วยผู้ใช้ทดสอบชั่วคราว
 *
 * ทำแยกเป็นฟังก์ชันเพราะต้องสร้างและลบผู้ใช้เอง ไม่ควรไปปนกับข้อมูลหน้า
 */
async function checkInlineEdit(payload: Payload, pageId: string | number) {
  const email = "page-check@example.invalid";
  const password = "PageCheck!2569";
  const stale = await payload.find({ collection: "users", where: { email: { equals: email } }, limit: 5 });
  for (const doc of stale.docs) await payload.delete({ collection: "users", id: doc.id });
  const user = await payload.create({
    collection: "users",
    data: { email, password, name: "ตรวจหน้า", role: "editor" },
  });

  try {
    const login = await fetch(`${BASE}/payload-api/users/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const cookie = login.headers
      .getSetCookie()
      .map((line) => line.split(";")[0])
      .find((line) => line.startsWith("payload-token="));
    if (!cookie) {
      check("ล็อกอินเพื่อทดสอบการแก้ในหน้าเว็บ", false);
      return;
    }

    const marker = `ย่อหน้าที่แก้จากหน้าเว็บ ${Date.now()}`;
    const response = await fetch(`${BASE}/api/inline-edit`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ at: `c:pages:${pageId}:layout.0.content.1.text`, value: marker, multiline: true }),
    });
    const body = (await response.json()) as { ok?: boolean; message?: string };
    check("แก้ข้อความในบล็อกซ้อนจากหน้าเว็บได้", response.ok && body.ok === true, body.message ?? "");

    const saved = (await payload.findByID({
      collection: "pages",
      id: pageId,
      depth: 0,
      locale: "th",
      draft: true,
    })) as { layout?: { content?: { text?: string }[] }[] };
    check("ข้อความใหม่ถูกบันทึกลงบล็อกที่ถูกต้อง", saved.layout?.[0]?.content?.[1]?.text === marker);

    const badPath = await fetch(`${BASE}/api/inline-edit`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify({ at: `c:pages:${pageId}:layout.0.content.1.level`, value: "9" }),
    });
    check("ปฏิเสธช่องที่ไม่ใช่ข้อความในบล็อกซ้อน", badPath.status === 400, `ได้ ${badPath.status}`);
  } finally {
    await payload.delete({ collection: "users", id: user.id });
  }
}

type Payload = Awaited<ReturnType<typeof getPayload>>;

async function main() {
  const payload = await getPayload({ config });

  // เก็บกวาดของค้างจากรอบก่อน เผื่อรอบที่แล้วพังกลางทาง
  const stale = await payload.find({ collection: "pages", where: { title: { equals: SLUG } }, limit: 10 });
  for (const doc of stale.docs) await payload.delete({ collection: "pages", id: doc.id });

  const media = await payload.find({ collection: "media", limit: 1 });
  const imageId = media.docs[0]?.id;

  const page = await payload.create({
    collection: "pages",
    locale: "th",
    data: {
      title: SLUG,
      slug: "check-page",
      _status: "published",
      hero: { eyebrow: "ทดสอบ", title: "หัวเรื่องแบนเนอร์ทดสอบ", description: "คำโปรยทดสอบ" },
      layout: [
        {
          blockType: "prose",
          textScale: "1.2",
          contentWidth: "narrow",
          content: [
            { blockType: "heading", level: "2", text: "หัวข้อในบล็อกข้อความ" },
            { blockType: "paragraph", text: "ย่อหน้าทดสอบในบล็อกข้อความ" },
            { blockType: "list", style: "bullet", items: [{ value: "ข้อแรกในรายการ" }] },
          ],
        },
        {
          blockType: "cards",
          background: "dark",
          columns: "2",
          heading: { title: "หัวข้อการ์ดทดสอบ" },
          items: [{ icon: "leaf", title: "การ์ดทดสอบหนึ่ง", body: "เนื้อหาการ์ดทดสอบ" }],
        },
        {
          blockType: "stats",
          heading: { title: "ตัวเลขทดสอบ" },
          items: [{ value: "1,234", label: "คำอธิบายตัวเลขทดสอบ" }],
        },
        ...(imageId
          ? [
              {
                blockType: "imageText",
                image: imageId,
                imagePosition: "right",
                title: "หัวเรื่องภาพคู่ข้อความ",
                body: "เนื้อหาภาพคู่ข้อความทดสอบ",
              },
              {
                blockType: "gallery",
                heading: { title: "แกลเลอรีทดสอบ" },
                images: [{ image: imageId }],
              },
            ]
          : []),
        {
          blockType: "collection",
          heading: { title: "สินค้าที่ดึงมาทดสอบ" },
          source: "products",
          limit: 2,
        },
        { blockType: "cta", title: "กล่องชวนติดต่อทดสอบ", body: "เนื้อหากล่องชวนติดต่อ" },
      ],
    } as never,
  });

  try {
    const res = await fetch(`${BASE}/check-page`);
    const html = await res.text();
    check("เปิดหน้าที่สร้างเองได้", res.status === 200, `ได้ ${res.status}`);

    for (const [name, needle] of [
      ["แบนเนอร์หัวหน้าเพจ", "หัวเรื่องแบนเนอร์ทดสอบ"],
      ["บล็อกข้อความ: หัวข้อ", "หัวข้อในบล็อกข้อความ"],
      ["บล็อกข้อความ: ย่อหน้า", "ย่อหน้าทดสอบในบล็อกข้อความ"],
      ["บล็อกข้อความ: รายการ", "ข้อแรกในรายการ"],
      ["บล็อกการ์ด", "การ์ดทดสอบหนึ่ง"],
      ["บล็อกตัวเลข", "คำอธิบายตัวเลขทดสอบ"],
      ["บล็อกดึงสินค้า", "สินค้าที่ดึงมาทดสอบ"],
      ["บล็อกชวนติดต่อ", "กล่องชวนติดต่อทดสอบ"],
      ["ขนาดตัวอักษรรายบล็อก", "--text-base:1.2rem"],
      ["ความกว้างเนื้อหารายบล็อก", "--section-measure:48rem"],
      ["พื้นหลังเข้มรายบล็อก", "bg-ink-800"],
      ["คอลัมน์ตามที่ตั้งไว้", "sm:grid-cols-2"],
    ] as [string, string][]) {
      check(name, html.includes(needle));
    }

    if (imageId) {
      check("บล็อกภาพคู่ข้อความ", html.includes("หัวเรื่องภาพคู่ข้อความ"));
      check("บล็อกแกลเลอรี", html.includes("แกลเลอรีทดสอบ"));
    }

    const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
    check("อยู่ใน sitemap", sitemap.includes("/check-page"));

    check("ไม่มีที่อยู่ฟิลด์หลุดให้ผู้เข้าชมทั่วไป", !html.includes("c:pages:") && !html.includes("inline-edit"));

    // เส้นทางที่เขียนไว้ในโค้ดต้องไม่ถูกเส้นทาง catch-all แย่งไป
    for (const path of ["/about", "/shop", "/tourism", "/robots.txt", "/sitemap.xml"]) {
      const r = await fetch(BASE + path);
      check(`เส้นทางเดิมยังทำงาน: ${path}`, r.status === 200, `ได้ ${r.status}`);
    }

    const missing = await fetch(`${BASE}/ไม่มีหน้านี้จริง`, { redirect: "manual" });
    check("ที่อยู่ที่ไม่มีอยู่จริงคืน 404", missing.status === 404, `ได้ ${missing.status}`);

    let reserved = false;
    try {
      await payload.create({
        collection: "pages",
        locale: "th",
        data: { title: "ชนกับหน้าเดิม", slug: "shop", layout: [{ blockType: "cta", title: "x" }] } as never,
      });
    } catch {
      reserved = true;
    }
    check("ปฏิเสธชื่อลิงก์ที่ชนกับหน้าเดิม", reserved);

    // แก้ข้อความในบล็อกซ้อนจากหน้าเว็บ — เส้นทางลึกสามชั้น (layout.N.content.M.text)
    // เป็นจุดที่ตัวตรวจเส้นทางกับสคีมาพลาดได้ง่ายที่สุด
    await checkInlineEdit(payload, page.id);

    let nested = false;
    try {
      await payload.create({
        collection: "pages",
        locale: "th",
        data: { title: "ชื่อซ้อน", slug: "a/b", layout: [{ blockType: "cta", title: "x" }] } as never,
      });
    } catch {
      nested = true;
    }
    check("ปฏิเสธชื่อลิงก์ที่มีเครื่องหมาย /", nested);
  } finally {
    await payload.delete({ collection: "pages", id: page.id });
    const leftovers = await payload.find({ collection: "pages", where: { slug: { in: ["shop", "a/b"] } }, limit: 10 });
    for (const doc of leftovers.docs) await payload.delete({ collection: "pages", id: doc.id });
    console.log("ลบหน้าทดสอบแล้ว");
  }

  console.log(`\nผ่าน ${pass} · ไม่ผ่าน ${fail}`);
  process.exit(fail === 0 ? 0 : 1);
}

void main();

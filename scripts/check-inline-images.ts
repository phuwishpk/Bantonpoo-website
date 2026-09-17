/**
 * ตรวจการเปลี่ยนรูปจากหน้าเว็บตั้งแต่ต้นจนจบ
 *
 * สร้างผู้ใช้ทดสอบชั่วคราว → ล็อกอิน → เปิดโหมดดูตัวอย่าง → อัปโหลดรูป →
 * เปลี่ยนรูปในช่องต่าง ๆ (กลุ่มฟิลด์ แถวในอาร์เรย์ ไอคอนเว็บ) → ตรวจคำขอที่ต้องถูกปฏิเสธ →
 * คืนค่าเดิม → ลบรูปทดสอบและผู้ใช้ทดสอบ
 *
 * รันด้วย: npm run check:images  (ต้องมี npm run dev ทำงานอยู่)
 *
 * สคริปต์นี้แก้ฉบับร่างของหน้าแรก สินค้าหนึ่งชิ้น และข้อมูลชุมชนชั่วคราว
 * แล้วคืนค่าใน finally เสมอ — ไม่กดเผยแพร่อะไรเลย
 */
import { getPayload } from "payload";
import sharp from "sharp";
import config from "../src/payload.config";

const BASE = process.env.CHECK_BASE_URL ?? "http://localhost:3100";
const EMAIL = "image-check@example.invalid";
const PASSWORD = "ImageCheck!2569";

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

type Doc = Record<string, unknown>;

const png = (color: string) =>
  sharp({ create: { width: 640, height: 480, channels: 3, background: color } }).png().toBuffer();

/**
 * คืนค่าเดิมทั้งฉบับเผยแพร่และฉบับร่าง
 *
 * เขียนฉบับเผยแพร่ก่อน แล้วค่อยเขียนฉบับร่างเฉพาะเมื่อเดิมต่างกันจริง
 * ไม่งั้นเอกสารที่ไม่เคยมีฉบับร่างค้างจะกลายเป็น "มีการแก้ที่ยังไม่เผยแพร่" หลังตรวจเสร็จ
 *
 * ผู้เรียกต้องใส่ _status: "published" ตอนเขียนฉบับเผยแพร่ — Payload ยึดสถานะจาก
 * ฉบับล่าสุด (ซึ่งเป็นฉบับร่างที่การตรวจสร้างไว้) ถ้าไม่ระบุจะได้ฉบับร่างอีกฉบับแทน
 */
const status = (draft: boolean) => (draft ? {} : { _status: "published" as const });

async function restoreBoth(
  snapshot: { draft: unknown; published: unknown },
  write: (value: unknown, draft: boolean) => Promise<unknown>
) {
  await write(snapshot.published, false);
  if (JSON.stringify(snapshot.draft) !== JSON.stringify(snapshot.published)) await write(snapshot.draft, true);
}

async function main() {
  const payload = await getPayload({ config });
  const cleanups: (() => Promise<unknown>)[] = [];

  for (const old of (await payload.find({ collection: "users", where: { email: { equals: EMAIL } } })).docs) {
    await payload.delete({ collection: "users", id: old.id });
  }
  const user = await payload.create({
    collection: "users",
    data: { email: EMAIL, password: PASSWORD, name: "ตรวจรูป", role: "editor" },
  });

  try {
    // ---------- ล็อกอิน + โหมดดูตัวอย่าง ----------
    const login = await fetch(`${BASE}/payload-api/users/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const authCookie = cookiesFrom(login).find((c) => c.startsWith("payload-token="));
    if (!authCookie) throw new Error("ไม่ได้คุกกี้ล็อกอิน");
    const preview = await fetch(`${BASE}/api/preview?path=/`, {
      headers: { cookie: authCookie },
      redirect: "manual",
    });
    const jar = [authCookie, ...cookiesFrom(preview)].join("; ");

    const post = (body: unknown, cookie = jar, origin?: string) =>
      fetch(`${BASE}/api/inline-edit`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie, ...(origin ? { origin } : {}) },
        body: JSON.stringify({ action: "image", ...(body as Doc) }),
      });

    const upload = async (fields: Record<string, string>, file: Buffer, type: string, name: string, cookie = jar) => {
      const form = new FormData();
      form.set("file", new File([new Uint8Array(file)], name, { type }));
      for (const [key, value] of Object.entries(fields)) form.set(key, value);
      return fetch(`${BASE}/api/inline-media`, { method: "POST", headers: { cookie }, body: form });
    };

    // ---------- ผู้ไม่ได้ล็อกอิน ----------
    check("ผู้ไม่ได้ล็อกอินดูคลังรูปไม่ได้ (401)", (await fetch(`${BASE}/api/inline-media`)).status === 401);
    const anonUpload = await upload({ alt: "x", credit: "x", usageRights: "own" }, await png("#888"), "image/png", "a.png", "");
    check("ผู้ไม่ได้ล็อกอินอัปโหลดไม่ได้ (401)", anonUpload.status === 401, `ได้ ${anonUpload.status}`);
    check("ผู้ไม่ได้ล็อกอินเปลี่ยนรูปไม่ได้ (401)", (await post({ at: "g:home-page:hero.image", media: 1 }, "")).status === 401);

    // ---------- หน้าเว็บในโหมดแก้ไข ----------
    const editingHtml = await (await fetch(`${BASE}/`, { headers: { cookie: jar } })).text();
    check("โหมดแก้ไขมีปุ่มเปลี่ยนรูป", editingHtml.includes("image-edit"));
    check("โหมดแก้ไขมีปุ่มเปลี่ยนโลโก้", editingHtml.includes("เปลี่ยนโลโก้"));
    const publicHtml = await (await fetch(`${BASE}/`)).text();
    check("ผู้เข้าชมทั่วไปไม่เห็นปุ่มเปลี่ยนรูป", !publicHtml.includes("image-edit"));

    // ---------- อัปโหลด ----------
    const pendingFile = await png("#aa3333");
    const pending = await payload.create({
      collection: "media",
      data: { alt: "รูปทดสอบที่ยังไม่ได้ขออนุญาต", credit: "ตรวจระบบ", usageRights: "pending" } as never,
      file: { data: pendingFile, mimetype: "image/png", name: "check-pending.png", size: pendingFile.length },
    });
    cleanups.push(() => payload.delete({ collection: "media", id: pending.id }));

    const uploaded = await upload(
      { alt: "รูปทดสอบระบบเปลี่ยนรูป", credit: "ตรวจระบบ", usageRights: "own" },
      await png("#2e7d52"),
      "image/png",
      "ทดสอบ รูป!.png"
    );
    const uploadedBody = (await uploaded.json()) as {
      ok?: boolean;
      message?: string;
      media?: { id: number; url: string; thumbUrl: string; filename: string };
    };
    check("อัปโหลดรูปจากหน้าเว็บได้", uploaded.ok && uploadedBody.ok === true, uploadedBody.message ?? "");
    const media = uploadedBody.media;
    if (!media) throw new Error("อัปโหลดไม่สำเร็จ ตรวจต่อไม่ได้");
    cleanups.push(() => payload.delete({ collection: "media", id: media.id }));
    check("ชื่อไฟล์ถูกทำให้ปลอดภัย", /^ทดสอบ-รูป(-\d+)?\.png$/.test(media.filename), media.filename);
    check("สร้างรูปย่อให้", media.thumbUrl !== media.url && media.thumbUrl.includes("320x320"), media.thumbUrl);
    check("เปิดไฟล์ที่อัปโหลดได้", (await fetch(`${BASE}${media.url}`)).ok);

    const credit = { alt: "x", credit: "x", usageRights: "own" };
    const rejects: [string, Promise<Response>, number][] = [
      ["ไฟล์ SVG", upload(credit, Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'), "image/svg+xml", "x.svg"), 415],
      ["ข้อความที่ตั้งชื่อเป็น .png", upload(credit, Buffer.from("not an image at all"), "image/png", "fake.png"), 415],
      ["ไม่กรอกคำบรรยายภาพ", upload({ ...credit, alt: "  " }, await png("#111"), "image/png", "a.png"), 400],
      ["ไม่กรอกเจ้าของภาพ", upload({ ...credit, credit: "" }, await png("#111"), "image/png", "a.png"), 400],
      ["สิทธิ์ยังไม่ได้ขออนุญาต", upload({ ...credit, usageRights: "pending" }, await png("#111"), "image/png", "a.png"), 400],
    ];
    for (const [name, request, status] of rejects) {
      const response = await request;
      check(`ปฏิเสธการอัปโหลด: ${name}`, response.status === status, `ได้ ${response.status}`);
    }

    // ---------- คลังรูป ----------
    const library = (await (await fetch(`${BASE}/api/inline-media`, { headers: { cookie: jar } })).json()) as {
      docs?: { id: number }[];
    };
    const ids = (library.docs ?? []).map((doc) => doc.id);
    check("คลังรูปมีรูปที่เพิ่งอัปโหลด", ids.includes(media.id));
    check("คลังรูปไม่แสดงรูปที่ยังไม่ได้ขออนุญาต", !ids.includes(pending.id as number));
    const search = (await (
      await fetch(`${BASE}/api/inline-media?q=${encodeURIComponent("ทดสอบระบบเปลี่ยนรูป")}`, { headers: { cookie: jar } })
    ).json()) as { docs?: { id: number }[] };
    check("ค้นหาในคลังรูปได้", search.docs?.length === 1 && search.docs[0].id === media.id, JSON.stringify(search.docs));

    // ---------- เปลี่ยนรูปในกลุ่มฟิลด์ (หน้าแรก) ----------
    const readHome = async (draft: boolean) =>
      ((await payload.findGlobal({ slug: "home-page", depth: 0, locale: "th", draft })) as unknown as Doc).hero as Doc;
    const heroSnapshot = { draft: await readHome(true), published: await readHome(false) };
    cleanups.unshift(() =>
      restoreBoth(heroSnapshot, (hero, draft) =>
        payload.updateGlobal({ slug: "home-page", data: { hero, ...status(draft) } as never, locale: "th", draft })
      )
    );

    const setHero = await post({ at: "g:home-page:hero.image", media: media.id });
    const setHeroBody = (await setHero.json()) as { ok?: boolean; scope?: string; message?: string };
    check("เปลี่ยนภาพหลักหน้าแรกได้", setHero.ok && setHeroBody.ok === true, setHeroBody.message ?? "");
    check("คืนขอบเขตของเอกสารที่แก้", setHeroBody.scope === "g:home-page", String(setHeroBody.scope));
    const heroAfter = await readHome(true);
    check("ฉบับร่างได้รูปใหม่", heroAfter.image === media.id, String(heroAfter.image));
    check("ช่องอื่นในกลุ่มไม่เปลี่ยน", heroAfter.subtitle === heroSnapshot.draft.subtitle);
    const draftHtml = await (await fetch(`${BASE}/`, { headers: { cookie: jar } })).text();
    const stem = media.filename.replace(/\.png$/, "");
    check("หน้าเว็บฉบับร่างแสดงรูปใหม่", draftHtml.includes(encodeURIComponent(stem)) || draftHtml.includes(stem));
    const stillPublic = await (await fetch(`${BASE}/`)).text();
    check("ผู้เข้าชมทั่วไปยังไม่เห็นรูปใหม่", !stillPublic.includes(encodeURIComponent(stem)) && !stillPublic.includes(stem));

    const same = (await (await post({ at: "g:home-page:hero.image", media: media.id })).json()) as { unchanged?: boolean };
    check("เลือกรูปเดิมซ้ำไม่สร้างฉบับร่างใหม่", same.unchanged === true);

    const removeHero = await post({ at: "g:home-page:hero.image", media: null });
    check("นำรูปออกจากช่องที่ไม่บังคับได้", removeHero.ok, `ได้ ${removeHero.status}`);
    check("ฉบับร่างไม่มีรูปแล้ว", (await readHome(true)).image == null);
    const emptyHtml = await (await fetch(`${BASE}/`, { headers: { cookie: jar } })).text();
    check("โหมดแก้ไขแสดงกล่องเพิ่มรูปแทน", emptyHtml.includes("เพิ่มภาพหลัก"));

    // ---------- แถวในอาร์เรย์ (รูปสินค้า) ----------
    const product = (await payload.find({ collection: "products", limit: 1, depth: 0, draft: true, locale: "th" }))
      .docs[0] as unknown as Doc & { id: number; gallery: { id: string; image: number }[] };
    const productSnapshot = { draft: product.gallery, published: (await payload.findByID({ collection: "products", id: product.id, depth: 0, locale: "th" }) as unknown as typeof product).gallery };
    cleanups.unshift(() =>
      restoreBoth(productSnapshot, (gallery, draft) =>
        payload.update({ collection: "products", id: product.id, data: { gallery, ...status(draft) } as never, locale: "th", draft })
      )
    );
    const row = product.gallery.length > 1 ? 1 : 0;
    const setRow = await post({ at: `c:products:${product.id}:gallery.${row}.image`, media: media.id });
    check("เปลี่ยนรูปสินค้าแถวที่ระบุได้", setRow.ok, `ได้ ${setRow.status}`);
    const galleryAfter = ((await payload.findByID({ collection: "products", id: product.id, depth: 0, draft: true, locale: "th" })) as unknown as typeof product).gallery;
    check("แถวที่ระบุได้รูปใหม่", galleryAfter[row]?.image === media.id);
    check(
      "แถวอื่นและรหัสแถวไม่เปลี่ยน",
      galleryAfter.length === product.gallery.length &&
        galleryAfter.every((item, index) => item.id === product.gallery[index].id && (index === row || item.image === product.gallery[index].image))
    );

    // ---------- ไอคอนเว็บ ----------
    const readSite = async (draft: boolean) =>
      ((await payload.findGlobal({ slug: "site-settings", depth: 0, draft })) as unknown as Doc).favicon ?? null;
    const siteSnapshot = { draft: await readSite(true), published: await readSite(false) };
    cleanups.unshift(() =>
      restoreBoth(siteSnapshot, (favicon, draft) =>
        payload.updateGlobal({ slug: "site-settings", data: { favicon, ...status(draft) } as never, draft })
      )
    );
    const setIcon = await post({ at: "g:site-settings:favicon", media: media.id });
    check("ตั้งไอคอนเว็บได้", setIcon.ok, `ได้ ${setIcon.status}`);
    const iconHtml = await (await fetch(`${BASE}/about`, { headers: { cookie: jar } })).text();
    const iconLink = iconHtml.match(/<link rel="icon" href="([^"]+)"/)?.[1] ?? "";
    check("ฉบับร่างใช้ไอคอนใหม่ (รูปย่อจัตุรัส)", iconLink === media.thumbUrl, iconLink);
    const publicIcon = (await (await fetch(`${BASE}/about`)).text()).match(/<link rel="icon" href="([^"]+)"/)?.[1];
    check("ผู้เข้าชมทั่วไปยังเห็นไอคอนเดิม", publicIcon !== media.thumbUrl, String(publicIcon));

    // ---------- คำขอที่ต้องถูกปฏิเสธ ----------
    const cases: [string, Doc, number][] = [
      ["รูปที่ยังไม่ได้ขออนุญาต", { at: "g:home-page:hero.image", media: pending.id }, 400],
      ["รูปที่ไม่มีอยู่จริง", { at: "g:home-page:hero.image", media: 987654321 }, 404],
      ["id รูปแปลกปลอม", { at: "g:home-page:hero.image", media: "1;drop table media" }, 400],
      ["ช่องข้อความ", { at: "g:home-page:hero.subtitle", media: media.id }, 400],
      ["ช่องที่ไม่มีอยู่จริง", { at: "g:home-page:hero.notAField", media: media.id }, 400],
      ["ภาพตอนแชร์ของเอกสารนอกรายการ", { at: "g:seo-settings:defaultOgImage", media: media.id }, 400],
      ["นำรูปออกจากช่องบังคับ", { at: `c:products:${product.id}:gallery.0.image`, media: null }, 400],
      ["แถวที่ยังไม่มี", { at: `c:products:${product.id}:gallery.99.image`, media: media.id }, 400],
    ];
    for (const [name, body, status] of cases) {
      const response = await post(body);
      check(`ปฏิเสธ: ${name}`, response.status === status, `ได้ ${response.status}`);
    }
    const crossOrigin = await post({ at: "g:home-page:hero.image", media: media.id }, jar, "https://evil.example");
    check("ปฏิเสธคำขอจากโดเมนอื่น (403)", crossOrigin.status === 403, `ได้ ${crossOrigin.status}`);
    const crossUpload = await fetch(`${BASE}/api/inline-media`, { headers: { cookie: jar, origin: "https://evil.example" } });
    check("ปฏิเสธคลังรูปจากโดเมนอื่น (403)", crossUpload.status === 403, `ได้ ${crossUpload.status}`);
  } finally {
    // คืนค่าและลบของทดสอบให้ได้เสมอ แม้การตรวจจะพังกลางทาง — คืนเนื้อหาก่อนลบรูป
    for (const cleanup of cleanups) {
      await cleanup().catch((error) => console.log(`คืนค่าไม่สำเร็จ: ${String(error)}`));
    }
    await payload.delete({ collection: "users", id: user.id });
    console.log("\nคืนค่าเนื้อหา ลบรูปทดสอบ และลบผู้ใช้ทดสอบแล้ว");
  }

  console.log(`\nผ่าน ${passed} · ไม่ผ่าน ${failed}`);
  process.exit(failed === 0 ? 0 : 1);
}

void main();

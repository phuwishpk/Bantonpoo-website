import {
  getAtPath,
  MAX_VALUE_LENGTH,
  parseAddress,
  parseMediaId,
  parseTarget,
  scopeOf,
  setAtPath,
  type Address,
  type Target,
} from "@/lib/cms/inline";
import {
  deny,
  messageOf,
  requireEditor,
  type Cms,
  type CmsUser as User,
} from "@/lib/cms/inline-request";
import { findMediaField, findTextField } from "@/lib/cms/inline-schema";

/**
 * บันทึกข้อความที่แก้จากหน้าเว็บ
 *
 * หลักการที่ยึดไว้สามข้อ
 *   1. ตรวจสิทธิ์จากคุกกี้ล็อกอินของ Payload เสมอ ไม่ใช้กุญแจลับในลิงก์
 *   2. รับเฉพาะเอกสารและเส้นทางที่อยู่ในรายการอนุญาต และเฉพาะช่องที่ตรงชนิด
 *      ตามสคีมา (ข้อความรับสตริง ช่องรูปรับ id ของคลังรูป) ค่าที่ส่งมาจึงไม่มีทาง
 *      ไปทับโครงสร้างข้อมูลอื่น เช่น อาร์เรย์หรือความสัมพันธ์
 *   3. ส่งกลับเฉพาะกิ่งบนสุดของเส้นทางที่แก้ ไม่ส่งเอกสารทั้งก้อน เพื่อไม่ให้ทับ
 *      ฟิลด์อื่นที่คนอื่นอาจกำลังแก้อยู่พร้อมกัน
 *
 * ทุกการบันทึกลงเป็น "ฉบับร่าง" เมื่อเอกสารนั้นรองรับ ผู้เข้าชมทั่วไปจึงยังไม่เห็น
 * จนกว่าจะกดเผยแพร่
 *
 * คำขอมีสามแบบ แยกด้วย action
 *   (ไม่มี)   { at, value, multiline }  แก้ข้อความ
 *   "image"   { at, media }             เปลี่ยนรูป (media = id ในคลังรูป หรือ null เพื่อนำรูปออก)
 *   "publish" { scopes }                เผยแพร่ฉบับร่างของเอกสารที่แก้ไว้
 */

/** ภาษาที่หน้าเว็บใช้อยู่ตอนนี้ (ดู src/lib/i18n.ts) */
const LOCALE = "th" as const;

/**
 * ทำความสะอาดข้อความที่รับมา
 *
 * ช่องแก้ไขบนหน้าเว็บแทรกช่องว่างแบบ non-breaking และตัวขึ้นบรรทัดของ Windows
 * มาให้เองเวลาวางข้อความ ถ้าไม่ล้างออก ข้อความที่เก็บจะต่างจากที่พิมพ์ในหลังบ้าน
 * ทั้งที่ตามองเห็นเหมือนกัน แล้วจะตามแก้ยากมากภายหลัง
 */
function clean(raw: unknown, multiline: boolean): string | null {
  if (typeof raw !== "string") return null;
  const text = raw
    .replace(/\r\n?/g, "\n")
    .replace(/\u00a0/g, " ")
    .split("\n")
    // อักขระควบคุมอื่นนอกจากขึ้นบรรทัดใหม่ไม่มีที่ใช้ในเนื้อหา
    .map((line) => line.replace(/\p{Cc}/gu, "").replace(/[ \t]+$/, ""))
    .join("\n");
  const normalised = multiline
    ? text.replace(/\n{3,}/g, "\n\n").trim()
    : text.replace(/\n+/g, " ").trim();
  return normalised.length > MAX_VALUE_LENGTH ? null : normalised;
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return deny("รูปแบบคำขอไม่ถูกต้อง", 415);
  }

  const auth = await requireEditor(request);
  if (auth instanceof Response) return auth;
  const { cms, user } = auth;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return deny("อ่านคำขอไม่ได้", 400);
  }

  if (body.action === "publish") return publish(cms, user, body);
  if (body.action === "image") return saveImage(cms, user, body);
  return save(cms, user, body);
}

/* ------------------------------------------------------------------
   บันทึกฉบับร่าง
   ------------------------------------------------------------------ */

async function save(cms: Cms, user: User, body: Record<string, unknown>) {
  const address = parseAddress(body.at);
  if (!address) return deny("ไม่รู้จักช่องที่ต้องการแก้", 400);

  const value = clean(body.value, body.multiline === true);
  if (value === null) return deny("ข้อความยาวเกินไปหรือรูปแบบไม่ถูกต้อง", 400);

  const doc = await readDoc(cms, address, user);
  if (!doc) return deny("ไม่พบเอกสารที่ต้องการแก้", 404);

  // เทียบกับสคีมาก่อนเขียน — ชื่อฟิลด์ที่พิมพ์ผิดหรือช่องที่ไม่ใช่ข้อความจะตกที่นี่
  if (!findTextField(fieldsOf(cms, address), address.path, doc)) {
    return deny("ช่องนี้แก้จากหน้าเว็บไม่ได้ ต้องแก้จากหลังบ้าน", 400);
  }

  return writeValue(cms, user, address, doc, value);
}

/* ------------------------------------------------------------------
   เปลี่ยนรูป
   ------------------------------------------------------------------ */

/**
 * ผูกรูปจากคลังรูปเข้ากับช่องรูปหนึ่งช่อง
 *
 * รับแค่ id ของรูปที่มีอยู่แล้ว — การอัปโหลดไฟล์ใหม่แยกไปที่ /api/inline-media
 * ซึ่งบังคับกรอกคำบรรยายภาพและเจ้าของภาพก่อน รูปทุกรูปบนเว็บจึงตรวจที่มาได้เสมอ
 */
async function saveImage(cms: Cms, user: User, body: Record<string, unknown>) {
  const address = parseAddress(body.at);
  if (!address) return deny("ไม่รู้จักช่องที่ต้องการแก้", 400);

  const removing = body.media === null;
  const mediaId = removing ? null : parseMediaId(body.media);
  if (!removing && mediaId === null) return deny("ไม่รู้จักรูปที่เลือก", 400);

  const doc = await readDoc(cms, address, user);
  if (!doc) return deny("ไม่พบเอกสารที่ต้องการแก้", 404);

  const field = findMediaField(fieldsOf(cms, address), address.path, doc);
  if (!field) return deny("ช่องนี้เปลี่ยนรูปจากหน้าเว็บไม่ได้ ต้องแก้จากหลังบ้าน", 400);
  if (removing && field.required) return deny("ช่องนี้ต้องมีรูปเสมอ เลือกรูปอื่นแทนได้", 400);

  let value: number | string | null = null;
  if (mediaId !== null) {
    const media = (await cms
      .findByID({
        collection: "media",
        id: mediaId,
        depth: 0,
        user,
        overrideAccess: false,
        disableErrors: true,
      })
      .catch(() => null)) as { id: number | string; usageRights?: string } | null;
    if (!media) return deny("ไม่พบรูปนี้ในคลังรูป อาจถูกลบไปแล้ว", 404);
    // รูปที่ยังไม่ได้ขออนุญาตห้ามขึ้นเว็บ (ดูคำอธิบายในคอลเลกชัน Media)
    if (media.usageRights === "pending") {
      return deny("รูปนี้ยังไม่ได้รับอนุญาตให้ใช้ แก้สิทธิ์การใช้งานในคลังรูปก่อน", 400);
    }
    value = media.id;
  }

  return writeValue(cms, user, address, doc, value);
}

/**
 * เขียนค่าหนึ่งช่องลงเอกสาร
 *
 * ส่งกลับเฉพาะกิ่งบนสุดของเส้นทาง ไม่ส่งเอกสารทั้งก้อน เพื่อไม่ให้ทับฟิลด์อื่น
 * ที่คนอื่นอาจกำลังแก้อยู่พร้อมกัน เอกสารอ่านด้วย depth 0 รูปในกิ่งเดียวกันจึงเป็น id
 * อยู่แล้ว เขียนกลับไปได้ตรง ๆ
 */
async function writeValue(
  cms: Cms,
  user: User,
  address: Address,
  doc: Record<string, unknown>,
  value: unknown
) {
  const current = getAtPath(doc, address.path);
  // ช่องรูปที่ถูก populate มาจะเป็นอ็อบเจกต์ เทียบด้วย id
  const currentValue =
    current && typeof current === "object" && "id" in current ? (current as { id: unknown }).id : current;
  if (currentValue === value || (value === null && currentValue === undefined)) {
    return Response.json({ ok: true, unchanged: true });
  }

  const [top, ...rest] = address.path;
  let branch: unknown = value;
  if (rest.length > 0) {
    // กลุ่มฟิลด์ที่ยังไม่เคยกรอกเลย Payload จะไม่ส่งกลับมา แต่ถ้าชั้นถัดไปเป็นเลขลำดับ
    // แปลว่าเป็นอาร์เรย์ซึ่งสร้างแถวเองไม่ได้ ต้องปล่อยให้ setAtPath ปฏิเสธ
    const seed = doc[top] ?? (/^\d+$/.test(rest[0]) ? null : {});
    branch = structuredClone(seed);
    if (!setAtPath(branch, rest, value)) return deny("ไม่พบช่องที่ต้องการแก้ในเอกสาร", 400);
  }

  try {
    await writeDoc(cms, address, user, { [top]: branch }, address.drafts);
  } catch (error) {
    return deny(messageOf(error), 422);
  }

  return Response.json({
    ok: true,
    scope: scopeOf(address),
    label: address.label,
    drafts: address.drafts,
  });
}

/* ------------------------------------------------------------------
   เผยแพร่
   ------------------------------------------------------------------ */

/**
 * ยกฉบับร่างล่าสุดขึ้นเป็นฉบับเผยแพร่
 *
 * ต้องอ่านฉบับร่างมาแล้วเขียนกลับพร้อม _status: "published" เพราะ Payload เก็บ
 * ฉบับร่างกับฉบับเผยแพร่แยกเวอร์ชันกัน การตั้งสถานะอย่างเดียวจะเผยแพร่ข้อมูลเก่า
 *
 * ขั้นตอนนี้ตรวจฟิลด์ที่บังคับกรอกด้วย (ฉบับร่างไม่ตรวจ) ถ้ามีช่องว่างอยู่
 * การเผยแพร่จะไม่ผ่าน แล้วส่งข้อความบอกกลับไปให้ผู้ดูแลเห็นบนหน้าเว็บ
 */
async function publish(cms: Cms, user: User, body: Record<string, unknown>) {
  const scopes = Array.isArray(body.scopes) ? body.scopes.slice(0, 20) : [];
  const done: string[] = [];
  const failed: { label: string; message: string }[] = [];

  for (const scope of scopes) {
    const target = parseTarget(scope);
    if (!target || !target.drafts) continue;

    try {
      const draft = await readDoc(cms, target, user);
      if (!draft) continue;
      await writeDoc(cms, target, user, { ...stripMeta(draft), _status: "published" }, false);
      done.push(target.label);
    } catch (error) {
      failed.push({ label: target.label, message: messageOf(error) });
    }
  }

  return Response.json({ ok: failed.length === 0, done, failed });
}

/** ฟิลด์ที่ Payload จัดการเอง — ส่งกลับไปแล้วไม่มีผลหรือทำให้เกิดข้อผิดพลาด */
function stripMeta(doc: Record<string, unknown>): Record<string, unknown> {
  const rest = { ...doc };
  for (const key of ["id", "createdAt", "updatedAt", "globalType", "_status"]) delete rest[key];
  return rest;
}

/* ------------------------------------------------------------------
   อ่าน/เขียนผ่าน Local API
   ------------------------------------------------------------------ */

/** ผังฟิลด์ของเอกสาร ใช้ตรวจว่าเส้นทางที่ขอมาชี้ไปยังช่องข้อความจริง */
function fieldsOf(cms: Cms, target: Target) {
  if (target.kind === "global") {
    return cms.globals.config.find((global) => global.slug === target.slug)?.fields ?? [];
  }
  return cms.collections[target.collection as keyof Cms["collections"]]?.config.fields ?? [];
}

async function readDoc(cms: Cms, target: Target, user: User) {
  const common = {
    depth: 0 as const,
    locale: LOCALE,
    // ต้องปิด fallback ไม่งั้นค่าที่อ่านได้อาจเป็นของอีกภาษา แล้วเขียนทับผิดช่อง
    fallbackLocale: false as const,
    draft: target.drafts,
    user,
    overrideAccess: false,
  };

  if (target.kind === "global") {
    return (await cms.findGlobal({
      slug: target.slug as never,
      ...common,
    })) as unknown as Record<string, unknown>;
  }
  return (await cms.findByID({
    collection: target.collection as never,
    id: target.id,
    ...common,
  })) as unknown as Record<string, unknown>;
}

async function writeDoc(
  cms: Cms,
  target: Target,
  user: User,
  data: Record<string, unknown>,
  asDraft: boolean
) {
  const common = {
    data: data as never,
    locale: LOCALE,
    fallbackLocale: false as const,
    user,
    overrideAccess: false,
    draft: asDraft,
  };

  if (target.kind === "global") {
    return cms.updateGlobal({ slug: target.slug as never, ...common });
  }
  return cms.update({ collection: target.collection as never, id: target.id, ...common });
}

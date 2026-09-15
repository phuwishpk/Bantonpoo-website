import { getCms } from "@/lib/cms/client";
import {
  getAtPath,
  MAX_VALUE_LENGTH,
  parseAddress,
  parseTarget,
  scopeOf,
  setAtPath,
  type Target,
} from "@/lib/cms/inline";

/**
 * บันทึกข้อความที่แก้จากหน้าเว็บ
 *
 * หลักการที่ยึดไว้สามข้อ
 *   1. ตรวจสิทธิ์จากคุกกี้ล็อกอินของ Payload เสมอ ไม่ใช้กุญแจลับในลิงก์
 *   2. รับเฉพาะเอกสารและเส้นทางที่อยู่ในรายการอนุญาต และเฉพาะช่องที่เดิมเป็นข้อความ
 *      สตริงจึงไม่มีทางไปทับโครงสร้างข้อมูล เช่น อาร์เรย์หรือความสัมพันธ์
 *   3. ส่งกลับเฉพาะกิ่งบนสุดของเส้นทางที่แก้ ไม่ส่งเอกสารทั้งก้อน เพื่อไม่ให้ทับ
 *      ฟิลด์อื่นที่คนอื่นอาจกำลังแก้อยู่พร้อมกัน
 *
 * ทุกการบันทึกลงเป็น "ฉบับร่าง" เมื่อเอกสารนั้นรองรับ ผู้เข้าชมทั่วไปจึงยังไม่เห็น
 * จนกว่าจะกดเผยแพร่
 */

/** ภาษาที่หน้าเว็บใช้อยู่ตอนนี้ (ดู src/lib/i18n.ts) */
const LOCALE = "th";

type Cms = Awaited<ReturnType<typeof getCms>>;
type User = Parameters<Cms["updateGlobal"]>[0]["user"];

function deny(message: string, status: number) {
  return Response.json({ ok: false, message }, { status });
}

/** กันการถูกเว็บอื่นยิงคำขอแทนผู้ใช้ที่ล็อกอินค้างไว้ */
function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // คำขอที่ไม่ได้ข้ามโดเมนจะไม่ส่ง Origin มา
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

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
  if (!sameOrigin(request)) return deny("คำขอมาจากโดเมนอื่น", 403);
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return deny("รูปแบบคำขอไม่ถูกต้อง", 415);
  }

  const cms = await getCms();
  const { user } = await cms.auth({ headers: request.headers });
  if (!user) return deny("ต้องเข้าสู่ระบบหลังบ้านก่อนจึงจะแก้ไขได้", 401);

  const role = (user as { role?: string }).role;
  if (role !== "admin" && role !== "editor") {
    return deny("บัญชีนี้ดูได้อย่างเดียว ยังแก้ไขเนื้อหาไม่ได้", 403);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return deny("อ่านคำขอไม่ได้", 400);
  }

  return body.action === "publish"
    ? publish(cms, user as User, body)
    : save(cms, user as User, body);
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

  // ช่องที่แก้ได้ต้องเป็นข้อความอยู่แล้ว — กันไม่ให้สตริงไปทับอาร์เรย์หรือกลุ่มฟิลด์
  const current = getAtPath(doc, address.path);
  if (typeof current !== "string" && current !== null && current !== undefined) {
    return deny("ช่องนี้ไม่ใช่ช่องข้อความ ต้องแก้จากหลังบ้าน", 400);
  }
  if (current === value) return Response.json({ ok: true, unchanged: true });

  // ส่งกลับเฉพาะกิ่งบนสุดของเส้นทาง ไม่ส่งเอกสารทั้งก้อน
  const [top, ...rest] = address.path;
  let branch: unknown = value;
  if (rest.length > 0) {
    branch = structuredClone(doc[top] ?? null);
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

function messageOf(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "บันทึกไม่สำเร็จ";
}

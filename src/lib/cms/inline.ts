/**
 * ที่อยู่ของข้อความหนึ่งช่องบนหน้าเว็บ
 *
 * ปัญหาของการ "แก้ในหน้าเว็บ" ไม่ใช่การพิมพ์ แต่คือการรู้ว่าข้อความที่คลิกอยู่นั้น
 * คือฟิลด์ไหนของเอกสารไหน ไฟล์นี้จึงกำหนดรูปแบบที่อยู่ที่ใช้ร่วมกันทั้งฝั่งหน้าเว็บ
 * (ตอนเรนเดอร์) และฝั่ง API (ตอนบันทึก) เพื่อไม่ให้สองฝั่งตีความคนละแบบ
 *
 *   g:<global>:<path>            เช่น  g:home-page:hero.subtitle
 *   c:<collection>:<id>:<path>   เช่น  c:products:12:name
 *
 * path คั่นด้วยจุด และใช้ตัวเลขแทนลำดับในอาร์เรย์ เช่น assets.0.title
 * ส่วนที่ตัด path ออก (เช่น g:home-page) เรียกว่า "ขอบเขต" ใช้ตอนกดเผยแพร่
 */

/** เอกสารที่ยอมให้แก้จากหน้าเว็บได้ — นอกรายการนี้ API จะปฏิเสธเสมอ */
export const EDITABLE_GLOBALS: Record<string, { label: string; drafts: boolean }> = {
  "site-settings": { label: "ข้อมูลชุมชน", drafts: true },
  navigation: { label: "เมนูนำทางและท้ายเว็บ", drafts: true },
  "ui-labels": { label: "ข้อความบนปุ่มและป้ายกำกับ", drafts: true },
  "home-page": { label: "หน้าแรก", drafts: true },
  "about-page": { label: "หน้าเกี่ยวกับชุมชน", drafts: true },
  "shop-page": { label: "หน้าสินค้าชุมชน", drafts: true },
  "stories-page": { label: "หน้าเรื่องเล่า", drafts: true },
  "tourism-page": { label: "หน้าท่องเที่ยว", drafts: true },
  "contact-page": { label: "หน้าติดต่อเรา", drafts: true },
  "not-found-page": { label: "หน้าไม่พบข้อมูล", drafts: false },
};

/**
 * คอลเลกชันที่ยอมให้แก้จากหน้าเว็บได้
 *
 * ธีมและผู้ใช้ไม่อยู่ในรายการนี้โดยตั้งใจ — ช่อง CSS เพิ่มเติมและบทบาทผู้ใช้
 * ต้องแก้ผ่านหลังบ้านที่มีการตรวจสิทธิ์ระดับฟิลด์อยู่แล้วเท่านั้น
 */
export const EDITABLE_COLLECTIONS: Record<string, { label: string; drafts: boolean }> = {
  products: { label: "สินค้า", drafts: true },
  articles: { label: "บทความ", drafts: true },
  pages: { label: "หน้าที่สร้างเอง", drafts: true },
  workshops: { label: "ฐานเรียนรู้และกิจกรรม", drafts: false },
  places: { label: "จุดเช็กอิน", drafts: false },
  artisans: { label: "ปราชญ์ชุมชน", drafts: false },
  categories: { label: "หมวดหมู่", drafts: false },
};

/** เอกสารหนึ่งฉบับ โดยยังไม่ระบุว่าจะแก้ช่องไหน */
export type Target =
  | { kind: "global"; slug: string; label: string; drafts: boolean }
  | { kind: "doc"; collection: string; id: string; label: string; drafts: boolean };

export type Address = Target & { path: string[] };

/** ชื่อฟิลด์ต้องเป็นตัวระบุธรรมดา หรือเลขลำดับในอาร์เรย์เท่านั้น */
const SEGMENT = /^(?:[A-Za-z][A-Za-z0-9_]*|\d{1,3})$/;

/** ความยาวสูงสุดของข้อความหนึ่งช่อง — กันการยัดข้อมูลก้อนใหญ่ผ่านช่องทางนี้ */
export const MAX_VALUE_LENGTH = 6000;

/** ขอบเขตของเอกสาร เช่น "g:home-page" หรือ "c:products:12" */
export function parseTarget(scope: unknown): Target | null {
  if (typeof scope !== "string" || scope.length > 200) return null;
  const parts = scope.split(":");

  if (parts[0] === "g" && parts.length === 2) {
    const config = EDITABLE_GLOBALS[parts[1]];
    return config ? { kind: "global", slug: parts[1], ...config } : null;
  }

  if (parts[0] === "c" && parts.length === 3) {
    const config = EDITABLE_COLLECTIONS[parts[1]];
    // id ของ Postgres เป็นตัวเลข แต่รับเป็นสตริงไว้เผื่อเปลี่ยนฐานข้อมูลภายหลัง
    if (!config || !/^[A-Za-z0-9-]{1,64}$/.test(parts[2])) return null;
    return { kind: "doc", collection: parts[1], id: parts[2], ...config };
  }

  return null;
}

/** ที่อยู่เต็มของช่องหนึ่งช่อง = ขอบเขต + เส้นทางของฟิลด์ */
export function parseAddress(at: unknown): Address | null {
  if (typeof at !== "string" || at.length > 300) return null;
  const cut = at.lastIndexOf(":");
  if (cut < 0) return null;

  const target = parseTarget(at.slice(0, cut));
  const path = splitPath(at.slice(cut + 1));
  return target && path ? { ...target, path } : null;
}

/** ขอบเขตของที่อยู่หนึ่ง ๆ ใช้บอกหน้าเว็บว่ามีเอกสารไหนถูกแก้ไปบ้าง */
export function scopeOf(target: Target): string {
  return target.kind === "global" ? `g:${target.slug}` : `c:${target.collection}:${target.id}`;
}

function splitPath(raw: string): string[] | null {
  if (!raw) return null;
  const segments = raw.split(".");
  if (segments.length > 8) return null;
  return segments.every((segment) => SEGMENT.test(segment)) ? segments : null;
}

/** อ่านค่าตามเส้นทาง คืน undefined ถ้าเส้นทางไม่มีอยู่จริง */
export function getAtPath(root: unknown, path: string[]): unknown {
  let current: unknown = root;
  for (const segment of path) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

/**
 * เขียนค่าตามเส้นทาง
 *
 * สร้างกลุ่มฟิลด์ที่ยังไม่มีให้ได้ เพราะ Payload ไม่ส่งคีย์ของช่องที่ยังว่างกลับมาเลย
 * ถ้าไม่ยอมสร้าง ผู้ดูแลจะกรอกช่องที่ยังว่างจากหน้าเว็บไม่ได้สักช่อง
 *
 * แต่ไม่สร้าง "แถวในอาร์เรย์" ให้ — เส้นทางที่ชี้ไปยังแถวที่ยังไม่มีจะคืน false
 * เพราะแถวใหม่ต้องมีฟิลด์อื่นครบด้วย การเดาโครงสร้างเองจะได้ข้อมูลที่ไม่ตรงสคีมา
 *
 * ผู้เรียกต้องตรวจเส้นทางกับสคีมาก่อน (ดู findTextField) ไม่งั้นชื่อฟิลด์ที่พิมพ์ผิด
 * จะกลายเป็นคีย์ใหม่ในเอกสาร
 */
export function setAtPath(root: unknown, path: string[], value: unknown): boolean {
  if (path.length === 0) return false;

  let current: unknown = root;
  for (let index = 0; index < path.length - 1; index += 1) {
    if (current === null || typeof current !== "object") return false;
    const holder = current as Record<string, unknown>;
    const segment = path[index];

    if (holder[segment] === undefined || holder[segment] === null) {
      // แถวในอาร์เรย์สร้างเองไม่ได้ ต้องไปเพิ่มในหลังบ้าน
      const nextIsRow = /^\d+$/.test(path[index + 1]);
      if (Array.isArray(holder) || /^\d+$/.test(segment) || nextIsRow) return false;
      holder[segment] = {};
    }
    current = holder[segment];
  }

  if (current === null || typeof current !== "object") return false;
  (current as Record<string, unknown>)[path[path.length - 1]] = value;
  return true;
}

/** id ของรูปในคลัง — ตัวเลขของ SQLite หรือสตริงถ้าเปลี่ยนฐานข้อมูลภายหลัง */
export function parseMediaId(raw: unknown): number | string | null {
  if (typeof raw === "number") return Number.isSafeInteger(raw) && raw > 0 ? raw : null;
  if (typeof raw === "string" && /^[A-Za-z0-9-]{1,64}$/.test(raw)) return raw;
  return null;
}

/** ตัวช่วยสร้างที่อยู่ ใช้ในหน้าเว็บเพื่อไม่ต้องพิมพ์ prefix ซ้ำทุกจุด */
export const atGlobal =
  (slug: string) =>
  (path: string): string =>
    `g:${slug}:${path}`;

export const atDoc =
  (collection: string, id: string | number) =>
  (path: string): string =>
    `c:${collection}:${id}:${path}`;

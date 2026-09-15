import type { Localized, Media } from "@/content/types";
import { loc, locList, mapMedia } from "./map";

/**
 * ตัวช่วยอ่านค่าจาก Global ประจำหน้า
 *
 * Global คืนข้อมูลดิบมาเป็นอ็อบเจกต์ ฟังก์ชันชุดนี้ดึงค่าออกมาให้เป็นชนิดที่ใช้ได้
 * พร้อมค่าสำรองเมื่อผู้ดูแลยังไม่ได้กรอก เพื่อไม่ให้หน้าเว็บพังเพราะช่องว่าง
 */

type Doc = Record<string, unknown>;

const asDoc = (value: unknown): Doc =>
  value && typeof value === "object" ? (value as Doc) : {};

export type HeroContent = { eyebrow: Localized; title: Localized; description: Localized };

export function hero(doc: Doc, key = "hero"): HeroContent {
  const group = asDoc(doc[key]);
  return {
    eyebrow: loc(group.eyebrow as never),
    title: loc(group.title as never),
    description: loc(group.description as never),
  };
}

/** หัวข้อ + คำโปรยของ section — ใช้ชื่อเดียวกับ hero แต่คนละ key */
export const section = hero;

export type TitleBody = { title: Localized; body: Localized };

export function titleBody(doc: Doc, key: string): TitleBody {
  const group = asDoc(doc[key]);
  return { title: loc(group.title as never), body: loc(group.body as never) };
}

export type LinkContent = { label: Localized; href: string };

export function link(doc: Doc, key: string): LinkContent {
  const group = asDoc(doc[key]);
  return { label: loc(group.label as never), href: String(group.href ?? "/") };
}

export function media(doc: Doc, key: string): Media | null {
  return mapMedia(doc[key]);
}

export function textList(doc: Doc, key: string): Localized<string[]> {
  return locList(doc[key]);
}

/**
 * อ่านอาร์เรย์จาก Global
 *
 * รองรับสองรูปแบบ เพราะ Payload คืนค่าต่างกัน:
 *   - อาร์เรย์ธรรมดา          → [{...}, {...}]
 *   - อาร์เรย์ที่ตั้ง localized → { th: [{...}], en: [{...}] }
 */
export function rowsOf<T>(doc: Doc, key: string, map: (row: Doc) => T): T[] {
  const raw = doc[key];
  const rows = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as Record<string, unknown>).th)
      ? ((raw as Record<string, unknown>).th as unknown[])
      : [];
  return rows.map((row) => map(asDoc(row)));
}

/** ตัวเลขสถิติ เช่น "5,870 / ประชากรในชุมชน" */
export function stats(doc: Doc, key: string) {
  return rowsOf(doc, key, (row) => ({
    value: loc(row.value as never),
    label: loc(row.label as never),
  }));
}

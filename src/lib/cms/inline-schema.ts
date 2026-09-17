import type { Field } from "payload";
import { STYLE_FIELD_NAMES } from "@/fields";

/**
 * ตรวจว่าเส้นทางที่ส่งมาชี้ไปยัง "ช่องข้อความ" หรือ "ช่องรูป" จริงตามสคีมาของ Payload
 *
 * ทำไมต้องตรวจกับสคีมา ไม่ใช่กับข้อมูล:
 * ช่องข้อความที่ยังว่างอยู่ Payload จะไม่ส่งคีย์นั้นกลับมาเลย การเช็กว่า "มีคีย์นี้
 * ในข้อมูลไหม" จึงปฏิเสธการกรอกช่องว่างที่ถูกต้อง ส่วนการเช็กว่า "ค่าเดิมเป็นสตริงไหม"
 * ก็ปล่อยชื่อฟิลด์ที่พิมพ์ผิดผ่านไปได้ เพราะค่าเดิมเป็น undefined เหมือนกัน
 * แล้วจะเกิดฉบับร่างใหม่ทั้งที่ไม่มีอะไรเปลี่ยน
 */

type AnyField = Field & {
  name?: string;
  required?: boolean;
  options?: (string | { value: string })[];
  relationTo?: unknown;
  hasMany?: boolean;
  fields?: Field[];
  tabs?: { name?: string; fields: Field[] }[];
  blocks?: { slug: string; fields: Field[] }[];
};

/** ชนิดฟิลด์ข้อความที่แก้จากหน้าเว็บได้ — ที่เหลือต้องแก้ในหลังบ้านที่มีตัวช่วยครบกว่า */
const TEXT_TYPES = new Set(["text", "textarea"]);

const isText = (field: AnyField) => TEXT_TYPES.has(field.type);

/** ช่องรูปเดี่ยวที่ผูกกับคลังรูป — ช่องที่เลือกได้หลายรูปหรือผูกคอลเลกชันอื่นไม่นับ */
const isMediaUpload = (field: AnyField) =>
  field.type === "upload" && field.relationTo === "media" && !field.hasMany;

/** ช่องสี — เฉพาะชื่อในชุดฟิลด์สี (colorFields) และต้องเป็นตัวเลือกหรือช่องรหัสสีเท่านั้น */
const STYLE_KEYS = new Set<string>(STYLE_FIELD_NAMES);
const isStyleField = (field: AnyField) =>
  STYLE_KEYS.has(field.name ?? "") && (field.type === "select" || field.type === "text");

const isIndex = (segment: string) => /^\d{1,3}$/.test(segment);

/**
 * ช่องข้อความตามเส้นทาง หรือ null
 *
 * @param data เอกสารปัจจุบัน (ถ้ามี) — ใช้เลือกชนิดบล็อกให้ตรงกับแถวจริง
 */
export function findTextField(fields: Field[], path: string[], data?: unknown): AnyField | null {
  return findField(fields, path, isText, data);
}

/** ช่องรูปภาพตามเส้นทาง หรือ null — ใช้ required ของผลลัพธ์ตัดสินว่านำรูปออกได้ไหม */
export function findMediaField(fields: Field[], path: string[], data?: unknown): AnyField | null {
  return findField(fields, path, isMediaUpload, data);
}

/** ช่องสีตามเส้นทาง หรือ null — ใช้กับคำขอเปลี่ยนสีจากหน้าเว็บ */
export function findStyleField(fields: Field[], path: string[], data?: unknown): AnyField | null {
  return findField(fields, path, isStyleField, data);
}

/** ค่าที่เลือกได้ของช่องตัวเลือก */
export function optionValues(field: AnyField): string[] {
  return (field.options ?? []).map((option) => (typeof option === "string" ? option : option.value));
}

const child = (data: unknown, key: string): unknown =>
  data !== null && typeof data === "object" ? (data as Record<string, unknown>)[key] : undefined;

/**
 * เดินตามเส้นทางในผังฟิลด์ คืนฟิลด์ปลายทางเมื่อผ่านเงื่อนไข accept
 *
 * บล็อกต่างชนิดอาจมีฟิลด์ชื่อเดียวกันแต่ตั้งค่าต่างกัน (เช่น image ที่บังคับกับไม่บังคับ)
 * ถ้าส่งเอกสารมาด้วย จะเลือกเฉพาะชนิดบล็อกของแถวนั้นจริง ๆ ไม่งั้นลองทุกชนิด
 *
 * @returns ฟิลด์ที่แก้ได้ หรือ null เมื่อเส้นทางไม่มีอยู่จริง/ชนิดไม่ตรง
 */
function findField(
  fields: Field[],
  path: string[],
  accept: (field: AnyField) => boolean,
  data?: unknown
): AnyField | null {
  if (path.length === 0) return null;
  const [segment, ...rest] = path;

  for (const raw of fields) {
    const field = raw as AnyField;

    // row / collapsible / tabs แบบไม่มีชื่อ ไม่กินชื่อในเส้นทาง จึงมองทะลุเข้าไปได้เลย
    if (!field.name) {
      if (field.type === "tabs" && field.tabs) {
        for (const tab of field.tabs) {
          const inner = tab.name
            ? tab.name === segment
              ? findField(tab.fields, rest, accept, child(data, tab.name))
              : null
            : findField(tab.fields, path, accept, data);
          if (inner) return inner;
        }
        continue;
      }
      if (field.fields) {
        const inner = findField(field.fields, path, accept, data);
        if (inner) return inner;
      }
      continue;
    }

    if (field.name !== segment) continue;

    if (rest.length === 0) {
      return accept(field) ? field : null;
    }

    if (field.type === "group" && field.fields) {
      return findField(field.fields, rest, accept, child(data, segment));
    }

    // อาร์เรย์และบล็อกกินเลขลำดับอีกหนึ่งชั้นก่อนถึงฟิลด์ข้างใน
    if (field.type === "array" && field.fields && isIndex(rest[0])) {
      return findField(field.fields, rest.slice(1), accept, child(child(data, segment), rest[0]));
    }

    if (field.type === "blocks" && field.blocks && isIndex(rest[0])) {
      const row = child(child(data, segment), rest[0]);
      const blockType = child(row, "blockType");
      const candidates =
        typeof blockType === "string"
          ? field.blocks.filter((block) => block.slug === blockType)
          : field.blocks;
      for (const block of candidates) {
        const inner = findField(block.fields, rest.slice(1), accept, row);
        if (inner) return inner;
      }
    }

    return null;
  }

  return null;
}

import type { Field } from "payload";

/**
 * ตรวจว่าเส้นทางที่ส่งมาชี้ไปยัง "ช่องข้อความ" จริงตามสคีมาของ Payload
 *
 * ทำไมต้องตรวจกับสคีมา ไม่ใช่กับข้อมูล:
 * ช่องข้อความที่ยังว่างอยู่ Payload จะไม่ส่งคีย์นั้นกลับมาเลย การเช็กว่า "มีคีย์นี้
 * ในข้อมูลไหม" จึงปฏิเสธการกรอกช่องว่างที่ถูกต้อง ส่วนการเช็กว่า "ค่าเดิมเป็นสตริงไหม"
 * ก็ปล่อยชื่อฟิลด์ที่พิมพ์ผิดผ่านไปได้ เพราะค่าเดิมเป็น undefined เหมือนกัน
 * แล้วจะเกิดฉบับร่างใหม่ทั้งที่ไม่มีอะไรเปลี่ยน
 */

/** ชนิดฟิลด์ที่แก้จากหน้าเว็บได้ — ที่เหลือต้องแก้ในหลังบ้านที่มีตัวช่วยครบกว่า */
const EDITABLE_TYPES = new Set(["text", "textarea"]);

type AnyField = Field & {
  name?: string;
  fields?: Field[];
  tabs?: { name?: string; fields: Field[] }[];
  blocks?: { fields: Field[] }[];
};

const isIndex = (segment: string) => /^\d{1,3}$/.test(segment);

/**
 * เดินตามเส้นทางในผังฟิลด์ คืนฟิลด์ปลายทางเมื่อเป็นช่องข้อความ
 *
 * @returns ฟิลด์ที่แก้ได้ หรือ null เมื่อเส้นทางไม่มีอยู่จริง/ไม่ใช่ช่องข้อความ
 */
export function findTextField(fields: Field[], path: string[]): AnyField | null {
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
              ? findTextField(tab.fields, rest)
              : null
            : findTextField(tab.fields, path);
          if (inner) return inner;
        }
        continue;
      }
      if (field.fields) {
        const inner = findTextField(field.fields, path);
        if (inner) return inner;
      }
      continue;
    }

    if (field.name !== segment) continue;

    if (rest.length === 0) {
      return EDITABLE_TYPES.has(field.type) ? field : null;
    }

    if (field.type === "group" && field.fields) {
      return findTextField(field.fields, rest);
    }

    // อาร์เรย์และบล็อกกินเลขลำดับอีกหนึ่งชั้นก่อนถึงฟิลด์ข้างใน
    if (field.type === "array" && field.fields && isIndex(rest[0])) {
      return findTextField(field.fields, rest.slice(1));
    }

    if (field.type === "blocks" && field.blocks && isIndex(rest[0])) {
      for (const block of field.blocks) {
        const inner = findTextField(block.fields, rest.slice(1));
        if (inner) return inner;
      }
    }

    return null;
  }

  return null;
}

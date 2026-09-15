import type { ArrayField, Field, TextField } from "payload";

/** แปลงข้อความเป็น slug ที่ใช้ใน URL ได้ — รองรับทั้งไทยและอังกฤษ */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * ช่อง slug ที่เติมให้อัตโนมัติจากฟิลด์ต้นทาง
 * แก้เองได้ แต่ถ้าเว้นว่างจะสร้างให้จากชื่อ
 */
export function slugField(sourceField = "title"): TextField {
  return {
    name: "slug",
    type: "text",
    unique: true,
    index: true,
    label: "ตัวระบุใน URL (slug)",
    admin: {
      position: "sidebar",
      description: "เว้นว่างได้ ระบบจะสร้างให้จากชื่อ — เปลี่ยนแล้วลิงก์เดิมจะใช้ไม่ได้",
    },
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          if (typeof value === "string" && value.trim()) return slugify(value);
          const source = (data as Record<string, unknown> | undefined)?.[sourceField];
          // ฟิลด์ที่แปลได้จะมาเป็นอ็อบเจกต์ {th, en} ต้องดึงภาษาไทยออกมา
          const text =
            typeof source === "string"
              ? source
              : typeof source === "object" && source !== null
                ? String((source as Record<string, unknown>).th ?? "")
                : "";
          return text ? slugify(text) : value;
        },
      ],
    },
  };
}

/**
 * รายการข้อความหลายบรรทัด เช่น สมุนไพรหลัก วิธีใช้ ข้อควรระวัง
 *
 * Payload ไม่มีฟิลด์ "อาร์เรย์ของข้อความ" ตรง ๆ ต้องทำเป็นอาร์เรย์ของแถว
 * ที่มีฟิลด์เดียว แล้วค่อยแปลงกลับเป็นอาร์เรย์ข้อความในชั้น src/lib/cms
 */
export function textListField(options: {
  name: string;
  label: string;
  itemLabel?: string;
  multiline?: boolean;
  required?: boolean;
  minRows?: number;
  maxRows?: number;
  description?: string;
}): ArrayField {
  return {
    name: options.name,
    type: "array",
    label: options.label,
    localized: true,
    required: options.required,
    minRows: options.minRows,
    maxRows: options.maxRows,
    admin: { description: options.description, initCollapsed: false },
    labels: { singular: options.itemLabel ?? "รายการ", plural: options.label },
    // แยกเป็นสองกรณีเพราะ TypeScript ไม่ยอมให้ type เป็น union ของชนิดฟิลด์
    fields: [
      options.multiline
        ? { name: "value", type: "textarea", required: true, label: options.itemLabel ?? "ข้อความ" }
        : { name: "value", type: "text", required: true, label: options.itemLabel ?? "ข้อความ" },
    ],
  };
}

/** หัวข้อ + คำโปรยของ section หนึ่ง ๆ บนหน้าเว็บ */
export function sectionHeadingField(name: string, label: string, extra?: Field[]): Field {
  return {
    name,
    type: "group",
    label,
    fields: [
      { name: "eyebrow", type: "text", localized: true, label: "ข้อความนำ (ตัวเล็กสีเขียว)" },
      { name: "title", type: "text", required: true, localized: true, label: "หัวเรื่อง" },
      { name: "description", type: "textarea", localized: true, label: "คำโปรย" },
      ...(extra ?? []),
    ],
  };
}

/** ปุ่มหนึ่งปุ่ม — ข้อความ + ปลายทาง */
export function linkFields(): Field[] {
  return [
    { name: "label", type: "text", required: true, localized: true, label: "ข้อความบนปุ่ม" },
    {
      name: "href",
      type: "text",
      required: true,
      label: "ลิงก์ปลายทาง",
      admin: { description: 'เช่น /shop หรือ https://... ' },
    },
  ];
}

/** แถบหัวหน้าเพจด้านใน (พื้นเข้ม) */
export function heroFields(): Field {
  return {
    name: "hero",
    type: "group",
    label: "แถบหัวหน้าเพจ",
    fields: [
      { name: "eyebrow", type: "text", localized: true, label: "ข้อความนำ (ตัวเล็ก)" },
      { name: "title", type: "text", required: true, localized: true, label: "หัวเรื่อง" },
      { name: "description", type: "textarea", localized: true, label: "คำโปรย" },
    ],
  };
}

/** เนื้อหาแบบหัวข้อ + ย่อหน้า สำหรับหน้าที่ต้องเล่าเรื่องยาว */
export function proseBlocksField(name: string, label: string): Field {
  return {
    name,
    type: "blocks",
    label,
    labels: { singular: "บล็อก", plural: "บล็อกเนื้อหา" },
    blocks: [
      {
        slug: "heading",
        labels: { singular: "หัวข้อ", plural: "หัวข้อ" },
        fields: [{ name: "text", type: "text", required: true, localized: true, label: "ข้อความ" }],
      },
      {
        slug: "paragraph",
        labels: { singular: "ย่อหน้า", plural: "ย่อหน้า" },
        fields: [{ name: "text", type: "textarea", required: true, localized: true, label: "ข้อความ" }],
      },
    ],
  };
}

/** ชุดตัวเลขสถิติ เช่น "5,870 ประชากรในชุมชน" */
export function statsField(name: string, label: string, rows: number): ArrayField {
  return {
    name,
    type: "array",
    label,
    minRows: rows,
    maxRows: rows,
    labels: { singular: "ตัวเลข", plural: label },
    fields: [
      { name: "value", type: "text", required: true, localized: true, label: "ตัวเลข" },
      { name: "label", type: "text", required: true, localized: true, label: "คำอธิบาย" },
    ],
  };
}

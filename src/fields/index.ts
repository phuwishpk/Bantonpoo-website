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
      colorCollapsible("สีของแถบหัวหน้าเพจ", { fallbackBackground: "dark" }),
      typographyCollapsible("ตัวอักษรและการจัดวางของแถบหัวหน้าเพจ"),
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

/**
 * ตัวอักษรและการจัดวางของกล่องเนื้อหาหนึ่งกล่อง
 *
 * ทุกช่องเป็น "ตัวเลือกจำกัด" ไม่ใช่ช่องพิมพ์อิสระ เพื่อให้ทุกส่วนของเว็บยังเข้าชุดกัน
 * แม้ผู้ดูแลจะปรับหลายส่วนต่างกัน — ค่าที่เลือกถูกแปลงเป็นตัวแปร CSS ที่ประกาศบนตัว
 * <section> จึงมีผลเฉพาะภายในกล่องนั้น ไม่กระทบส่วนอื่นและทำ layout พังไม่ได้
 * (ดู sectionSkin ใน src/lib/cms/page-content.ts)
 */
export function typographyCollapsible(label = "ตัวอักษรและการจัดวางของส่วนนี้"): Field {
  return {
    type: "collapsible",
    label,
    admin: { initCollapsed: true, description: "เว้นไว้ตามค่าเริ่มต้นได้ทั้งหมด ถ้ายังไม่ต้องการปรับ" },
    fields: typographyFields(),
  };
}

/** ชุดฟิลด์ตัวอักษรและการจัดวาง — แยกไว้เพื่อใช้ทั้งในแถว section และในกลุ่มแบนเนอร์ */
export function typographyFields(): Field[] {
  return [
    {
      name: "fontFamily",
      type: "select",
      defaultValue: "theme",
      label: "ฟอนต์",
      options: [
        { label: "ตามธีมของเว็บ", value: "theme" },
        { label: "IBM Plex Sans Thai + Noto Serif Thai", value: "plex-noto" },
        { label: "Sarabun + Trirong — ทางการ อ่านง่าย", value: "sarabun-trirong" },
        { label: "Prompt — โมเดิร์น เรียบ", value: "prompt" },
      ],
      admin: { description: "เลือกได้เฉพาะฟอนต์ที่โหลดมาพร้อมเว็บแล้ว จึงไม่ทำให้เว็บช้าลง" },
    },
    {
      name: "textScale",
      type: "select",
      defaultValue: "1",
      label: "ขนาดตัวอักษร",
      options: [
        { label: "เล็กลงมาก", value: "0.9" },
        { label: "เล็กลง", value: "0.95" },
        { label: "ปกติ", value: "1" },
        { label: "ใหญ่ขึ้น", value: "1.1" },
        { label: "ใหญ่มาก", value: "1.2" },
      ],
      admin: { description: "ย่อ-ขยายตัวอักษรทุกขนาดในส่วนนี้พร้อมกัน สัดส่วนหัวเรื่องกับเนื้อหาจึงไม่เพี้ยน" },
    },
    {
      name: "textAlign",
      type: "select",
      defaultValue: "default",
      label: "การจัดวางข้อความ",
      options: [
        { label: "ตามค่าเริ่มต้น", value: "default" },
        { label: "ชิดซ้าย", value: "left" },
        { label: "กึ่งกลาง", value: "center" },
        { label: "ชิดขวา", value: "right" },
      ],
    },
    {
      name: "contentWidth",
      type: "select",
      defaultValue: "default",
      label: "ความกว้างของเนื้อหา",
      options: [
        { label: "ตามค่าเริ่มต้น", value: "default" },
        { label: "แคบ — อ่านง่ายที่สุด", value: "narrow" },
        { label: "ปานกลาง", value: "medium" },
        { label: "กว้างเต็มพื้นที่", value: "full" },
      ],
    },
    {
      name: "spacing",
      type: "select",
      defaultValue: "default",
      label: "ความโปร่งของส่วนนี้",
      options: [
        { label: "ตามธีมของเว็บ", value: "default" },
        { label: "กระชับ", value: "compact" },
        { label: "มาตรฐาน", value: "normal" },
        { label: "โปร่ง", value: "roomy" },
      ],
      admin: { description: "ปรับระยะห่างบน-ล่างและช่องไฟระหว่างการ์ดในส่วนนี้" },
    },
  ];
}

/** ตรวจรหัสสี — เว้นว่างได้ */
const hexOrEmpty = (value: unknown) => {
  if (value === undefined || value === null || value === "") return true;
  if (typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value)) return true;
  return "ต้องเป็นรหัสสีแบบ #rrggbb เช่น #2e7d52";
};

/**
 * ช่องเลือกสี — เก็บเป็นรหัส #rrggbb แต่ในหลังบ้านแสดงเป็นจานสีให้คลิกเลือก
 * (ดู src/components/admin/ColorField.tsx) ผู้ดูแลจึงไม่ต้องรู้จักรหัสสี
 *
 * @param palette ชุดสีแนะนำที่แสดง — พื้นหลังแสดงทั้งสีอ่อนและเข้ม สีเน้นแสดงสีสด
 */
export function colorField(
  name: string,
  label: string,
  options: {
    description?: string;
    palette?: "surface" | "accent";
    condition?: (data: unknown, sibling: Record<string, unknown>) => boolean;
  } = {}
): TextField {
  return {
    name,
    type: "text",
    label,
    validate: hexOrEmpty,
    admin: {
      description: options.description,
      condition: options.condition as never,
      components: { Field: "/components/admin/ColorField#ColorField" },
      custom: { palette: options.palette ?? "surface" },
    },
  };
}

/** ตัวเลือกพื้นหลังที่ใช้ร่วมกันระหว่าง section ของหน้าประจำ และบล็อกของหน้าที่สร้างเอง */
const BACKGROUND_OPTIONS = [
  { label: "ตามแบบเดิมของส่วนนี้", value: "page" },
  { label: "พื้นเข้ม", value: "dark" },
  { label: "พื้นอ่อนตัดกัน", value: "tint" },
  { label: "กำหนดสีเอง", value: "custom" },
];

const TEXT_TONE_OPTIONS = [
  { label: "เลือกให้อัตโนมัติจากความสว่างของพื้น", value: "auto" },
  { label: "ตัวอักษรสีอ่อน", value: "light" },
  { label: "ตัวอักษรสีเข้ม", value: "dark" },
];

/** ชื่อฟิลด์สีทั้งหมด — API แก้สีจากหน้าเว็บรับเฉพาะชื่อในรายการนี้ */
export const STYLE_FIELD_NAMES = ["background", "backgroundColor", "textTone", "accentColor", "cardColor"] as const;

/**
 * ชุดฟิลด์สีของกล่องหนึ่งกล่อง — ใช้ชื่อเดียวกันทุกที่ (ส่วนของหน้า บล็อก แบนเนอร์ แถบเมนู)
 * ตัวแปลงเป็น CSS จึงมีตัวเดียว (sectionSkin ใน src/lib/cms/page-content.ts)
 *
 * @param fallbackBackground พื้นหลังตั้งต้น — แบนเนอร์และแถบเมนูเป็นพื้นเข้ม
 * @param cards มีช่องสีการ์ดด้วยหรือไม่ (กล่องที่ไม่มีการ์ดข้างในไม่ต้องแสดง)
 * @param when  เงื่อนไขเพิ่มเติมในการแสดงทุกช่อง
 */
export function colorFields(
  options: {
    fallbackBackground?: "page" | "dark";
    cards?: boolean;
    when?: (sibling: Record<string, unknown>) => boolean;
  } = {}
): Field[] {
  const when = options.when ?? (() => true);
  const isCustom = (_: unknown, sibling: Record<string, unknown>) =>
    when(sibling ?? {}) && sibling?.background === "custom";
  const shown = (_: unknown, sibling: Record<string, unknown>) => when(sibling ?? {});

  const backgroundOptions =
    options.fallbackBackground === "dark"
      ? [
          { label: "พื้นเข้ม (ค่าเริ่มต้น)", value: "dark" },
          { label: "สีพื้นของหน้า", value: "page" },
          { label: "พื้นอ่อนตัดกัน", value: "tint" },
          { label: "กำหนดสีเอง", value: "custom" },
        ]
      : BACKGROUND_OPTIONS;

  return [
    {
      name: "background",
      type: "select",
      defaultValue: options.fallbackBackground ?? "page",
      label: "พื้นหลัง",
      options: backgroundOptions,
      admin: { condition: shown },
    },
    colorField("backgroundColor", "สีพื้นหลัง", { condition: isCustom }),
    {
      name: "textTone",
      type: "select",
      defaultValue: "auto",
      label: "สีตัวอักษรบนพื้นนี้",
      options: TEXT_TONE_OPTIONS,
      admin: { condition: isCustom },
    },
    colorField("accentColor", "สีเน้น (ปุ่ม ป้าย หัวข้อเล็ก)", {
      palette: "accent",
      condition: shown,
      description: "เว้นว่างไว้เพื่อใช้สีหลักของธีม",
    }),
    ...(options.cards
      ? [
          colorField("cardColor", "สีการ์ดและกล่องข้างใน", {
            condition: shown,
            description: "เว้นว่างไว้เพื่อใช้สีเดิม · สีตัวอักษรบนการ์ดปรับให้อ่านง่ายเองอัตโนมัติ",
          }),
        ]
      : []),
  ];
}

/** ชุดฟิลด์สีในกล่องพับ */
export function colorCollapsible(
  label: string,
  options: Parameters<typeof colorFields>[0] = {}
): Field {
  return {
    type: "collapsible",
    label,
    admin: { initCollapsed: true, description: "เว้นไว้ตามค่าเริ่มต้นได้ทั้งหมด ถ้ายังไม่ต้องการปรับ" },
    fields: colorFields(options),
  };
}

/**
 * สีของทั้งหน้า — ส่วนที่ไม่ได้ตั้งสีเองจะใช้ค่านี้
 * ตั้งในแท็บแรกของทุกหน้า เพื่อให้เปลี่ยนโทนทั้งหน้าได้ในที่เดียว
 */
export function pageStyleField(): Field {
  return {
    name: "pageStyle",
    type: "group",
    label: "สีของทั้งหน้า",
    admin: {
      description:
        "ใช้กับทุกส่วนของหน้านี้ที่ยังไม่ได้ตั้งสีเอง · หน้ารายละเอียดสินค้า/บทความใช้สีเน้นตามหน้ารวมด้วย",
    },
    fields: [
      colorField("accentColor", "สีเน้นของหน้า", {
        palette: "accent",
        description: "เว้นว่างไว้เพื่อใช้สีหลักของธีม",
      }),
      colorField("backgroundColor", "สีพื้นของหน้า", {
        description: "เว้นว่างไว้เพื่อใช้สีพื้นของธีม · ถ้าเลือกสีเข้ม ตัวอักษรจะเปลี่ยนเป็นสีอ่อนให้เอง",
      }),
      colorField("cardColor", "สีการ์ดของทั้งหน้า", {
        description: "เว้นว่างไว้เพื่อใช้สีเดิม",
      }),
    ],
  };
}

const COLUMN_OPTIONS = [
  { label: "ตามค่าเริ่มต้น", value: "auto" },
  { label: "2 คอลัมน์", value: "2" },
  { label: "3 คอลัมน์", value: "3" },
  { label: "4 คอลัมน์", value: "4" },
];

/**
 * สี ตัวอักษร และการจัดวางของบล็อกหนึ่งบล็อกในหน้าที่สร้างเอง
 *
 * ใช้ชื่อฟิลด์ชุดเดียวกับ sectionsField เพื่อให้ตัวแปลงเป็น CSS ตัวเดียวกัน
 * (sectionSkin) อ่านได้ทั้งสองแบบ ไม่ต้องเขียนตรรกะสีซ้ำสองชุด
 */
export function blockStyleFields(options: { columns?: boolean } = {}): Field {
  return {
    type: "collapsible",
    label: "สี ตัวอักษร และการจัดวางของส่วนนี้",
    admin: { initCollapsed: true, description: "เว้นไว้ตามค่าเริ่มต้นได้ทั้งหมด ถ้ายังไม่ต้องการปรับ" },
    fields: [
      ...colorFields({ cards: true }),
      ...(options.columns
        ? [
            {
              name: "columns",
              type: "select" as const,
              defaultValue: "auto",
              label: "จำนวนคอลัมน์",
              options: COLUMN_OPTIONS,
            },
          ]
        : []),
      ...typographyFields(),
    ],
  };
}

/**
 * รายการ section ของหน้าหนึ่ง ๆ — ลากสลับลำดับ ซ่อน/แสดง และปรับรูปแบบการวางได้
 *
 * ชนิดของ section ผูกกับคอมโพเนนต์ในโค้ด จึงเป็นตัวเลือกไม่ใช่ช่องพิมพ์
 * ถ้าจะเพิ่มชนิดใหม่ต้องเพิ่มทั้งที่นี่และใน switch ของหน้านั้น
 *
 * @param gridTypes ชนิดที่วางเป็นกริด จึงเลือกจำนวนคอลัมน์ได้ (สีเปลี่ยนได้ทุกชนิด)
 * @param limitTypes ชนิดที่จำกัดจำนวนรายการที่แสดงได้
 */
export function sectionsField(options: {
  types: { label: string; value: string }[];
  gridTypes?: string[];
  limitTypes?: string[];
  description?: string;
}): ArrayField {
  const grid = options.gridTypes ?? [];
  const limited = options.limitTypes ?? [];
  const inGroup = (list: string[]) => (_: unknown, sibling: { type?: string }) =>
    list.includes(sibling?.type ?? "");

  return {
    name: "sections",
    type: "array",
    label: "ลำดับและการแสดงส่วนต่าง ๆ",
    labels: { singular: "ส่วน", plural: "ส่วนต่าง ๆ" },
    admin: {
      description:
        options.description ??
        "ลากเพื่อสลับลำดับ ติ๊กออกเพื่อซ่อน · ส่วนที่ไม่ได้อยู่ในรายการนี้จะไม่แสดงบนหน้าเว็บ",
    },
    fields: [
      { name: "type", type: "select", required: true, label: "ส่วนไหน", options: options.types },
      { name: "enabled", type: "checkbox", defaultValue: true, label: "แสดงส่วนนี้" },
      // สีเปลี่ยนได้ทุกชนิดส่วน ทุกส่วนเลือกสีตัวอักษรตามพื้นได้เองแล้ว
      colorCollapsible("สีของส่วนนี้", { cards: true }),
      {
        name: "columns",
        type: "select",
        defaultValue: "auto",
        label: "จำนวนคอลัมน์",
        options: COLUMN_OPTIONS,
        admin: { condition: inGroup(grid) },
      },
      {
        name: "limit",
        type: "number",
        min: 1,
        max: 12,
        label: "จำนวนรายการที่แสดง",
        admin: {
          condition: inGroup(limited),
          description: "เว้นว่างไว้เพื่อแสดงทั้งหมด",
        },
      },
      // ตัวอักษรและการจัดวางใช้ได้กับทุกชนิดส่วน ไม่ใช่เฉพาะส่วนที่วางเป็นกริด
      typographyCollapsible(),
    ],
  };
}

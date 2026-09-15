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

export type SectionConfig = {
  type: string;
  background: string;
  backgroundColor?: string;
  textTone: string;
  accentColor?: string;
  columns: string;
  limit?: number;
} & Typography;

/** ตัวอักษรและการจัดวางของกล่องเนื้อหาหนึ่งกล่อง (ดู typographyFields ใน src/fields) */
export type Typography = {
  fontFamily: string;
  textScale: string;
  textAlign: string;
  contentWidth: string;
  spacing: string;
};

export const DEFAULT_TYPOGRAPHY: Typography = {
  fontFamily: "theme",
  textScale: "1",
  textAlign: "default",
  contentWidth: "default",
  spacing: "default",
};

/** อ่านค่าตัวอักษรและการจัดวางจากแถวข้อมูล เผื่อผู้ดูแลยังไม่เคยแตะช่องเหล่านี้ */
export function readTypography(row: Doc): Typography {
  const pick = (key: keyof Typography) =>
    typeof row[key] === "string" && row[key] ? (row[key] as string) : DEFAULT_TYPOGRAPHY[key];
  return {
    fontFamily: pick("fontFamily"),
    textScale: pick("textScale"),
    textAlign: pick("textAlign"),
    contentWidth: pick("contentWidth"),
    spacing: pick("spacing"),
  };
}

/** ตัวอักษรและการจัดวางของกลุ่มฟิลด์ เช่นแบนเนอร์หัวหน้าเพจ */
export function typographyOf(doc: Doc, key = "hero"): Typography {
  return readTypography(asDoc(doc[key]));
}

/** ฟอนต์ที่โหลดมาพร้อมเว็บแล้ว — ตัวแปรถูกประกาศไว้ใน layout โดย next/font */
const FONT_STACK: Record<string, { sans: string; serif: string }> = {
  "plex-noto": { sans: "--font-plex-thai", serif: "--font-serif-thai" },
  "sarabun-trirong": { sans: "--font-sarabun", serif: "--font-trirong" },
  prompt: { sans: "--font-prompt", serif: "--font-prompt" },
};

/**
 * ขนาดตัวอักษรมาตรฐานที่ดีไซน์นี้ใช้
 *
 * Tailwind v4 ให้คลาส text-* อ่านค่าจากตัวแปร --text-* การประกาศตัวแปรเหล่านี้ใหม่
 * บนตัว <section> จึงย่อ-ขยายตัวอักษรทุกขนาดในส่วนนั้นพร้อมกัน โดยคลาสในคอมโพเนนต์
 * ไม่ต้องรู้เรื่องด้วยเลย · ค่าที่เขียนตายตัวแบบ text-[1.1rem] จะไม่ขยับตาม
 * จึงย้ายขนาดที่ใช้บ่อยไปเป็นโทเคนใน globals.css แล้ว
 */
const TEXT_TOKENS: [string, number][] = [
  ["2xs", 0.6875],
  ["xs", 0.75],
  ["sm", 0.875],
  ["md", 0.9375],
  ["base", 1],
  ["lg", 1.125],
  ["xl", 1.25],
  ["2xl", 1.5],
  ["3xl", 1.875],
  ["4xl", 2.25],
  ["display-sm", 1.75],
  ["display-md", 2.25],
  ["display-lg", 2.75],
];

const MEASURE: Record<string, string> = {
  narrow: "48rem",
  medium: "64rem",
  full: "none",
};

/** Tailwind คำนวณระยะห่างทุกคลาสจากตัวแปรเดียวนี้ — ตรงกับที่ธีมใช้ทั้งเว็บ */
const SECTION_SPACING: Record<string, string> = {
  compact: "0.22rem",
  normal: "0.25rem",
  roomy: "0.3rem",
};

const ALIGN_CLASS: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

/** แปลงตัวเลือกตัวอักษร/การจัดวาง เป็นคลาสและตัวแปร CSS ที่มีผลเฉพาะกล่องนั้น */
export function typographySkin(typo: Typography): {
  className: string;
  style: Record<string, string>;
} {
  const style: Record<string, string> = {};

  const fonts = FONT_STACK[typo.fontFamily];
  if (fonts) {
    style["--font-sans"] = `var(${fonts.sans}), ui-sans-serif, system-ui, sans-serif`;
    style["--font-serif"] = `var(${fonts.serif}), ui-serif, Georgia, serif`;
  }

  const scale = Number(typo.textScale);
  if (Number.isFinite(scale) && scale > 0 && scale !== 1) {
    for (const [name, rem] of TEXT_TOKENS) {
      style[`--text-${name}`] = `${Number((rem * scale).toFixed(4))}rem`;
    }
  }

  const measure = MEASURE[typo.contentWidth];
  if (measure) style["--section-measure"] = measure;

  const spacing = SECTION_SPACING[typo.spacing];
  if (spacing) style["--spacing"] = spacing;

  return { className: ALIGN_CLASS[typo.textAlign] ?? "", style };
}

/** คลาสพื้นหลังของ section — แปลงจากตัวเลือกในหลังบ้าน */
export const BACKGROUND_CLASS: Record<string, string> = {
  page: "",
  dark: "bg-ink-800",
  tint: "bg-rice-200",
};

/**
 * คลาสกริดตามจำนวนคอลัมน์
 *
 * ต้องเขียนคลาสเต็มไว้ตรงนี้ ห้ามประกอบสตริงแบบ `grid-cols-${n}`
 * เพราะ Tailwind อ่านคลาสจากซอร์สตอน build คลาสที่ประกอบตอนรันจะไม่ถูกสร้าง
 */
export const COLUMN_CLASS: Record<string, string> = {
  "2": "grid-cols-1 sm:grid-cols-2",
  "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  "4": "grid-cols-2 lg:grid-cols-4",
};

/** อ่านลำดับ section จาก Global ถ้ายังไม่ได้ตั้งค่าจะใช้ลำดับมาตรฐานของหน้านั้น */
export function readSections(doc: Doc, fallback: string[]): SectionConfig[] {
  const rows = rowsOf(doc, "sections", (row) => ({
    type: String(row.type ?? ""),
    enabled: row.enabled !== false,
    background: String(row.background ?? "page"),
    backgroundColor: typeof row.backgroundColor === "string" ? row.backgroundColor : undefined,
    textTone: String(row.textTone ?? "auto"),
    accentColor: typeof row.accentColor === "string" && row.accentColor ? row.accentColor : undefined,
    columns: String(row.columns ?? "auto"),
    limit: typeof row.limit === "number" ? row.limit : undefined,
    ...readTypography(row),
  })).filter((row) => row.enabled && row.type);

  if (rows.length) return rows;
  return fallback.map((type) => ({
    type,
    background: "page",
    textTone: "auto",
    columns: "auto",
    ...DEFAULT_TYPOGRAPHY,
  }));
}

/**
 * อ่านการตั้งค่าสีและการจัดวางของบล็อกหนึ่งบล็อก
 *
 * บล็อกใช้ชื่อฟิลด์ชุดเดียวกับแถวใน "ลำดับและการแสดงส่วนต่าง ๆ" จึงแปลงเป็น
 * SectionConfig แล้วส่งให้ sectionSkin ตัวเดิมได้เลย ไม่ต้องมีตรรกะสีสองชุด
 */
export function readBlockConfig(row: Doc): SectionConfig {
  return {
    type: String(row.blockType ?? ""),
    background: String(row.background ?? "page"),
    backgroundColor: typeof row.backgroundColor === "string" ? row.backgroundColor : undefined,
    textTone: String(row.textTone ?? "auto"),
    accentColor: typeof row.accentColor === "string" && row.accentColor ? row.accentColor : undefined,
    columns: String(row.columns ?? "auto"),
    limit: typeof row.limit === "number" ? row.limit : undefined,
    ...readTypography(row),
  };
}

/** ความสว่างของสี ใช้ตัดสินว่าบนพื้นนี้ควรใช้ตัวอักษรสีอ่อนหรือเข้ม */
function luminance(hex: string): number {
  const value = hex.replace("#", "");
  const channel = (start: number) => {
    const part = parseInt(value.slice(start, start + 2), 16) / 255;
    return part <= 0.03928 ? part / 12.92 : ((part + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

export type SectionSkin = {
  className: string;
  style?: React.CSSProperties;
  /** true เมื่อพื้นหลังเข้ม จึงต้องใช้ตัวอักษรสีอ่อน */
  onDark: boolean;
};

/**
 * แปลงการตั้งค่าสีของ section เป็นคลาสและ inline style
 *
 * สีเน้นเฉพาะส่วนทำงานได้เพราะคลาสของ Tailwind อ้างตัวแปร --color-leaf-*
 * การประกาศตัวแปรนั้นใหม่บนตัว <section> จึงมีผลเฉพาะภายในส่วนนั้น
 */
export function sectionSkin(config: SectionConfig, darkByDefault = false): SectionSkin {
  const typography = typographySkin(config);
  const style: Record<string, string> = { ...typography.style };

  if (config.accentColor) {
    const mix = (color: string, percent: number) =>
      `color-mix(in oklab, ${config.accentColor} ${100 - percent}%, ${color} ${percent}%)`;
    Object.assign(style, {
      "--color-leaf-50": mix("white", 92),
      "--color-leaf-100": mix("white", 84),
      "--color-leaf-200": mix("white", 66),
      "--color-leaf-300": mix("white", 46),
      "--color-leaf-400": mix("white", 22),
      "--color-leaf-500": config.accentColor,
      "--color-leaf-600": mix("black", 16),
      "--color-leaf-700": mix("black", 30),
      "--color-leaf-800": mix("black", 44),
    });
  }

  if (config.background === "custom" && config.backgroundColor) {
    const onDark =
      config.textTone === "light" ||
      (config.textTone === "auto" && luminance(config.backgroundColor) < 0.45);
    return {
      className: `${onDark ? "text-rice-100" : "text-ink-800"} ${typography.className}`.trim(),
      style: { ...style, backgroundColor: config.backgroundColor },
      onDark,
    };
  }

  const preset: Record<string, { className: string; onDark: boolean }> = {
    page: { className: "", onDark: darkByDefault },
    dark: { className: "bg-ink-800", onDark: true },
    tint: { className: "bg-rice-200", onDark: false },
  };
  const chosen = preset[config.background] ?? preset.page;

  return {
    className: `${chosen.className} ${typography.className}`.trim(),
    style: Object.keys(style).length ? (style as React.CSSProperties) : undefined,
    onDark: chosen.onDark,
  };
}

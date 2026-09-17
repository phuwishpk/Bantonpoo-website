import type { Localized, Media } from "@/content/types";
import { accentVars, cardVars, isDarkColor, isHexColor, lightSurfaceVars } from "@/lib/color";
import { type Tone, toneOf } from "@/lib/tone";
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

/**
 * สีของกล่องเนื้อหาหนึ่งกล่อง — ส่วนของหน้า บล็อก แบนเนอร์ หรือแถบเมนู
 * ชื่อฟิลด์ตรงกับ colorFields ใน src/fields ทุกที่ จึงใช้ตัวแปลงเป็น CSS ตัวเดียวกันได้หมด
 */
export type StyleConfig = {
  /** page | dark | tint | custom */
  background: string;
  backgroundColor?: string;
  /** auto | light | dark — ใช้เมื่อกำหนดสีพื้นเอง */
  textTone: string;
  accentColor?: string;
  cardColor?: string;
};

/** สีที่ตั้งไว้ระดับทั้งหน้า ส่วนที่ไม่ได้ตั้งสีเองจะใช้ค่านี้ */
export type PageStyle = {
  accentColor?: string;
  backgroundColor?: string;
  cardColor?: string;
  /** พื้นของหน้าเป็นสีเข้ม — ส่วนที่ใช้ "สีพื้นของหน้า" จึงต้องใช้ตัวอักษรสีอ่อน */
  dark: boolean;
};

export type SectionConfig = {
  type: string;
  /**
   * ลำดับแถวจริงในหลังบ้าน ใช้ชี้ตำแหน่งตอนเปลี่ยนสีจากหน้าเว็บ
   * ไม่มีค่าเมื่อหน้านั้นยังไม่เคยบันทึกลำดับส่วน (ใช้ลำดับมาตรฐานจากโค้ด)
   */
  index?: number;
  columns: string;
  limit?: number;
  page?: PageStyle;
} & StyleConfig &
  Typography;

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

const colorOrUndefined = (value: unknown) => (isHexColor(value) ? value : undefined);

/**
 * อ่านค่าสีของกล่องหนึ่งกล่อง
 *
 * @param fallbackBackground พื้นหลังเมื่อยังไม่เคยตั้ง — แบนเนอร์และแถบเมนูเป็นพื้นเข้มมาตั้งแต่แรก
 */
export function readStyle(row: Doc, fallbackBackground = "page"): StyleConfig {
  return {
    background: typeof row.background === "string" && row.background ? row.background : fallbackBackground,
    backgroundColor: colorOrUndefined(row.backgroundColor),
    textTone: typeof row.textTone === "string" && row.textTone ? row.textTone : "auto",
    accentColor: colorOrUndefined(row.accentColor),
    cardColor: colorOrUndefined(row.cardColor),
  };
}

/** สีระดับทั้งหน้า (กลุ่มฟิลด์ pageStyle ของแต่ละหน้า) */
export function readPageStyle(doc: Doc): PageStyle {
  const group = asDoc(doc.pageStyle);
  const backgroundColor = colorOrUndefined(group.backgroundColor);
  return {
    accentColor: colorOrUndefined(group.accentColor),
    backgroundColor,
    cardColor: colorOrUndefined(group.cardColor),
    dark: backgroundColor ? isDarkColor(backgroundColor) : false,
  };
}

/** อ่านลำดับ section จาก Global ถ้ายังไม่ได้ตั้งค่าจะใช้ลำดับมาตรฐานของหน้านั้น */
export function readSections(doc: Doc, fallback: string[]): SectionConfig[] {
  const page = readPageStyle(doc);
  const rows = rowsOf(doc, "sections", (row) => row)
    .map((row, index) => ({
      type: String(row.type ?? ""),
      index,
      enabled: row.enabled !== false,
      columns: String(row.columns ?? "auto"),
      limit: typeof row.limit === "number" ? row.limit : undefined,
      page,
      ...readStyle(row),
      ...readTypography(row),
    }))
    .filter((row) => row.enabled && row.type);

  if (rows.length) return rows;
  return fallback.map((type) => ({
    type,
    columns: "auto",
    page,
    ...readStyle({}),
    ...DEFAULT_TYPOGRAPHY,
  }));
}

/**
 * อ่านการตั้งค่าสีและการจัดวางของบล็อกหนึ่งบล็อก
 *
 * บล็อกใช้ชื่อฟิลด์ชุดเดียวกับแถวใน "ลำดับและการแสดงส่วนต่าง ๆ" จึงแปลงเป็น
 * SectionConfig แล้วส่งให้ sectionSkin ตัวเดิมได้เลย ไม่ต้องมีตรรกะสีสองชุด
 */
export function readBlockConfig(row: Doc, page?: PageStyle): SectionConfig {
  return {
    type: String(row.blockType ?? ""),
    columns: String(row.columns ?? "auto"),
    limit: typeof row.limit === "number" ? row.limit : undefined,
    page,
    ...readStyle(row),
    ...readTypography(row),
  };
}

/** สีและตัวอักษรของแบนเนอร์หัวหน้าเพจ — พื้นเข้มเป็นค่าเริ่มต้น */
export function heroConfig(doc: Doc, key = "hero"): SectionConfig {
  const group = asDoc(doc[key]);
  return {
    type: key,
    columns: "auto",
    page: readPageStyle(doc),
    ...readStyle(group, "dark"),
    ...readTypography(group),
  };
}

export type SectionSkin = {
  className: string;
  style?: React.CSSProperties;
  /** true เมื่อพื้นหลังเข้ม จึงต้องใช้ตัวอักษรสีอ่อน */
  onDark: boolean;
  /** โทนตัวอักษรของส่วนนี้ (ดู src/lib/tone.ts) */
  tone: Tone;
  /** สีการ์ดที่มีผลกับส่วนนี้ (ของส่วนเองหรือของทั้งหน้า) */
  cardColor?: string;
  /**
   * โทนตัวอักษรบนการ์ดในส่วนนี้
   * ถ้าตั้งสีการ์ดไว้ ใช้โทนที่อ่านง่ายบนสีนั้น ไม่งั้นใช้ค่าที่คอมโพเนนต์ส่งมา
   * (การ์ดพื้นอ่อนส่ง "dark" กล่องพื้นเข้มอย่างกล่องชวนติดต่อส่ง "light")
   */
  cardTone: (fallback: Tone) => Tone;
};

/**
 * แปลงการตั้งค่าสีของ section เป็นคลาสและ inline style
 *
 * สีเน้นและสีการ์ดทำงานได้เพราะคลาสของ Tailwind อ้างตัวแปร CSS
 * การประกาศตัวแปรนั้นใหม่บนตัว <section> จึงมีผลเฉพาะภายในส่วนนั้น
 *
 * ทุกส่วนได้ `relative` เสมอ เพื่อให้ปุ่มเปลี่ยนสีในโหมดแก้ไขวางที่มุมของส่วนได้
 *
 * @param darkByDefault ส่วนที่ออกแบบมาเป็นพื้นเข้ม — ตัวเลือก "สีพื้นของหน้า" จึงหมายถึงพื้นเข้มเดิม
 */
export function sectionSkin(config: SectionConfig, darkByDefault = false): SectionSkin {
  const typography = typographySkin(config);
  const style: Record<string, string> = { ...typography.style };
  const classes = ["relative", typography.className];

  const accent = config.accentColor;
  if (accent) Object.assign(style, accentVars(accent));

  let onDark: boolean;
  if (config.background === "custom" && config.backgroundColor) {
    onDark =
      config.textTone === "light" ||
      (config.textTone !== "dark" && isDarkColor(config.backgroundColor));
    style.backgroundColor = config.backgroundColor;
    if (!onDark) Object.assign(style, lightSurfaceVars(config.backgroundColor));
  } else if (config.background === "dark" || (config.background !== "tint" && darkByDefault)) {
    onDark = true;
    classes.push("bg-ink-800");
  } else if (config.background === "tint") {
    onDark = false;
    classes.push("bg-rice-200");
  } else {
    onDark = config.page?.dark ?? false;
  }

  // สีตัวอักษรตั้งต้นของทั้งส่วน — ข้อความที่ไม่ได้ระบุสีเองจะได้ไม่เป็นสีเข้มบนพื้นเข้ม
  if (onDark) classes.push("text-rice-100");

  const cardColor = config.cardColor ?? config.page?.cardColor;
  if (cardColor) {
    classes.push("has-card-color");
    Object.assign(style, cardVars(cardColor));
  }
  const cardToneValue: Tone | null = cardColor ? toneOf(isDarkColor(cardColor)) : null;

  return {
    className: classes.filter(Boolean).join(" "),
    style: Object.keys(style).length ? (style as React.CSSProperties) : undefined,
    onDark,
    tone: toneOf(onDark),
    cardColor,
    cardTone: (fallback) => cardToneValue ?? fallback,
  };
}

/** ค่าสีปัจจุบันของกล่อง — ส่งให้ตัวเลือกสีในโหมดแก้ไขแสดงค่าที่เลือกไว้ */
export function styleValues(config: StyleConfig): StyleConfig {
  return {
    background: config.background,
    backgroundColor: config.backgroundColor,
    textTone: config.textTone,
    accentColor: config.accentColor,
    cardColor: config.cardColor,
  };
}

/** สีของแถบเมนูบนและส่วนท้ายเว็บ — ส่งให้คอมโพเนนต์ฝั่งไคลเอนต์ได้ จึงไม่มีฟังก์ชันข้างใน */
export type ChromeSkin = {
  className: string;
  style?: Record<string, string>;
  onDark: boolean;
};

/**
 * คลาสพื้นหลังสำเร็จรูปของแถบเมนูและส่วนท้าย
 * แบบ glass ใช้กับแถบเมนูที่ติดขอบบน — โปร่งเล็กน้อยให้เห็นเนื้อหาที่เลื่อนผ่านด้านหลัง
 */
const CHROME_PRESET: Record<string, { solid: string; glass: string; onDark: boolean }> = {
  dark: {
    solid: "bg-ink-800",
    glass: "bg-ink-800/95 backdrop-blur supports-[backdrop-filter]:bg-ink-800/85",
    onDark: true,
  },
  page: {
    solid: "bg-rice-100",
    glass: "bg-rice-100/95 backdrop-blur supports-[backdrop-filter]:bg-rice-100/85",
    onDark: false,
  },
  tint: {
    solid: "bg-rice-200",
    glass: "bg-rice-200/95 backdrop-blur supports-[backdrop-filter]:bg-rice-200/85",
    onDark: false,
  },
};

/** แปลงค่าสีของแถบเมนูหรือส่วนท้ายเป็นคลาสและ style (พื้นเข้มเป็นค่าเริ่มต้น) */
export function chromeSkin(config: StyleConfig | undefined, glass = false): ChromeSkin {
  const style: Record<string, string> = {};
  if (config?.accentColor) Object.assign(style, accentVars(config.accentColor));

  if (config?.background === "custom" && config.backgroundColor) {
    const color = config.backgroundColor;
    const onDark = config.textTone === "light" || (config.textTone !== "dark" && isDarkColor(color));
    style.backgroundColor = glass ? `color-mix(in oklab, ${color} 94%, transparent)` : color;
    return { className: glass ? "backdrop-blur" : "", style, onDark };
  }

  const preset = CHROME_PRESET[config?.background ?? "dark"] ?? CHROME_PRESET.dark;
  return {
    className: glass ? preset.glass : preset.solid,
    style: Object.keys(style).length ? style : undefined,
    onDark: preset.onDark,
  };
}

/** สีแถบสถานะของเบราว์เซอร์มือถือ — ให้ตรงกับสีแถบเมนู */
export function chromeThemeColor(config: StyleConfig | undefined): string {
  if (config?.background === "custom" && config.backgroundColor) return config.backgroundColor;
  if (config?.background === "page") return "#faf8f5";
  if (config?.background === "tint") return "#f2ede6";
  return "#1e232a";
}

/** ชื่อของแต่ละชนิดส่วน — แสดงบนแผงเปลี่ยนสีในโหมดแก้ไข */
const SECTION_LABELS: Record<string, string> = {
  highlights: "ส่วนการ์ดจุดเด่น",
  "featured-products": "ส่วนสินค้าแนะนำ",
  spotlight: "ส่วนเรื่องเล่าเด่น",
  workshops: "ส่วนฐานเรียนรู้",
  "latest-articles": "ส่วนบทความล่าสุด",
  cta: "กล่องชวนติดต่อ",
  history: "ส่วนประวัติชุมชน",
  assets: "ส่วนทุนชุมชน",
  artisans: "ส่วนทำเนียบปราชญ์",
  closing: "กล่องปิดท้าย",
  references: "ส่วนแหล่งอ้างอิง",
  catalogue: "ส่วนรายการสินค้า",
  list: "ส่วนรายการบทความ",
  places: "ส่วนจุดเช็กอิน",
  travel: "ส่วนการเดินทาง",
  channels: "ส่วนช่องทางติดต่อ",
  form: "ส่วนฟอร์มและแผนที่",
  prose: "ส่วนเนื้อหาข้อความ",
  imageText: "ส่วนภาพคู่ข้อความ",
  cards: "ส่วนการ์ด",
  stats: "ส่วนตัวเลขสำคัญ",
  gallery: "ส่วนแกลเลอรี",
  collection: "ส่วนรายการจากคลัง",
};

export const sectionLabel = (type: string) => SECTION_LABELS[type] ?? "ส่วนนี้";

/**
 * ที่อยู่ของแถวส่วนนั้นในหลังบ้าน สำหรับปุ่มเปลี่ยนสี
 * คืน undefined เมื่อหน้ายังไม่เคยบันทึกลำดับส่วน (แถวยังไม่มีจริงในฐานข้อมูล)
 */
export function sectionAt(make: (path: string) => string, config: SectionConfig): string | undefined {
  return config.index === undefined ? undefined : make(`sections.${config.index}`);
}

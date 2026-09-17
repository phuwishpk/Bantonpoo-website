/**
 * ตัวช่วยเรื่องสีที่ใช้ร่วมกันทั้งหน้าเว็บ หลังบ้าน และตัวเลือกสีในโหมดแก้ไข
 *
 * ไฟล์นี้ต้องไม่ import อะไรที่ผูกกับเซิร์ฟเวอร์ เพราะคอมโพเนนต์ฝั่งไคลเอนต์ใช้ด้วย
 */

export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export const isHexColor = (value: unknown): value is string =>
  typeof value === "string" && HEX_COLOR.test(value);

/** ความสว่างของสีตามมาตรฐาน WCAG (0 = ดำ, 1 = ขาว) */
export function luminance(hex: string): number {
  const value = hex.replace("#", "");
  const channel = (start: number) => {
    const part = parseInt(value.slice(start, start + 2), 16) / 255;
    return part <= 0.03928 ? part / 12.92 : ((part + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/** สีตัวอักษรหลักของเว็บ — ink-800 (เข้ม) และ rice-100 (อ่อน) */
const DARK_TEXT = luminance("#1e232a");
const LIGHT_TEXT = luminance("#faf8f5");

/**
 * พื้นสีนี้ควรใช้ตัวอักษรสีอ่อนหรือไม่
 *
 * เทียบความต่างของสีกับตัวอักษรทั้งสองแบบแล้วเลือกแบบที่อ่านง่ายกว่า
 * แม่นกว่าการตัดที่ความสว่างค่าเดียว โดยเฉพาะสีกลาง ๆ อย่างเขียวหรือส้ม
 */
export function isDarkColor(hex: string): boolean {
  const surface = luminance(hex);
  return contrast(surface, LIGHT_TEXT) > contrast(surface, DARK_TEXT);
}

const mix = (base: string, other: string, percent: number) =>
  `color-mix(in oklab, ${base} ${100 - percent}%, ${other} ${percent}%)`;

/**
 * ไล่เฉดสีเน้นจากสีเดียว แล้วเขียนทับตัวแปร --color-leaf-* ที่คลาสของ Tailwind อ้างอยู่
 *
 * ใช้ color-mix ของ CSS เพราะเบราว์เซอร์ผสมใน oklab ซึ่งให้เฉดที่ตาคนมองแล้วสม่ำเสมอ
 * กว่าการคำนวณแบบ RGB — ธีมทั้งเว็บ (src/lib/theme.ts) ใช้สูตรเดียวกันนี้
 */
export function accentVars(hex: string): Record<string, string> {
  return {
    "--color-leaf-50": mix(hex, "white", 92),
    "--color-leaf-100": mix(hex, "white", 84),
    "--color-leaf-200": mix(hex, "white", 66),
    "--color-leaf-300": mix(hex, "white", 46),
    "--color-leaf-400": mix(hex, "white", 22),
    "--color-leaf-500": hex,
    "--color-leaf-600": mix(hex, "black", 16),
    "--color-leaf-700": mix(hex, "black", 30),
    "--color-leaf-800": mix(hex, "black", 44),
    "--color-leaf-900": mix(hex, "black", 56),
  };
}

/**
 * พื้นสีอ่อนที่ผู้ดูแลเลือกเอง — ปรับสีการ์ดและเส้นแบ่งในส่วนนั้นให้เข้ากับพื้น
 *
 * การ์ดใช้ bg-rice-50 และเส้นใช้ rice-300 อยู่แล้ว การเขียนทับตัวแปรเหล่านี้บนตัวส่วน
 * จึงทำให้การ์ดอมสีพื้นเล็กน้อยแทนที่จะเป็นสีครีมโดด ๆ
 * ไม่แตะ rice-100 เพราะใช้เป็นสีตัวอักษรบนกล่องสีเข้มด้วย
 */
export function lightSurfaceVars(hex: string): Record<string, string> {
  return {
    "--color-rice-50": mix(hex, "white", 55),
    "--color-rice-200": mix(hex, "black", 4),
    "--color-rice-300": mix(hex, "black", 12),
    "--color-rice-400": mix(hex, "black", 20),
  };
}

/** สีพื้นและเส้นขอบของการ์ด — ใช้คู่กับกฎ .has-card-color .box ใน globals.css */
export function cardVars(hex: string): Record<string, string> {
  return {
    "--card-bg": hex,
    "--card-line": mix(hex, isDarkColor(hex) ? "white" : "black", 14),
  };
}

/** ชุดสีสำเร็จรูปที่แนะนำ — เลือกให้เข้ากับโทนของเว็บและอ่านง่ายทั้งพื้นอ่อนและเข้ม */
export type Swatch = { value: string; label: string };

export const LIGHT_SWATCHES: Swatch[] = [
  { value: "#ffffff", label: "ขาว" },
  { value: "#faf8f5", label: "ครีมข้าว" },
  { value: "#f2ede6", label: "ครีมเข้ม" },
  { value: "#eef7f1", label: "เขียวอ่อน" },
  { value: "#fdf8e7", label: "เหลืองอ่อน" },
  { value: "#fdf0e8", label: "ส้มอ่อน" },
  { value: "#eef2fa", label: "ฟ้าอ่อน" },
  { value: "#f9eef1", label: "ชมพูอ่อน" },
];

export const DARK_SWATCHES: Swatch[] = [
  { value: "#1e232a", label: "เทาเข้ม (ค่าเริ่มต้น)" },
  { value: "#123020", label: "เขียวเข้ม" },
  { value: "#1d3557", label: "น้ำเงินเข้ม" },
  { value: "#4a1d24", label: "แดงเลือดหมู" },
  { value: "#3b2a1a", label: "น้ำตาลไม้" },
  { value: "#2e2640", label: "ม่วงเข้ม" },
];

export const ACCENT_SWATCHES: Swatch[] = [
  { value: "#2e7d52", label: "เขียวสมุนไพร" },
  { value: "#0f766e", label: "เขียวหัวเป็ด" },
  { value: "#3b4f9e", label: "คราม" },
  { value: "#7c3aed", label: "ม่วง" },
  { value: "#9f1239", label: "แดงชาด" },
  { value: "#c2410c", label: "ส้มอิฐ" },
  { value: "#ad8a1c", label: "ทองวัด" },
  { value: "#1e232a", label: "เทาเข้ม" },
];

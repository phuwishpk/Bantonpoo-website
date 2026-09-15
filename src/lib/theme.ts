/**
 * แปลงค่าจาก Global "ธีมและหน้าตาเว็บ" เป็น CSS ที่ฉีดทับค่าเดิม
 *
 * Tailwind v4 ประกาศโทเคนทั้งหมดเป็นตัวแปร CSS บน :root อยู่แล้ว
 * การเขียนทับตัวแปรเหล่านั้นจึงเปลี่ยนสีและระยะห่างได้ทั้งเว็บพร้อมกัน
 * โดยไม่ต้องแก้คลาสในคอมโพเนนต์แม้แต่ที่เดียว
 */

export type ThemeSettings = {
  palette: string;
  accentColor?: string;
  surface: string;
  fontPair: string;
  baseFontSize: string;
  radius: string;
  density: string;
  customCss?: string;
};

export const DEFAULT_THEME: ThemeSettings = {
  palette: "leaf",
  surface: "rice",
  fontPair: "plex-noto",
  baseFontSize: "16",
  radius: "medium",
  density: "normal",
};

/** สีหลักของแต่ละชุดสีสำเร็จรูป */
const PALETTE_BASE: Record<string, string> = {
  leaf: "#2e7d52",
  ember: "#c2410c",
  indigo: "#3b4f9e",
  crimson: "#9f1239",
};

const SURFACE: Record<string, { c50: string; c100: string; c200: string; c300: string; c400: string }> = {
  rice: { c50: "#fefdfc", c100: "#faf8f5", c200: "#f2ede6", c300: "#e7dfd4", c400: "#d6cabb" },
  white: { c50: "#ffffff", c100: "#ffffff", c200: "#f4f4f5", c300: "#e4e4e7", c400: "#d4d4d8" },
  grey: { c50: "#fafafa", c100: "#f4f4f5", c200: "#e9e9ec", c300: "#dcdce0", c400: "#c8c8cf" },
};

const RADIUS: Record<string, { card: string; lg: string; xl: string; xl2: string; full: string }> = {
  sharp: { card: "0.125rem", lg: "0.125rem", xl: "0.25rem", xl2: "0.25rem", full: "0.25rem" },
  medium: { card: "0.75rem", lg: "0.5rem", xl: "0.75rem", xl2: "1rem", full: "9999px" },
  round: { card: "1.5rem", lg: "1rem", xl: "1.5rem", xl2: "2rem", full: "9999px" },
};

/** Tailwind คำนวณระยะห่างทุกคลาสจากตัวแปรเดียวนี้ ปรับที่นี่จึงปรับได้ทั้งเว็บ */
const DENSITY: Record<string, string> = {
  compact: "0.22rem",
  normal: "0.25rem",
  airy: "0.285rem",
};

const FONT_PAIRS: Record<string, { sans: string; serif: string }> = {
  "plex-noto": { sans: "--font-plex-thai", serif: "--font-serif-thai" },
  "sarabun-trirong": { sans: "--font-sarabun", serif: "--font-trirong" },
  prompt: { sans: "--font-prompt", serif: "--font-prompt" },
};

/**
 * ไล่เฉดอ่อน-เข้มจากสีหลักสีเดียว
 *
 * ใช้ color-mix ของ CSS แทนการคำนวณสีใน JavaScript เพราะเบราว์เซอร์ผสมใน oklab
 * ซึ่งให้เฉดที่ตาคนมองแล้วสม่ำเสมอกว่าการผสมแบบ RGB ตรง ๆ
 */
function scaleFrom(base: string): string {
  const mix = (color: string, percent: number) =>
    `color-mix(in oklab, ${base} ${100 - percent}%, ${color} ${percent}%)`;
  return [
    `--color-leaf-50: ${mix("white", 92)};`,
    `--color-leaf-100: ${mix("white", 84)};`,
    `--color-leaf-200: ${mix("white", 66)};`,
    `--color-leaf-300: ${mix("white", 46)};`,
    `--color-leaf-400: ${mix("white", 22)};`,
    `--color-leaf-500: ${base};`,
    `--color-leaf-600: ${mix("black", 16)};`,
    `--color-leaf-700: ${mix("black", 30)};`,
    `--color-leaf-800: ${mix("black", 44)};`,
    `--color-leaf-900: ${mix("black", 56)};`,
  ].join("\n    ");
}

/**
 * กรอง CSS ที่ผู้ดูแลเขียนเอง
 *
 * ตัดสิ่งที่พาไปโหลดทรัพยากรภายนอกหรือปิดหน้าเว็บทั้งหน้าออก
 * ไม่ใช่การกรองที่กันได้ทุกกรณี แต่กันข้อผิดพลาดที่พบบ่อยและการดึงข้อมูลออกนอกเว็บ
 */
export function sanitiseCustomCss(css: string): string {
  return (
    css
      // ปิดแท็กเพื่อแทรก script ไม่ได้
      .replace(/<\/?[a-z][^>]*>/gi, "")
      // ห้ามดึงสไตล์หรือฟอนต์จากภายนอก
      .replace(/@import[^;]*;?/gi, "")
      // url() ที่ชี้ออกนอกเว็บใช้ติดตามผู้ใช้ได้ จึงตัดทิ้ง
      .replace(/url\(\s*['"]?\s*(https?:)?\/\/[^)]*\)/gi, "none")
      .replace(/expression\s*\(/gi, "(")
      .replace(/javascript:/gi, "")
      .slice(0, 8000)
  );
}

export function buildThemeCss(theme: ThemeSettings): string {
  const surface = SURFACE[theme.surface] ?? SURFACE.rice;
  const radius = RADIUS[theme.radius] ?? RADIUS.medium;
  const fonts = FONT_PAIRS[theme.fontPair] ?? FONT_PAIRS["plex-noto"];
  const base =
    theme.palette === "custom"
      ? (theme.accentColor ?? PALETTE_BASE.leaf)
      : (PALETTE_BASE[theme.palette] ?? PALETTE_BASE.leaf);

  const rules = `:root {
    ${scaleFrom(base)}
    --color-rice-50: ${surface.c50};
    --color-rice-100: ${surface.c100};
    --color-rice-200: ${surface.c200};
    --color-rice-300: ${surface.c300};
    --color-rice-400: ${surface.c400};
    --radius-card: ${radius.card};
    --radius-lg: ${radius.lg};
    --radius-xl: ${radius.xl};
    --radius-2xl: ${radius.xl2};
    --spacing: ${DENSITY[theme.density] ?? DENSITY.normal};
    --font-sans: var(${fonts.sans}), ui-sans-serif, system-ui, sans-serif;
    --font-serif: var(${fonts.serif}), ui-serif, Georgia, serif;
  }
  html { font-size: ${Number(theme.baseFontSize) || 16}px; }`;

  const custom = theme.customCss?.trim() ? `\n\n/* CSS เพิ่มเติมจากผู้ดูแล */\n${sanitiseCustomCss(theme.customCss)}` : "";
  return rules + custom;
}

/**
 * สร้างไฟล์ภาพ placeholder (SVG) สำหรับ prototype
 *
 * รันด้วย: npm run placeholders
 *
 * เมื่อได้รูปถ่ายจริงของชุมชนแล้ว ให้แทนที่ทีละไฟล์ใน public/placeholder/
 * โดยใช้ "ชื่อไฟล์เดิม" (เปลี่ยนนามสกุลเป็น .jpg แล้วแก้ path ใน src/content/media.ts)
 * ขนาดที่ระบุในแต่ละรายการคืออัตราส่วนที่หน้าเว็บออกแบบไว้ ควรครอปรูปจริงให้ตรงกัน
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "placeholder");

/** ชุดสีเดียวกับ design tokens ใน globals.css */
const PALETTE = {
  steel900: "#15191e",
  steel800: "#1e232a",
  steel700: "#272d35",
  steel500: "#47505b",
  ember500: "#e65100",
  ember600: "#d84315",
  ember300: "#ffa26b",
  rice100: "#faf8f5",
  rice300: "#e7dfd4",
  rice500: "#b9a894",
  forged500: "#64748b",
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** ลายเส้นทแยงบาง ๆ ให้พื้นผิวไม่เรียบจนดูเหมือนภาพเสีย */
const hatch = (id, color, opacity) => `
    <pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
      <line x1="0" y1="0" x2="0" y2="8" stroke="${color}" stroke-width="1" opacity="${opacity}"/>
    </pattern>`;

/**
 * ป้ายมุมขวาบน บอกว่าเป็นภาพตัวอย่าง พร้อมคำบรรยายว่าควรใส่รูปอะไร
 *
 * วางไว้มุมขวาบนเพราะมุมซ้ายบนเป็นที่ของป้ายสถานะสินค้า และขอบล่างเป็นที่ของ
 * คำบรรยายภาพจริงในหน้าเว็บ — ถ้าวางทับกันจะอ่านไม่ออกทั้งคู่
 */
const caption = (label, w, h, fg, dim) => {
  const pad = Math.round(w * 0.045);
  // จำกัดขนาดสูงสุดไว้ ไม่งั้นภาพกว้าง ๆ อย่างปกบทความจะมีป้ายตัวใหญ่จนแย่งความสนใจ
  const size = Math.min(22, Math.max(12, Math.round(w * 0.02)));
  return `
  <g font-family="'IBM Plex Sans Thai','Noto Sans Thai',sans-serif" text-anchor="end">
    <text x="${w - pad}" y="${pad + size}" font-size="${Math.round(size * 0.7)}"
          fill="${dim}" letter-spacing="1.6" opacity="0.9">PLACEHOLDER</text>
    <text x="${w - pad}" y="${pad + size * 2.3}" font-size="${size}" fill="${fg}" opacity="0.75">${esc(label)}</text>
  </g>`;
};

/**
 * variant "forge" — บรรยากาศเตาตีเหล็ก ไฟลุก ใช้กับ hero และภาพกิจกรรม
 */
const forge = (label, w, h) => `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stop-color="${PALETTE.steel900}"/>
      <stop offset="55%" stop-color="${PALETTE.steel800}"/>
      <stop offset="100%" stop-color="${PALETTE.steel700}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.68" cy="0.72" r="0.55">
      <stop offset="0%" stop-color="${PALETTE.ember300}" stop-opacity="0.85"/>
      <stop offset="45%" stop-color="${PALETTE.ember500}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${PALETTE.ember500}" stop-opacity="0"/>
    </radialGradient>
    ${hatch("h", "#ffffff", "0.035")}
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#h)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <g stroke="${PALETTE.ember300}" stroke-linecap="round" opacity="0.5" fill="none">
    <path d="M ${w * 0.5} ${h * 0.74} L ${w * 0.78} ${h * 0.6}" stroke-width="${h * 0.02}"/>
    <path d="M ${w * 0.3} ${h * 0.5} L ${w * 0.42} ${h * 0.68}" stroke-width="${h * 0.012}" opacity="0.3"/>
  </g>
  <g fill="${PALETTE.ember300}" opacity="0.55">
    <circle cx="${w * 0.62}" cy="${h * 0.42}" r="${h * 0.008}"/>
    <circle cx="${w * 0.71}" cy="${h * 0.3}" r="${h * 0.005}"/>
    <circle cx="${w * 0.55}" cy="${h * 0.24}" r="${h * 0.004}"/>
    <circle cx="${w * 0.8}" cy="${h * 0.46}" r="${h * 0.006}"/>
  </g>
  ${caption(label, w, h, "#ffffffcc", PALETTE.ember300)}`;

/**
 * variant "product" — ฉากถ่ายสินค้าพื้นเข้ม มีไฟส่องจากบน เห็นเงาใบมีด
 */
const product = (label, w, h, seed = 0) => {
  const cx = w / 2;
  const cy = h / 2;
  const bladeLen = w * 0.52;
  const tilt = -18 + (seed % 3) * 9;
  return `
  <defs>
    <linearGradient id="bg" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="${PALETTE.steel700}"/>
      <stop offset="100%" stop-color="${PALETTE.steel900}"/>
    </linearGradient>
    <radialGradient id="key" cx="0.5" cy="0.18" r="0.75">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#cfd6de"/>
      <stop offset="48%" stop-color="#8a949f"/>
      <stop offset="52%" stop-color="#6c7682"/>
      <stop offset="100%" stop-color="#3d454f"/>
    </linearGradient>
    ${hatch("h", "#ffffff", "0.025")}
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#h)"/>
  <rect width="${w}" height="${h}" fill="url(#key)"/>
  <g transform="translate(${cx} ${cy}) rotate(${tilt})">
    <!-- ใบมีด -->
    <path d="M ${-bladeLen * 0.55} ${-h * 0.045}
             L ${bladeLen * 0.3} ${-h * 0.05}
             Q ${bladeLen * 0.48} ${-h * 0.04} ${bladeLen * 0.5} ${h * 0.012}
             L ${-bladeLen * 0.55} ${h * 0.05} Z"
          fill="url(#steel)"/>
    <!-- ด้ามไม้ -->
    <rect x="${-bladeLen * 0.95}" y="${-h * 0.042}" width="${bladeLen * 0.42}" height="${h * 0.092}"
          rx="${h * 0.02}" fill="#5a3a24"/>
    <rect x="${-bladeLen * 0.95}" y="${-h * 0.042}" width="${bladeLen * 0.42}" height="${h * 0.03}"
          rx="${h * 0.014}" fill="#ffffff" opacity="0.08"/>
    <!-- เงาตกกระทบ -->
    <ellipse cx="0" cy="${h * 0.12}" rx="${bladeLen * 0.8}" ry="${h * 0.022}" fill="#000000" opacity="0.35"/>
  </g>
  ${caption(label, w, h, "#ffffffcc", PALETTE.forged500)}`;
};

/**
 * variant "portrait" — ภาพช่างฝีมือ โทนอบอุ่น
 */
const portrait = (label, w, h) => `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="${PALETTE.rice300}"/>
      <stop offset="100%" stop-color="${PALETTE.rice500}"/>
    </linearGradient>
    ${hatch("h", PALETTE.steel800, "0.05")}
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#h)"/>
  <g fill="${PALETTE.steel700}" opacity="0.5">
    <circle cx="${w * 0.5}" cy="${h * 0.38}" r="${w * 0.15}"/>
    <path d="M ${w * 0.5} ${h * 0.56}
             c ${-w * 0.26} 0 ${-w * 0.32} ${h * 0.18} ${-w * 0.32} ${h * 0.34}
             l ${w * 0.64} 0
             c 0 ${-h * 0.16} ${-w * 0.06} ${-h * 0.34} ${-w * 0.32} ${-h * 0.34} z"/>
  </g>
  ${caption(label, w, h, PALETTE.steel800, PALETTE.ember600)}`;

/**
 * variant "scene" — วิวชุมชน/ท่องเที่ยว โทนสว่างอบอุ่น
 */
const scene = (label, w, h) => `
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f7ece0"/>
      <stop offset="60%" stop-color="${PALETTE.rice300}"/>
      <stop offset="100%" stop-color="${PALETTE.rice500}"/>
    </linearGradient>
    ${hatch("h", PALETTE.steel800, "0.04")}
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  <rect width="${w}" height="${h}" fill="url(#h)"/>
  <circle cx="${w * 0.76}" cy="${h * 0.26}" r="${h * 0.1}" fill="${PALETTE.ember300}" opacity="0.5"/>
  <g fill="${PALETTE.steel700}" opacity="0.38">
    <path d="M 0 ${h * 0.78} L ${w * 0.22} ${h * 0.52} L ${w * 0.4} ${h * 0.78} Z"/>
    <path d="M ${w * 0.3} ${h * 0.82} L ${w * 0.56} ${h * 0.46} L ${w * 0.82} ${h * 0.82} Z"/>
  </g>
  <g fill="${PALETTE.steel800}" opacity="0.55">
    <rect x="0" y="${h * 0.8}" width="${w}" height="${h * 0.2}"/>
    <rect x="${w * 0.08}" y="${h * 0.62}" width="${w * 0.16}" height="${h * 0.18}"/>
    <path d="M ${w * 0.05} ${h * 0.63} L ${w * 0.16} ${h * 0.54} L ${w * 0.27} ${h * 0.63} Z"/>
  </g>
  ${caption(label, w, h, PALETTE.steel800, PALETTE.ember600)}`;

const VARIANTS = { forge, product, portrait, scene };

const svg = (variant, label, w, h, seed) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}">${VARIANTS[variant](label, w, h, seed)}</svg>\n`;

/* ------------------------------------------------------------------
   รายการภาพทั้งหมดที่ prototype ใช้
   ------------------------------------------------------------------ */
const MANIFEST = [
  // Hero / บรรยากาศชุมชน
  ["hero-forge", "forge", "ช่างกำลังตีมีดในเตาไฟ (ภาพ/วิดีโอหลักหน้าแรก)", 1200, 1500],
  ["forge-wide", "forge", "บรรยากาศซุ้มตีมีดบ้านต้นโพธิ์", 1600, 900],
  ["forge-quench", "forge", "ขั้นตอนชุบแข็งใบมีดในน้ำมัน", 1600, 900],
  ["forge-hammer", "forge", "การตีขึ้นรูปด้วยค้อน", 1200, 900],
  ["forge-sharpen", "forge", "ครูช่างกำลังลับคมมีด", 1200, 1000],

  // สินค้า
  ["product-chef-1", "product", "มีดแล่เนื้ออรัญญิก — ภาพรวมทั้งเล่ม", 1200, 1200],
  ["product-chef-2", "product", "มีดแล่เนื้ออรัญญิก — รายละเอียดใบมีด", 1200, 1200],
  ["product-chef-3", "product", "มีดแล่เนื้ออรัญญิก — ด้ามไม้ประดู่", 1200, 1200],
  ["product-chef-4", "product", "มีดแล่เนื้ออรัญญิก — ขณะใช้งานจริง", 1200, 1200],
  ["product-bushcraft-1", "product", "มีดเดินป่าทรงคลาสสิก — ภาพรวม", 1200, 1200],
  ["product-bushcraft-2", "product", "มีดเดินป่าทรงคลาสสิก — ซองหนังแท้", 1200, 1200],
  ["product-bushcraft-3", "product", "มีดเดินป่าทรงคลาสสิก — สันมีดและคม", 1200, 1200],
  ["product-damascus-1", "product", "มีดพับเหล็กดามัสกัส — ภาพรวม", 1200, 1200],
  ["product-damascus-2", "product", "มีดพับเหล็กดามัสกัส — ลายเหล็กดามัสกัส", 1200, 1200],
  ["product-damascus-3", "product", "มีดพับเหล็กดามัสกัส — ขณะพับเก็บ", 1200, 1200],
  ["product-santoku-1", "product", "มีดซันโตกุเหล็ก D2 — ภาพรวม", 1200, 1200],
  ["product-santoku-2", "product", "มีดซันโตกุเหล็ก D2 — คมมีด", 1200, 1200],
  ["product-cleaver-1", "product", "มีดอีโต้ครัวไทย — ภาพรวม", 1200, 1200],
  ["product-cleaver-2", "product", "มีดอีโต้ครัวไทย — ด้ามจับ", 1200, 1200],
  ["product-sword-1", "product", "ดาบมงคลสะสม — ภาพรวมทั้งเล่ม", 1200, 1200],
  ["product-sword-2", "product", "ดาบมงคลสะสม — ฝักไม้แกะสลัก", 1200, 1200],
  ["product-sword-3", "product", "ดาบมงคลสะสม — ลวดลายบนใบดาบ", 1200, 1200],
  ["product-keychain-1", "product", "พวงกุญแจมีดจิ๋ว — ภาพรวม", 1200, 1200],
  ["product-keychain-2", "product", "พวงกุญแจมีดจิ๋ว — เทียบขนาดกับมือ", 1200, 1200],
  ["product-chili-1", "scene", "น้ำพริกเผาสูตรชุมชน — ภาพสินค้า", 1200, 1200],
  ["product-chili-2", "scene", "น้ำพริกเผาสูตรชุมชน — วัตถุดิบ", 1200, 1200],

  // ช่างฝีมือ
  ["craftsman-somchai", "portrait", "ครูช่างสมชาย — ภาพโปรไฟล์", 800, 800],
  ["craftsman-prasert", "portrait", "ช่างประเสริฐ — ภาพโปรไฟล์", 800, 800],
  ["craftsman-wanpen", "portrait", "ช่างวันเพ็ญ — ภาพโปรไฟล์", 800, 800],
  ["craftsman-thawee", "portrait", "ช่างทวี — ภาพโปรไฟล์", 800, 800],

  // บทความ
  ["article-steel-sound", "forge", "ปกบทความ: ภูมิปัญญาการฟังเสียงเหล็ก", 1600, 900],
  ["article-history", "scene", "ปกบทความ: ประวัติชุมชนบ้านต้นโพธิ์", 1600, 900],
  ["article-festival", "scene", "ปกบทความ: งานประจำปีของชุมชน", 1600, 900],
  ["article-knife-care", "product", "ปกบทความ: วิธีดูแลรักษามีด", 1600, 900],
  ["article-rice-field", "scene", "ปกบทความ: วิถีเกษตรริมแม่น้ำป่าสัก", 1600, 900],
  ["article-workshop-open", "forge", "ปกบทความ: เปิดฐานเรียนรู้การตีมีด", 1600, 900],
  ["article-inline-anvil", "forge", "ภาพประกอบบทความ: ทั่งตีเหล็กโบราณ", 1400, 900],
  ["article-inline-charcoal", "forge", "ภาพประกอบบทความ: ถ่านไม้สำหรับเตาเผา", 1400, 900],

  // ท่องเที่ยว / เวิร์กช็อป / สถานที่
  ["workshop-forge", "forge", "ฐานเรียนรู้การตีมีด", 1200, 800],
  ["workshop-handle", "product", "ฐานเรียนรู้การเข้าด้ามและทำซองหนัง", 1200, 800],
  ["workshop-farm", "scene", "ฐานเรียนรู้วิถีเกษตรและอาหารพื้นบ้าน", 1200, 800],
  ["place-homestay", "scene", "โฮมสเตย์บ้านต้นโพธิ์", 1200, 800],
  ["place-temple", "scene", "วัดประจำชุมชน — จุดเช็กอิน", 1200, 800],
  ["place-market", "scene", "ตลาดชุมชนและร้านของฝาก", 1200, 800],

  // เกี่ยวกับชุมชน
  ["about-heritage", "forge", "ภาพประวัติศาสตร์ชุมชนช่างตีเหล็ก", 1400, 1000],
  ["about-community", "scene", "ภาพรวมชุมชนบ้านต้นโพธิ์", 1600, 900],
];

mkdirSync(OUT_DIR, { recursive: true });

MANIFEST.forEach(([name, variant, label, w, h], index) => {
  writeFileSync(join(OUT_DIR, `${name}.svg`), svg(variant, label, w, h, index));
});

/**
 * เขียนทะเบียนภาพเป็นไฟล์ TypeScript ด้วย เพื่อให้ขนาดภาพ (width/height)
 * ที่ next/image ใช้ ตรงกับไฟล์จริงเสมอ ไม่ต้องมาไล่แก้สองที่
 */
const TS_OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "content", "placeholders.ts");
const entries = MANIFEST.map(
  ([name, , label, w, h]) =>
    `  "${name}": { url: "/placeholder/${name}.svg", width: ${w}, height: ${h}, label: ${JSON.stringify(label)} },`
).join("\n");

writeFileSync(
  TS_OUT,
  `/* eslint-disable */
// ไฟล์นี้ถูกสร้างอัตโนมัติโดย scripts/generate-placeholders.mjs — อย่าแก้ด้วยมือ
// รันใหม่ด้วย: npm run placeholders

export type PlaceholderName = keyof typeof PLACEHOLDERS;

export const PLACEHOLDERS = {
${entries}
} as const;
`
);

console.log(`สร้างภาพ placeholder ${MANIFEST.length} ไฟล์ ที่ public/placeholder/ และทะเบียนภาพที่ src/content/placeholders.ts`);

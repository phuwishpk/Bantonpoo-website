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
  ink900: "#15191e",
  ink800: "#1e232a",
  ink700: "#272d35",
  ink500: "#47505b",
  leaf500: "#2e7d52",
  leaf600: "#24643f",
  leaf300: "#7ec79b",
  ochre400: "#c9a227",
  rice100: "#faf8f5",
  rice300: "#e7dfd4",
  rice500: "#b9a894",
  stone500: "#64748b",
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
 * variant "herb" — โทนเขียวสมุนไพร มีเงาใบไม้ ใช้กับ hero และภาพกระบวนการผลิต
 */
const herb = (label, w, h) => {
  const leaf = (x, y, size, angle, opacity) => `
    <g transform="translate(${x} ${y}) rotate(${angle})" opacity="${opacity}">
      <path d="M 0 0 C ${size * 0.55} ${-size * 0.45}, ${size * 0.95} ${-size * 0.2}, ${size} ${size * 0.05}
               C ${size * 0.8} ${size * 0.4}, ${size * 0.3} ${size * 0.42}, 0 0 Z"
            fill="${PALETTE.leaf300}"/>
      <path d="M 0 0 L ${size * 0.92} ${size * 0.02}" stroke="${PALETTE.ink900}" stroke-width="${size * 0.035}"
            opacity="0.25" fill="none"/>
    </g>`;

  return `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stop-color="${PALETTE.ink900}"/>
      <stop offset="55%" stop-color="${PALETTE.ink800}"/>
      <stop offset="100%" stop-color="#1c2b23"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.68" cy="0.68" r="0.62">
      <stop offset="0%" stop-color="${PALETTE.leaf300}" stop-opacity="0.72"/>
      <stop offset="45%" stop-color="${PALETTE.leaf500}" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="${PALETTE.leaf500}" stop-opacity="0"/>
    </radialGradient>
    ${hatch("h", "#ffffff", "0.03")}
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#h)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  ${leaf(w * 0.08, h * 0.66, h * 0.19, -26, 0.6)}
  ${leaf(w * 0.5, h * 0.84, h * 0.24, -14, 0.8)}
  ${leaf(w * 0.74, h * 0.56, h * 0.17, 22, 0.55)}
  ${leaf(w * 0.82, h * 0.3, h * 0.14, 152, 0.42)}
  ${leaf(w * 0.28, h * 0.42, h * 0.16, 196, 0.34)}
  ${leaf(w * 0.44, h * 0.18, h * 0.11, 168, 0.24)}
  ${leaf(w * 0.16, h * 0.94, h * 0.13, -40, 0.45)}
  ${caption(label, w, h, "#ffffffcc", PALETTE.leaf300)}`;
};

/**
 * variant "product" — ฉากถ่ายสินค้าพื้นเข้ม มีไฟส่องจากบน
 * ทรงสินค้าระบุตรง ๆ ในรายการภาพ (ช่องที่ 6) ไม่ใช่สุ่มตามลำดับ
 * เพราะชื่อภาพกับทรงต้องตรงกัน เช่น "ยาหม่องน้ำ" ต้องเป็นขวด ไม่ใช่ลูกประคบ
 */
const product = (label, w, h, shape = "jar") => {
  const cx = w / 2;
  const cy = h / 2;

  const shadow = `<ellipse cx="${cx}" cy="${cy + h * 0.24}" rx="${w * 0.24}" ry="${h * 0.025}"
                           fill="#000000" opacity="0.4"/>`;

  // ตลับยาหม่องทรงเตี้ย มีฝาเกลียว
  const jar = () => {
    const r = w * 0.17;
    const bodyTop = cy - h * 0.02;
    const bodyH = h * 0.2;
    return `
    ${shadow}
    <rect x="${cx - r}" y="${bodyTop}" width="${r * 2}" height="${bodyH}" rx="${r * 0.12}" fill="url(#glass)"/>
    <ellipse cx="${cx}" cy="${bodyTop + bodyH}" rx="${r}" ry="${r * 0.22}" fill="#1d3a2a"/>
    <rect x="${cx - r * 1.06}" y="${cy - h * 0.13}" width="${r * 2.12}" height="${h * 0.115}"
          rx="${r * 0.14}" fill="url(#lid)"/>
    <ellipse cx="${cx}" cy="${cy - h * 0.13}" rx="${r * 1.06}" ry="${r * 0.24}" fill="${PALETTE.leaf300}" opacity="0.9"/>
    <rect x="${cx - r * 0.6}" y="${bodyTop + bodyH * 0.25}" width="${r * 1.2}" height="${bodyH * 0.45}"
          rx="${r * 0.08}" fill="#ffffff" opacity="0.14"/>`;
  };

  // ขวดน้ำมันสมุนไพรคอยาว
  const bottle = () => {
    const r = w * 0.115;
    const top = cy - h * 0.2;
    return `
    ${shadow}
    <rect x="${cx - r * 0.34}" y="${top}" width="${r * 0.68}" height="${h * 0.1}" fill="url(#glass)"/>
    <path d="M ${cx - r * 0.34} ${top + h * 0.09}
             C ${cx - r * 1.05} ${top + h * 0.15}, ${cx - r * 1.1} ${top + h * 0.2}, ${cx - r * 1.1} ${top + h * 0.26}
             L ${cx - r * 1.1} ${cy + h * 0.21}
             Q ${cx - r * 1.1} ${cy + h * 0.24} ${cx - r * 0.9} ${cy + h * 0.24}
             L ${cx + r * 0.9} ${cy + h * 0.24}
             Q ${cx + r * 1.1} ${cy + h * 0.24} ${cx + r * 1.1} ${cy + h * 0.21}
             L ${cx + r * 1.1} ${top + h * 0.26}
             C ${cx + r * 1.1} ${top + h * 0.2}, ${cx + r * 1.05} ${top + h * 0.15}, ${cx + r * 0.34} ${top + h * 0.09} Z"
          fill="url(#glass)"/>
    <rect x="${cx - r * 0.42}" y="${top - h * 0.015}" width="${r * 0.84}" height="${h * 0.035}"
          rx="${r * 0.1}" fill="url(#lid)"/>
    <rect x="${cx - r * 0.85}" y="${cy + h * 0.02}" width="${r * 1.7}" height="${h * 0.12}"
          rx="${r * 0.08}" fill="${PALETTE.rice100}" opacity="0.88"/>
    <rect x="${cx - r * 0.55}" y="${cy + h * 0.055}" width="${r * 1.1}" height="${h * 0.012}"
          rx="2" fill="${PALETTE.leaf600}" opacity="0.5"/>
    <path d="M ${cx - r * 0.75} ${top + h * 0.2} L ${cx - r * 0.75} ${cy + h * 0.16}"
          stroke="#ffffff" stroke-width="${w * 0.011}" opacity="0.16" stroke-linecap="round"/>`;
  };

  // ลูกประคบสมุนไพร ห่อผ้าและมัดด้ามไม้
  const compress = () => {
    const r = w * 0.155;
    const ballY = cy + h * 0.06;
    return `
    ${shadow}
    <path d="M ${cx - r * 0.13} ${ballY - r * 1.05} L ${cx - r * 0.13} ${cy - h * 0.23}
             L ${cx + r * 0.13} ${cy - h * 0.23} L ${cx + r * 0.13} ${ballY - r * 1.05} Z"
          fill="#8a6a45"/>
    <circle cx="${cx}" cy="${ballY}" r="${r}" fill="url(#cloth)"/>
    <path d="M ${cx - r * 0.55} ${ballY - r * 0.9} Q ${cx} ${ballY - r * 1.35} ${cx + r * 0.55} ${ballY - r * 0.9}"
          fill="url(#cloth)"/>
    <rect x="${cx - r * 0.3}" y="${ballY - r * 1.12}" width="${r * 0.6}" height="${r * 0.22}"
          rx="${r * 0.08}" fill="${PALETTE.leaf600}"/>
    <g stroke="#00000030" fill="none" stroke-width="${r * 0.05}">
      <path d="M ${cx - r * 0.75} ${ballY - r * 0.3} Q ${cx - r * 0.2} ${ballY + r * 0.1} ${cx - r * 0.1} ${ballY + r * 0.9}"/>
      <path d="M ${cx + r * 0.75} ${ballY - r * 0.3} Q ${cx + r * 0.2} ${ballY + r * 0.1} ${cx + r * 0.1} ${ballY + r * 0.9}"/>
    </g>
    <circle cx="${cx - r * 0.35}" cy="${ballY - r * 0.35}" r="${r * 0.42}" fill="#ffffff" opacity="0.12"/>`;
  };

  // ก้อนสบู่สมุนไพร
  const bar = () => {
    const bw = w * 0.34;
    const bh = h * 0.2;
    return `
    ${shadow}
    <rect x="${cx - bw / 2}" y="${cy - bh / 2}" width="${bw}" height="${bh}" rx="${bh * 0.18}" fill="url(#glass)"/>
    <rect x="${cx - bw / 2}" y="${cy - bh / 2}" width="${bw}" height="${bh * 0.32}" rx="${bh * 0.18}"
          fill="#ffffff" opacity="0.12"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${bw * 0.22}" ry="${bh * 0.26}" fill="${PALETTE.leaf300}" opacity="0.35"/>`;
  };

  // กล่องชุดของฝาก
  const box = () => {
    const bw = w * 0.36;
    const bh = h * 0.26;
    const top = cy - bh * 0.55;
    return `
    ${shadow}
    <rect x="${cx - bw / 2}" y="${top}" width="${bw}" height="${bh}" rx="${bh * 0.06}" fill="#6b5a3a"/>
    <rect x="${cx - bw / 2}" y="${top}" width="${bw}" height="${bh * 0.26}" rx="${bh * 0.06}" fill="url(#lid)"/>
    <rect x="${cx - bw * 0.3}" y="${top + bh * 0.42}" width="${bw * 0.6}" height="${bh * 0.34}"
          rx="${bh * 0.05}" fill="${PALETTE.rice100}" opacity="0.9"/>
    <rect x="${cx - bw * 0.16}" y="${top + bh * 0.53}" width="${bw * 0.32}" height="${bh * 0.05}"
          rx="2" fill="${PALETTE.leaf600}" opacity="0.6"/>`;
  };

  const SHAPES = { jar, bottle, compress, bar, box };

  return `
  <defs>
    <linearGradient id="bg" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="${PALETTE.ink700}"/>
      <stop offset="100%" stop-color="${PALETTE.ink900}"/>
    </linearGradient>
    <radialGradient id="key" cx="0.5" cy="0.18" r="0.75">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1f4a34"/>
      <stop offset="35%" stop-color="#3d7f5c"/>
      <stop offset="70%" stop-color="#2a5c41"/>
      <stop offset="100%" stop-color="#163423"/>
    </linearGradient>
    <linearGradient id="lid" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#8f7b3a"/>
      <stop offset="40%" stop-color="${PALETTE.ochre400}"/>
      <stop offset="100%" stop-color="#7a6822"/>
    </linearGradient>
    <linearGradient id="cloth" x1="0.2" y1="0" x2="0.9" y2="1">
      <stop offset="0%" stop-color="#f3ead6"/>
      <stop offset="60%" stop-color="#ddcba6"/>
      <stop offset="100%" stop-color="#b8a077"/>
    </linearGradient>
    ${hatch("h", "#ffffff", "0.025")}
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#h)"/>
  <rect width="${w}" height="${h}" fill="url(#key)"/>
  ${(SHAPES[shape] ?? jar)()}
  ${caption(label, w, h, "#ffffffcc", PALETTE.stone500)}`;
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
    ${hatch("h", PALETTE.ink800, "0.05")}
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#h)"/>
  <g fill="${PALETTE.ink700}" opacity="0.5">
    <circle cx="${w * 0.5}" cy="${h * 0.38}" r="${w * 0.15}"/>
    <path d="M ${w * 0.5} ${h * 0.56}
             c ${-w * 0.26} 0 ${-w * 0.32} ${h * 0.18} ${-w * 0.32} ${h * 0.34}
             l ${w * 0.64} 0
             c 0 ${-h * 0.16} ${-w * 0.06} ${-h * 0.34} ${-w * 0.32} ${-h * 0.34} z"/>
  </g>
  ${caption(label, w, h, PALETTE.ink800, PALETTE.leaf600)}`;

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
    ${hatch("h", PALETTE.ink800, "0.04")}
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  <rect width="${w}" height="${h}" fill="url(#h)"/>
  <circle cx="${w * 0.76}" cy="${h * 0.26}" r="${h * 0.1}" fill="${PALETTE.leaf300}" opacity="0.5"/>
  <g fill="${PALETTE.ink700}" opacity="0.38">
    <path d="M 0 ${h * 0.78} L ${w * 0.22} ${h * 0.52} L ${w * 0.4} ${h * 0.78} Z"/>
    <path d="M ${w * 0.3} ${h * 0.82} L ${w * 0.56} ${h * 0.46} L ${w * 0.82} ${h * 0.82} Z"/>
  </g>
  <g fill="${PALETTE.ink800}" opacity="0.55">
    <rect x="0" y="${h * 0.8}" width="${w}" height="${h * 0.2}"/>
    <rect x="${w * 0.08}" y="${h * 0.62}" width="${w * 0.16}" height="${h * 0.18}"/>
    <path d="M ${w * 0.05} ${h * 0.63} L ${w * 0.16} ${h * 0.54} L ${w * 0.27} ${h * 0.63} Z"/>
  </g>
  ${caption(label, w, h, PALETTE.ink800, PALETTE.leaf600)}`;

const VARIANTS = { herb, product, portrait, scene };

const svg = (variant, label, w, h, shape) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}">${VARIANTS[variant](label, w, h, shape)}</svg>\n`;

/* ------------------------------------------------------------------
   รายการภาพทั้งหมดที่ prototype ใช้
   ------------------------------------------------------------------ */
const MANIFEST = [
  // Hero / บรรยากาศชุมชน
  ["hero-herbal", "herb", "กลุ่มแม่บ้านกำลังแปรรูปสมุนไพร (ภาพ/วิดีโอหลักหน้าแรก)", 1200, 1500],
  ["community-wide", "scene", "บรรยากาศชุมชนบ้านต้นโพธิ์ริมแม่น้ำเจ้าพระยา", 1600, 900],
  ["herb-garden", "herb", "แปลงสมุนไพรของชุมชน", 1600, 900],
  ["herb-drying", "herb", "การตากและอบสมุนไพรก่อนแปรรูป", 1200, 900],
  ["herb-blending", "herb", "การผสมตำรับยาหม่องน้ำ", 1200, 1000],

  // สินค้า — เรียงให้ทรงสลับกัน (ตลับ / ขวด / ลูกประคบ)
  ["product-balm-1", "product", "ยาหม่องน้ำสมุนไพรบ้านต้นโพธิ์ — ภาพรวมขวด", 1200, 1200, "bottle"],
  ["product-balm-2", "product", "ยาหม่องน้ำสมุนไพรบ้านต้นโพธิ์ — ฉลากและปริมาณสุทธิ", 1200, 1200, "bottle"],
  ["product-balm-3", "product", "ยาหม่องน้ำสมุนไพรบ้านต้นโพธิ์ — ขณะใช้งาน", 1200, 1200, "bottle"],
  ["product-solidbalm-1", "product", "ยาหม่องสมุนไพรแบบตลับ — ภาพรวม", 1200, 1200, "jar"],
  ["product-solidbalm-2", "product", "ยาหม่องสมุนไพรแบบตลับ — เปิดฝาเห็นเนื้อยาหม่อง", 1200, 1200, "jar"],
  ["product-oil-1", "product", "น้ำมันไพลนวดคลายกล้ามเนื้อ — ภาพรวม", 1200, 1200, "bottle"],
  ["product-oil-2", "product", "น้ำมันไพลนวดคลายกล้ามเนื้อ — เทียบขนาดกับฝ่ามือ", 1200, 1200, "bottle"],
  ["product-compress-1", "product", "ลูกประคบสมุนไพรสด — ภาพรวม", 1200, 1200, "compress"],
  ["product-compress-2", "product", "ลูกประคบสมุนไพรสด — สมุนไพรที่ใช้ภายใน", 1200, 1200, "compress"],
  ["product-compress-3", "product", "ลูกประคบสมุนไพรสด — ขณะนึ่งก่อนใช้", 1200, 1200, "compress"],
  ["product-inhaler-1", "product", "ยาดมสมุนไพรแบบหลอด — ภาพรวม", 1200, 1200, "bottle"],
  ["product-inhaler-2", "product", "ยาดมสมุนไพรแบบหลอด — สมุนไพรภายในหลอด", 1200, 1200, "bottle"],
  ["product-soap-1", "product", "สบู่สมุนไพรกลุ่มแม่บ้าน — ภาพรวม", 1200, 1200, "bar"],
  ["product-soap-2", "product", "สบู่สมุนไพรกลุ่มแม่บ้าน — ผิวสบู่ใกล้ ๆ", 1200, 1200, "bar"],
  ["product-tea-1", "product", "ชาสมุนไพรชงดื่ม — ภาพรวมบรรจุภัณฑ์", 1200, 1200, "box"],
  ["product-tea-2", "product", "ชาสมุนไพรชงดื่ม — ขณะชงในถ้วย", 1200, 1200, "jar"],
  ["product-giftset-1", "product", "ชุดของฝากสมุนไพรบ้านต้นโพธิ์ — ภาพรวมทั้งชุด", 1200, 1200, "box"],
  ["product-giftset-2", "product", "ชุดของฝากสมุนไพรบ้านต้นโพธิ์ — กล่องบรรจุ", 1200, 1200, "box"],
  ["product-rice-1", "scene", "ข้าวสารจากแปลงนาของชุมชน — ภาพสินค้า", 1200, 1200],
  ["product-rice-2", "scene", "ข้าวสารจากแปลงนาของชุมชน — แปลงนา 15 ไร่", 1200, 1200],

  // ปราชญ์ชุมชนและกลุ่มผู้ผลิต
  ["member-pimsiri", "portrait", "นางพิมสิริ กัลวิชา ปราชญ์ชุมชนด้านการแปรรูปสมุนไพร — ภาพโปรไฟล์", 800, 800],
  ["member-pathummarat", "portrait", "นางปทุมมรัตน์ ธรรมโม ประธานกลุ่มวิสาหกิจชุมชนสมุนไพร — ภาพโปรไฟล์", 800, 800],

  // บทความ
  ["article-mon-heritage", "scene", "ปกบทความ: รากเหง้าชาวมอญบ้านต้นโพธิ์", 1600, 900],
  ["article-wat-chetwong", "scene", "ปกบทความ: วัดเจตวงศ์ โบราณสถานริมเจ้าพระยา", 1600, 900],
  ["article-herbal-wisdom", "herb", "ปกบทความ: ภูมิปัญญาสมุนไพรของชุมชน", 1600, 900],
  ["article-name-origin", "scene", "ปกบทความ: ที่มาของชื่อบ้านต้นโพธิ์", 1600, 900],
  ["article-sufficiency", "herb", "ปกบทความ: ศูนย์เรียนรู้เศรษฐกิจพอเพียง", 1600, 900],
  ["article-riverside", "scene", "ปกบทความ: จุดชมทัศนียภาพริมแม่น้ำเจ้าพระยา", 1600, 900],
  ["article-inline-mortar", "herb", "ภาพประกอบบทความ: ครกบดสมุนไพรของชุมชน", 1400, 900],
  ["article-inline-ubosot", "scene", "ภาพประกอบบทความ: อุโบสถมหาอุตของวัดเจตวงศ์", 1400, 900],

  // ท่องเที่ยว / เวิร์กช็อป / สถานที่
  ["workshop-balm", "herb", "ฐานเรียนรู้การทำยาหม่องน้ำสมุนไพร", 1200, 800],
  ["workshop-compress", "product", "ฐานเรียนรู้การทำลูกประคบสมุนไพร", 1200, 800, "compress"],
  ["workshop-mon-walk", "scene", "กิจกรรมเดินชมวัดเจตวงศ์และวิถีมอญริมน้ำ", 1200, 800],
  ["place-wat-chetwong", "scene", "วัดเจตวงศ์ — โบราณสถานประจำชุมชน", 1200, 800],
  ["place-learning-center", "herb", "ศูนย์การเรียนรู้เศรษฐกิจพอเพียงบ้านต้นโพธิ์", 1200, 800],
  ["place-viewpoint", "scene", "จุดชมทัศนียภาพริมฝั่งแม่น้ำเจ้าพระยา", 1200, 800],
  ["place-enterprise", "product", "จุดจำหน่ายผลิตภัณฑ์วิสาหกิจชุมชนสมุนไพร", 1200, 800, "box"],

  // เกี่ยวกับชุมชน
  ["about-heritage", "scene", "ภาพประวัติศาสตร์ชุมชนมอญริมเจ้าพระยา", 1400, 1000],
  ["about-community", "scene", "ภาพรวมชุมชนบ้านต้นโพธิ์", 1600, 900],
];

mkdirSync(OUT_DIR, { recursive: true });

MANIFEST.forEach(([name, variant, label, w, h, shape]) => {
  writeFileSync(join(OUT_DIR, `${name}.svg`), svg(variant, label, w, h, shape));
});

/**
 * เขียนทะเบียนภาพเป็นไฟล์ TypeScript ด้วย เพื่อให้ขนาดภาพ (width/height)
 * ที่ next/image ใช้ ตรงกับไฟล์จริงเสมอ ไม่ต้องมาไล่แก้สองที่
 */
const TS_OUT = join(dirname(fileURLToPath(import.meta.url)), "seed-data", "placeholders.ts");
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

console.log(`สร้างภาพ placeholder ${MANIFEST.length} ไฟล์ ที่ public/placeholder/ และทะเบียนภาพที่ scripts/seed-data/placeholders.ts`);

import type { ProductForm, ProductStatus } from "@/content/types";

/**
 * ป้ายชื่อสถานะและรูปแบบผลิตภัณฑ์
 *
 * เก็บไว้ในโค้ดโดยตั้งใจ ไม่เปิดให้แก้ผ่าน CMS เพราะค่าเหล่านี้ผูกกับตรรกะ
 * ของตัวกรองและสีของป้าย ถ้าแก้เป็นข้อความอื่นตัวกรองจะพัง
 */
export const productFormLabels: Record<ProductForm, { th: string }> = {
  "liquid-balm": { th: "ยาหม่องน้ำ" },
  "solid-balm": { th: "ยาหม่องแบบตลับ" },
  "massage-oil": { th: "น้ำมันนวด" },
  compress: { th: "ลูกประคบ" },
  soap: { th: "สบู่และของใช้" },
  tea: { th: "ชาสมุนไพร" },
  "dried-herb": { th: "สมุนไพรอบแห้ง" },
  other: { th: "อื่น ๆ" },
};

export const productStatusLabels: Record<ProductStatus, { th: string }> = {
  "in-stock": { th: "พร้อมส่ง" },
  "made-to-order": { th: "สั่งทำล่วงหน้า" },
  "sold-out": { th: "สินค้าหมด" },
};

/** ป้ายชื่อประเภทการจดแจ้ง — กฎหมายกำหนดให้แสดงเลขที่ถ้าผลิตภัณฑ์จดแจ้งไว้ */
export const registrationLabels = {
  none: { th: "" },
  "fda-cosmetic": { th: "เลขที่ใบรับแจ้งเครื่องสำอาง" },
  "fda-herbal": { th: "เลขทะเบียนผลิตภัณฑ์สมุนไพร" },
  tcps: { th: "มาตรฐานผลิตภัณฑ์ชุมชน (มผช.)" },
} as const;

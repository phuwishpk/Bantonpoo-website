import type { Category } from "./types";

/** หมวดหมู่บทความ */
export const articleCategories: Category[] = [
  {
    slug: "local-wisdom",
    title: { th: "วิถีชีวิตและภูมิปัญญาท้องถิ่น" },
    type: "article",
    description: { th: "เรื่องเล่าจากเตาไฟ ภูมิปัญญาการตีเหล็ก และวิถีชีวิตของคนบ้านต้นโพธิ์" },
  },
  {
    slug: "news-events",
    title: { th: "กิจกรรมและข่าวประชาสัมพันธ์" },
    type: "article",
    description: { th: "ข่าวสาร งานประจำปี และกิจกรรมที่ชุมชนเปิดให้ผู้สนใจเข้าร่วม" },
  },
];

/** หมวดหมู่สินค้า */
export const productCategories: Category[] = [
  {
    slug: "kitchen-knives",
    title: { th: "มีดทำครัว" },
    type: "product",
    description: { th: "มีดสำหรับงานครัวเรือนและครัวมืออาชีพ ทรงไทยและทรงสากล" },
  },
  {
    slug: "outdoor-knives",
    title: { th: "มีดเดินป่าและใช้งานทั่วไป" },
    type: "product",
    description: { th: "มีดเนื้อเหนียว ทนงานหนัก สำหรับงานสวน งานป่า และการเดินทาง" },
  },
  {
    slug: "collectible",
    title: { th: "ดาบและมีดมงคลสะสม" },
    type: "product",
    description: { th: "งานสั่งทำพิเศษ ตีโดยครูช่างอาวุโส สำหรับสะสมและมอบเป็นของที่ระลึก" },
  },
  {
    slug: "souvenir",
    title: { th: "ของฝากและของที่ระลึก" },
    type: "product",
    description: { th: "ของฝากชิ้นเล็กจากชุมชน เหมาะเป็นของที่ระลึกจากการมาเยือน" },
  },
  {
    slug: "farm-products",
    title: { th: "สินค้าเกษตรและอาหารแปรรูป" },
    type: "product",
    description: { th: "ผลผลิตและอาหารแปรรูปฝีมือกลุ่มแม่บ้านในชุมชน" },
  },
];

export const allCategories: Category[] = [...articleCategories, ...productCategories];

export function getCategory(slug: string, type: Category["type"]): Category | undefined {
  return allCategories.find((category) => category.slug === slug && category.type === type);
}

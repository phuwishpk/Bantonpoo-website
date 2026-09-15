import type { Category } from "./types";

/** หมวดหมู่บทความ */
export const articleCategories: Category[] = [
  {
    slug: "local-wisdom",
    title: { th: "วิถีชีวิตและภูมิปัญญาท้องถิ่น" },
    type: "article",
    description: { th: "รากเหง้าชาวมอญ ภูมิปัญญาสมุนไพร และวิถีชีวิตริมแม่น้ำเจ้าพระยา" },
  },
  {
    slug: "news-events",
    title: { th: "กิจกรรมและข่าวประชาสัมพันธ์" },
    type: "article",
    description: { th: "ข่าวสารของชุมชน กิจกรรมฐานเรียนรู้ และงานประเพณีประจำปี" },
  },
];

/** หมวดหมู่สินค้า */
export const productCategories: Category[] = [
  {
    slug: "balm-oil",
    title: { th: "ยาหม่องและน้ำมันสมุนไพร" },
    type: "product",
    description: { th: "ผลิตภัณฑ์เรือธงของชุมชน ทั้งยาหม่องน้ำ ยาหม่องตลับ และน้ำมันนวด" },
  },
  {
    slug: "compress",
    title: { th: "ลูกประคบและสมุนไพรอบ" },
    type: "product",
    description: { th: "ลูกประคบสมุนไพรและสมุนไพรอบแห้งสำหรับนวดและอบไอน้ำ" },
  },
  {
    slug: "body-care",
    title: { th: "สบู่และของใช้สมุนไพร" },
    type: "product",
    description: { th: "ของใช้ในชีวิตประจำวันจากสมุนไพร ทำโดยกลุ่มแม่บ้านในชุมชน" },
  },
  {
    slug: "herbal-drinks",
    title: { th: "ชาและเครื่องดื่มสมุนไพร" },
    type: "product",
    description: { th: "สมุนไพรอบแห้งสำหรับชงดื่ม คัดจากแปลงปลูกของชุมชน" },
  },
  {
    slug: "gift-set",
    title: { th: "ชุดของฝากและของที่ระลึก" },
    type: "product",
    description: { th: "ชุดของฝากจากชุมชน เหมาะเป็นของที่ระลึกจากการมาเยือนหรือของชำร่วย" },
  },
  {
    slug: "farm-products",
    title: { th: "ผลผลิตเกษตรของชุมชน" },
    type: "product",
    description: { th: "ผลผลิตจากพื้นที่นาและสวนของชุมชนบ้านต้นโพธิ์" },
  },
];

export const allCategories: Category[] = [...articleCategories, ...productCategories];

export function getCategory(slug: string, type: Category["type"]): Category | undefined {
  return allCategories.find((category) => category.slug === slug && category.type === type);
}

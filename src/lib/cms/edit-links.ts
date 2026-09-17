/**
 * ทางลัดไปยังหน้าแก้ไขในหลังบ้าน
 *
 * รวมไว้ที่เดียวเพื่อให้ปุ่มแก้ไขบนหน้าเว็บกับโครงสร้างหลังบ้านไม่หลุดจากกัน
 * ถ้าเปลี่ยน slug ของ global หรือ collection ต้องแก้ที่นี่ที่เดียว
 */
export const adminGlobal = (slug: string) => `/admin/globals/${slug}`;
export const adminDoc = (collection: string, id: string | number) =>
  `/admin/collections/${collection}/${id}`;
export const adminList = (collection: string) => `/admin/collections/${collection}`;

/** ทางลัดที่ใช้ได้ทุกหน้า */
const SHARED = [
  { label: "เมนูนำทางและท้ายเว็บ", href: adminGlobal("navigation") },
  { label: "ข้อความบนปุ่มและป้ายกำกับ", href: adminGlobal("ui-labels") },
  { label: "ข้อมูลชุมชนและการติดต่อ", href: adminGlobal("site-settings") },
  { label: "ธีมและสีของเว็บ", href: adminGlobal("theme") },
];

type PageKey = "home" | "about" | "shop" | "stories" | "tourism" | "contact";

const PAGE_GLOBAL: Record<PageKey, { label: string; slug: string; extra?: { label: string; href: string }[] }> = {
  home: {
    label: "หน้าแรก",
    slug: "home-page",
    extra: [
      { label: "สินค้าทั้งหมด", href: adminList("products") },
      { label: "บทความทั้งหมด", href: adminList("articles") },
    ],
  },
  about: {
    label: "หน้าเกี่ยวกับชุมชน",
    slug: "about-page",
    extra: [{ label: "ทำเนียบปราชญ์ชุมชน", href: adminList("artisans") }],
  },
  shop: {
    label: "หน้าสินค้าชุมชน",
    slug: "shop-page",
    extra: [
      { label: "สินค้าทั้งหมด", href: adminList("products") },
      { label: "หมวดหมู่สินค้า", href: adminList("categories") },
    ],
  },
  stories: {
    label: "หน้าเรื่องเล่า",
    slug: "stories-page",
    extra: [
      { label: "บทความทั้งหมด", href: adminList("articles") },
      { label: "หมวดหมู่บทความ", href: adminList("categories") },
    ],
  },
  tourism: {
    label: "หน้าท่องเที่ยว",
    slug: "tourism-page",
    extra: [
      { label: "ฐานเรียนรู้และกิจกรรม", href: adminList("workshops") },
      { label: "จุดเช็กอินในชุมชน", href: adminList("places") },
    ],
  },
  contact: {
    label: "หน้าติดต่อเรา",
    slug: "contact-page",
    extra: [{ label: "ข้อความที่ส่งเข้ามา", href: adminList("enquiries") }],
  },
};

/**
 * ทางลัดของหน้าที่ผู้ดูแลสร้างเอง
 *
 * หน้าเหล่านี้ไม่มี global ประจำตัว จึงลิงก์ไปที่เอกสารของหน้านั้นโดยตรง
 */
export function editLinksForCustomPage(id: string | number, title: string) {
  return {
    pageLabel: title || "หน้านี้",
    links: [
      { label: `เนื้อหา${title || "หน้านี้"}`, href: adminDoc("pages", id) },
      { label: "หน้าที่สร้างเองทั้งหมด", href: adminList("pages") },
      ...SHARED,
    ],
  };
}

const DOC_KINDS = {
  product: { collection: "products", label: "สินค้า", list: "สินค้าทั้งหมด" },
  article: { collection: "articles", label: "บทความ", list: "บทความทั้งหมด" },
} as const;

/** ทางลัดของหน้ารายละเอียดสินค้า/บทความ — ลิงก์ไปที่เอกสารนั้นโดยตรง */
export function editLinksForDoc(kind: keyof typeof DOC_KINDS, id: string | number, title: string) {
  const config = DOC_KINDS[kind];
  return {
    pageLabel: title ? `${config.label} "${title}"` : `${config.label}นี้`,
    links: [
      { label: `${config.label}นี้ (ราคา สถานะ รูปทั้งหมด)`, href: adminDoc(config.collection, id) },
      { label: config.list, href: adminList(config.collection) },
      ...SHARED,
    ],
  };
}

export function editLinksFor(page: PageKey) {
  const config = PAGE_GLOBAL[page];
  return {
    pageLabel: config.label,
    links: [
      { label: `เนื้อหา${config.label}`, href: adminGlobal(config.slug) },
      ...(config.extra ?? []),
      ...SHARED,
    ],
  };
}

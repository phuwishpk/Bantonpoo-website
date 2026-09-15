import type { Locale, Localized } from "@/content/types";

/**
 * ตอนนี้เว็บให้บริการภาษาไทยภาษาเดียว
 *
 * โครงรองรับอังกฤษวางไว้แล้ว: ข้อความทุกตัวผ่าน t() และเก็บใน Localized
 * เมื่อจะเปิด EN ให้ทำ 3 อย่าง
 *   1. เติมคีย์ en ในข้อมูล src/content/*.ts และใน UI ด้านล่าง
 *   2. เปลี่ยน src/app/... เป็น src/app/[locale]/... แล้วส่ง locale ลงมาทาง props
 *   3. เพิ่ม "en" ใน LOCALES และเปิดตัวสลับภาษาใน SiteHeader
 */
export const DEFAULT_LOCALE: Locale = "th";
export const LOCALES: Locale[] = ["th"];

/** ดึงข้อความตามภาษา ถ้ายังไม่มีคำแปลให้ตกกลับเป็นภาษาไทย */
export function t<T>(value: Localized<T>, locale: Locale = DEFAULT_LOCALE): T {
  return (value[locale] ?? value.th) as T;
}

/** ช่วยสร้างค่า Localized จากข้อความไทยตัวเดียว ใช้ตอนเขียน mock data */
export function th<T>(value: T): Localized<T> {
  return { th: value };
}

/** ข้อความ UI ที่ไม่ได้มาจาก CMS — รวมไว้ที่เดียวเพื่อให้แปลได้ทีเดียวจบ */
export const ui = {
  th: {
    skipToContent: "ข้ามไปยังเนื้อหาหลัก",
    menu: "เมนู",
    closeMenu: "ปิดเมนู",
    openMenu: "เปิดเมนู",
    home: "หน้าแรก",
    viewAll: "ดูทั้งหมด",
    readMore: "อ่านต่อ",
    readFullArticle: "อ่านบทความฉบับเต็ม",
    orderViaLine: "สั่งซื้อผ่าน LINE",
    callCraftsman: "โทรสอบถามช่างโดยตรง",
    contactUs: "ติดต่อเรา",
    askPrice: "สอบถามราคา",
    baht: "฿",
    perPerson: "/ คน",
    minutesRead: "นาที",
    readTime: "ใช้เวลาอ่าน",
    publishedOn: "เผยแพร่เมื่อ",
    writtenBy: "เขียนโดย",
    share: "แชร์บทความนี้",
    shareFacebook: "แชร์ไปยัง Facebook",
    shareLine: "แชร์ไปยัง LINE",
    copyLink: "คัดลอกลิงก์",
    copied: "คัดลอกแล้ว",
    relatedArticles: "บทความที่เกี่ยวข้อง",
    relatedProducts: "สินค้าที่คล้ายกัน",
    allCategories: "ทั้งหมด",
    searchPlaceholder: "ค้นหาเรื่องเล่าและข่าวกิจกรรม",
    searchProductsPlaceholder: "ค้นหาชื่อมีดหรือรหัสสินค้า",
    noResults: "ไม่พบรายการที่ตรงกับเงื่อนไข",
    clearFilters: "ล้างตัวกรอง",
    filters: "ตัวกรอง",
    category: "หมวดหมู่",
    steelType: "ชนิดเหล็ก",
    availability: "สถานะสินค้า",
    specs: "สเปกทางเทคนิค",
    craftedBy: "ตีโดย",
    care: "การดูแลรักษา",
    productCode: "รหัสสินค้า",
    resultsCount: "รายการ",
  },
} as const;

export function useUi(locale: Locale = DEFAULT_LOCALE) {
  return ui[locale as "th"] ?? ui.th;
}

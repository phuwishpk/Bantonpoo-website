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

/*
  ข้อความ UI ที่ไม่ได้อยู่ในเนื้อหาของหน้า เช่น "ผลิตโดย" หรือ "เวลาทำการ"
  ย้ายไปอยู่ใน Global "ข้อความบนปุ่มและป้ายกำกับ" แล้ว ผู้ดูแลจึงแก้เองได้
  ค่าตั้งต้นอยู่ที่ DEFAULT_LABELS ใน src/lib/cms/labels.ts
*/

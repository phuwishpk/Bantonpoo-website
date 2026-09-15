import type { Product, SiteSettings, Workshop } from "@/content/types";
import { formatPrice } from "./format";
import { t } from "./i18n";

/**
 * ข้อความสั่งซื้อที่จะถูกคัดลอกไปวางในแชท LINE
 *
 * หมายเหตุทางเทคนิค: LINE ไม่มี URL scheme ที่ส่งข้อความเข้าห้องแชทของ
 * Official Account ได้โดยตรง (line.me/R/msg/text/ จะเปิดหน้าเลือกผู้รับแทน)
 * เว็บจึงใช้วิธี "คัดลอกข้อความ + เปิดแชท OA" ซึ่งได้ผลจริงบนทุกอุปกรณ์
 *
 * ถ้าภายหลังชุมชนทำ LINE Messaging API (บอท) จะเปลี่ยนไปใช้ลิงก์พร้อม
 * พารามิเตอร์แล้วให้บอทตอบกลับอัตโนมัติได้ โดยแก้เฉพาะไฟล์นี้
 */
export function buildProductOrderMessage(
  product: Product,
  url: string,
  site: SiteSettings
): string {
  const price = product.price === null ? "สอบถามราคา" : formatPrice(product.price);
  return [
    `สวัสดีครับ/ค่ะ สนใจสั่งซื้อสินค้าจากเว็บไซต์${t(site.communityShortName)}`,
    "",
    `สินค้า: ${t(product.name)}`,
    `รหัสสินค้า: ${product.sku}`,
    `ราคา: ${price}`,
    `ลิงก์: ${url}`,
    "",
    "รบกวนสอบถามรายละเอียดและค่าจัดส่งด้วยครับ/ค่ะ",
  ].join("\n");
}

export function buildWorkshopBookingMessage(
  workshop: Workshop,
  url: string,
  site: SiteSettings
): string {
  const price =
    workshop.pricePerPerson === null ? "สอบถามราคา" : `${formatPrice(workshop.pricePerPerson)} / คน`;
  return [
    `สวัสดีครับ/ค่ะ สนใจจองกิจกรรมของ${t(site.communityShortName)}`,
    "",
    `กิจกรรม: ${t(workshop.title)}`,
    `ระยะเวลา: ${t(workshop.duration)}`,
    `ค่าบริการ: ${price}`,
    `ลิงก์: ${url}`,
    "",
    "รบกวนสอบถามรอบที่ว่างและวิธีการจองด้วยครับ/ค่ะ",
  ].join("\n");
}

/** ลิงก์โทรออก */
export const telUrl = (site: SiteSettings) => `tel:${site.phone}`;

/** ลิงก์แชร์ไปยัง LINE (ใช้กับปุ่มแชร์บทความ) */
export function lineShareUrl(url: string): string {
  return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`;
}

export function facebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

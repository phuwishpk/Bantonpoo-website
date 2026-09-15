import type { Article, ContentBlock } from "@/content/types";
import { t } from "./i18n";

/** วันที่แบบไทย ปี พ.ศ. เช่น "24 สิงหาคม 2569" */
export function formatThaiDate(iso: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(new Date(`${iso}T00:00:00+07:00`));
}

/** วันที่แบบสั้น ใช้บนการ์ด เช่น "24 ส.ค. 69" */
export function formatThaiDateShort(iso: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
    timeZone: "Asia/Bangkok",
  }).format(new Date(`${iso}T00:00:00+07:00`));
}

/** ราคาเป็นบาท มีตัวคั่นหลักพัน เช่น "฿1,450" */
export function formatPrice(price: number): string {
  return `฿${new Intl.NumberFormat("th-TH").format(price)}`;
}

/**
 * ประมาณเวลาที่ใช้อ่าน
 *
 * ภาษาไทยไม่มีช่องว่างระหว่างคำ จึงนับเป็นจำนวนอักขระแทนจำนวนคำ
 * ใช้ค่าประมาณ 500 อักขระ/นาที ซึ่งใกล้เคียงความเร็วอ่านเพื่อความเข้าใจของผู้อ่านทั่วไป
 */
const CHARS_PER_MINUTE = 500;

export function estimateReadingMinutes(article: Article): number {
  const characters = article.content.reduce((total, block) => total + blockLength(block), 0);
  return Math.max(1, Math.round(characters / CHARS_PER_MINUTE));
}

function blockLength(block: ContentBlock): number {
  switch (block.type) {
    case "heading":
    case "paragraph":
      return t(block.text).length;
    case "quote":
      return t(block.text).length + (block.attribution ? t(block.attribution).length : 0);
    case "list":
      return t(block.items).join("").length;
    case "image":
      return block.media.caption ? t(block.media.caption).length : 0;
    case "youtube":
      // วิดีโอไม่ได้อ่าน แต่กินเวลาผู้ใช้ — คิดเป็นค่าคงที่เทียบเท่าครึ่งนาที
      return CHARS_PER_MINUTE / 2;
  }
}

/** ตัดข้อความให้สั้นลงโดยไม่ตัดกลางคำอังกฤษ ใช้กับ meta description */
export function truncate(text: string, maxLength = 155): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

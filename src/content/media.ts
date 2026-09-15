import { PLACEHOLDERS, type PlaceholderName } from "./placeholders";
import type { Media } from "./types";

/**
 * สร้างอ็อบเจกต์ Media จากทะเบียนภาพ placeholder
 *
 * ตอนต่อ Payload CMS จริง ฟังก์ชันนี้จะถูกแทนที่ด้วยข้อมูลจาก Media collection
 * (url/width/height/alt มาจาก API ตรง ๆ) โดย component ไม่ต้องแก้
 *
 * @param alt ข้อความบรรยายภาพสำหรับ screen reader — ถ้าไม่ระบุจะใช้คำอธิบาย
 *            ในทะเบียนภาพ ซึ่งบอกว่า "ควรเป็นรูปอะไร" ช่วยตอนเอารูปจริงมาใส่
 */
export function img(name: PlaceholderName, alt?: string, caption?: string): Media {
  const source = PLACEHOLDERS[name];
  return {
    url: source.url,
    width: source.width,
    height: source.height,
    alt: { th: alt ?? source.label },
    ...(caption ? { caption: { th: caption } } : {}),
  };
}

/**
 * โดเมนของเว็บ
 *
 * อ่านจากตัวแปรสภาพแวดล้อมก่อนเสมอ เพื่อให้เครื่องทดสอบกับเครื่องจริง
 * ใช้โค้ดชุดเดียวกันได้โดยไม่ต้องแก้ไฟล์
 *
 *   NEXT_PUBLIC_SITE_URL=https://bantonpoo.phuwish.com
 *
 * ค่านี้มีผลกับ canonical URL, sitemap, OpenGraph และปุ่มแชร์บทความ
 * ถ้าตั้งผิด ลิงก์ที่ถูกแชร์ออกไปจะชี้ผิดที่
 */
const FALLBACK_SITE_URL = "https://bantonpoo.phuwish.com";

function normalise(url: string): string {
  // ตัด / ท้ายออก เพื่อไม่ให้ประกอบ URL แล้วได้ // ซ้อน
  return url.trim().replace(/\/+$/, "");
}

export const siteUrl = normalise(process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL);

/**
 * กันไม่ให้โดเมนทดสอบถูก Google เก็บดัชนีไปแข่งกับเว็บจริง
 * ตั้ง SITE_NOINDEX=1 บนเครื่องทดสอบ และไม่ต้องตั้งบนเครื่องจริง
 */
export const isNoIndex = process.env.SITE_NOINDEX === "1";

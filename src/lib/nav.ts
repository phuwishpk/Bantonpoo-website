/**
 * รายการเมนูย้ายไปอยู่ใน CMS แล้ว (Global "เมนูนำทาง")
 * เหลือไว้เฉพาะตรรกะที่ไม่ใช่เนื้อหา
 */

/** ตรวจว่าเมนูข้อนี้ตรงกับหน้าที่กำลังเปิดอยู่หรือไม่ */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

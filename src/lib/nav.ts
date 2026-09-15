/** เมนูนำทางหลัก ใช้ร่วมกันระหว่าง Header, Drawer บนมือถือ และ Footer */
export const mainNav = [
  { href: "/", label: "หน้าแรก" },
  { href: "/about", label: "เกี่ยวกับชุมชน" },
  { href: "/stories", label: "เรื่องเล่า" },
  { href: "/shop", label: "สินค้าชุมชน" },
  { href: "/tourism", label: "ท่องเที่ยว" },
  { href: "/contact", label: "ติดต่อเรา" },
] as const;

/** ตรวจว่าเมนูข้อนี้ตรงกับหน้าที่กำลังเปิดอยู่หรือไม่ */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

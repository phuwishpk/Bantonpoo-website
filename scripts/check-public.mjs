/**
 * ตรวจว่าหน้าเว็บสาธารณะไม่มีข้อมูลหลังบ้านหลุดออกไป
 *
 * คอมโพเนนต์ฝั่งไคลเอนต์ที่ "เรนเดอร์ null" ยังส่ง props ของตัวเองไปกับหน้าเว็บอยู่ดี
 * ลิงก์หลังบ้านและที่อยู่ของฟิลด์จึงเคยหลุดไปถึงผู้เข้าชมทุกคนมาแล้ว
 * สคริปต์นี้กันไม่ให้พลาดซ้ำ — รันทุกครั้งก่อน deploy
 *
 * รันด้วย: npm run check:public  (ต้องมี npm run dev หรือ npm start ทำงานอยู่)
 */

const BASE = process.env.CHECK_BASE_URL ?? "http://localhost:3100";

/** ร่องรอยของโหมดแก้ไขที่ต้องไม่ปรากฏในหน้าของผู้เข้าชมทั่วไป */
const FORBIDDEN = [
  "g:home-page", "g:about-page", "g:shop-page", "g:stories-page",
  "g:tourism-page", "g:contact-page", "g:site-settings", "g:navigation", "g:ui-labels",
  "c:products:", "c:articles:", "c:workshops:", "c:places:", "c:artisans:", "c:pages:",
  "inline-edit", "/admin/collections", "/admin/globals", "api/inline-edit",
];

const PATHS = ["/", "/about", "/shop", "/stories", "/tourism", "/contact"];

let failed = 0;

async function inspect(path) {
  const response = await fetch(BASE + path);
  const html = await response.text();
  const found = FORBIDDEN.filter((needle) => html.includes(needle));
  if (found.length || !response.ok) failed++;
  console.log(
    `  ${found.length || !response.ok ? "FAIL" : "ok  "} ${path.padEnd(26)} ${response.status}` +
      (found.length ? `  หลุด: ${found.join(", ")}` : "")
  );
}

for (const path of PATHS) await inspect(path);

// หน้ารายละเอียด — หยิบลิงก์แรกที่เจอจากหน้ารวม
for (const [listPath, prefix] of [["/shop", "/shop/"], ["/stories", "/stories/"]]) {
  const html = await (await fetch(BASE + listPath)).text();
  const match = html.match(new RegExp(`href="(${prefix}[a-z0-9-]+)"`));
  if (match) await inspect(match[1]);
}

console.log(failed === 0 ? "\nไม่มีข้อมูลหลังบ้านหลุด" : `\nพบปัญหา ${failed} หน้า`);
process.exit(failed === 0 ? 0 : 1);

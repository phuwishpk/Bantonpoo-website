import type { Access, FieldAccess } from "payload";

/**
 * กฎการเข้าถึงที่ใช้ร่วมกันทุก collection
 *
 * บทบาท
 *   admin   ทำได้ทุกอย่าง รวมจัดการผู้ใช้และลบถาวร
 *   editor  สร้าง/แก้/เผยแพร่เนื้อหาได้ แต่ลบถาวรและจัดการผู้ใช้ไม่ได้
 *   viewer  เข้าดูหลังบ้านได้อย่างเดียว
 */
export const isAdmin: Access = ({ req }) => req.user?.role === "admin";

export const isEditor: Access = ({ req }) =>
  req.user?.role === "admin" || req.user?.role === "editor";

export const isLoggedIn: Access = ({ req }) => Boolean(req.user);

/** ทุกคนอ่านได้ — ใช้กับเนื้อหาที่ต้องแสดงบนเว็บสาธารณะ */
export const anyone: Access = () => true;

/** ระดับฟิลด์ — กันไม่ให้ editor เลื่อนขั้นตัวเองเป็น admin */
export const isAdminField: FieldAccess = ({ req }) => req.user?.role === "admin";

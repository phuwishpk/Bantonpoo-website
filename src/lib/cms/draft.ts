import { cache } from "react";
import { draftMode } from "next/headers";

/**
 * อยู่ในโหมดดูตัวอย่างหรือไม่
 *
 * เปิดผ่าน /api/preview ซึ่งตรวจสิทธิ์ผู้ใช้ Payload ก่อนเสมอ
 * เมื่อเปิดอยู่ ทุกคำสั่งดึงข้อมูลจะอ่าน "ฉบับร่าง" แทนฉบับที่เผยแพร่แล้ว
 *
 * หน้าเว็บยังถูกสร้างเป็นไฟล์ล่วงหน้าตามปกติ — Next ข้ามแคชให้เฉพาะคำขอที่มีคุกกี้
 * โหมดดูตัวอย่างเท่านั้น ผู้เข้าชมทั่วไปจึงยังได้หน้าที่สร้างไว้ล่วงหน้าเหมือนเดิม
 */
export const isDraftMode = cache(async (): Promise<boolean> => {
  try {
    const { isEnabled } = await draftMode();
    return isEnabled;
  } catch {
    // ถูกเรียกนอกบริบทคำขอ เช่นจากสคริปต์ seed
    return false;
  }
});

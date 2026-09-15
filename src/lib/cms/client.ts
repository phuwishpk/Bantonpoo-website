import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";

/**
 * ตัวเชื่อม Payload สำหรับใช้ใน Server Component
 *
 * เรียกฐานข้อมูลตรง ไม่ผ่าน HTTP จึงไม่ต้องจัดการ CORS หรือ API key
 * ห่อด้วย cache() เพื่อให้หลายคอมโพเนนต์ในคำขอเดียวกันใช้ instance เดิม
 */
export const getCms = cache(async () => getPayload({ config }));

/**
 * ดึงข้อมูลทุกภาษาพร้อมกัน
 *
 * Payload จะคืนฟิลด์ที่แปลได้เป็นอ็อบเจกต์ { th, en } ซึ่งตรงกับชนิด
 * Localized<T> ที่คอมโพเนนต์ของเราใช้อยู่แล้ว จึงแทบไม่ต้องแปลงอะไร
 */
export const ALL_LOCALES = "all" as const;

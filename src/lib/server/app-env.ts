import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseEnv } from "node:util";

/**
 * อ่านค่าตั้งของแอปจากไฟล์ bantonpoo-data/app.env
 *
 * โฮสต์ Plesk นี้ไม่ส่ง Custom environment variables ในหน้า Node.js มาถึงแอป
 * (ตรวจจาก log บนเซิร์ฟเวอร์จริง: ทุกตัวว่าง) จึงเก็บค่าไว้ในไฟล์ที่อยู่นอกโฟลเดอร์เว็บแทน
 * scripts/deploy-ftp.mjs สร้างไฟล์นี้ให้เอง พร้อมสุ่ม PAYLOAD_SECRET
 *
 * ค่าในไฟล์ชนะค่าจากสภาพแวดล้อม ให้มีที่ตั้งค่าที่เดียว — ถ้าวันหนึ่ง Plesk เริ่มส่งค่าเก่ามา
 * แอปจะไม่สลับไปใช้ฐานข้อมูลหรือกุญแจอื่นเงียบ ๆ
 *
 * ต้องเรียกก่อนโค้ดที่อ่าน process.env ถูกโหลด — instrumentation register() รันก่อน route ใด ๆ
 * เส้นทางแบบสัมพัทธ์ในไฟล์นับจากโฟลเดอร์แอป เพราะ server.js ย้ายไปทำงานที่นั่นเสมอ
 */

/** โฟลเดอร์ข้อมูลข้างโฟลเดอร์แอป ตามโครงที่สคริปต์ deploy สร้าง */
export function defaultDataDir() {
  // turbopackIgnore: เส้นทางรู้ตอนรันเท่านั้น ถ้าไม่บอก Turbopack จะลากทั้งโปรเจกต์เข้าบิลด์
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), "..", "bantonpoo-data");
}

export type AppEnvResult =
  | { file: string; keys: string[]; overridden: string[] }
  | { file: string; error: string }
  | { file: null };

export function loadAppEnv(): AppEnvResult {
  const file = process.env.APP_ENV_FILE
    ? path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.APP_ENV_FILE)
    : path.join(defaultDataDir(), "app.env");
  if (!existsSync(/*turbopackIgnore: true*/ file)) return { file: null };

  try {
    const values = parseEnv(readFileSync(/*turbopackIgnore: true*/ file, "utf8"));
    const keys: string[] = [];
    const overridden: string[] = [];
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined) continue;
      if (process.env[key] !== undefined && process.env[key] !== value) overridden.push(key);
      process.env[key] = value;
      keys.push(key);
    }
    return { file, keys, overridden };
  } catch (error) {
    // ห้ามพิมพ์เนื้อไฟล์ — มีกุญแจลับอยู่ข้างใน
    return { file, error: error instanceof Error ? error.message : String(error) };
  }
}

/** สรุปผลเป็นข้อความสำหรับ log — มีแต่ชื่อค่า ไม่มีค่าจริง */
export function describeAppEnv(result: AppEnvResult) {
  if (!result.file) return "ไม่พบไฟล์ค่าตั้ง app.env — ใช้ค่าจากสภาพแวดล้อมอย่างเดียว";
  if ("error" in result) return `อ่าน ${result.file} ไม่ได้: ${result.error}`;
  const overridden = result.overridden.length ? ` (แทนค่าจากสภาพแวดล้อม: ${result.overridden.join(", ")})` : "";
  return `อ่านค่าตั้งจาก ${result.file}: ${result.keys.join(", ") || "(ว่าง)"}${overridden}`;
}

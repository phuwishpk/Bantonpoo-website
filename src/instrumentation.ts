import type { Instrumentation } from "next";

/**
 * จุดเริ่มต้นของเซิร์ฟเวอร์ — Next เรียก register() ครั้งเดียวและรอให้เสร็จก่อนรับคำขอแรก
 *
 * 1. อ่านค่าตั้งจาก bantonpoo-data/app.env (โฮสต์ไม่ส่ง env ของ Plesk มาให้ — ดู app-env.ts)
 * 2. เปิดการบันทึก log ลงไฟล์ บนโฮสต์ที่ไม่มี SSH (ดู file-log.ts)
 *
 * import แบบ dynamic และเช็ก NEXT_RUNTIME เพราะไฟล์นี้ถูกโหลดใน Edge runtime ด้วย
 * ซึ่งไม่มีโมดูล node:fs ให้ใช้
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NODE_ENV !== "production") return;
  // ตอน next build ไม่ต้องทำ — ไม่ใช่เซิร์ฟเวอร์จริง และต้องใช้ค่าที่สคริปต์ build ส่งมา
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { describeAppEnv, loadAppEnv } = await import("./lib/server/app-env");
  const appEnv = loadAppEnv();

  const { logStartupProbe, startFileLog } = await import("./lib/server/file-log");
  if (startFileLog()) await logStartupProbe([describeAppEnv(appEnv)]);
}

export const onRequestError: Instrumentation.onRequestError = async (error, request) => {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NODE_ENV !== "production") return;
  const { logRequestError } = await import("./lib/server/file-log");
  logRequestError(error, request);
};

import { mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import type { Payload } from "payload";

/**
 * ปรับโครงฐานข้อมูลเองตอนแอปเริ่มทำงาน โดยให้ทำทีละโพรเซส
 *
 * ทำไมไม่ใช้ `prodMigrations` ของ adapter ตรง ๆ:
 * ทั้ง `next build` (หลาย worker) และ Passenger บนเซิร์ฟเวอร์ (หลายโพรเซส) เปิดแอป
 * พร้อมกันได้ ทุกตัวเห็นว่า migration ยังไม่ได้รันแล้วแย่งกันสร้างตาราง ตัวที่ช้ากว่า
 * ล้มด้วย "table already exists" — เจอจริงตอนทดสอบ build
 *
 * แก้ด้วยการล็อกระดับไฟล์: `mkdir` สำเร็จได้แค่โพรเซสเดียว ตัวอื่นรอจนตัวแรกเสร็จ
 * แล้วค่อยรันต่อ ซึ่งจะเห็นว่าทุก migration รันไปแล้วและข้ามไปเอง
 */

type Migration = { name: string; up: unknown; down: unknown };

/** ล็อกที่ค้างนานกว่านี้ถือว่าโพรเซสเจ้าของตายไปแล้ว */
const STALE_LOCK_MS = 2 * 60 * 1000;
const WAIT_LIMIT_MS = 90 * 1000;
const POLL_MS = 250;

/** โฟลเดอร์ล็อกวางไว้ข้างไฟล์ฐานข้อมูล — คืน null ถ้าไม่ใช่ฐานข้อมูลแบบไฟล์ */
function lockPathFor(databaseUri: string | undefined): string | null {
  const uri = databaseUri || "file:./bantonpoo.db";
  if (!uri.startsWith("file:")) return null;
  // turbopackIgnore: เส้นทางนี้รู้ตอนรันเท่านั้น ถ้าไม่บอก Turbopack จะลากทั้งโปรเจกต์เข้าบิลด์
  const file = path.resolve(/*turbopackIgnore: true*/ process.cwd(), uri.slice("file:".length));
  return `${file}.migrate-lock`;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function acquire(lock: string, logger: Payload["logger"]): Promise<boolean> {
  const started = Date.now();
  while (true) {
    try {
      await mkdir(lock);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    }

    try {
      const info = await stat(lock);
      if (Date.now() - info.mtimeMs > STALE_LOCK_MS) {
        logger.warn(`[migrate] พบล็อกค้างเกิน 2 นาที ลบทิ้งแล้วลองใหม่: ${lock}`);
        await rm(lock, { recursive: true, force: true });
        continue;
      }
    } catch {
      // ล็อกหายไประหว่างเช็ก — วนกลับไปลองใหม่ได้เลย
      continue;
    }

    if (Date.now() - started > WAIT_LIMIT_MS) {
      logger.error(`[migrate] รอล็อกนานเกินไป ข้ามการปรับโครงรอบนี้: ${lock}`);
      return false;
    }
    await sleep(POLL_MS);
  }
}

export async function migrateOnStart(payload: Payload, migrations: Migration[]): Promise<void> {
  if (process.env.NODE_ENV !== "production" || migrations.length === 0) return;

  const lock = lockPathFor(process.env.DATABASE_URI);
  if (lock && !(await acquire(lock, payload.logger))) return;

  try {
    /*
      ฐานข้อมูลที่เคยถูกเปิดในโหมดพัฒนา (push) จะมีแถว batch = -1
      เมื่อเจอแถวนี้ Payload จะถามยืนยันในเทอร์มินัล ซึ่งบนเซิร์ฟเวอร์ไม่มีใครตอบ
      แอปจะค้างหรือปิดตัวไปเลย จึงต้องตรวจก่อนแล้วหยุดพร้อมบอกสาเหตุ
    */
    const tracked = await payload
      .find({ collection: "payload-migrations", limit: 0, depth: 0 })
      .catch(() => ({ docs: [] as { batch?: number }[] }));
    if (tracked.docs.some((row) => (row as { batch?: number }).batch === -1)) {
      payload.logger.error(
        "[migrate] ฐานข้อมูลนี้เคยถูกเปิดในโหมดพัฒนา ข้ามการปรับโครงอัตโนมัติ — อย่าอัปโหลดไฟล์ฐานข้อมูลของเครื่องพัฒนาขึ้นเซิร์ฟเวอร์"
      );
      return;
    }

    await payload.db.migrate({ migrations: migrations as never });
  } finally {
    if (lock) await rm(lock, { recursive: true, force: true });
  }
}

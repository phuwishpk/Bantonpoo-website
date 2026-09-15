import { revalidatePath } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from "payload";

/**
 * ล้างแคชของหน้าที่เกี่ยวข้องหลังแก้เนื้อหา
 *
 * ทำให้เว็บอัปเดตทันทีที่กดบันทึก โดยไม่ต้อง build ใหม่ทั้งเว็บ
 * ถ้าไม่มีส่วนนี้ ผู้ดูแลจะแก้เนื้อหาแล้วไม่เห็นผลจนกว่าจะ deploy รอบถัดไป
 */
function safeRevalidate(paths: string[], layout = false) {
  for (const path of paths) {
    try {
      revalidatePath(path, layout ? "layout" : "page");
    } catch {
      // เรียกจากสคริปต์นอก Next (เช่น seed) จะทำไม่ได้ — ข้ามไปเงียบ ๆ
    }
  }
}

export const revalidateProducts: CollectionAfterChangeHook & CollectionAfterDeleteHook = ({
  doc,
  previousDoc,
}: {
  doc?: Record<string, unknown>;
  previousDoc?: Record<string, unknown>;
}) => {
  const paths = ["/", "/shop"];
  if (doc?.slug) paths.push(`/shop/${doc.slug}`);
  // slug เปลี่ยน ต้องล้างหน้าเดิมด้วย ไม่งั้นลิงก์เก่าจะค้างในแคช
  if (previousDoc?.slug && previousDoc.slug !== doc?.slug) paths.push(`/shop/${previousDoc.slug}`);
  safeRevalidate(paths);
  return doc;
};

export const revalidateArticles: CollectionAfterChangeHook & CollectionAfterDeleteHook = ({
  doc,
  previousDoc,
}: {
  doc?: Record<string, unknown>;
  previousDoc?: Record<string, unknown>;
}) => {
  const paths = ["/", "/stories"];
  if (doc?.slug) paths.push(`/stories/${doc.slug}`);
  if (previousDoc?.slug && previousDoc.slug !== doc?.slug) paths.push(`/stories/${previousDoc.slug}`);
  safeRevalidate(paths);
  return doc;
};

/** เนื้อหาหน้าท่องเที่ยว — กระทบหน้าแรกด้วยเพราะมีการ์ดฐานเรียนรู้อยู่ */
export const revalidateTourism: CollectionAfterChangeHook & CollectionAfterDeleteHook = ({
  doc,
}: {
  doc?: Record<string, unknown>;
}) => {
  safeRevalidate(["/", "/tourism"]);
  return doc;
};

export const revalidateEverything: CollectionAfterChangeHook & CollectionAfterDeleteHook = ({
  doc,
}: {
  doc?: Record<string, unknown>;
}) => {
  safeRevalidate(["/"], true);
  return doc;
};

/** Global อย่างเมนูและข้อมูลติดต่อกระทบทุกหน้า จึงต้องล้างทั้ง layout */
export const revalidateGlobal: GlobalAfterChangeHook = ({ doc }) => {
  safeRevalidate(["/"], true);
  return doc;
};

/** Global ประจำหน้าเดียว ระบุ path ที่ต้องล้างได้ตรง ๆ */
export function revalidatePage(path: string): GlobalAfterChangeHook {
  return ({ doc }) => {
    safeRevalidate([path]);
    return doc;
  };
}

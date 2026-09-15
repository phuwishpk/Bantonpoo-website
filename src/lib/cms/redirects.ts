import { cache } from "react";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { getCms } from "./client";

/**
 * ค้นทางเปลี่ยนเส้นทางของลิงก์ที่หาหน้าไม่เจอ
 *
 * เรียกเฉพาะตอนที่หน้าไม่มีอยู่จริงแล้วเท่านั้น หน้าปกติจึงไม่มีภาระเพิ่มสักนิด
 * ต่างจากการทำใน proxy.ts ที่ต้องทำงานกับ "ทุก" คำขอที่เข้ามา
 */

export type Redirect = { to: string; permanent: boolean };

/** ตัด / ท้ายและ query string ออก ให้เทียบกับค่าที่เก็บไว้ได้ตรง ๆ */
function normalise(path: string): string {
  const clean = path.split("?")[0].split("#")[0].trim();
  return clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
}

export const findRedirect = cache(async (path: string): Promise<Redirect | null> => {
  const target = normalise(path);
  if (!target.startsWith("/")) return null;

  try {
    const cms = await getCms();
    const { docs } = await cms.find({
      collection: "redirects",
      where: { and: [{ from: { equals: target } }, { enabled: { not_equals: false } }] },
      limit: 1,
      depth: 0,
    });

    const doc = docs[0] as { to?: string; permanent?: boolean } | undefined;
    if (!doc?.to) return null;
    // ชี้กลับหาตัวเองจะวนไม่รู้จบ — กันไว้อีกชั้นเผื่อข้อมูลเก่าที่บันทึกก่อนมีการตรวจ
    if (normalise(doc.to) === target) return null;
    return { to: doc.to, permanent: doc.permanent !== false };
  } catch {
    // หาทางเปลี่ยนเส้นทางไม่ได้ไม่ควรทำให้หน้า 404 พังไปด้วย
    return null;
  }
});

/**
 * พาไปหน้าใหม่ถ้ามีทางเปลี่ยนเส้นทางไว้ ไม่งั้นคืนหน้า 404 ตามปกติ
 *
 * ทั้ง redirect และ notFound ทำงานด้วยการโยน error จึงต้องเรียกนอก try/catch
 * และไม่มีทางคืนค่ากลับมา (ชนิดจึงเป็น never)
 */
export async function redirectOrNotFound(path: string): Promise<never> {
  const match = await findRedirect(path);
  if (match) {
    if (match.permanent) permanentRedirect(match.to);
    redirect(match.to);
  }
  notFound();
}

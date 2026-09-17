import { getCms } from "@/lib/cms/client";

/**
 * ด่านตรวจร่วมของ API ที่แก้เนื้อหาจากหน้าเว็บ (/api/inline-edit และ /api/inline-media)
 *
 * รวมไว้ที่เดียวเพื่อให้ทุกทางเข้าตรวจเหมือนกันเป๊ะ — ถ้าต่างคนต่างเขียน
 * วันหนึ่งจะมีทางหนึ่งลืมตรวจโดเมนหรือบทบาท
 */

export type Cms = Awaited<ReturnType<typeof getCms>>;
export type CmsUser = Parameters<Cms["updateGlobal"]>[0]["user"];

export function deny(message: string, status: number) {
  return Response.json({ ok: false, message }, { status });
}

/** กันการถูกเว็บอื่นยิงคำขอแทนผู้ใช้ที่ล็อกอินค้างไว้ */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // คำขอที่ไม่ได้ข้ามโดเมนจะไม่ส่ง Origin มา
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

/**
 * ตรวจว่าคำขอมาจากผู้ดูแลที่มีสิทธิ์แก้เนื้อหา
 *
 * ตรวจสิทธิ์จากคุกกี้ล็อกอินของ Payload เสมอ ไม่ใช้กุญแจลับในลิงก์
 * คืน Response เมื่อไม่ผ่าน ผู้เรียกส่งต่อได้ทันที
 */
export async function requireEditor(
  request: Request
): Promise<{ cms: Cms; user: CmsUser } | Response> {
  if (!sameOrigin(request)) return deny("คำขอมาจากโดเมนอื่น", 403);

  const cms = await getCms();
  const { user } = await cms.auth({ headers: request.headers });
  if (!user) return deny("ต้องเข้าสู่ระบบหลังบ้านก่อนจึงจะแก้ไขได้", 401);

  const role = (user as { role?: string }).role;
  if (role !== "admin" && role !== "editor") {
    return deny("บัญชีนี้ดูได้อย่างเดียว ยังแก้ไขเนื้อหาไม่ได้", 403);
  }
  return { cms, user: user as CmsUser };
}

export function messageOf(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "บันทึกไม่สำเร็จ";
}

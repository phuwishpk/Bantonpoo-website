import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getCms } from "@/lib/cms/client";

/**
 * เปิดโหมดดูตัวอย่าง
 *
 * ตรวจว่าเป็นผู้ใช้ที่ล็อกอินหลังบ้านอยู่จริงก่อนเสมอ ไม่ใช้กุญแจลับในลิงก์
 * เพราะลิงก์หลุดได้ง่ายกว่าคุกกี้ของระบบล็อกอิน
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.searchParams.get("path") || "/";

  // อนุญาตเฉพาะเส้นทางภายในเว็บ กันการถูกใช้เป็นตัวเปลี่ยนเส้นทางไปเว็บอื่น
  if (!path.startsWith("/") || path.startsWith("//")) {
    return new Response("เส้นทางไม่ถูกต้อง", { status: 400 });
  }

  const cms = await getCms();
  const { user } = await cms.auth({ headers: request.headers });
  if (!user) {
    return new Response("ต้องเข้าสู่ระบบหลังบ้านก่อนจึงจะดูตัวอย่างได้", { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();
  redirect(path);
}

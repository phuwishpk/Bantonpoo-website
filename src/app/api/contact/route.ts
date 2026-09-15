import { NextResponse } from "next/server";

/**
 * รับข้อความจากฟอร์มติดต่อ
 *
 * สถานะปัจจุบัน (prototype): ตรวจความถูกต้องของข้อมูลแล้วบันทึกลง log ของเซิร์ฟเวอร์
 *
 * สิ่งที่ต้องต่อในเฟส CMS
 *   1. บันทึกลง Payload collection "Enquiries" เพื่อให้แอดมินย้อนดูได้
 *   2. ส่งอีเมลแจ้งเตือนผู้ประสานงานชุมชน (เช่นผ่าน Resend)
 *   3. ใส่ระบบกันสแปม (rate limit ตาม IP หรือ Cloudflare Turnstile)
 */
export const runtime = "nodejs";

type ContactPayload = {
  name?: unknown;
  phone?: unknown;
  topic?: unknown;
  message?: unknown;
};

const TOPICS = ["สั่งซื้อสินค้า", "งานสั่งทำพิเศษ", "จองกิจกรรม/เข้าชมชุมชน", "ขายส่ง/ตัวแทนจำหน่าย", "อื่น ๆ"];

/** เบอร์โทรไทย: 9–10 หลัก อนุญาตให้มีขีดหรือช่องว่างคั่น */
const PHONE_PATTERN = /^[0-9\s-]{9,15}$/;

export async function POST(request: Request) {
  let body: ContactPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "รูปแบบข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "กรุณากรอกชื่อ";
  if (!PHONE_PATTERN.test(phone)) errors.phone = "กรุณากรอกเบอร์ติดต่อให้ถูกต้อง";
  if (!TOPICS.includes(topic)) errors.topic = "กรุณาเลือกหัวข้อที่สนใจ";
  if (message.length < 5) errors.message = "กรุณาพิมพ์ข้อความอย่างน้อย 5 ตัวอักษร";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  console.info("[contact] ข้อความใหม่จากฟอร์มติดต่อ", {
    name,
    phone,
    topic,
    message,
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}

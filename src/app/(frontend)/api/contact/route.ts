import { NextResponse } from "next/server";
import { getCms } from "@/lib/cms/client";
import { getPageGlobal } from "@/lib/cms/queries";
import { textList } from "@/lib/cms/page-content";
import { t } from "@/lib/i18n";

/**
 * รับข้อความจากฟอร์มติดต่อ แล้วบันทึกลง collection "enquiries"
 *
 * ผู้ดูแลจะเห็นข้อความใหม่ในหน้าแอดมินที่กลุ่ม "กล่องข้อความ" ทันที
 *
 * ยังไม่ได้ทำ: ส่งอีเมลแจ้งเตือน (ต้องตั้ง SMTP ก่อน)
 * และระบบกันสแปมแบบ CAPTCHA — ตอนนี้กันด้วยการจำกัดความถี่ตาม IP เท่านั้น
 */
export const runtime = "nodejs";

/** เบอร์โทรไทย: 9–10 หลัก อนุญาตให้มีขีดหรือช่องว่างคั่น */
const PHONE_PATTERN = /^[0-9\s-]{9,15}$/;

/** จำกัดความถี่แบบง่ายในหน่วยความจำ — กันสแปมพื้นฐาน รีเซ็ตเมื่อรีสตาร์ตเซิร์ฟเวอร์ */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;
const recentSubmissions = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const history = (recentSubmissions.get(ip) ?? []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  history.push(now);
  recentSubmissions.set(ip, history);
  return history.length > RATE_LIMIT_MAX;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "ส่งข้อความถี่เกินไป กรุณารอสักครู่แล้วลองใหม่" },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "รูปแบบข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const text = (key: string) => (typeof body[key] === "string" ? (body[key] as string).trim() : "");
  const name = text("name");
  const phone = text("phone");
  const topic = text("topic");
  const message = text("message");

  // หัวข้อที่รับได้มาจาก CMS จึงตรงกับตัวเลือกที่ผู้ใช้เห็นในฟอร์มเสมอ
  const contactPage = await getPageGlobal("contact-page");
  const allowedTopics = t(textList(contactPage, "formTopics"));

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "กรุณากรอกชื่อ";
  if (!PHONE_PATTERN.test(phone)) errors.phone = "กรุณากรอกเบอร์ติดต่อให้ถูกต้อง";
  if (!allowedTopics.includes(topic)) errors.topic = "กรุณาเลือกหัวข้อที่สนใจ";
  if (message.length < 5) errors.message = "กรุณาพิมพ์ข้อความอย่างน้อย 5 ตัวอักษร";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  try {
    const cms = await getCms();
    await cms.create({
      collection: "enquiries",
      data: { name, phone, topic, message, status: "new" },
    });
  } catch (error) {
    console.error("[contact] บันทึกข้อความไม่สำเร็จ", error);
    return NextResponse.json(
      { ok: false, error: "ระบบขัดข้อง กรุณาลองใหม่หรือติดต่อทาง LINE" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

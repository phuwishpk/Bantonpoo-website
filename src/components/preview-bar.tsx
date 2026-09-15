"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * แถบบอกสถานะ "กำลังดูตัวอย่าง" พร้อมรีเฟรชอัตโนมัติ
 *
 * หน้าแอดมินของ Payload ส่งข้อความผ่าน postMessage ทุกครั้งที่ผู้ดูแลพิมพ์
 * เราไม่ได้ใช้ข้อมูลที่ส่งมาตรง ๆ แต่ใช้เป็นสัญญาณให้ดึงข้อมูลใหม่จากเซิร์ฟเวอร์
 * ซึ่งอ่านฉบับร่างล่าสุดที่ Payload บันทึกไว้ให้อัตโนมัติ
 *
 * วิธีนี้แลกความเร็วนิดหน่อยกับความถูกต้อง — สิ่งที่เห็นคือหน้าเว็บจริงที่เรนเดอร์
 * ด้วยข้อมูลจริง ไม่ใช่การจำลองในฝั่งเบราว์เซอร์ที่อาจไม่ตรงกับของจริง
 */
export function PreviewBar({ path }: { path: string }) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      // รับเฉพาะข้อความจากหน้าแอดมินที่อยู่โดเมนเดียวกัน
      if (event.origin !== window.location.origin) return;
      if (typeof event.data !== "object" || event.data?.type !== "payload-live-preview") return;

      // รวบหลายการพิมพ์ให้เหลือการรีเฟรชครั้งเดียว
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => router.refresh(), 700);
    }

    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [router]);

  return (
    <div // ไม่ทำเป็น sticky เพราะ header ก็ยึดบนสุดเหมือนกัน แล้วจะทับกัน
      // ปุ่มออกจากโหมดยังอยู่ในแถบเครื่องมือลอยมุมล่างขวาเสมอ
      className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-ochre-400 px-4 py-2 text-center text-xs font-semibold text-ink-900">
      <span>กำลังดูตัวอย่างฉบับร่าง — ยังไม่ได้เผยแพร่ ผู้เข้าชมทั่วไปยังไม่เห็นการเปลี่ยนแปลงนี้</span>
      <a
        href={`/api/exit-preview?path=${encodeURIComponent(path)}`}
        className="underline underline-offset-2 hover:no-underline"
      >
        ออกจากโหมดดูตัวอย่าง
      </a>
    </div>
  );
}

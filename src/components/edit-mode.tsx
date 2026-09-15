"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * โหมดแก้ไขบนหน้าเว็บ
 *
 * เปิดจากปุ่ม "เปิดเว็บไซต์ (โหมดแก้ไข)" ในหลังบ้าน ผู้ดูแลจะเห็นเว็บจริง
 * พร้อมปุ่มแก้ไขลอยอยู่ตรงจุดที่แก้ได้ กดแล้วเด้งไปหน้าแก้ไขของจุดนั้นทันที
 *
 * เจตนา: ให้คนที่ไม่คุ้นกับโครงสร้างหลังบ้านหาจุดที่ต้องแก้เจอจากสิ่งที่เห็นบนหน้าเว็บ
 * แทนที่จะต้องเดาว่าข้อความนี้อยู่ใน global ตัวไหน
 */
/**
 * ปุ่มแก้ไขเล็ก ๆ ที่ลอยอยู่มุมของบล็อกเนื้อหา
 *
 * ผู้เรียกต้องเป็นคนตัดสินใจว่าจะเรนเดอร์หรือไม่ (ส่ง href มาเมื่ออยู่ในโหมดแก้ไขเท่านั้น)
 * ถ้าปล่อยให้คอมโพเนนต์ตัดสินใจเอง ลิงก์หลังบ้านจะติดไปกับข้อมูลที่ส่งให้ผู้เข้าชมทุกคน
 * แม้ปุ่มจะไม่แสดงก็ตาม
 */
export function EditButton({
  href,
  label,
  className = "",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={`แก้ไข${label}`}
      className={`absolute right-3 top-3 z-30 inline-flex items-center gap-1.5 rounded-full border border-ochre-400 bg-ochre-50/95 px-3 py-1.5 text-xs font-semibold text-ink-900 shadow-lift backdrop-blur transition hover:bg-ochre-200 ${className}`}
    >
      <PencilIcon />
      {label}
    </a>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M4 20h4L19 9a2.8 2.8 0 10-4-4L4 16z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type EditLink = { label: string; href: string };

/**
 * แถบเครื่องมือลอยมุมล่างขวา
 *
 * รวมทางลัดไปยังทุกจุดที่แก้ได้ของหน้าที่เปิดอยู่ พร้อมปุ่มออกจากโหมด
 * และรีเฟรชอัตโนมัติเมื่อมีการบันทึกในหน้าแอดมินที่เปิดค้างไว้
 */
export function EditToolbar({ pageLabel, links }: { pageLabel: string; links: EditLink[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // เมื่อผู้ดูแลบันทึกในแท็บหลังบ้าน ให้หน้านี้ดึงข้อมูลใหม่เอง
  useEffect(() => {
    function onFocus() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => router.refresh(), 400);
    }
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [router]);

  return (
    <div className="fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-2 print:hidden">
      {open ? (
        <div className="w-64 overflow-hidden rounded-xl border border-ink-700 bg-ink-800 shadow-lift-lg">
          <p className="border-b border-white/10 px-4 py-3 text-xs font-semibold text-ochre-200">
            แก้ไข{pageLabel}
          </p>
          <ul className="flex flex-col py-1">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-rice-100 transition-colors hover:bg-white/10"
                >
                  <PencilIcon />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={`/api/exit-preview?path=${encodeURIComponent(pathname)}`}
            className="block border-t border-white/10 px-4 py-2.5 text-center text-xs text-ink-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            ออกจากโหมดแก้ไข
          </a>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full bg-ochre-400 px-4 py-3 text-sm font-semibold text-ink-900 shadow-lift-lg transition hover:bg-ochre-200"
      >
        <PencilIcon />
        {open ? "ปิดเมนูแก้ไข" : "แก้ไขหน้านี้"}
      </button>
    </div>
  );
}

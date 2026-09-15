"use client";

import { useEffect, useRef, useState } from "react";
import { facebookShareUrl, lineShareUrl } from "@/lib/line";
import { absoluteUrl } from "@/lib/seo";
import { CheckIcon, CopyIcon, FacebookIcon, LineIcon } from "./icons";
import { useLabels } from "./site-context";

const BUTTON =
  "inline-flex items-center gap-2 rounded-lg border border-rice-300 bg-rice-50 px-3.5 py-2 text-sm font-medium text-ink-700 transition duration-200 ease-craft hover:border-ink-800 hover:bg-white";

/**
 * ปุ่มแชร์บทความไปยัง Facebook, LINE และคัดลอกลิงก์
 *
 * ใช้ URL แบบ canonical (ประกอบจาก NEXT_PUBLIC_SITE_URL) ไม่ใช่ URL ของหน้าที่เปิดอยู่
 * เพราะสิ่งที่ควรถูกแชร์ออกไปคือลิงก์ของโดเมนจริงเสมอ ไม่ใช่ลิงก์ preview
 * หรือ localhost — จึงต้องตั้ง NEXT_PUBLIC_SITE_URL ให้ถูกก่อน deploy
 */
export function ShareButtons({ path, title }: { path: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const labels = useLabels();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const url = absoluteUrl(path);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      // เบราว์เซอร์ไม่อนุญาตให้เข้าถึงคลิปบอร์ด — ผู้ใช้ยังคัดลอกจากแถบที่อยู่ได้
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm text-river-500">{labels.article.share}</span>

      <a
        href={facebookShareUrl(url)}
        target="_blank"
        rel="noopener noreferrer"
        className={BUTTON}
        aria-label={`แชร์ "${title}" ไปยัง Facebook`}
      >
        <FacebookIcon className="h-[18px] w-[18px] text-[#1877F2]" />
        Facebook
      </a>

      <a
        href={lineShareUrl(url)}
        target="_blank"
        rel="noopener noreferrer"
        className={BUTTON}
        aria-label={`แชร์ "${title}" ไปยัง LINE`}
      >
        <LineIcon className="h-[18px] w-[18px] text-[#06C755]" />
        LINE
      </a>

      <button type="button" onClick={copyLink} className={BUTTON}>
        {copied ? (
          <CheckIcon className="h-[18px] w-[18px] text-leaf-600" />
        ) : (
          <CopyIcon className="h-[18px] w-[18px]" />
        )}
        <span aria-live="polite">{copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์"}</span>
      </button>
    </div>
  );
}

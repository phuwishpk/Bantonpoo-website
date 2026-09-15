"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Product, SiteSettings, Workshop } from "@/content/types";
import { buildProductOrderMessage, buildWorkshopBookingMessage } from "@/lib/line";
import { siteUrl } from "@/lib/site-url";
import { useSite } from "./site-context";

/**
 * ตรรกะกลางของปุ่ม "สั่งซื้อ/จองผ่าน LINE"
 *
 * เมื่อกด: เปิดห้องแชท LINE Official Account ของชุมชน แล้วคัดลอกข้อความ
 * รายละเอียด (ชื่อ รหัส ราคา ลิงก์) ไปยังคลิปบอร์ด ผู้ใช้เพียงกดวางในแชท
 */
export function useCopyAndOpenLine(buildMessage: (url: string, site: SiteSettings) => string) {
  const site = useSite();
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleClick = useCallback(async () => {
    const url = typeof window === "undefined" ? siteUrl : window.location.href;
    const message = buildMessage(url, site);

    // เปิดแชทก่อน เพื่อไม่ให้เบราว์เซอร์บล็อกป๊อปอัปหลังจบ await
    window.open(site.lineUrl, "_blank", "noopener,noreferrer");

    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 4000);
    } catch {
      // บางเบราว์เซอร์ไม่อนุญาต clipboard (เช่น เปิดผ่าน http) — แชทยังเปิดได้ตามปกติ
    }
  }, [buildMessage, site]);

  return { copied, handleClick };
}

export function useProductOrder(product: Product) {
  return useCopyAndOpenLine(
    useCallback((url: string, site: SiteSettings) => buildProductOrderMessage(product, url, site), [product])
  );
}

export function useWorkshopBooking(workshop: Workshop) {
  return useCopyAndOpenLine(
    useCallback(
      (url: string, site: SiteSettings) => buildWorkshopBookingMessage(workshop, url, site),
      [workshop]
    )
  );
}

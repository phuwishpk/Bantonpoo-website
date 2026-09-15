"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import type { Product, Workshop } from "@/content/types";
import { buildProductOrderMessage, buildWorkshopBookingMessage, lineChatUrl } from "@/lib/line";

/**
 * ตรรกะกลางของปุ่ม "สั่งซื้อ/จองผ่าน LINE"
 *
 * เมื่อกด: เปิดห้องแชท LINE Official Account ของชุมชน แล้วคัดลอกข้อความ
 * รายละเอียด (ชื่อ รหัส ราคา ลิงก์) ไปยังคลิปบอร์ด ผู้ใช้เพียงกดวางในแชท
 *
 * เหตุผลที่ไม่ส่งข้อความอัตโนมัติ: LINE ไม่เปิดให้เว็บส่งข้อความเข้าห้องแชท
 * ของ OA โดยตรง ต้องทำผ่าน Messaging API (บอท) ซึ่งอยู่นอกขอบเขต prototype
 * ถ้าภายหลังชุมชนทำบอทแล้ว แก้เฉพาะไฟล์นี้กับ src/lib/line.ts
 */
export function useCopyAndOpenLine(buildMessage: (url: string) => string) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleClick = useCallback(async () => {
    const url = typeof window === "undefined" ? site.siteUrl : window.location.href;
    const message = buildMessage(url);

    // เปิดแชทก่อน เพื่อไม่ให้เบราว์เซอร์บล็อกป๊อปอัปหลังจบ await
    window.open(lineChatUrl, "_blank", "noopener,noreferrer");

    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 4000);
    } catch {
      // บางเบราว์เซอร์ไม่อนุญาต clipboard (เช่น เปิดผ่าน http) — แชทยังเปิดได้ตามปกติ
    }
  }, [buildMessage]);

  return { copied, handleClick };
}

export function useProductOrder(product: Product) {
  return useCopyAndOpenLine(useCallback((url: string) => buildProductOrderMessage(product, url), [product]));
}

export function useWorkshopBooking(workshop: Workshop) {
  return useCopyAndOpenLine(
    useCallback((url: string) => buildWorkshopBookingMessage(workshop, url), [workshop])
  );
}

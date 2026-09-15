"use client";

import { createContext, useContext } from "react";
import type { SiteSettings } from "@/content/types";
import type { Labels } from "@/lib/labels";

/**
 * ข้อมูลชุมชนและป้ายกำกับสำหรับคอมโพเนนต์ฝั่งไคลเอนต์
 *
 * Server Component เรียก getSite() / getLabels() ได้ตรง ๆ แต่ Client Component ทำไม่ได้
 * จึงส่งค่าลงมาครั้งเดียวที่ layout แล้วให้ทุกตัวอ่านผ่าน context นี้
 */
type SiteContextValue = { site: SiteSettings; labels: Labels };

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({
  site,
  labels,
  children,
}: {
  site: SiteSettings;
  labels: Labels;
  children: React.ReactNode;
}) {
  return <SiteContext.Provider value={{ site, labels }}>{children}</SiteContext.Provider>;
}

function useSiteContext(): SiteContextValue {
  const value = useContext(SiteContext);
  if (!value) throw new Error("ต้องอยู่ภายใต้ <SiteProvider>");
  return value;
}

export function useSite(): SiteSettings {
  return useSiteContext().site;
}

/** ป้ายกำกับที่แก้ได้จากหลังบ้าน — ตกกลับเป็นคำตั้งต้นถ้าเรียกนอก provider ไม่ได้ */
export function useLabels(): Labels {
  return useSiteContext().labels;
}

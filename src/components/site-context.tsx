"use client";

import { createContext, useContext } from "react";
import type { SiteSettings } from "@/content/types";

/**
 * ข้อมูลชุมชนสำหรับคอมโพเนนต์ฝั่งไคลเอนต์
 *
 * Server Component เรียก getSite() ได้ตรง ๆ แต่ Client Component ทำไม่ได้
 * จึงส่งค่าลงมาครั้งเดียวที่ layout แล้วให้ทุกตัวอ่านผ่าน context นี้
 */
const SiteContext = createContext<SiteSettings | null>(null);

export function SiteProvider({
  site,
  children,
}: {
  site: SiteSettings;
  children: React.ReactNode;
}) {
  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteSettings {
  const site = useContext(SiteContext);
  if (!site) throw new Error("useSite ต้องอยู่ภายใต้ <SiteProvider>");
  return site;
}

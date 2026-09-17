"use client";

import { useNav, usePreferences } from "@payloadcms/ui";
import { PREFERENCE_KEYS } from "payload/shared";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * ให้เมนูด้านข้างของหลังบ้านเปิดค้างไว้บนจอโน้ตบุ๊ก
 *
 * Payload ปิดเมนูทุกครั้งที่โหลดหน้าเมื่อจอกว้างไม่เกิน 1440px — ซึ่งคือโน้ตบุ๊กเกือบทุกเครื่อง
 * ผู้ดูแลเปิดหลังบ้านมาเจอแต่แดชบอร์ด ไม่เห็นเมนู ทั้งที่ช่วง 1025–1440px เมนูวางข้างเนื้อหา
 * ได้สบาย (ไม่ได้ลอยทับเหมือนบนมือถือ)
 *
 * คอมโพเนนต์นี้เปิดเมนูกลับให้ในช่วงจอนั้น เว้นแต่ผู้ใช้กดปิดเอง — Payload จำการกดปิด/เปิด
 * เฉพาะจอกว้าง จึงบันทึกเองลงค่าเดียวกัน (payload-preferences คีย์ nav) ผลคือจำตามผู้ใช้
 * ทุกเครื่องเหมือนพฤติกรรมเดิมบนจอกว้าง
 *
 * ไม่แสดงอะไร วางไว้ในเมนูด้านข้างเพื่อให้อยู่ใต้ตัวจัดการเมนูของ Payload
 */

/** ช่วงจอที่ Payload ปิดเมนูเอง แต่ยังวางเมนูข้างเนื้อหาได้ (ตรงกับจุดตัด l และ m ของ Payload) */
const LAPTOP = "(min-width: 1025px) and (max-width: 1440px)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(LAPTOP);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const isLaptop = () => window.matchMedia(LAPTOP).matches;

export function NavKeeper() {
  const { hydrated, navOpen, setNavOpen } = useNav();
  const { getPreference, setPreference } = usePreferences();
  const laptop = useSyncExternalStore(subscribe, isLaptop, () => false);
  // null = ยังโหลดค่าที่ผู้ใช้เคยเลือกไม่เสร็จ
  const [preferred, setPreferred] = useState<boolean | null>(null);
  const navOpenRef = useRef(navOpen);

  useEffect(() => {
    navOpenRef.current = navOpen;
  }, [navOpen]);

  useEffect(() => {
    let active = true;
    void getPreference<{ open?: boolean }>(PREFERENCE_KEYS.NAV).then((value) => {
      if (active) setPreferred(value?.open !== false);
    });
    return () => {
      active = false;
    };
  }, [getPreference]);

  // จำการกดปุ่มเปิด/ปิดเมนูบนจอโน้ตบุ๊ก (ดักก่อนปุ่มของ Payload จะสลับสถานะ)
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!isLaptop()) return;
      if (!(event.target instanceof Element) || !event.target.closest(".nav-toggler")) return;
      const open = !navOpenRef.current;
      setPreferred(open);
      void setPreference(PREFERENCE_KEYS.NAV, { open }, true);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [setPreference]);

  // Payload ปิดเมนูเองตอนโหลดและตอนเปลี่ยนขนาดจอ — เปิดกลับถ้าผู้ใช้ไม่ได้เลือกปิดไว้
  useEffect(() => {
    if (hydrated && laptop && preferred && !navOpen) setNavOpen(true);
  }, [hydrated, laptop, preferred, navOpen, setNavOpen]);

  return null;
}

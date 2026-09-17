"use client";

import { useTheme } from "@payloadcms/ui";
import React from "react";

/**
 * ปุ่มสลับโหมดสว่าง/มืดของหลังบ้าน วางไว้บนแถบด้านบนทุกหน้า
 *
 * Payload มีตัวเลือกนี้อยู่แล้วในหน้า "บัญชี" แต่ซ่อนลึกจนผู้ดูแลไม่เจอ
 * ค่าที่เลือกเก็บในคุกกี้ payload-theme ของเบราว์เซอร์นั้น (ไม่กระทบคนอื่น)
 * และเซิร์ฟเวอร์อ่านคุกกี้ตอนเปิดหน้า จึงไม่กะพริบเป็นอีกโหมดก่อน
 *
 * "ตามเครื่อง" ลบคุกกี้ทิ้ง ให้กลับไปใช้โหมดของระบบปฏิบัติการ
 */

type Choice = "auto" | "light" | "dark";

const CHOICES: { value: Choice; label: string; icon: React.ReactNode }[] = [
  {
    value: "auto",
    label: "ตามเครื่อง",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </>
    ),
  },
  {
    value: "light",
    label: "สว่าง",
    icon: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
  },
  {
    value: "dark",
    label: "มืด",
    icon: <path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" />,
  },
];

export function ThemeToggle() {
  const { autoMode, setTheme, theme } = useTheme();
  const active: Choice = autoMode ? "auto" : theme;

  return (
    <div
      className="theme-toggle"
      role="radiogroup"
      aria-label="โหมดสีของหลังบ้าน"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        padding: "2px",
        borderRadius: "999px",
        border: "1px solid var(--theme-elevation-150)",
        background: "var(--theme-elevation-50)",
      }}
    >
      {CHOICES.map((choice) => {
        const selected = choice.value === active;
        return (
          <button
            key={choice.value}
            type="button"
            role="radio"
            aria-checked={selected}
            title={`โหมด${choice.label}`}
            aria-label={`โหมด${choice.label}`}
            // Payload ประกาศชนิดไว้แค่ light/dark แต่ตัวจริงรับ "auto" ด้วย (ลบคุกกี้แล้วใช้ค่าของเครื่อง)
            onClick={() => setTheme(choice.value as "light" | "dark")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.3rem 0.65rem",
              border: 0,
              borderRadius: "999px",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: selected ? 600 : 400,
              background: selected ? "var(--theme-elevation-150)" : "transparent",
              color: selected ? "var(--theme-elevation-1000)" : "var(--theme-elevation-600)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width={14}
              height={14}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {choice.icon}
            </svg>
            <span className="theme-toggle__label">{choice.label}</span>
          </button>
        );
      })}
      {/* จอแคบเหลือแต่ไอคอน ชื่อโหมดยังอยู่ใน title และ aria */}
      <style>{`@media (max-width: 768px) { .theme-toggle__label { display: none; } }`}</style>
    </div>
  );
}

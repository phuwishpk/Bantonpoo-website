"use client";

import React from "react";

/**
 * ปุ่มในเมนูหลังบ้าน สำหรับเปิดเว็บไซต์ในโหมดแก้ไข
 *
 * เปิดผ่าน /api/preview ซึ่งเปิดโหมดฉบับร่างให้ ผู้ดูแลจึงเห็นสิ่งที่ยังไม่ได้เผยแพร่
 * และเห็นปุ่มแก้ไขลอยอยู่ตรงจุดที่แก้ได้บนหน้าเว็บ
 */
export function OpenSiteButton() {
  return (
    <a
      href="/api/preview?path=/"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        margin: "0 0 1.25rem",
        padding: "0.7rem 0.9rem",
        borderRadius: "0.5rem",
        background: "var(--theme-elevation-100)",
        border: "1px solid var(--theme-elevation-150)",
        color: "var(--theme-elevation-800)",
        fontWeight: 600,
        fontSize: "0.85rem",
        textDecoration: "none",
      }}
    >
      <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
        <path d="M4 20h4L19 9a2.8 2.8 0 10-4-4L4 16z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      เปิดเว็บไซต์ (โหมดแก้ไข)
    </a>
  );
}

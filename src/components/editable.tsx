import type { ElementType } from "react";
import { isDraftMode } from "@/lib/cms/draft";
import { InlineEditable } from "./inline-editable";
import { EmptyImageSlot, InlineImageEdit } from "./inline-image";

/**
 * ข้อความที่แก้ได้จากหน้าเว็บ
 *
 * ตัวตัดสินว่าจะเปิดให้แก้หรือไม่อยู่ฝั่งเซิร์ฟเวอร์โดยตั้งใจ — ถ้าปล่อยให้คอมโพเนนต์
 * ฝั่งไคลเอนต์ตัดสินเอง ที่อยู่ของฟิลด์จะติดไปกับข้อมูลที่ส่งให้ผู้เข้าชมทุกคน
 * แม้ช่องแก้ไขจะไม่แสดงก็ตาม (เป็นบทเรียนเดียวกับปุ่มแก้ไขใน edit-mode.tsx)
 *
 * วิธีใช้
 *   <Ed at={at("hero.subtitle")}>{t(content.subtitle)}</Ed>
 *     → แทรกอยู่ในแท็กเดิม ผู้เข้าชมทั่วไปได้ข้อความล้วนเหมือนเดิมเป๊ะ
 *
 *   <Ed as="p" className="text-md" at={at("cta.body")} multiline>{t(cta.body)}</Ed>
 *     → เป็นแท็กนั้นเองทั้งสองโหมด ใช้เมื่ออยากให้ทั้งกล่องเป็นพื้นที่คลิกแก้
 */
export async function Ed({
  at,
  as,
  multiline = false,
  className = "",
  tone = "dark",
  placeholder,
  children,
}: {
  at: string;
  as?: ElementType;
  multiline?: boolean;
  className?: string;
  /** พื้นหลังเข้มต้องใช้เส้นขอบสีอ่อน ไม่งั้นมองไม่เห็นว่าช่องไหนแก้ได้ */
  tone?: "light" | "dark";
  placeholder?: string;
  children?: string;
}) {
  const text = children ?? "";

  if (!(await isDraftMode())) {
    if (!as) return text || null;
    const Tag = as;
    return text ? <Tag className={className || undefined}>{text}</Tag> : null;
  }

  return (
    <InlineEditable
      at={at}
      as={as ?? "span"}
      multiline={multiline}
      className={className}
      tone={tone}
      placeholder={placeholder}
    >
      {text}
    </InlineEditable>
  );
}

/**
 * ปุ่มเปลี่ยนรูปที่วางทับรูปบนหน้าเว็บ (เฉพาะโหมดแก้ไข)
 *
 * วางไว้ในกล่อง relative เดียวกับรูป ผู้เข้าชมทั่วไปไม่ได้อะไรเลย — ไม่มีแม้แต่ที่อยู่ของฟิลด์
 *
 *   <div className="relative ...">
 *     <Image ... />
 *     <EdImage at={at("hero.image")} label="ภาพหลัก" current={image.id} />
 *   </div>
 *
 * ถ้ารูปยังไม่มี (ช่องไม่บังคับ) ใช้ empty เพื่อแสดงกล่อง "เพิ่มรูป" ตรงตำแหน่งนั้นแทน
 */
export async function EdImage({
  empty = false,
  compact = false,
  className,
  ...target
}: {
  at: string;
  label: string;
  current?: string | number;
  removable?: boolean;
  hint?: string;
  compact?: boolean;
  /** ยังไม่มีรูป — แสดงกล่องให้กดเพิ่มรูป แทนปุ่มที่วางทับรูป */
  empty?: boolean;
  className?: string;
}) {
  if (!(await isDraftMode())) return null;
  if (empty) return <EmptyImageSlot {...target} className={className} />;
  return <InlineImageEdit {...target} compact={compact} className={className} />;
}

"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ElementType } from "react";

/**
 * ช่องข้อความที่แก้ได้บนหน้าเว็บจริง
 *
 * เรนเดอร์ก็ต่อเมื่ออยู่ในโหมดแก้ไขเท่านั้น (ผู้เรียกเป็นคนตัดสิน ดู <Ed> ใน editable.tsx)
 * ผู้เข้าชมทั่วไปจึงไม่เห็นแม้แต่ชื่อฟิลด์ที่ผูกอยู่
 *
 * ทำไมถึงบันทึกตอนคลิกออกจากช่อง ไม่ใช่ระหว่างพิมพ์:
 * ภาษาไทยพิมพ์ทีละอักขระแล้วประกอบเป็นคำ การยิงบันทึกระหว่างพิมพ์จะได้คำที่ยังไม่ครบ
 * เก็บลงฐานข้อมูลเต็มไปหมด และผู้ใช้กด "เลิกทำ" ไม่ทัน
 */

type Tone = "light" | "dark";

const HINT = {
  single: "คลิกเพื่อแก้ไข · Enter บันทึก · Esc ยกเลิก",
  multi: "คลิกเพื่อแก้ไข · Ctrl+Enter บันทึก · Esc ยกเลิก",
};

export function InlineEditable({
  at,
  as = "span",
  multiline = false,
  className = "",
  tone = "dark",
  placeholder = "ยังไม่มีข้อความ",
  children,
}: {
  /** ที่อยู่ของฟิลด์ เช่น g:home-page:hero.subtitle (ดู src/lib/cms/inline.ts) */
  at: string;
  as?: ElementType;
  multiline?: boolean;
  className?: string;
  tone?: Tone;
  placeholder?: string;
  children?: string;
}) {
  const Tag = as as ElementType;
  const ref = useRef<HTMLElement>(null);
  const original = useRef<string>(children ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const router = useRouter();

  const readValue = useCallback(() => {
    // innerText ให้ข้อความตามที่ตาเห็น ต่างจาก textContent ที่รวมข้อความของแท็กซ่อนด้วย
    return (ref.current?.innerText ?? "").replace(/ /g, " ").replace(/\n+$/, "").trim();
  }, []);

  const commit = useCallback(async () => {
    const value = readValue();
    if (value === original.current) {
      setState("idle");
      return;
    }

    setState("saving");
    setError("");
    try {
      const response = await fetch("/api/inline-edit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ at, value, multiline }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
        scope?: string;
        label?: string;
        drafts?: boolean;
      };

      if (!response.ok || !result.ok) {
        setState("error");
        setError(result.message ?? "บันทึกไม่สำเร็จ");
        return;
      }

      original.current = value;
      setState("saved");
      window.setTimeout(() => setState("idle"), 1800);

      // บอกแถบเครื่องมือว่ามีเอกสารไหนถูกแก้ไปแล้ว เพื่อให้ปุ่มเผยแพร่รู้ว่าต้องเผยแพร่อะไร
      window.dispatchEvent(
        new CustomEvent("bantonpoo:inline-saved", {
          detail: { scope: result.scope, label: result.label, drafts: result.drafts },
        })
      );

      // ข้อความเดียวกันอาจโผล่หลายที่ในหน้า (เช่นชื่อชุมชนบนหัวและท้ายเว็บ)
      // ดึงข้อมูลใหม่เพื่อให้ทุกจุดตรงกัน แต่ไม่รบกวนช่องที่ผู้ใช้กำลังพิมพ์อยู่
      if (!document.activeElement?.classList.contains("inline-edit")) router.refresh();
    } catch {
      setState("error");
      setError("ติดต่อเซิร์ฟเวอร์ไม่ได้ ลองอีกครั้ง");
    }
  }, [at, multiline, readValue, router]);

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      // ภาษาไทยไม่มีตัวพิมพ์ใหญ่และไม่มีคำแนะนำที่ถูกต้องบนมือถือ ปิดไปทั้งหมดจะพิมพ์ง่ายกว่า
      autoCorrect="off"
      autoCapitalize="off"
      data-state={state}
      data-placeholder={placeholder}
      title={error || (multiline ? HINT.multi : HINT.single)}
      className={`inline-edit ${tone === "light" ? "inline-edit-light" : ""} ${className}`}
      onFocus={() => {
        original.current = readValue();
        setState("idle");
        setError("");
      }}
      onBlur={commit}
      onPaste={(event: React.ClipboardEvent) => {
        // วางข้อความจาก Word หรือเว็บอื่นจะพารูปแบบ HTML ติดมาด้วย ต้องตัดเหลือข้อความล้วน
        event.preventDefault();
        const text = event.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, multiline ? text : text.replace(/\s+/g, " "));
      }}
      onKeyDown={(event: React.KeyboardEvent) => {
        if (event.key === "Escape") {
          event.preventDefault();
          if (ref.current) ref.current.innerText = original.current;
          setState("idle");
          setError("");
          (event.currentTarget as HTMLElement).blur();
          return;
        }
        if (event.key === "Enter" && (!multiline || event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          (event.currentTarget as HTMLElement).blur();
        }
      }}
    >
      {children}
    </Tag>
  );
}

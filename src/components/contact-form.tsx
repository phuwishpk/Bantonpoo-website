"use client";

import { useState } from "react";
import { site } from "@/content/site";
import { CheckIcon, LineIcon } from "./icons";
import { buttonClass } from "./ui";

const TOPICS = ["สั่งซื้อสินค้า", "สั่งทำชุดของฝาก/ของชำร่วย", "จองกิจกรรม/เข้าศึกษาดูงาน", "ขายส่ง/ตัวแทนจำหน่าย", "อื่น ๆ"];

type FieldErrors = Partial<Record<"name" | "phone" | "topic" | "message", string>>;

const FIELD_BASE =
  "w-full rounded-lg border bg-rice-50 px-4 py-3 text-sm text-ink-800 placeholder:text-river-400 focus:outline-none";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<FieldErrors>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    setStatus("sending");
    setErrors({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        setErrors(result.errors ?? {});
        setStatus("error");
        return;
      }

      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-card border border-leaf-200 bg-leaf-50 px-6 py-10 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-leaf-600 text-white">
          <CheckIcon className="h-6 w-6" />
        </span>
        <h3 className="font-serif text-lg font-semibold text-ink-800">ได้รับข้อความแล้ว</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-river-500">
          ผู้ประสานงานชุมชนจะติดต่อกลับภายในเวลาทำการ หากต้องการคำตอบเร็วกว่านี้
          ทักมาทาง LINE หรือโทรหาได้เลย
        </p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={site.lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("primary")}
          >
            <LineIcon />
            ทักไลน์ {site.lineId}
          </a>
          <button type="button" onClick={() => setStatus("idle")} className={buttonClass("secondary")}>
            ส่งข้อความอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Field label="ชื่อ-นามสกุล" name="name" error={errors.name}>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="เช่น สมหญิง ใจดี"
          className={`${FIELD_BASE} ${errors.name ? "border-leaf-500" : "border-rice-300 focus:border-ink-800"}`}
        />
      </Field>

      <Field label="เบอร์ติดต่อ" name="phone" error={errors.phone}>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="08X-XXX-XXXX"
          className={`${FIELD_BASE} ${errors.phone ? "border-leaf-500" : "border-rice-300 focus:border-ink-800"}`}
        />
      </Field>

      <Field label="หัวข้อที่สนใจ" name="topic" error={errors.topic}>
        <select
          id="topic"
          name="topic"
          required
          defaultValue=""
          className={`${FIELD_BASE} ${errors.topic ? "border-leaf-500" : "border-rice-300 focus:border-ink-800"}`}
        >
          <option value="" disabled>
            เลือกหัวข้อ
          </option>
          {TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </Field>

      <Field label="ข้อความ" name="message" error={errors.message}>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="เล่ารายละเอียดที่ต้องการสอบถาม เช่น ผลิตภัณฑ์ที่สนใจ จำนวน หรือวันที่ต้องการเข้าดูงาน"
          className={`${FIELD_BASE} resize-y ${
            errors.message ? "border-leaf-500" : "border-rice-300 focus:border-ink-800"
          }`}
        />
      </Field>

      {status === "error" && Object.keys(errors).length === 0 ? (
        <p role="alert" className="rounded-lg bg-leaf-50 px-4 py-3 text-sm text-leaf-700">
          ส่งข้อความไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือติดต่อทาง LINE {site.lineId}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={status === "sending"} className={buttonClass("primary", "sm:w-auto")}>
          {status === "sending" ? "กำลังส่ง…" : "ส่งข้อความ"}
        </button>
        <p className="text-xs leading-relaxed text-river-500">
          หรือทักมาทาง LINE {site.lineId} เพื่อคุยกับกลุ่มวิสาหกิจชุมชนโดยตรง ตอบเร็วกว่าในเวลาทำการ
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-ink-800">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-leaf-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

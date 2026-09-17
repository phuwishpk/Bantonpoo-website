"use client";

import { useState } from "react";
import { CheckIcon, LineIcon } from "./icons";
import { useSite } from "./site-context";
import { buttonClass } from "./ui";
import { INK, type Tone } from "@/lib/tone";

type FieldErrors = Partial<Record<"name" | "phone" | "topic" | "message", string>>;

/**
 * ช่องกรอกตามโทนของพื้น — ตัวเลือกใน <select> ใช้ตัวอักษรเข้มเสมอ
 * เพราะรายการที่เบราว์เซอร์กางออกมาเป็นพื้นขาว
 */
const FIELD = {
  dark: {
    base: "w-full rounded-lg border bg-rice-50 px-4 py-3 text-sm text-ink-800 placeholder:text-river-400 focus:outline-none",
    idle: "border-rice-300 focus:border-ink-800",
  },
  light: {
    base: "w-full rounded-lg border bg-white/5 px-4 py-3 text-sm text-rice-100 placeholder:text-ink-400 focus:outline-none [&_option]:text-ink-800",
    idle: "border-white/15 focus:border-white/50",
  },
} as const;

export function ContactForm({
  topics,
  success,
  tone = "dark",
}: {
  topics: string[];
  success: { title: string; body: string };
  /** โทนตัวอักษรตามพื้นของส่วนที่ฟอร์มวางอยู่ */
  tone?: Tone;
}) {
  const site = useSite();
  const field = FIELD[tone];
  const fieldClass = (hasError: boolean) => `${field.base} ${hasError ? "border-leaf-500" : field.idle}`;
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
        <h3 className="font-serif text-lg font-semibold text-ink-800">{success.title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-river-500">{success.body}</p>
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
      <Field label="ชื่อ-นามสกุล" name="name" error={errors.name} tone={tone}>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="เช่น สมหญิง ใจดี"
          className={fieldClass(Boolean(errors.name))}
        />
      </Field>

      <Field label="เบอร์ติดต่อ" name="phone" error={errors.phone} tone={tone}>
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="08X-XXX-XXXX"
          className={fieldClass(Boolean(errors.phone))}
        />
      </Field>

      <Field label="หัวข้อที่สนใจ" name="topic" error={errors.topic} tone={tone}>
        <select
          id="topic"
          name="topic"
          required
          defaultValue=""
          className={fieldClass(Boolean(errors.topic))}
        >
          <option value="" disabled>
            เลือกหัวข้อ
          </option>
          {topics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </Field>

      <Field label="ข้อความ" name="message" error={errors.message} tone={tone}>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="เล่ารายละเอียดที่ต้องการสอบถาม เช่น ผลิตภัณฑ์ที่สนใจ จำนวน หรือวันที่ต้องการเข้าดูงาน"
          className={`${fieldClass(Boolean(errors.message))} resize-y`}
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
        <p className={`text-xs leading-relaxed ${INK[tone].body}`}>
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
  tone,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  tone: Tone;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className={`text-sm font-medium ${INK[tone].title}`}>
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className={`text-xs ${INK[tone].accent}`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

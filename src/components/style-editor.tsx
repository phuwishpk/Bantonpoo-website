"use client";

import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  ACCENT_SWATCHES,
  DARK_SWATCHES,
  isDarkColor,
  isHexColor,
  LIGHT_SWATCHES,
  type Swatch,
} from "@/lib/color";
import { CloseIcon } from "./icons";

/**
 * เปลี่ยนสีบนหน้าเว็บ (เฉพาะโหมดแก้ไข)
 *
 * ปุ่ม "สี" ลอยที่มุมซ้ายบนของแต่ละส่วน กดแล้วเปิดแผงเลือกสีที่มุมซ้ายล่างของจอ
 * แผงไม่บังส่วนที่กำลังแก้ ผู้ดูแลจึงเห็นผลทันทีหลังเลือก (หน้าดึงฉบับร่างใหม่เอง)
 *
 * ทุกการเลือกบันทึกเป็นฉบับร่างผ่าน /api/inline-edit (action: "style")
 * แล้วไปรวมในปุ่ม "เผยแพร่" ของแถบเครื่องมือเหมือนการแก้ข้อความ
 */

export type StyleValues = {
  background?: string;
  backgroundColor?: string;
  textTone?: string;
  accentColor?: string;
  cardColor?: string;
};

export type StyleTarget = {
  /** ที่อยู่ของกลุ่มฟิลด์สี เช่น g:home-page:sections.2 หรือ g:theme:header */
  at: string;
  /** ชื่อที่แสดง เช่น "ส่วนสินค้าแนะนำ" */
  label: string;
  current: StyleValues;
  /** "box" กล่องทั่วไป (มีพื้นหลังสำเร็จรูป) · "page" สีของทั้งหน้า */
  kind?: "box" | "page";
  /** แสดงตัวเลือกสีการ์ด */
  cards?: boolean;
  /** พื้นหลังตั้งต้น — แบนเนอร์และแถบเมนูเป็นพื้นเข้ม */
  fallbackBackground?: "page" | "dark";
};

type SaveResult = { ok?: boolean; message?: string; scope?: string; label?: string; drafts?: boolean };

/** แจ้งให้แผงอื่นปิดตัวเอง — เปิดได้ทีละแผง */
const OPEN_EVENT = "bantonpoo:style-panel";

/**
 * @param placement "edge" วางคร่อมขอบบนของส่วน ไม่บังเนื้อหาแม้ส่วนนั้นไม่มีระยะขอบบน
 *                  "inside" วางในมุมซ้ายบน สำหรับแบนเนอร์ที่ตัดขอบ (overflow-hidden)
 */
export function StyleButton({
  className = "",
  placement = "edge",
  ...target
}: StyleTarget & { className?: string; placement?: "edge" | "inside" }) {
  const id = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOther = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== id) setOpen(false);
    };
    window.addEventListener(OPEN_EVENT, onOther);
    return () => window.removeEventListener(OPEN_EVENT, onOther);
  }, [id]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!open) window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }));
          setOpen((value) => !value);
        }}
        aria-expanded={open}
        title={`เปลี่ยนสี${target.label}`}
        className={`absolute left-3 z-30 ${placement === "edge" ? "top-0 -translate-y-1/2" : "top-3"} inline-flex items-center gap-1.5 rounded-full border border-ochre-400 bg-ochre-50/95 px-3 py-1.5 text-xs font-semibold text-ink-900 shadow-lift backdrop-blur transition hover:bg-ochre-200 print:hidden ${className}`}
      >
        <PaletteIcon />
        สี
      </button>
      {open ? <StylePanel target={target} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

export function StylePanel({ target, onClose }: { target: StyleTarget; onClose: () => void }) {
  const router = useRouter();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<StyleValues>(target.current);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const timers = useRef<Record<string, number>>({});
  // บันทึกทีละคำขอ — ถ้ายิงพร้อมกัน คำขอหลังอาจอ่านเอกสารก่อนคำขอแรกเขียนเสร็จแล้วทับค่าไป
  const queue = useRef<Promise<void>>(Promise.resolve());

  const kind = target.kind ?? "box";
  const fallback = target.fallbackBackground ?? "page";

  const onEscape = useEffectEvent(() => onClose());

  // โฟกัสแผงครั้งเดียวตอนเปิด (ถ้าผูกกับทุกการเรนเดอร์ โฟกัสจะถูกดึงออกจากตัวเลือกสี)
  useEffect(() => {
    panelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", onKeyDown);
    const pending = timers.current;
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      Object.values(pending).forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  async function send(patch: Record<string, string | null>) {
    setStatus("saving");
    setError("");
    try {
      const response = await fetch("/api/inline-edit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "style", at: target.at, values: patch }),
      });
      const result = (await response.json()) as SaveResult;
      if (!response.ok || !result.ok) throw new Error(result.message ?? "บันทึกไม่สำเร็จ");
      if (result.scope) {
        window.dispatchEvent(
          new CustomEvent("bantonpoo:inline-saved", {
            detail: { scope: result.scope, label: result.label, drafts: result.drafts },
          })
        );
      }
      setStatus("saved");
      router.refresh();
    } catch (caught) {
      setStatus("error");
      setError(caught instanceof Error ? caught.message : "บันทึกไม่สำเร็จ");
    }
  }

  /** เปลี่ยนค่าในแผงทันที แล้วบันทึก — ตัวเลือกสีของเบราว์เซอร์ยิงค่าถี่มาก จึงรอให้หยุดลากก่อน */
  function update(patch: StyleValues, debounce = false) {
    setValues((current) => ({ ...current, ...patch }));
    const key = Object.keys(patch).join(",");
    window.clearTimeout(timers.current[key]);
    // ค่าว่าง = กลับไปใช้ค่าเริ่มต้น ต้องส่งเป็น null เพราะ JSON ตัดคีย์ที่เป็น undefined ทิ้ง
    const payload = Object.fromEntries(Object.entries(patch).map(([name, value]) => [name, value ?? null]));
    const run = () => {
      queue.current = queue.current.then(() => send(payload));
    };
    if (debounce) timers.current[key] = window.setTimeout(run, 400);
    else run();
  }

  const presets =
    fallback === "dark"
      ? [
          { value: "dark", label: "พื้นเข้ม (เดิม)" },
          { value: "page", label: "สีพื้นของหน้า" },
          { value: "tint", label: "พื้นอ่อน" },
        ]
      : [
          { value: "page", label: "ตามแบบเดิม" },
          { value: "tint", label: "พื้นอ่อน" },
          { value: "dark", label: "พื้นเข้ม" },
        ];
  const background = values.background || fallback;
  const surfaceSwatches = [...LIGHT_SWATCHES, ...DARK_SWATCHES];

  const statusText =
    status === "saving"
      ? "กำลังบันทึก…"
      : status === "saved"
        ? "บันทึกเป็นฉบับร่างแล้ว — กดเผยแพร่เมื่อพอใจ"
        : status === "error"
          ? error
          : "เลือกแล้วเห็นผลทันที ผู้เข้าชมยังไม่เห็นจนกว่าจะเผยแพร่";

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="fixed inset-x-2 bottom-2 z-[90] max-h-[min(38rem,calc(100dvh-1rem))] overflow-y-auto rounded-xl border border-ink-700 bg-ink-800 text-rice-100 shadow-lift-lg focus:outline-none sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-[22rem] print:hidden"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-ink-800 px-4 py-3">
        <p id={titleId} className="text-sm font-semibold text-ochre-200">
          สีของ{target.label}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิดแผงเลือกสี"
          className="rounded-lg p-1.5 text-ink-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col gap-5 px-4 py-4">
        {kind === "box" ? (
          <Group title="พื้นหลัง">
            <Chips
              options={presets}
              value={background === "custom" ? "" : background}
              onChange={(value) => update({ background: value })}
            />
            <Swatches
              swatches={surfaceSwatches}
              value={background === "custom" ? values.backgroundColor : undefined}
              onPick={(color) => update({ background: "custom", backgroundColor: color })}
              onCustom={(color) => update({ background: "custom", backgroundColor: color }, true)}
            />
            {background === "custom" ? (
              <div className="flex flex-col gap-1.5">
                <p className="text-2xs text-ink-300">สีตัวอักษรบนพื้นนี้</p>
                <Chips
                  options={[
                    { value: "auto", label: "อัตโนมัติ" },
                    { value: "light", label: "สีอ่อน" },
                    { value: "dark", label: "สีเข้ม" },
                  ]}
                  value={values.textTone || "auto"}
                  onChange={(value) => update({ textTone: value })}
                />
              </div>
            ) : null}
          </Group>
        ) : (
          <Group title="สีพื้นของหน้า">
            <ColorChoice
              value={values.backgroundColor}
              swatches={surfaceSwatches}
              resetLabel="ตามธีม"
              onChange={(color, debounce) => update({ backgroundColor: color }, debounce)}
            />
          </Group>
        )}

        <Group title="สีเน้น (ปุ่ม ป้าย หัวข้อเล็ก)">
          <ColorChoice
            value={values.accentColor}
            swatches={ACCENT_SWATCHES}
            resetLabel="ตามธีม"
            onChange={(color, debounce) => update({ accentColor: color }, debounce)}
          />
        </Group>

        {target.cards || kind === "page" ? (
          <Group title="สีการ์ดและกล่องข้างใน">
            <ColorChoice
              value={values.cardColor}
              swatches={surfaceSwatches}
              resetLabel="สีเดิม"
              onChange={(color, debounce) => update({ cardColor: color }, debounce)}
            />
          </Group>
        ) : null}
      </div>

      <p
        aria-live="polite"
        className={`border-t border-white/10 px-4 py-3 text-2xs leading-relaxed ${
          status === "error" ? "text-red-300" : "text-ink-300"
        }`}
      >
        {statusText}
      </p>
    </div>,
    document.body
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="mb-2.5 text-xs font-semibold text-rice-100">{title}</legend>
      {children}
    </fieldset>
  );
}

function Chips({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              selected
                ? "border-ochre-400 bg-ochre-400 font-semibold text-ink-900"
                : "border-white/20 text-rice-100 hover:border-white/50"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** ปุ่ม "ค่าเดิม" + จานสี + ตัวเลือกสีอื่น — ใช้กับช่องที่เว้นว่างได้ */
function ColorChoice({
  value,
  swatches,
  resetLabel,
  onChange,
}: {
  value?: string;
  swatches: Swatch[];
  resetLabel: string;
  onChange: (color: string | undefined, debounce?: boolean) => void;
}) {
  return (
    <>
      <Chips
        options={[{ value: "reset", label: resetLabel }]}
        value={value ? "" : "reset"}
        onChange={() => onChange(undefined)}
      />
      <Swatches
        swatches={swatches}
        value={value}
        onPick={(color) => onChange(color)}
        onCustom={(color) => onChange(color, true)}
      />
    </>
  );
}

function Swatches({
  swatches,
  value,
  onPick,
  onCustom,
}: {
  swatches: Swatch[];
  value?: string;
  onPick: (color: string) => void;
  onCustom: (color: string) => void;
}) {
  const selected = value?.toLowerCase();
  const isPreset = swatches.some((swatch) => swatch.value === selected);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {swatches.map((swatch) => {
        const active = swatch.value === selected;
        return (
          <button
            key={swatch.value}
            type="button"
            title={swatch.label}
            aria-label={swatch.label}
            aria-pressed={active}
            onClick={() => onPick(swatch.value)}
            style={{ backgroundColor: swatch.value }}
            className={`flex h-7 w-7 items-center justify-center rounded-md border border-white/25 text-xs transition ${
              active ? "ring-2 ring-ochre-400 ring-offset-2 ring-offset-ink-800" : "hover:scale-110"
            } ${isDarkColor(swatch.value) ? "text-white" : "text-ink-900"}`}
          >
            {active ? "✓" : ""}
          </button>
        );
      })}

      {/* สีอื่นนอกจานสี — ใช้ตัวเลือกสีของเบราว์เซอร์ */}
      <label
        title="เลือกสีอื่น"
        className={`relative flex h-7 cursor-pointer items-center gap-1.5 rounded-md border px-2 text-2xs transition-colors ${
          selected && !isPreset ? "border-ochre-400 text-ochre-200" : "border-white/25 text-rice-100 hover:border-white/50"
        }`}
      >
        <span
          aria-hidden
          className="h-4 w-4 rounded-sm border border-white/30"
          style={{
            background:
              selected && isHexColor(selected)
                ? selected
                : "conic-gradient(#e11d48, #f59e0b, #22c55e, #0ea5e9, #8b5cf6, #e11d48)",
          }}
        />
        สีอื่น
        <input
          type="color"
          value={selected && isHexColor(selected) ? selected : "#2e7d52"}
          onChange={(event) => onCustom(event.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label="เลือกสีอื่น"
        />
      </label>
    </div>
  );
}

function PaletteIcon() {
  return (
    <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path
        d="M12 3a9 9 0 100 18c1.1 0 1.8-.9 1.8-1.9 0-.5-.2-.9-.5-1.3-.3-.3-.5-.8-.5-1.2 0-1 .8-1.8 1.8-1.8H17a4 4 0 004-4c0-4.3-4-7.8-9-7.8z"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="11" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="10.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="8" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

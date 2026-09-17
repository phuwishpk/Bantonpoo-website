"use client";

import Image from "next/image";
import { useCallback, useEffect, useEffectEvent, useId, useRef, useState } from "react";
import type { ReactNode, SyntheticEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CheckIcon, CloseIcon, SearchIcon } from "./icons";

/**
 * เปลี่ยนรูปจากหน้าเว็บ (โหมดแก้ไข)
 *
 * แนวเดียวกับ InlineEditable: เรนเดอร์ก็ต่อเมื่อผู้เรียกตัดสินแล้วว่าอยู่ในโหมดแก้ไข
 * (ฝั่งเซิร์ฟเวอร์ใช้ <EdImage> ใน editable.tsx ฝั่งไคลเอนต์ส่ง editing ลงมา)
 * ผู้เข้าชมทั่วไปจึงไม่เห็นที่อยู่ของฟิลด์
 *
 * ปุ่มวางทับรูปแบบ absolute — ผู้เรียกต้องวางไว้ในกล่องที่เป็น relative อยู่แล้ว
 * ทำแบบนี้แทนการห่อรูป เพราะการห่อเปลี่ยนโครง layout ของรูปทุกจุดบนเว็บ
 *
 * รูปมาจากคลังรูปเสมอ อัปโหลดใหม่ก็เข้าคลังก่อน (บังคับกรอกคำบรรยายและเจ้าของภาพ)
 * แล้วค่อยผูกเข้าช่อง — ตรงกับหลังบ้าน รูปทุกรูปบนเว็บจึงตรวจที่มาได้
 */

type PickerTarget = {
  /** ที่อยู่ของช่องรูป เช่น g:home-page:hero.image (ดู src/lib/cms/inline.ts) */
  at: string;
  /** ชื่อที่ใช้บนปุ่มและหัวหน้าต่าง เช่น "รูปหลัก" */
  label: string;
  /** id ของรูปที่ใช้อยู่ ใช้ทำเครื่องหมายในคลังรูป */
  current?: string | number;
  /** ช่องไม่บังคับ — แสดงปุ่มนำรูปออก */
  removable?: boolean;
  /** คำแนะนำขนาดรูป เช่น "สี่เหลี่ยมจัตุรัส" */
  hint?: string;
};

/** กันคลิก/ลาก/กดปุ่มไม่ให้ทะลุไปถึงลิงก์ สไลด์ หรือช่องแก้ข้อความที่ครอบอยู่ */
function isolate(event: SyntheticEvent) {
  event.stopPropagation();
}

export function InlineImageEdit({
  compact = false,
  className = "",
  ...target
}: PickerTarget & {
  /** ปุ่มดินสอเล็กมุมขวาล่าง สำหรับรูปเล็กอย่างโลโก้และรูปโปรไฟล์ */
  compact?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        title={`เปลี่ยน${target.label}`}
        aria-label={`เปลี่ยน${target.label}`}
        onPointerDown={isolate}
        onClick={(event) => {
          // รูปหลายจุดอยู่ในลิงก์ (โลโก้ การ์ดสินค้า) ต้องกันไม่ให้พาออกจากหน้า
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
        className={`group/image-edit absolute inset-0 z-20 cursor-pointer rounded-[inherit] outline-2 -outline-offset-2 outline-ochre-400/70 outline-dashed transition-colors hover:bg-ink-950/30 hover:outline-ochre-400 focus-visible:bg-ink-950/30 focus-visible:outline-solid ${className}`}
      >
        {compact ? (
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-ochre-400 text-ink-900 shadow-lift">
            <PencilIcon size={11} />
          </span>
        ) : (
          <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-ochre-400 px-3.5 py-2 text-xs font-semibold text-ink-900 opacity-0 shadow-lift-lg transition-opacity group-hover/image-edit:opacity-100 group-focus-visible/image-edit:opacity-100 pointer-coarse:opacity-100">
            <PencilIcon size={13} />
            {`เปลี่ยน${target.label}`}
          </span>
        )}
      </button>
      {open ? <ImagePicker {...target} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

/** ช่องว่างแทนรูปที่ยังไม่มี — ให้กดเพิ่มรูปได้ตรงตำแหน่งที่รูปจะอยู่ */
export function EmptyImageSlot({
  className = "",
  ...target
}: PickerTarget & { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ochre-400/70 bg-ochre-400/5 p-6 text-center text-sm font-semibold text-ochre-400 transition-colors hover:border-ochre-400 hover:bg-ochre-400/10 ${className}`}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ochre-400 text-2xl leading-none text-ink-900">
          +
        </span>
        {`เพิ่ม${target.label}`}
        {target.hint ? <span className="text-2xs font-normal opacity-80">{target.hint}</span> : null}
      </button>
      {open ? <ImagePicker {...target} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

/* ------------------------------------------------------------------
   หน้าต่างเลือกรูป
   ------------------------------------------------------------------ */

type LibraryItem = {
  id: string | number;
  url: string;
  thumbUrl: string;
  alt: string;
  filename: string;
};

type SaveResult = { ok?: boolean; message?: string; scope?: string; label?: string; drafts?: boolean };

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";
const MAX_BYTES = 8 * 1024 * 1024;

export function ImagePicker({
  at,
  label,
  current,
  removable = false,
  hint,
  onClose,
}: PickerTarget & { onClose: () => void }) {
  const router = useRouter();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // คลังรูป
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | number | undefined>(current);

  // อัปโหลด
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [alt, setAlt] = useState("");
  const [credit, setCredit] = useState("ชุมชนบ้านต้นโพธิ์");
  const [rights, setRights] = useState<"own" | "licensed">("own");

  const onEscape = useEffectEvent(() => {
    if (!busy) onClose();
  });

  /*
    Esc ปิด · ล็อกการเลื่อนหน้าข้างหลัง · ย้ายโฟกัสเข้าหน้าต่าง แล้วคืนโฟกัสตอนปิด

    ปุ่มที่กดในหน้าต่างถูกหยุดไม่ให้ทะลุออกไป (ดู onKeyDown ด้านล่าง) ซึ่ง React หยุดที่ระดับ
    document ตัวดักที่ window จึงไม่เห็น Esc จากในหน้าต่าง — ในหน้าต่างรับเองที่ onKeyDown
    ส่วนตัวดักนี้มีไว้กรณีโฟกัสหลุดออกไปนอกหน้าต่าง
  */
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus?.();
    };
  }, []);

  const load = useCallback(async (nextPage: number, search: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(nextPage) });
      if (search) params.set("q", search);
      const response = await fetch(`/api/inline-media?${params}`);
      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
        docs?: LibraryItem[];
        hasNextPage?: boolean;
      };
      if (!response.ok || !result.ok) {
        setError(result.message ?? "โหลดคลังรูปไม่สำเร็จ");
        return;
      }
      setItems((existing) => (nextPage === 1 ? (result.docs ?? []) : [...existing, ...(result.docs ?? [])]));
      setPage(nextPage);
      setHasNext(Boolean(result.hasNextPage));
    } catch {
      setError("ติดต่อเซิร์ฟเวอร์ไม่ได้ ลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  }, []);

  // ค้นหาเมื่อหยุดพิมพ์ครู่หนึ่ง ไม่ยิงทุกตัวอักษร
  useEffect(() => {
    const timer = window.setTimeout(() => void load(1, query.trim()), query ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [load, query]);

  // คืนหน่วยความจำของรูปตัวอย่างเมื่อเปลี่ยนไฟล์หรือปิดหน้าต่าง
  useEffect(() => () => URL.revokeObjectURL(preview), [preview]);

  async function apply(media: string | number | null) {
    const response = await fetch("/api/inline-edit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "image", at, media }),
    });
    const result = (await response.json()) as SaveResult;
    if (!response.ok || !result.ok) throw new Error(result.message ?? "บันทึกไม่สำเร็จ");

    if (result.scope) {
      // บอกแถบเครื่องมือว่ามีเอกสารที่ต้องเผยแพร่ (เหมือนตอนแก้ข้อความ)
      window.dispatchEvent(
        new CustomEvent("bantonpoo:inline-saved", {
          detail: { scope: result.scope, label: result.label, drafts: result.drafts },
        })
      );
    }
    router.refresh();
    onClose();
  }

  async function run(task: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await task();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "บันทึกไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  function chooseFile(next: File | undefined) {
    setError("");
    if (!next) return;
    if (!ACCEPT.split(",").includes(next.type)) {
      setError("รองรับเฉพาะรูป JPG, PNG, WebP และ AVIF");
      return;
    }
    if (next.size > MAX_BYTES) {
      setError("ไฟล์ใหญ่เกิน 8 MB ย่อรูปก่อนแล้วลองใหม่");
      return;
    }
    setFile(next);
    setPreview(URL.createObjectURL(next));
    // ตั้งคำบรรยายเริ่มต้นจากชื่อไฟล์ ให้ผู้ใช้แก้ต่อ แทนการปล่อยว่าง
    if (!alt) setAlt(next.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
  }

  async function upload() {
    if (!file) throw new Error("ยังไม่ได้เลือกไฟล์รูป");
    const form = new FormData();
    form.set("file", file);
    form.set("alt", alt);
    form.set("credit", credit);
    form.set("usageRights", rights);
    const response = await fetch("/api/inline-media", { method: "POST", body: form });
    const result = (await response.json()) as { ok?: boolean; message?: string; media?: LibraryItem };
    if (!response.ok || !result.ok || !result.media) throw new Error(result.message ?? "อัปโหลดไม่สำเร็จ");
    // รูปเข้าคลังแล้ว ถ้าขั้นผูกรูปพังก็เลือกจากคลังได้ ไม่ต้องอัปโหลดซ้ำ
    setItems((existing) => [result.media!, ...existing]);
    setSelected(result.media.id);
    await apply(result.media.id);
  }

  const canUpload = Boolean(file && alt.trim() && credit.trim());
  const canApply = selected !== undefined && selected !== current;

  // เปิดได้หลังผู้ใช้กดปุ่มเท่านั้น จึงมี document ให้ใช้เสมอ
  // วางไว้ที่ body เพื่อหลุดจากกล่องที่ตัดขอบ (overflow-hidden) และลำดับชั้นของหัวเว็บ
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(event) => {
        event.stopPropagation();
        if (event.target === event.currentTarget && !busy) onClose();
      }}
      onPointerDown={isolate}
      onPointerMove={isolate}
      onPointerUp={isolate}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Escape" && !busy) onClose();
      }}
      onFocus={isolate}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="flex h-[min(44rem,92dvh)] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-rice-50 text-ink-800 shadow-lift-lg outline-none sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-rice-300 px-5 py-4">
          <div>
            <h2 id={titleId} className="font-serif text-lg font-semibold">
              {`เปลี่ยน${label}`}
            </h2>
            {hint ? <p className="mt-0.5 text-xs text-river-500">{hint}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="ปิด"
            className="rounded-lg p-2 text-river-500 transition-colors hover:bg-rice-200 hover:text-ink-800"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div role="tablist" className="flex gap-1 border-b border-rice-300 px-5">
          {(
            [
              ["library", "เลือกจากคลังรูป"],
              ["upload", "อัปโหลดรูปใหม่"],
            ] as const
          ).map(([key, text]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => {
                setTab(key);
                setError("");
              }}
              className={`-mb-px border-b-2 px-3 py-3 text-sm font-semibold transition-colors ${
                tab === key
                  ? "border-leaf-500 text-leaf-600"
                  : "border-transparent text-river-500 hover:text-ink-800"
              }`}
            >
              {text}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {tab === "library" ? (
            <div className="flex flex-col gap-4">
              <label className="relative block">
                <span className="sr-only">ค้นหารูป</span>
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-river-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="ค้นหาจากคำบรรยาย ชื่อไฟล์ หรือเจ้าของภาพ"
                  className="w-full rounded-lg border border-rice-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-leaf-500"
                />
              </label>

              {items.length === 0 && !loading ? (
                <p className="py-10 text-center text-sm text-river-500">
                  {query ? "ไม่พบรูปที่ตรงกับคำค้น" : "คลังรูปยังว่าง — อัปโหลดรูปใหม่ได้ที่แท็บด้านบน"}
                </p>
              ) : (
                <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                  {items.map((item) => {
                    const isSelected = item.id === selected;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => setSelected(item.id)}
                          onDoubleClick={() => item.id !== current && void run(() => apply(item.id))}
                          aria-pressed={isSelected}
                          title={item.alt || item.filename}
                          className={`relative block aspect-square w-full overflow-hidden rounded-lg bg-rice-200 transition ${
                            isSelected
                              ? "ring-3 ring-leaf-500 ring-offset-2 ring-offset-rice-50"
                              : "hover:opacity-85"
                          }`}
                        >
                          <Image
                            src={item.thumbUrl || item.url}
                            alt={item.alt}
                            width={160}
                            height={160}
                            unoptimized
                            className="h-full w-full object-cover"
                          />
                          {item.id === current ? (
                            <span className="absolute inset-x-0 bottom-0 bg-ink-950/75 py-1 text-center text-2xs font-semibold text-rice-100">
                              ใช้อยู่
                            </span>
                          ) : null}
                          {isSelected ? (
                            <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-leaf-500 text-white">
                              <CheckIcon className="h-4 w-4" />
                            </span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {loading ? <p className="text-center text-xs text-river-500">กำลังโหลด…</p> : null}
              {hasNext && !loading ? (
                <button
                  type="button"
                  onClick={() => void load(page + 1, query.trim())}
                  className="self-center rounded-lg border border-rice-300 px-4 py-2 text-sm font-medium hover:border-ink-400"
                >
                  โหลดรูปเพิ่ม
                </button>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-[14rem_1fr]">
              <label
                className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-rice-400 bg-white text-center text-sm text-river-500 transition-colors hover:border-leaf-500"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  chooseFile(event.dataTransfer.files[0]);
                }}
              >
                {preview ? (
                  <Image
                    src={preview}
                    alt="ตัวอย่างรูปที่เลือก"
                    width={224}
                    height={224}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <span className="text-3xl leading-none text-rice-500">+</span>
                    เลือกไฟล์ หรือลากรูปมาวาง
                    <span className="text-2xs">JPG · PNG · WebP · AVIF ไม่เกิน 8 MB</span>
                  </>
                )}
                <input
                  type="file"
                  accept={ACCEPT}
                  className="sr-only"
                  onChange={(event) => chooseFile(event.target.files?.[0])}
                />
              </label>

              <div className="flex flex-col gap-4 text-sm">
                <label className="flex flex-col gap-1.5">
                  <span className="font-semibold">
                    คำบรรยายภาพ <span className="text-red-700">*</span>
                  </span>
                  <input
                    value={alt}
                    onChange={(event) => setAlt(event.target.value)}
                    maxLength={300}
                    placeholder="เช่น กลุ่มแม่บ้านกำลังตำยาหม่อง"
                    className="rounded-lg border border-rice-300 bg-white px-3 py-2.5 outline-none focus:border-leaf-500"
                  />
                  <span className="text-2xs text-river-500">
                    อธิบายว่าในภาพมีอะไร สำหรับผู้พิการทางสายตาและ Google
                  </span>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="font-semibold">
                    เจ้าของภาพ / แหล่งที่มา <span className="text-red-700">*</span>
                  </span>
                  <input
                    value={credit}
                    onChange={(event) => setCredit(event.target.value)}
                    maxLength={200}
                    className="rounded-lg border border-rice-300 bg-white px-3 py-2.5 outline-none focus:border-leaf-500"
                  />
                </label>
                <fieldset className="flex flex-col gap-1.5">
                  <legend className="mb-1.5 font-semibold">สิทธิ์การใช้งาน</legend>
                  {(
                    [
                      ["own", "ชุมชนถ่ายเอง"],
                      ["licensed", "ได้รับอนุญาตจากเจ้าของภาพแล้ว"],
                    ] as const
                  ).map(([value, text]) => (
                    <label key={value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`${titleId}-rights`}
                        checked={rights === value}
                        onChange={() => setRights(value)}
                        className="accent-leaf-500"
                      />
                      {text}
                    </label>
                  ))}
                  <span className="text-2xs text-river-500">
                    รูปที่ยังไม่ได้ขออนุญาตห้ามนำขึ้นเว็บ — เก็บไว้ในหลังบ้านก่อนจนกว่าจะได้รับอนุญาต
                  </span>
                </fieldset>
              </div>
            </div>
          )}
        </div>

        {error ? (
          <p role="alert" className="border-t border-red-200 bg-red-50 px-5 py-2.5 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rice-300 bg-rice-100 px-5 py-3">
          <div>
            {removable && current !== undefined ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void run(() => apply(null))}
                className="rounded-lg px-3 py-2 text-sm font-medium text-red-800 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                นำรูปออก
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-river-600 transition-colors hover:bg-rice-200"
            >
              ยกเลิก
            </button>
            <FooterAction
              busy={busy}
              disabled={tab === "library" ? !canApply : !canUpload}
              onClick={() =>
                void run(tab === "library" ? () => apply(selected!) : () => upload())
              }
            >
              {tab === "library" ? "ใช้รูปนี้" : "อัปโหลดและใช้รูปนี้"}
            </FooterAction>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function FooterAction({
  busy,
  disabled,
  onClick,
  children,
}: {
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className="rounded-lg bg-leaf-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-leaf-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {busy ? "กำลังบันทึก…" : children}
    </button>
  );
}

function PencilIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M4 20h4L19 9a2.8 2.8 0 10-4-4L4 16z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ImagePicker } from "./inline-image";
import { useSite } from "./site-context";

/**
 * โหมดแก้ไขบนหน้าเว็บ
 *
 * เปิดจากปุ่ม "เปิดเว็บไซต์ (โหมดแก้ไข)" ในหลังบ้าน ผู้ดูแลจะเห็นเว็บจริง
 * พร้อมช่องข้อความที่คลิกแก้ได้ตรงนั้น และปุ่มลัดไปหน้าแก้ไขของแต่ละส่วน
 *
 * เจตนา: ให้คนที่ไม่คุ้นกับโครงสร้างหลังบ้านแก้ข้อความและรูปจากสิ่งที่เห็นบนหน้าเว็บได้เลย
 * ส่วนที่แก้ในหน้าเว็บไม่ได้ (เพิ่ม/ลบรายการ จัดสี) ยังต้องไปที่หลังบ้าน
 * ปุ่มลัดในแถบนี้จึงยังอยู่
 */

/**
 * ปุ่มแก้ไขเล็ก ๆ ที่ลอยอยู่มุมของบล็อกเนื้อหา
 *
 * ผู้เรียกต้องเป็นคนตัดสินใจว่าจะเรนเดอร์หรือไม่ (ส่ง href มาเมื่ออยู่ในโหมดแก้ไขเท่านั้น)
 * ถ้าปล่อยให้คอมโพเนนต์ตัดสินใจเอง ลิงก์หลังบ้านจะติดไปกับข้อมูลที่ส่งให้ผู้เข้าชมทุกคน
 * แม้ปุ่มจะไม่แสดงก็ตาม
 */
export function EditButton({
  href,
  label,
  className = "",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={`แก้ไข${label}`}
      className={`absolute right-3 top-3 z-30 inline-flex items-center gap-1.5 rounded-full border border-ochre-400 bg-ochre-50/95 px-3 py-1.5 text-xs font-semibold text-ink-900 shadow-lift backdrop-blur transition hover:bg-ochre-200 ${className}`}
    >
      <PencilIcon />
      {label}
    </a>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="M4 20h4L19 9a2.8 2.8 0 10-4-4L4 16z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type EditLink = { label: string; href: string };

type SavedEvent = CustomEvent<{ scope?: string; label?: string; drafts?: boolean }>;

/**
 * แถบเครื่องมือลอยมุมล่างขวา
 *
 * รวมสามอย่างไว้ที่เดียว: รายการสิ่งที่แก้ไปแล้วแต่ยังไม่เผยแพร่ ปุ่มเผยแพร่
 * และทางลัดไปหลังบ้านสำหรับสิ่งที่แก้ในหน้าเว็บไม่ได้
 */
export function EditToolbar({ pageLabel, links }: { pageLabel: string; links: EditLink[] }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<{ scope: string; label: string }[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");
  const [siteImage, setSiteImage] = useState<"logo" | "favicon" | null>(null);
  const site = useSite();
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // เมื่อผู้ดูแลบันทึกในแท็บหลังบ้าน ให้หน้านี้ดึงข้อมูลใหม่เอง
  useEffect(() => {
    function onFocus() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => router.refresh(), 400);
    }
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [router]);

  // เก็บรายชื่อเอกสารที่ถูกแก้จากหน้าเว็บ เพื่อให้ปุ่มเผยแพร่รู้ว่าต้องเผยแพร่อะไรบ้าง
  useEffect(() => {
    function onSaved(event: Event) {
      const detail = (event as SavedEvent).detail;
      if (!detail?.scope || !detail.drafts) return;
      setMessage("");
      setPending((current) =>
        current.some((item) => item.scope === detail.scope)
          ? current
          : [...current, { scope: detail.scope!, label: detail.label ?? "เนื้อหา" }]
      );
    }
    window.addEventListener("bantonpoo:inline-saved", onSaved);
    return () => window.removeEventListener("bantonpoo:inline-saved", onSaved);
  }, []);

  // เตือนก่อนปิดแท็บถ้ายังมีฉบับร่างที่ยังไม่เผยแพร่
  useEffect(() => {
    if (pending.length === 0) return;
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [pending.length]);

  async function publishAll() {
    setPublishing(true);
    setMessage("");
    try {
      const response = await fetch("/api/inline-edit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "publish", scopes: pending.map((item) => item.scope) }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        done?: string[];
        failed?: { label: string; message: string }[];
      };

      if (result.ok) {
        setPending([]);
        setMessage("เผยแพร่แล้ว ผู้เข้าชมทั่วไปเห็นการเปลี่ยนแปลงนี้แล้ว");
        router.refresh();
      } else {
        const first = result.failed?.[0];
        setMessage(first ? `${first.label}: ${first.message}` : "เผยแพร่ไม่สำเร็จ");
      }
    } catch {
      setMessage("ติดต่อเซิร์ฟเวอร์ไม่ได้ ลองอีกครั้ง");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-2 print:hidden">
      {siteImage === "logo" ? (
        <ImagePicker
          at="g:site-settings:logo"
          label="โลโก้"
          current={site.logo?.id}
          removable
          hint="แสดงตามสัดส่วนจริง สูงเท่าชื่อชุมชน · แถบเมนูเป็นพื้นเข้ม ใช้ PNG พื้นโปร่งใสจะดูดีที่สุด — ถ้านำออกจะใช้ใบโพธิ์"
          onClose={() => setSiteImage(null)}
        />
      ) : null}
      {siteImage === "favicon" ? (
        <ImagePicker
          at="g:site-settings:favicon"
          label="ไอคอนบนแท็บเบราว์เซอร์"
          current={site.favicon?.id}
          removable
          hint="PNG สี่เหลี่ยมจัตุรัส อย่างน้อย 512×512 — ถ้านำออกจะใช้โลโก้ · เบราว์เซอร์อาจจำไอคอนเก่าไว้สักพัก"
          onClose={() => setSiteImage(null)}
        />
      ) : null}
      {open ? (
        <div className="w-72 overflow-hidden rounded-xl border border-ink-700 bg-ink-800 shadow-lift-lg">
          <p className="border-b border-white/10 px-4 py-3 text-xs font-semibold text-ochre-200">
            แก้ไข{pageLabel}
          </p>

          <p className="border-b border-white/10 px-4 py-3 text-2xs leading-relaxed text-ink-300">
            คลิกที่ข้อความบนหน้าเว็บเพื่อแก้ได้เลย · กด Esc เพื่อยกเลิก
            <br />
            คลิกที่รูปเพื่อเปลี่ยนรูป (ชี้เมาส์แล้วจะเห็นปุ่ม)
            <br />
            เพิ่ม/ลบรายการ และจัดสี ต้องทำที่หลังบ้าน
          </p>

          <div className="flex flex-col border-b border-white/10 py-1">
            <p className="px-4 pb-1 pt-2 text-2xs font-semibold tracking-wide text-ink-400">รูปประจำเว็บ</p>
            {(
              [
                ["logo", "โลโก้บนแถบเมนู", site.logo],
                ["favicon", "ไอคอนบนแท็บเบราว์เซอร์", site.favicon ?? site.logo],
              ] as const
            ).map(([key, text, image]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSiteImage(key)}
                className="flex items-center gap-3 px-4 py-2 text-left text-sm text-rice-100 transition-colors hover:bg-white/10"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/10">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- รูปย่อ 28px ไม่ต้องผ่านตัวย่อรูป
                    <img
                      src={key === "logo" ? image.url : (image.thumbUrl ?? image.url)}
                      alt=""
                      // โลโก้แสดงตามสัดส่วนจริงบนเว็บ ตัวอย่างจึงไม่ตัดขอบ ส่วนไอคอนเว็บใช้รูปจัตุรัสอยู่แล้ว
                      className={`h-full w-full ${key === "logo" ? "object-contain" : "object-cover"}`}
                    />
                  ) : (
                    <span aria-hidden className="text-2xs text-ink-300">—</span>
                  )}
                </span>
                <span className="flex flex-col">
                  {text}
                  {key === "favicon" && !site.favicon ? (
                    <span className="text-2xs text-ink-400">ยังไม่ได้ตั้ง — ใช้โลโก้แทน</span>
                  ) : null}
                </span>
              </button>
            ))}
          </div>

          <ul className="flex flex-col py-1">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-rice-100 transition-colors hover:bg-white/10"
                >
                  <PencilIcon />
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={`/api/exit-preview?path=${encodeURIComponent(pathname)}`}
            className="block border-t border-white/10 px-4 py-2.5 text-center text-xs text-ink-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            ออกจากโหมดแก้ไข
          </a>
        </div>
      ) : null}

      {message ? (
        <p className="max-w-72 rounded-lg bg-ink-800 px-3 py-2 text-2xs leading-relaxed text-rice-100 shadow-lift-lg">
          {message}
        </p>
      ) : null}

      {pending.length > 0 ? (
        <button
          type="button"
          onClick={publishAll}
          disabled={publishing}
          className="flex items-center gap-2 rounded-full bg-leaf-500 px-4 py-3 text-sm font-semibold text-white shadow-lift-lg transition hover:bg-leaf-600 disabled:opacity-60"
        >
          {publishing ? "กำลังเผยแพร่…" : `เผยแพร่ ${pending.length} รายการที่แก้ไว้`}
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full bg-ochre-400 px-4 py-3 text-sm font-semibold text-ink-900 shadow-lift-lg transition hover:bg-ochre-200"
      >
        <PencilIcon />
        {open ? "ปิดเมนูแก้ไข" : "แก้ไขหน้านี้"}
      </button>
    </div>
  );
}

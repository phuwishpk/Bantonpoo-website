"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Media } from "@/content/types";
import { t } from "@/lib/i18n";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, SearchIcon } from "./icons";

/**
 * แกลเลอรีรูปสินค้า
 *
 * เดสก์ท็อป — รูปหลักขนาดใหญ่ + แถบ thumbnail ด้านล่าง กดที่รูปเพื่อซูมเต็มจอ
 * มือถือ     — ปัดเลื่อนดูรูปได้ด้วยนิ้ว (scroll snap) พร้อมจุดบอกตำแหน่ง
 */
export function ProductGallery({ images, productName }: { images: Media[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const total = images.length;

  const showNext = useCallback(() => setLightboxIndex((i) => (i === null ? null : (i + 1) % total)), [total]);
  const showPrev = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i - 1 + total) % total)),
    [total]
  );

  // ปุ่มลูกศรและ Esc ใช้ได้ขณะเปิดภาพเต็มจอ
  useEffect(() => {
    if (lightboxIndex === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowRight") showNext();
      if (event.key === "ArrowLeft") showPrev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxIndex, showNext, showPrev]);

  // อัปเดตจุดบอกตำแหน่งตามการปัดของผู้ใช้บนมือถือ
  function handleTrackScroll() {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActiveIndex(Math.min(Math.max(index, 0), total - 1));
  }

  const active = images[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      {/* ---- มือถือ: ปัดเลื่อนดูรูป ---- */}
      <div className="lg:hidden">
        <div
          ref={trackRef}
          onScroll={handleTrackScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-card bg-ink-800"
          aria-label={`รูปภาพ ${productName}`}
        >
          {images.map((media, index) => (
            <button
              key={media.url}
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="relative aspect-square w-full shrink-0 snap-center"
              aria-label={`ดูภาพขยาย: ${t(media.alt)}`}
            >
              <Image
                src={media.url}
                alt={t(media.alt)}
                width={media.width}
                height={media.height}
                priority={index === 0}
                sizes="100vw"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>

        {total > 1 ? (
          <div className="mt-3 flex justify-center gap-1.5" role="tablist" aria-label="เลือกรูปภาพ">
            {images.map((media, index) => (
              <button
                key={media.url}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`ไปที่รูปที่ ${index + 1}`}
                onClick={() => {
                  trackRef.current?.scrollTo({ left: index * trackRef.current.clientWidth, behavior: "smooth" });
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ease-craft ${
                  index === activeIndex ? "w-6 bg-leaf-500" : "w-1.5 bg-rice-400"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* ---- เดสก์ท็อป: รูปหลัก + thumbnail ---- */}
      <div className="hidden lg:block">
        <button
          type="button"
          onClick={() => setLightboxIndex(activeIndex)}
          className="group relative block aspect-square w-full overflow-hidden rounded-card bg-ink-800"
          aria-label={`ดูภาพขยาย: ${t(active.alt)}`}
        >
          <Image
            src={active.url}
            alt={t(active.alt)}
            width={active.width}
            height={active.height}
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="h-full w-full object-cover transition duration-500 ease-craft group-hover:scale-[1.03]"
          />
          <span className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-lg bg-ink-950/70 px-3 py-2 text-xs font-medium text-rice-100 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <SearchIcon className="h-4 w-4" />
            คลิกเพื่อซูม
          </span>
        </button>

        {total > 1 ? (
          <div className="mt-3 grid grid-cols-5 gap-3">
            {images.map((media, index) => (
              <button
                key={media.url}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`แสดงรูป: ${t(media.alt)}`}
                aria-pressed={index === activeIndex}
                className={`relative aspect-square overflow-hidden rounded-lg bg-ink-800 transition duration-200 ease-craft ${
                  index === activeIndex
                    ? "ring-2 ring-leaf-500 ring-offset-2 ring-offset-rice-100"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={media.url}
                  alt=""
                  aria-hidden
                  width={media.width}
                  height={media.height}
                  sizes="120px"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* ---- ภาพเต็มจอ ---- */}
      {lightboxIndex !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`ภาพขยายของ ${productName}`}
          className="fixed inset-0 z-[60] flex flex-col bg-ink-950/95 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-ink-300">
              {lightboxIndex + 1} / {total}
            </span>
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="rounded-lg p-2 text-rice-100 transition-colors hover:bg-white/10"
              aria-label="ปิดภาพขยาย"
              autoFocus
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-4 pb-6">
            <Image
              src={images[lightboxIndex].url}
              alt={t(images[lightboxIndex].alt)}
              width={images[lightboxIndex].width}
              height={images[lightboxIndex].height}
              sizes="100vw"
              className="max-h-full w-auto max-w-full rounded-lg object-contain"
            />

            {total > 1 ? (
              <>
                <button
                  type="button"
                  onClick={showPrev}
                  className="absolute left-3 rounded-full bg-white/10 p-3 text-rice-100 transition-colors hover:bg-white/20"
                  aria-label="รูปก่อนหน้า"
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  className="absolute right-3 rounded-full bg-white/10 p-3 text-rice-100 transition-colors hover:bg-white/20"
                  aria-label="รูปถัดไป"
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>
              </>
            ) : null}
          </div>

          <p className="px-6 pb-8 text-center text-sm text-ink-300">{t(images[lightboxIndex].alt)}</p>
        </div>
      ) : null}
    </div>
  );
}

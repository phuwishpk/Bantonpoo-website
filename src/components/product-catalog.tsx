"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { productFormLabels, productStatusLabels } from "@/lib/product-labels";
import type { Product } from "@/content/types";
import { formatPrice } from "@/lib/format";
import { t } from "@/lib/i18n";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
} from "./icons";
import { adminDoc } from "@/lib/cms/edit-links";
import { EditButton } from "./edit-mode";
import { QuickOrderButton } from "./line-order-button";
import { Badge, buttonClass } from "./ui";

/** เวลาต่อสไลด์เมื่อเล่นอัตโนมัติ ต้องตรงกับ duration ของ animation แถบความคืบหน้า */
const AUTOPLAY_MS = 7000;

/** ระยะลากขั้นต่ำ (พิกเซล) ที่ถือว่าตั้งใจปัดเปลี่ยนสไลด์ */
const SWIPE_THRESHOLD = 60;

const STATUS_TONE = {
  "in-stock": "bg-leaf-600",
  "made-to-order": "bg-ochre-600",
  "sold-out": "bg-ink-500",
} as const;

/**
 * แคตตาล็อกสินค้าแบบสไลด์
 *
 * แสดงทีละชิ้นพร้อมข้อมูลเบื้องต้น (หมวดหมู่ ราคา สถานะ รูปแบบ ปริมาณสุทธิ สมุนไพรหลัก)
 * ควบคุมได้ด้วยปุ่มลูกศร ปุ่มลูกศรบนคีย์บอร์ด การปัดนิ้ว และแถบรูปย่อด้านล่าง
 *
 * การเคลื่อนไหวทั้งหมดใช้ CSS transition ล้วน ไม่มีไลบรารีเพิ่ม และถูกปิดอัตโนมัติ
 * เมื่อผู้ใช้ตั้งค่า prefers-reduced-motion (ดูกฎรวมใน globals.css)
 */
export function ProductCatalog({
  products,
  editing = false,
}: {
  products: Product[];
  editing?: boolean;
}) {
  const [rawIndex, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [hovering, setHovering] = useState(false);

  const total = products.length;
  const pointerStart = useRef<number | null>(null);
  const regionRef = useRef<HTMLDivElement>(null);

  // เมื่อผลการกรองเปลี่ยน จำนวนสไลด์อาจน้อยลงจนตัวชี้เกินขอบ
  // คำนวณค่าที่ปลอดภัยตอน render แทนการ setState ใน effect จะได้ไม่เกิด render ซ้อน
  const index = rawIndex >= total ? 0 : rawIndex;

  const goTo = useCallback(
    (next: number) => {
      if (total === 0) return;
      setIndex(((next % total) + total) % total);
    },
    [total]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // เล่นอัตโนมัติ หยุดเมื่อเมาส์ชี้อยู่ ผู้ใช้กดหยุด หรือมีสไลด์เดียว
  const running = autoplay && !hovering && !dragging && total > 1;
  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(next, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [running, next, index]);

  // ลูกศรซ้าย/ขวาใช้ได้เมื่อโฟกัสอยู่ในบริเวณแคตตาล็อก จึงไม่แย่งคีย์กับส่วนอื่นของหน้า
  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      prev();
    }
  }

  function handlePointerDown(event: React.PointerEvent) {
    if (total < 2 || event.pointerType === "mouse") return;
    pointerStart.current = event.clientX;
    setDragging(true);
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (pointerStart.current === null) return;
    setDragX(event.clientX - pointerStart.current);
  }

  function handlePointerEnd() {
    if (pointerStart.current === null) return;
    if (dragX <= -SWIPE_THRESHOLD) next();
    else if (dragX >= SWIPE_THRESHOLD) prev();
    pointerStart.current = null;
    setDragX(0);
    setDragging(false);
  }

  if (total === 0) return null;

  return (
    <div
      ref={regionRef}
      role="region"
      aria-roledescription="แคตตาล็อกสไลด์"
      aria-label="แคตตาล็อกสินค้าชุมชน"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="flex flex-col gap-4 rounded-2xl focus-visible:outline-none"
    >
      {/* ---------------- ตัวสไลด์ ---------------- */}
      <div className="relative overflow-hidden rounded-2xl bg-ink-800">
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          style={{
            transform: `translate3d(calc(${-index * 100}% + ${dragX}px), 0, 0)`,
            // ปิด transition ระหว่างลาก เพื่อให้สไลด์ติดนิ้ว
            transition: dragging ? "none" : "transform 600ms var(--ease-craft)",
            touchAction: "pan-y",
          }}
          className="flex"
        >
          {products.map((product, slideIndex) => (
            <CatalogSlide
              key={product.slug}
              product={product}
              active={slideIndex === index}
              position={slideIndex + 1}
              total={total}
              editing={editing}
            />
          ))}
        </div>

        {/* ปุ่มเลื่อน — ซ่อนบนมือถือเพราะใช้การปัดนิ้วแทน */}
        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="สินค้าก่อนหน้า"
              className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/20 bg-ink-950/50 p-3 text-rice-100 backdrop-blur transition duration-200 ease-craft hover:border-white/50 hover:bg-ink-950/80 lg:block"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="สินค้าถัดไป"
              className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/20 bg-ink-950/50 p-3 text-rice-100 backdrop-blur transition duration-200 ease-craft hover:border-white/50 hover:bg-ink-950/80 lg:block"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </>
        ) : null}

        {/* แถบความคืบหน้าของการเล่นอัตโนมัติ */}
        {total > 1 ? (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10">
            <span
              key={`${index}-${running}`}
              className="block h-full origin-left bg-leaf-400"
              style={{
                animation: running ? `catalog-progress ${AUTOPLAY_MS}ms linear forwards` : "none",
                transform: running ? undefined : "scaleX(0)",
              }}
            />
          </div>
        ) : null}
      </div>

      {/* ---------------- แถบควบคุมด้านล่าง ---------------- */}
      {total > 1 ? (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={prev}
              aria-label="สินค้าก่อนหน้า"
              className="rounded-lg border border-rice-300 bg-rice-50 p-2.5 text-ink-700 transition-colors hover:border-ink-400"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="สินค้าถัดไป"
              className="rounded-lg border border-rice-300 bg-rice-50 p-2.5 text-ink-700 transition-colors hover:border-ink-400"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          {/* รูปย่อสำหรับกระโดดไปสินค้าที่ต้องการโดยตรง */}
          {/* บนมือถือให้แถบรูปย่อขึ้นบรรทัดของตัวเอง ไม่งั้นจะถูกบีบจนเห็นแค่สองสามรูป */}
          <div
            className="no-scrollbar order-last -mx-1 flex w-full gap-2 overflow-x-auto px-1 lg:order-none lg:w-auto lg:flex-1"
            role="tablist"
            aria-label="เลือกสินค้าในแคตตาล็อก"
          >
            {products.map((product, slideIndex) => (
              <button
                key={product.slug}
                type="button"
                role="tab"
                aria-selected={slideIndex === index}
                aria-label={t(product.name)}
                onClick={() => goTo(slideIndex)}
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-800 transition duration-300 ease-craft ${
                  slideIndex === index
                    ? "ring-2 ring-leaf-500 ring-offset-2 ring-offset-rice-100"
                    : "opacity-55 hover:opacity-100"
                }`}
              >
                <Image
                  src={product.gallery[0].url}
                  alt=""
                  aria-hidden
                  width={product.gallery[0].width}
                  height={product.gallery[0].height}
                  sizes="56px"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setAutoplay((value) => !value)}
            aria-label={autoplay ? "หยุดเล่นสไลด์อัตโนมัติ" : "เล่นสไลด์อัตโนมัติ"}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-rice-300 bg-rice-50 px-3 py-2.5 text-xs font-medium text-ink-700 transition-colors hover:border-ink-400"
          >
            {autoplay ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
            <span className="tabular-nums">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** สไลด์เดียวในแคตตาล็อก — ข้อความจะไล่กันขึ้นมาเมื่อสไลด์นี้เป็นสไลด์ที่แสดงอยู่ */
function CatalogSlide({
  product,
  active,
  position,
  total,
  editing,
}: {
  product: Product;
  active: boolean;
  position: number;
  total: number;
  editing: boolean;
}) {
  const category = product.category;
  const cover = product.gallery[0];
  const herbs = t(product.mainHerbs);

  return (
    <article
      className="relative grid w-full shrink-0 lg:grid-cols-[1.05fr_1fr]"
      aria-roledescription="สไลด์"
      aria-label={`${position} จาก ${total}: ${t(product.name)}`}
      // inert ทำให้สไลด์ที่ไม่ได้แสดงอยู่กด Tab เข้าไปไม่ได้
      // ถ้าใช้แค่ aria-hidden ลิงก์ข้างในจะยังโฟกัสได้ ซึ่งผิดหลัก accessibility
      inert={!active}
    >
      {editing ? <EditButton href={adminDoc("products", product.id)} label="แก้สินค้านี้" /> : null}

      {/* ---- ภาพสินค้า ---- */}
      <div className="relative aspect-4/3 overflow-hidden lg:aspect-auto lg:min-h-[28rem]">
        <Image
          src={cover.url}
          alt={t(cover.alt)}
          width={cover.width}
          height={cover.height}
          priority={position === 1}
          sizes="(max-width: 1024px) 100vw, 55vw"
          className={`h-full w-full object-cover transition-transform duration-[1200ms] ease-craft ${
            active ? "scale-100" : "scale-105"
          }`}
        />
        <span
          className={`absolute left-5 top-5 rounded-full px-3 py-1.5 text-xs font-semibold text-white ${
            STATUS_TONE[product.status]
          }`}
        >
          {t(productStatusLabels[product.status])}
        </span>
        {/* ไล่เฉดให้ตัวเลขลำดับอ่านออกบนภาพที่สว่าง */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-950/70 to-transparent"
        />
        <span className="absolute bottom-5 right-5 font-serif text-sm tabular-nums text-rice-100/80">
          {String(position).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* ---- ข้อมูลเบื้องต้น ---- */}
      <div className="flex flex-col justify-center gap-5 p-7 sm:p-10">
        <Reveal active={active} delay={80}>
          {category ? (
            <p className="text-xs font-semibold tracking-label text-leaf-300">{t(category.title)}</p>
          ) : null}
        </Reveal>

        <Reveal active={active} delay={140} as="h3">
          <span className="font-serif text-2xl leading-snug font-semibold text-rice-100 sm:text-3xl">
            <Link href={`/shop/${product.slug}`} className="hover:text-leaf-200">
              {t(product.name)}
            </Link>
          </span>
        </Reveal>

        <Reveal active={active} delay={200}>
          <p className="text-md leading-relaxed text-ink-200">{t(product.excerpt)}</p>
        </Reveal>

        {/* ข้อมูลเบื้องต้นแบบย่อ */}
        <Reveal active={active} delay={260} as="dl" className="grid grid-cols-2 gap-4 border-y border-white/10 py-5">
          <div>
            <dt className="text-2xs text-ink-400">รูปแบบ</dt>
            <dd className="mt-1 text-sm font-medium text-rice-100">
              {t(productFormLabels[product.form])}
            </dd>
          </div>
          <div>
            <dt className="text-2xs text-ink-400">ปริมาณสุทธิ</dt>
            <dd className="mt-1 text-sm font-medium text-rice-100">{t(product.netContent)}</dd>
          </div>
          {herbs.length > 0 ? (
            <div className="col-span-2">
              <dt className="text-2xs text-ink-400">สมุนไพรหลัก</dt>
              <dd className="mt-1 text-sm font-medium text-rice-100">{herbs.join(" · ")}</dd>
            </div>
          ) : null}
        </Reveal>

        <Reveal active={active} delay={320} className="flex flex-wrap gap-2">
          {t(product.badges).map((badge) => (
            <Badge key={badge} tone="dark">
              {badge}
            </Badge>
          ))}
        </Reveal>

        <Reveal active={active} delay={380} className="flex flex-wrap items-center gap-4 pt-1">
          <p className="font-serif text-3xl font-bold text-rice-100">
            {product.price === null ? (
              <span className="text-xl text-ink-200">สอบถามราคา</span>
            ) : (
              formatPrice(product.price)
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href={`/shop/${product.slug}`} className={buttonClass("onDark", "px-4 py-2.5 text-sm")}>
              ดูรายละเอียด
            </Link>
            <QuickOrderButton product={product} />
          </div>
        </Reveal>
      </div>
    </article>
  );
}

/**
 * ข้อความที่เลื่อนขึ้นมาพร้อมจางเข้าเมื่อสไลด์ถูกแสดง
 * ใช้ style แบบ inline เพราะ Tailwind สร้างคลาสตอน build จึงรับค่า delay ที่คำนวณตอนรันไม่ได้
 */
function Reveal({
  active,
  delay,
  className = "",
  as: Tag = "div",
  children,
}: {
  active: boolean;
  delay: number;
  className?: string;
  as?: "div" | "h3" | "dl";
  children: React.ReactNode;
}) {
  return (
    <Tag
      style={{ transitionDelay: active ? `${delay}ms` : "0ms" }}
      className={`transition-all duration-700 ease-craft ${
        active ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

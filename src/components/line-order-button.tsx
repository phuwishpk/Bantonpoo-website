"use client";

import { site } from "@/content/site";
import type { Product, Workshop } from "@/content/types";
import { t } from "@/lib/i18n";
import { CheckIcon, LineIcon } from "./icons";
import { buttonClass } from "./ui";
import { useProductOrder, useWorkshopBooking } from "./use-line-order";

/** ปุ่มหลักในหน้ารายละเอียดสินค้า */
export function ProductOrderButton({ product, className = "" }: { product: Product; className?: string }) {
  const { copied, handleClick } = useProductOrder(product);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <button type="button" onClick={handleClick} className={buttonClass("primary", "w-full py-3.5 text-base")}>
        {copied ? <CheckIcon /> : <LineIcon />}
        {copied ? "คัดลอกแล้ว — วางในแชทได้เลย" : "สั่งซื้อผ่าน LINE"}
      </button>
      <p aria-live="polite" className="text-center text-xs text-forged-500">
        {copied
          ? `เปิดแชท ${site.lineId} แล้ว กดวางข้อความเพื่อส่งให้ช่างได้ทันที`
          : "กดแล้วระบบจะคัดลอกรายละเอียดสินค้าให้อัตโนมัติ"}
      </p>
    </div>
  );
}

/** ปุ่มขนาดเล็กบนการ์ดสินค้าในหน้าแรก */
export function QuickOrderButton({ product }: { product: Product }) {
  const { copied, handleClick } = useProductOrder(product);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`สั่งซื้อ ${t(product.name)} ผ่าน LINE`}
      className="relative z-10 inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-steel-800 px-3 py-2 text-xs font-semibold text-white transition duration-200 ease-craft hover:bg-ember-500"
    >
      {copied ? <CheckIcon className="h-4 w-4" /> : <LineIcon className="h-4 w-4" />}
      {copied ? "คัดลอกแล้ว" : "สั่งซื้อด่วน"}
    </button>
  );
}

/** ปุ่มจองกิจกรรม/เวิร์กช็อป */
export function WorkshopBookingButton({ workshop }: { workshop: Workshop }) {
  const { copied, handleClick } = useWorkshopBooking(workshop);

  return (
    <button type="button" onClick={handleClick} className={buttonClass("primary", "w-full sm:w-auto")}>
      {copied ? <CheckIcon /> : <LineIcon />}
      {copied ? "คัดลอกแล้ว — วางในแชทได้เลย" : "จองกิจกรรมผ่าน LINE"}
    </button>
  );
}

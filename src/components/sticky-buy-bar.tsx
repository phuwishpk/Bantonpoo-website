"use client";

import { useEffect, useState } from "react";
import { productStatusLabels } from "@/content/products";
import type { Product } from "@/content/types";
import { formatPrice } from "@/lib/format";
import { t } from "@/lib/i18n";
import { CheckIcon, LineIcon } from "./icons";
import { useProductOrder } from "./use-line-order";

/**
 * แถบสั่งซื้อติดล่างจอบนมือถือ
 *
 * จะโผล่ขึ้นมาเมื่อผู้ใช้เลื่อนผ่านปุ่มสั่งซื้อหลักไปแล้ว ทำให้กดสั่งซื้อได้ทันที
 * โดยไม่ต้องเลื่อนกลับขึ้นไปหาปุ่ม
 *
 * @param anchorId id ของกล่องปุ่มสั่งซื้อหลัก ใช้เป็นจุดอ้างอิงว่าเลื่อนพ้นหรือยัง
 */
export function StickyBuyBar({ product, anchorId }: { product: Product; anchorId: string }) {
  const [visible, setVisible] = useState(false);
  const { copied, handleClick } = useProductOrder(product);

  useEffect(() => {
    const anchor = document.getElementById(anchorId);
    if (!anchor) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // แสดงแถบเมื่อปุ่มหลักเลื่อนพ้นขอบบนของจอไปแล้วเท่านั้น
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );

    observer.observe(anchor);
    return () => observer.disconnect();
  }, [anchorId]);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-rice-300 bg-rice-50/95 backdrop-blur transition-transform duration-300 ease-craft lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-forged-500">{t(productStatusLabels[product.status])}</p>
          <p className="font-serif text-lg font-semibold text-steel-800">
            {product.price === null ? (
              <span className="text-base">สอบถามราคา</span>
            ) : (
              formatPrice(product.price)
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          tabIndex={visible ? 0 : -1}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-ember-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-ember-600"
        >
          {copied ? <CheckIcon className="h-[18px] w-[18px]" /> : <LineIcon className="h-[18px] w-[18px]" />}
          {copied ? "คัดลอกแล้ว" : "แอดไลน์สั่งซื้อ"}
        </button>
      </div>
    </div>
  );
}

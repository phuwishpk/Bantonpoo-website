"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { productCategories } from "@/content/categories";
import { productStatusLabels, steelTypeLabels } from "@/content/products";
import type { Product, ProductStatus, SteelType } from "@/content/types";
import { t } from "@/lib/i18n";
import { FilterGroup } from "./filter-group";
import { CloseIcon, FilterIcon, SearchIcon } from "./icons";
import { ProductCard } from "./product-card";
import { buttonClass } from "./ui";

export type ShopFilters = {
  categories: string[];
  steels: SteelType[];
  statuses: ProductStatus[];
  query: string;
  sort: SortKey;
};

export type SortKey = "recommended" | "price-asc" | "price-desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recommended", label: "แนะนำ" },
  { value: "price-asc", label: "ราคาน้อยไปมาก" },
  { value: "price-desc", label: "ราคามากไปน้อย" },
];

const STEEL_ORDER: SteelType[] = ["spring-steel", "d2", "damascus", "carbon-1095", "other"];
const STATUS_ORDER: ProductStatus[] = ["in-stock", "made-to-order", "sold-out"];

/**
 * หน้าคัดกรองสินค้า
 *
 * กรองฝั่งไคลเอนต์เพื่อให้ผลลัพธ์เปลี่ยนทันทีที่กด แล้วซิงก์เงื่อนไขขึ้น URL
 * ด้วย history.replaceState (ไม่เกิดการโหลดหน้าใหม่) เพื่อให้ผู้ใช้คัดลอกลิงก์
 * ผลการกรองไปส่งต่อได้ ค่าเริ่มต้นอ่านจาก query string ฝั่งเซิร์ฟเวอร์
 * จึงไม่มีอาการกระพริบตอนเปิดลิงก์ที่มีตัวกรองอยู่แล้ว
 */
export function ShopBrowser({ products, initial }: { products: Product[]; initial: ShopFilters }) {
  const [filters, setFilters] = useState<ShopFilters>(initial);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.categories.length) params.set("category", filters.categories.join(","));
    if (filters.steels.length) params.set("steel", filters.steels.join(","));
    if (filters.statuses.length) params.set("status", filters.statuses.join(","));
    if (filters.query.trim()) params.set("q", filters.query.trim());
    if (filters.sort !== "recommended") params.set("sort", filters.sort);

    const query = params.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }, [filters]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  const toggle = useCallback(<K extends "categories" | "steels" | "statuses">(key: K, value: ShopFilters[K][number]) => {
    setFilters((current) => {
      const list = current[key] as string[];
      const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
      return { ...current, [key]: next } as ShopFilters;
    });
  }, []);

  const searchText = filters.query.trim().toLowerCase();

  /** นับจำนวนสินค้าของแต่ละตัวเลือก โดยไม่นับตัวกรองของกลุ่มตัวเอง */
  const countBy = useCallback(
    (dimension: "category" | "steel" | "status", value: string) =>
      products.filter((product) => {
        if (dimension !== "category" && filters.categories.length && !filters.categories.includes(product.categorySlug))
          return false;
        if (dimension !== "steel" && filters.steels.length && !filters.steels.includes(product.steelType)) return false;
        if (dimension !== "status" && filters.statuses.length && !filters.statuses.includes(product.status))
          return false;

        if (dimension === "category") return product.categorySlug === value;
        if (dimension === "steel") return product.steelType === value;
        return product.status === value;
      }).length,
    [products, filters.categories, filters.steels, filters.statuses]
  );

  const visible = useMemo(() => {
    const filtered = products.filter((product) => {
      if (filters.categories.length && !filters.categories.includes(product.categorySlug)) return false;
      if (filters.steels.length && !filters.steels.includes(product.steelType)) return false;
      if (filters.statuses.length && !filters.statuses.includes(product.status)) return false;
      if (searchText) {
        const haystack = [t(product.name), product.sku, t(product.excerpt), t(product.handleMaterial)]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(searchText)) return false;
      }
      return true;
    });

    if (filters.sort === "recommended") return filtered;

    // สินค้าที่ยังไม่ระบุราคา (สอบถามราคา) ให้อยู่ท้ายเสมอไม่ว่าจะเรียงทางไหน
    return [...filtered].sort((a, b) => {
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      return filters.sort === "price-asc" ? a.price - b.price : b.price - a.price;
    });
  }, [products, filters, searchText]);

  const activeCount = filters.categories.length + filters.steels.length + filters.statuses.length;
  const hasAnyFilter = activeCount > 0 || searchText.length > 0;

  const resetFilters = () =>
    setFilters({ categories: [], steels: [], statuses: [], query: "", sort: filters.sort });

  const filterPanel = (
    <div className="flex flex-col gap-5">
      <FilterGroup
        legend="หมวดหมู่สินค้า"
        selected={filters.categories}
        onToggle={(value) => toggle("categories", value)}
        options={productCategories.map((category) => ({
          value: category.slug,
          label: t(category.title),
          count: countBy("category", category.slug),
        }))}
      />
      <FilterGroup
        legend="ชนิดเหล็ก / วัสดุ"
        selected={filters.steels}
        onToggle={(value) => toggle("steels", value)}
        options={STEEL_ORDER.map((steel) => ({
          value: steel,
          label: t(steelTypeLabels[steel]),
          count: countBy("steel", steel),
        }))}
      />
      <FilterGroup
        legend="สถานะสินค้า"
        selected={filters.statuses}
        onToggle={(value) => toggle("statuses", value)}
        options={STATUS_ORDER.map((status) => ({
          value: status,
          label: t(productStatusLabels[status]),
          count: countBy("status", status),
        }))}
      />
      {hasAnyFilter ? (
        <button type="button" onClick={resetFilters} className={buttonClass("secondary", "w-full py-2.5 text-sm")}>
          ล้างตัวกรองทั้งหมด
        </button>
      ) : null}
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-10">
      {/* แถบตัวกรองด้านข้าง — เดสก์ท็อป */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <h2 className="mb-5 font-serif text-lg font-semibold text-steel-800">ตัวกรอง</h2>
          {filterPanel}
        </div>
      </aside>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-forged-400" />
            <input
              type="search"
              value={filters.query}
              onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
              placeholder="ค้นหาชื่อมีดหรือรหัสสินค้า"
              aria-label="ค้นหาสินค้า"
              className="w-full rounded-lg border border-rice-300 bg-rice-50 py-3 pl-11 pr-4 text-sm text-steel-800 placeholder:text-forged-400 focus:border-steel-800 focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className={buttonClass("secondary", "flex-1 py-3 text-sm lg:hidden")}
            >
              <FilterIcon className="h-[18px] w-[18px]" />
              ตัวกรอง
              {activeCount > 0 ? (
                <span className="ml-1 rounded-full bg-ember-500 px-1.5 py-0.5 text-[0.6875rem] text-white">
                  {activeCount}
                </span>
              ) : null}
            </button>

            <label className="flex items-center gap-2 rounded-lg border border-rice-300 bg-rice-50 px-3 text-sm">
              <span className="whitespace-nowrap text-forged-500">เรียงตาม</span>
              <select
                value={filters.sort}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, sort: event.target.value as SortKey }))
                }
                className="bg-transparent py-3 pr-1 font-medium text-steel-800 focus:outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <p className="text-sm text-forged-500" aria-live="polite">
          พบ <span className="font-semibold text-steel-800">{visible.length}</span> รายการ
          {hasAnyFilter ? " จากเงื่อนไขที่เลือก" : ""}
        </p>

        {visible.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-5">
            {visible.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-rice-400 bg-rice-50 px-6 py-16 text-center">
            <p className="font-serif text-lg text-steel-800">ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
            <p className="mt-2 text-sm text-forged-500">
              ลองลดตัวกรองลง หรือทักไลน์มาสอบถามช่างโดยตรงได้เลย เรารับงานสั่งทำเฉพาะราย
            </p>
            <button type="button" onClick={resetFilters} className={buttonClass("secondary", "mt-5")}>
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* แถบตัวกรอง — มือถือ */}
      <div className={`fixed inset-0 z-50 lg:hidden ${drawerOpen ? "" : "pointer-events-none"}`} aria-hidden={!drawerOpen}>
        <button
          type="button"
          tabIndex={-1}
          aria-label="ปิดตัวกรอง"
          onClick={() => setDrawerOpen(false)}
          className={`absolute inset-0 bg-steel-950/60 transition-opacity duration-300 ${
            drawerOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="ตัวกรองสินค้า"
          className={`absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-rice-100 transition-transform duration-300 ease-craft ${
            drawerOpen ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="sticky top-0 flex items-center justify-between border-b border-rice-300 bg-rice-100 px-5 py-4">
            <h2 className="font-serif text-lg font-semibold text-steel-800">ตัวกรอง</h2>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="rounded-lg p-2 text-steel-700 transition-colors hover:bg-rice-200"
              aria-label="ปิดตัวกรอง"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="px-5 py-5">{filterPanel}</div>
          <div className="sticky bottom-0 border-t border-rice-300 bg-rice-100 px-5 py-4">
            <button type="button" onClick={() => setDrawerOpen(false)} className={buttonClass("primary", "w-full")}>
              ดูสินค้า {visible.length} รายการ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

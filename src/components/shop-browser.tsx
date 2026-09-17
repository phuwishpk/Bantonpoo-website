"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { productFormLabels, productStatusLabels } from "@/lib/product-labels";
import type { Category, Product, ProductForm, ProductStatus } from "@/content/types";
import { t } from "@/lib/i18n";
import { FilterGroup } from "./filter-group";
import { CloseIcon, FilterIcon, GridIcon, SearchIcon, SlidesIcon } from "./icons";
import { ProductCard } from "./product-card";
import { adminDoc } from "@/lib/cms/edit-links";
import { ProductCatalog } from "./product-catalog";
import { buttonClass } from "./ui";
import { useLabels } from "./site-context";

export type ShopFilters = {
  categories: string[];
  forms: ProductForm[];
  statuses: ProductStatus[];
  query: string;
  sort: SortKey;
  /** มุมมองการแสดงผล — แคตตาล็อกสไลด์ หรือตารางสินค้า */
  view: ViewMode;
};

export type ViewMode = "slide" | "grid";

export type SortKey = "recommended" | "price-asc" | "price-desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recommended", label: "แนะนำ" },
  { value: "price-asc", label: "ราคาน้อยไปมาก" },
  { value: "price-desc", label: "ราคามากไปน้อย" },
];

const FORM_ORDER: ProductForm[] = [
  "liquid-balm",
  "solid-balm",
  "massage-oil",
  "compress",
  "soap",
  "tea",
  "dried-herb",
  "other",
];
const STATUS_ORDER: ProductStatus[] = ["in-stock", "made-to-order", "sold-out"];

/**
 * หน้าคัดกรองสินค้า
 *
 * กรองฝั่งไคลเอนต์เพื่อให้ผลลัพธ์เปลี่ยนทันทีที่กด แล้วซิงก์เงื่อนไขขึ้น URL
 * ด้วย history.replaceState (ไม่เกิดการโหลดหน้าใหม่) เพื่อให้ผู้ใช้คัดลอกลิงก์
 * ผลการกรองไปส่งต่อได้ ค่าเริ่มต้นอ่านจาก query string ฝั่งเซิร์ฟเวอร์
 * จึงไม่มีอาการกระพริบตอนเปิดลิงก์ที่มีตัวกรองอยู่แล้ว
 */
export function ShopBrowser({
  products,
  categories,
  initial,
  emptyState,
  editing = false,
}: {
  products: Product[];
  categories: Category[];
  initial: ShopFilters;
  emptyState: { title: string; body: string };
  /** อยู่ในโหมดแก้ไขหรือไม่ — ตัดสินใจฝั่งเซิร์ฟเวอร์แล้วส่งมา */
  editing?: boolean;
}) {
  const [filters, setFilters] = useState<ShopFilters>(initial);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const labels = useLabels();

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.categories.length) params.set("category", filters.categories.join(","));
    if (filters.forms.length) params.set("steel", filters.forms.join(","));
    if (filters.statuses.length) params.set("status", filters.statuses.join(","));
    if (filters.query.trim()) params.set("q", filters.query.trim());
    if (filters.sort !== "recommended") params.set("sort", filters.sort);
    if (filters.view !== "slide") params.set("view", filters.view);

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

  const toggle = useCallback(<K extends "categories" | "forms" | "statuses">(key: K, value: ShopFilters[K][number]) => {
    setFilters((current) => {
      const list = current[key] as string[];
      const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
      return { ...current, [key]: next } as ShopFilters;
    });
  }, []);

  const searchText = filters.query.trim().toLowerCase();

  /** นับจำนวนสินค้าของแต่ละตัวเลือก โดยไม่นับตัวกรองของกลุ่มตัวเอง */
  const countBy = useCallback(
    (dimension: "category" | "form" | "status", value: string) =>
      products.filter((product) => {
        if (dimension !== "category" && filters.categories.length && !filters.categories.includes(product.category.slug))
          return false;
        if (dimension !== "form" && filters.forms.length && !filters.forms.includes(product.form)) return false;
        if (dimension !== "status" && filters.statuses.length && !filters.statuses.includes(product.status))
          return false;

        if (dimension === "category") return product.category.slug === value;
        if (dimension === "form") return product.form === value;
        return product.status === value;
      }).length,
    [products, filters.categories, filters.forms, filters.statuses]
  );

  const visible = useMemo(() => {
    const filtered = products.filter((product) => {
      if (filters.categories.length && !filters.categories.includes(product.category.slug)) return false;
      if (filters.forms.length && !filters.forms.includes(product.form)) return false;
      if (filters.statuses.length && !filters.statuses.includes(product.status)) return false;
      if (searchText) {
        // ค้นหาครอบคลุมชื่อ รหัส คำโปรย และชื่อสมุนไพรในตำรับ
        const haystack = [t(product.name), product.sku, t(product.excerpt), ...t(product.mainHerbs)]
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

  const activeCount = filters.categories.length + filters.forms.length + filters.statuses.length;
  const hasAnyFilter = activeCount > 0 || searchText.length > 0;

  const resetFilters = () =>
    setFilters({ categories: [], forms: [], statuses: [], query: "", sort: filters.sort, view: filters.view });

  const filterPanel = (
    <div className="flex flex-col gap-5">
      <FilterGroup
        legend="หมวดหมู่สินค้า"
        selected={filters.categories}
        onToggle={(value) => toggle("categories", value)}
        options={categories.map((category) => ({
          value: category.slug,
          label: t(category.title),
          count: countBy("category", category.slug),
        }))}
      />
      <FilterGroup
        legend="รูปแบบผลิตภัณฑ์"
        selected={filters.forms}
        onToggle={(value) => toggle("forms", value)}
        options={FORM_ORDER.map((form) => ({
          value: form,
          label: t(productFormLabels[form]),
          count: countBy("form", form),
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
          <h2 className="mb-5 font-serif text-lg font-semibold text-ink-800">{labels.product.filters}</h2>
          {filterPanel}
        </div>
      </aside>

      {/* min-w-0 จำเป็น: กริดคอลัมน์ 1fr มี min-width: auto โดยปริยาย
          ถ้าไม่ใส่ แถบสไลด์ที่กว้างรวมกันหลายเท่าจอจะดันคอลัมน์นี้จนล้นออกนอกหน้า */}
      <div className="flex min-w-0 flex-col gap-5">
        {/*
          วางช่องค้นหาแถวเดียวกับปุ่มตั้งแต่ md — ที่ sm ถ้าวางแถวเดียวกัน ช่องค้นหาเหลือแคบจนอ่านคำแนะนำไม่ได้
          บนมือถือกล่องเรียงลำดับขึ้นบรรทัดใหม่เต็มความกว้าง ไม่งั้นทั้งแถวล้นขอบจอ
        */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-river-400" />
            <input
              type="search"
              value={filters.query}
              onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
              placeholder="ค้นหาชื่อสินค้า รหัส หรือชื่อสมุนไพร"
              aria-label="ค้นหาสินค้า"
              className="w-full rounded-lg border border-rice-300 bg-rice-50 py-3 pl-11 pr-4 text-sm text-ink-800 placeholder:text-river-400 focus:border-ink-800 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className={buttonClass("secondary", "flex-1 py-3 text-sm lg:hidden")}
            >
              <FilterIcon className="h-[18px] w-[18px]" />
              ตัวกรอง
              {activeCount > 0 ? (
                <span className="ml-1 rounded-full bg-leaf-500 px-1.5 py-0.5 text-2xs text-white">
                  {activeCount}
                </span>
              ) : null}
            </button>

            <div
              role="group"
              aria-label="รูปแบบการแสดงสินค้า"
              className="flex shrink-0 items-center gap-1 rounded-lg border border-rice-300 bg-rice-50 p-1"
            >
              {(
                [
                  { value: "slide", label: "แคตตาล็อกสไลด์", icon: SlidesIcon },
                  { value: "grid", label: "ตารางสินค้า", icon: GridIcon },
                ] as const
              ).map((option) => {
                const Icon = option.icon;
                const selected = filters.view === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    aria-label={option.label}
                    title={option.label}
                    onClick={() => setFilters((current) => ({ ...current, view: option.value }))}
                    className={`rounded-md p-2 transition duration-200 ease-craft ${
                      selected ? "bg-ink-800 text-rice-100" : "text-ink-500 hover:bg-rice-200"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </button>
                );
              })}
            </div>

            <label className="flex w-full items-center gap-2 rounded-lg border border-rice-300 bg-rice-50 px-3 text-sm sm:w-auto">
              <span className="whitespace-nowrap text-river-500">{labels.product.sortBy}</span>
              <select
                value={filters.sort}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, sort: event.target.value as SortKey }))
                }
                className="min-w-0 flex-1 bg-transparent py-3 pr-1 font-medium text-ink-800 focus:outline-none"
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

        <p className="text-sm text-river-500" aria-live="polite">
          พบ <span className="font-semibold text-ink-800">{visible.length}</span>{" "}
          {labels.product.resultsUnit}
          {hasAnyFilter ? " จากเงื่อนไขที่เลือก" : ""}
        </p>

        {visible.length > 0 ? (
          filters.view === "slide" ? (
            // key ผูกกับเงื่อนไขการกรอง เพื่อให้สไลด์เริ่มที่ชิ้นแรกทุกครั้งที่ผลลัพธ์เปลี่ยน
            <ProductCatalog
              key={visible.map((product) => product.slug).join("-")}
              products={visible}
              editing={editing}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-5">
              {visible.map((product) => (
                <ProductCard labels={labels.general}
                  key={product.slug}
                  product={product}
                  editHref={editing ? adminDoc("products", product.id) : undefined}
                />
              ))}
            </div>
          )
        ) : (
          <div className="rounded-card border border-dashed border-rice-400 bg-rice-50 px-6 py-16 text-center">
            <p className="font-serif text-lg text-ink-800">{emptyState.title}</p>
            <p className="mt-2 text-sm text-river-500">{emptyState.body}</p>
            <button type="button" onClick={resetFilters} className={buttonClass("secondary", "mt-5")}>
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        )}
      </div>

      {/* แถบตัวกรอง — มือถือ */}
      {/* invisible ตอนปิด เพื่อให้ปุ่มในแผงที่เลื่อนออกนอกจอไม่ถูกโฟกัสด้วย Tab (ดู drawer ใน site-header) */}
      <div
        className={`fixed inset-0 z-50 transition-[visibility] duration-300 lg:hidden ${
          drawerOpen ? "visible" : "pointer-events-none invisible"
        }`}
        aria-hidden={!drawerOpen}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="ปิดตัวกรอง"
          onClick={() => setDrawerOpen(false)}
          className={`absolute inset-0 bg-ink-950/60 transition-opacity duration-300 ${
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
            <h2 className="font-serif text-lg font-semibold text-ink-800">{labels.product.filters}</h2>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="rounded-lg p-2 text-ink-700 transition-colors hover:bg-rice-200"
              aria-label="ปิดตัวกรอง"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="px-5 py-5">{filterPanel}</div>
          <div className="sticky bottom-0 border-t border-rice-300 bg-rice-100 px-5 py-4">
            <button type="button" onClick={() => setDrawerOpen(false)} className={buttonClass("primary", "w-full")}>
              ดูสินค้า {visible.length} {labels.product.resultsUnit}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

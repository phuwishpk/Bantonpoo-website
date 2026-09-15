"use client";

import { useEffect, useMemo, useState } from "react";
import { articleCategories } from "@/content/categories";
import type { Article } from "@/content/types";
import { t } from "@/lib/i18n";
import { ArticleCard } from "./article-card";
import { SearchIcon } from "./icons";
import { buttonClass } from "./ui";

/**
 * หน้ารวมบทความ พร้อมตัวกรองหมวดหมู่และช่องค้นหา
 * ซิงก์เงื่อนไขขึ้น URL เช่นเดียวกับหน้าสินค้า เพื่อให้แชร์ลิงก์ผลการกรองได้
 */
export function StoriesBrowser({
  articles,
  initialCategory,
  initialQuery,
}: {
  articles: Article[];
  initialCategory: string | null;
  initialQuery: string;
}) {
  const [category, setCategory] = useState<string | null>(initialCategory);
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (query.trim()) params.set("q", query.trim());
    const search = params.toString();
    window.history.replaceState(null, "", search ? `?${search}` : window.location.pathname);
  }, [category, query]);

  const searchText = query.trim().toLowerCase();

  const visible = useMemo(
    () =>
      articles.filter((article) => {
        if (category && article.categorySlug !== category) return false;
        if (!searchText) return true;
        const haystack = [t(article.title), t(article.excerpt), t(article.author)].join(" ").toLowerCase();
        return haystack.includes(searchText);
      }),
    [articles, category, searchText]
  );

  const tabs = [{ slug: null, label: "ทั้งหมด" }, ...articleCategories.map((c) => ({ slug: c.slug, label: t(c.title) }))];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:px-0" role="tablist" aria-label="หมวดหมู่บทความ">
          {tabs.map((tab) => {
            const active = category === tab.slug;
            return (
              <button
                key={tab.label}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(tab.slug)}
                className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition duration-200 ease-craft ${
                  active
                    ? "bg-ink-800 text-rice-100"
                    : "border border-rice-300 bg-rice-50 text-ink-700 hover:border-ink-400"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative lg:w-80">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-river-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหาเรื่องเล่าและข่าวกิจกรรม"
            aria-label="ค้นหาบทความ"
            className="w-full rounded-lg border border-rice-300 bg-rice-50 py-3 pl-11 pr-4 text-sm text-ink-800 placeholder:text-river-400 focus:border-ink-800 focus:outline-none"
          />
        </div>
      </div>

      <p className="text-sm text-river-500" aria-live="polite">
        พบ <span className="font-semibold text-ink-800">{visible.length}</span> บทความ
      </p>

      {visible.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((article, index) => (
            <ArticleCard key={article.slug} article={article} priority={index < 3} />
          ))}
        </div>
      ) : (
        <div className="rounded-card border border-dashed border-rice-400 bg-rice-50 px-6 py-16 text-center">
          <p className="font-serif text-lg text-ink-800">ไม่พบบทความที่ตรงกับคำค้น</p>
          <p className="mt-2 text-sm text-river-500">ลองใช้คำที่สั้นลง หรือเลือกดูจากหมวดหมู่ทั้งหมด</p>
          <button
            type="button"
            onClick={() => {
              setCategory(null);
              setQuery("");
            }}
            className={buttonClass("secondary", "mt-5")}
          >
            ล้างตัวกรอง
          </button>
        </div>
      )}
    </div>
  );
}

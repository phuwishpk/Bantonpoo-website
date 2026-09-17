"use client";

import { useEffect, useMemo, useState } from "react";
import type { Article, Category } from "@/content/types";
import { t } from "@/lib/i18n";
import { adminDoc } from "@/lib/cms/edit-links";
import { ArticleCard } from "./article-card";
import { SearchIcon } from "./icons";
import { buttonClass } from "./ui";
import { useLabels } from "./site-context";
import { INK, type Tone } from "@/lib/tone";

/**
 * หน้ารวมบทความ พร้อมตัวกรองหมวดหมู่และช่องค้นหา
 * ซิงก์เงื่อนไขขึ้น URL เช่นเดียวกับหน้าสินค้า เพื่อให้แชร์ลิงก์ผลการกรองได้
 */
export function StoriesBrowser({
  articles,
  categories,
  initialCategory,
  initialQuery,
  emptyState,
  editing = false,
  tone = "dark",
  cardTone = "dark",
}: {
  articles: Article[];
  categories: Category[];
  initialCategory: string | null;
  initialQuery: string;
  emptyState: { title: string; body: string };
  editing?: boolean;
  /** โทนตัวอักษรของส่วนนี้ (ตามสีพื้นที่ผู้ดูแลเลือก) */
  tone?: Tone;
  /** โทนของการ์ดบทความ */
  cardTone?: Tone;
}) {
  const labels = useLabels();
  const ink = INK[tone];
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
        if (category && article.category.slug !== category) return false;
        if (!searchText) return true;
        const haystack = [t(article.title), t(article.excerpt), t(article.author)].join(" ").toLowerCase();
        return haystack.includes(searchText);
      }),
    [articles, category, searchText]
  );

  const tabs = [{ slug: null, label: "ทั้งหมด" }, ...categories.map((c) => ({ slug: c.slug, label: t(c.title) }))];

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
                    ? tone === "light"
                      ? "bg-rice-100 text-ink-800"
                      : "bg-ink-800 text-rice-100"
                    : `border ${ink.control}`
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative lg:w-80">
          <SearchIcon
            className={`pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 ${ink.muted}`}
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหาเรื่องเล่าและข่าวกิจกรรม"
            aria-label="ค้นหาบทความ"
            className={`w-full rounded-lg border py-3 pl-11 pr-4 text-sm focus:outline-none ${ink.field}`}
          />
        </div>
      </div>

      <p className={`text-sm ${ink.body}`} aria-live="polite">
        พบ <span className={`font-semibold ${ink.title}`}>{visible.length}</span> บทความ
      </p>

      {visible.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((article, index) => (
            <ArticleCard labels={labels.article}
              key={article.slug}
              article={article}
              priority={index < 3}
              editHref={editing ? adminDoc("articles", article.id) : undefined}
              tone={cardTone}
            />
          ))}
        </div>
      ) : (
        <div className={`rounded-card border border-dashed px-6 py-16 text-center ${INK[cardTone].empty}`}>
          <p className={`font-serif text-lg ${INK[cardTone].title}`}>{emptyState.title}</p>
          <p className={`mt-2 text-sm ${INK[cardTone].body}`}>{emptyState.body}</p>
          <button
            type="button"
            onClick={() => {
              setCategory(null);
              setQuery("");
            }}
            className={buttonClass(cardTone === "light" ? "onDark" : "secondary", "mt-5")}
          >
            ล้างตัวกรอง
          </button>
        </div>
      )}
    </div>
  );
}

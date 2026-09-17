import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/content/types";
import { estimateReadingMinutes, formatThaiDateShort } from "@/lib/format";
import { DEFAULT_LABELS, type Labels } from "@/lib/labels";
import { t } from "@/lib/i18n";
import { EditButton } from "./edit-mode";
import { InlineImageEdit } from "./inline-image";

export function ArticleCard({
  article,
  layout = "vertical",
  priority = false,
  editHref,
  labels = DEFAULT_LABELS.article,
}: {
  article: Article;
  layout?: "vertical" | "horizontal";
  priority?: boolean;
  /** ส่งมาเฉพาะตอนอยู่ในโหมดแก้ไข — เปิดปุ่มเปลี่ยนภาพหน้าปกด้วย */
  editHref?: string;
  /** ป้ายกำกับจากหลังบ้าน — รับเป็น prop ด้วยเหตุผลเดียวกับ ProductCard */
  labels?: Labels["article"];
}) {
  const category = article.category;
  const minutes = estimateReadingMinutes(article);
  const coverEdit = editHref ? (
    <InlineImageEdit
      at={`c:articles:${article.id}:coverImage`}
      label="ภาพหน้าปก"
      current={article.coverImage.id}
    />
  ) : null;

  if (layout === "horizontal") {
    return (
      <article className="group relative flex gap-4 rounded-card border border-rice-300 bg-rice-50 p-3 transition duration-300 ease-craft hover:border-rice-400 hover:shadow-lift">
        <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-ink-800">
          <Image
            src={article.coverImage.url}
            alt={t(article.coverImage.alt)}
            width={article.coverImage.width}
            height={article.coverImage.height}
            sizes="112px"
            className="h-full w-full object-cover transition duration-500 ease-craft group-hover:scale-105"
          />
          {coverEdit}
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-1.5">
          {category ? (
            <p className="text-2xs font-semibold text-leaf-600">{t(category.title)}</p>
          ) : null}
          <h3 className="font-serif text-md leading-snug font-semibold text-ink-800">
            <Link href={`/stories/${article.slug}`} className="after:absolute after:inset-0 after:content-['']">
              {t(article.title)}
            </Link>
          </h3>
          <p className="text-xs text-river-500">
            {formatThaiDateShort(article.publishedAt)} · {minutes} {labels.minutes}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card border border-rice-300 bg-rice-50 transition duration-300 ease-craft hover:-translate-y-1 hover:border-rice-400 hover:shadow-lift">
      {editHref ? <EditButton href={editHref} label="แก้บทความนี้" /> : null}

      <div className="relative aspect-[16/10] overflow-hidden bg-ink-800">
        <Image
          src={article.coverImage.url}
          alt={t(article.coverImage.alt)}
          width={article.coverImage.width}
          height={article.coverImage.height}
          priority={priority}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="h-full w-full object-cover transition duration-500 ease-craft group-hover:scale-[1.04]"
        />
        {coverEdit}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* การ์ดแคบ (สามคอลัมน์บนแท็บเล็ต) ให้วันที่ขึ้นบรรทัดใหม่ทั้งก้อน ไม่แตกเป็น "3 ก.ย." กับ "69" */}
        <div className="flex flex-wrap items-center gap-x-2 text-2xs font-semibold">
          {category ? <span className="text-leaf-600">{t(category.title)}</span> : null}
          <span aria-hidden className="text-rice-400">
            ·
          </span>
          <span className="whitespace-nowrap text-river-500">{formatThaiDateShort(article.publishedAt)}</span>
        </div>

        <h3 className="font-serif text-lg leading-snug font-semibold text-ink-800">
          <Link href={`/stories/${article.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {t(article.title)}
          </Link>
        </h3>

        <p className="line-clamp-3 text-sm leading-relaxed text-river-500">{t(article.excerpt)}</p>

        <p className="mt-auto pt-2 text-xs text-river-400">{labels.readTime} {minutes} {labels.minutes}</p>
      </div>
    </article>
  );
}

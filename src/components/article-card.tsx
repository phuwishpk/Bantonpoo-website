import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/content/types";
import { estimateReadingMinutes, formatThaiDateShort } from "@/lib/format";
import { t } from "@/lib/i18n";
import { EditButton } from "./edit-mode";

export function ArticleCard({
  article,
  layout = "vertical",
  priority = false,
  editHref,
}: {
  article: Article;
  layout?: "vertical" | "horizontal";
  priority?: boolean;
  /** ส่งมาเฉพาะตอนอยู่ในโหมดแก้ไข */
  editHref?: string;
}) {
  const category = article.category;
  const minutes = estimateReadingMinutes(article);

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
            {formatThaiDateShort(article.publishedAt)} · อ่าน {minutes} นาที
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
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-2xs font-semibold">
          {category ? <span className="text-leaf-600">{t(category.title)}</span> : null}
          <span aria-hidden className="text-rice-400">
            ·
          </span>
          <span className="text-river-500">{formatThaiDateShort(article.publishedAt)}</span>
        </div>

        <h3 className="font-serif text-lg leading-snug font-semibold text-ink-800">
          <Link href={`/stories/${article.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {t(article.title)}
          </Link>
        </h3>

        <p className="line-clamp-3 text-sm leading-relaxed text-river-500">{t(article.excerpt)}</p>

        <p className="mt-auto pt-2 text-xs text-river-400">ใช้เวลาอ่าน {minutes} นาที</p>
      </div>
    </article>
  );
}

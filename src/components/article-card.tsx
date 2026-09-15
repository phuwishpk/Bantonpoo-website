import Image from "next/image";
import Link from "next/link";
import { getCategory } from "@/content/categories";
import type { Article } from "@/content/types";
import { estimateReadingMinutes, formatThaiDateShort } from "@/lib/format";
import { t } from "@/lib/i18n";

export function ArticleCard({
  article,
  layout = "vertical",
  priority = false,
}: {
  article: Article;
  layout?: "vertical" | "horizontal";
  priority?: boolean;
}) {
  const category = getCategory(article.categorySlug, "article");
  const minutes = estimateReadingMinutes(article);

  if (layout === "horizontal") {
    return (
      <article className="group relative flex gap-4 rounded-card border border-rice-300 bg-rice-50 p-3 transition duration-300 ease-craft hover:border-rice-400 hover:shadow-lift">
        <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-lg bg-steel-800">
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
            <p className="text-[0.6875rem] font-semibold text-ember-600">{t(category.title)}</p>
          ) : null}
          <h3 className="font-serif text-[0.9375rem] leading-snug font-semibold text-steel-800">
            <Link href={`/stories/${article.slug}`} className="after:absolute after:inset-0 after:content-['']">
              {t(article.title)}
            </Link>
          </h3>
          <p className="text-xs text-forged-500">
            {formatThaiDateShort(article.publishedAt)} · อ่าน {minutes} นาที
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card border border-rice-300 bg-rice-50 transition duration-300 ease-craft hover:-translate-y-1 hover:border-rice-400 hover:shadow-lift">
      <div className="relative aspect-[16/10] overflow-hidden bg-steel-800">
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
        <div className="flex items-center gap-2 text-[0.6875rem] font-semibold">
          {category ? <span className="text-ember-600">{t(category.title)}</span> : null}
          <span aria-hidden className="text-rice-400">
            ·
          </span>
          <span className="text-forged-500">{formatThaiDateShort(article.publishedAt)}</span>
        </div>

        <h3 className="font-serif text-lg leading-snug font-semibold text-steel-800">
          <Link href={`/stories/${article.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {t(article.title)}
          </Link>
        </h3>

        <p className="line-clamp-3 text-sm leading-relaxed text-forged-500">{t(article.excerpt)}</p>

        <p className="mt-auto pt-2 text-xs text-forged-400">ใช้เวลาอ่าน {minutes} นาที</p>
      </div>
    </article>
  );
}

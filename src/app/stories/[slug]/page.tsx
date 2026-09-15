import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticleCard } from "@/components/article-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { RichText } from "@/components/rich-text";
import { ShareButtons } from "@/components/share-buttons";
import { ButtonLink, Container, OrnamentDivider, SectionHeading } from "@/components/ui";
import { articles, getArticle, getRelatedArticles } from "@/content/articles";
import { getCategory } from "@/content/categories";
import { getCraftsman } from "@/content/craftsmen";
import { site } from "@/content/site";
import { estimateReadingMinutes, formatThaiDate } from "@/lib/format";
import { t } from "@/lib/i18n";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

/** สร้างทุกหน้าบทความเป็นไฟล์สแตติกตอน build */
export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  return buildMetadata({
    title: t(article.title),
    description: t(article.excerpt),
    path: `/stories/${article.slug}`,
    image: article.coverImage.url,
    type: "article",
    publishedTime: article.publishedAt,
  });
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const category = getCategory(article.categorySlug, "article");
  const craftsman = article.craftsmanSlug ? getCraftsman(article.craftsmanSlug) : undefined;
  const related = getRelatedArticles(article, 3);
  const minutes = estimateReadingMinutes(article);
  const path = `/stories/${article.slug}`;

  const crumbs = [
    { name: "หน้าแรก", path: "/" },
    { name: "เรื่องเล่าชุมชน", path: "/stories" },
    ...(category ? [{ name: t(category.title), path: `/stories?category=${category.slug}` }] : []),
    { name: t(article.title), path },
  ];

  return (
    <article>
      {/* ---------------- ส่วนหัวบทความ ---------------- */}
      <header className="bg-steel-800 pb-10 pt-10 sm:pb-14">
        <Container size="narrow">
          <div className="flex flex-col gap-6">
            <Breadcrumbs items={crumbs} tone="light" />

            <div className="flex flex-col gap-5">
              {category ? (
                <p className="text-xs font-semibold tracking-label text-ember-400">{t(category.title)}</p>
              ) : null}

              <h1 className="font-serif text-[1.75rem] leading-snug font-bold text-rice-100 sm:text-[2.25rem] sm:leading-[1.35]">
                {t(article.title)}
              </h1>

              <p className="text-base leading-relaxed text-steel-200">{t(article.excerpt)}</p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-steel-300">
                <span>เขียนโดย {t(article.author)}</span>
                <span aria-hidden className="text-steel-500">
                  ·
                </span>
                <time dateTime={article.publishedAt}>{formatThaiDate(article.publishedAt)}</time>
                <span aria-hidden className="text-steel-500">
                  ·
                </span>
                <span>ใช้เวลาอ่าน {minutes} นาที</span>
              </div>
            </div>
          </div>
        </Container>
      </header>

      {/* ---------------- ภาพหน้าปก ---------------- */}
      <div className="bg-steel-800">
        <Container size="wide">
          <div className="relative -mb-16 aspect-16/9 overflow-hidden rounded-2xl bg-steel-900 shadow-lift-lg sm:-mb-24">
            <Image
              src={article.coverImage.url}
              alt={t(article.coverImage.alt)}
              width={article.coverImage.width}
              height={article.coverImage.height}
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="h-full w-full object-cover"
            />
          </div>
        </Container>
      </div>

      {/* ---------------- เนื้อหา ---------------- */}
      <div className="pt-24 pb-16 sm:pt-32 sm:pb-20">
        <Container size="narrow">
          <RichText blocks={article.content} />

          <div className="mt-12 border-t border-rice-300 pt-8">
            <ShareButtons path={path} title={t(article.title)} />
          </div>

          {/* กล่องประวัติผู้เขียน */}
          <aside className="mt-8 flex flex-col gap-4 rounded-card border border-rice-300 bg-rice-50 p-6 sm:flex-row sm:items-start sm:gap-6">
            {craftsman ? (
              <Image
                src={craftsman.photo.url}
                alt={t(craftsman.photo.alt)}
                width={craftsman.photo.width}
                height={craftsman.photo.height}
                sizes="80px"
                className="h-20 w-20 shrink-0 rounded-full object-cover"
              />
            ) : null}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold tracking-label text-ember-600">เกี่ยวกับผู้เขียน</p>
              <h2 className="font-serif text-lg font-semibold text-steel-800">{t(article.author)}</h2>
              <p className="text-sm leading-relaxed text-forged-500">
                {craftsman ? t(craftsman.bio) : t(site.aboutSummary)}
              </p>
              <div className="mt-2">
                <ButtonLink href="/about" variant="secondary" className="px-4 py-2 text-sm">
                  รู้จักชุมชนและครูช่างทั้งหมด
                </ButtonLink>
              </div>
            </div>
          </aside>
        </Container>
      </div>

      {/* ---------------- บทความที่เกี่ยวข้อง ---------------- */}
      {related.length > 0 ? (
        <section className="pb-4">
          <Container size="wide">
            <OrnamentDivider />
            <div className="mt-12">
              <SectionHeading eyebrow="อ่านต่อ" title="บทความที่เกี่ยวข้อง" />
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <ArticleCard key={item.slug} article={item} />
                ))}
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      <JsonLd data={[articleJsonLd(article), breadcrumbJsonLd(crumbs)]} />
    </article>
  );
}

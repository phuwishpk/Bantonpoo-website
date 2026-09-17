import Image from "next/image";
import type { Metadata } from "next";
import { ArticleCard } from "@/components/article-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { Ed, EdImage } from "@/components/editable";
import { EditToolbar } from "@/components/edit-mode";
import { RichText } from "@/components/rich-text";
import { ShareButtons } from "@/components/share-buttons";
import { ButtonLink, Container, OrnamentDivider } from "@/components/ui";
import { SectionHeading } from "@/components/section-heading";
import { getArticle, getArticles, getRelatedArticles, getSite } from "@/lib/cms/queries";
import { isDraftMode } from "@/lib/cms/draft";
import { adminDoc, editLinksForDoc } from "@/lib/cms/edit-links";
import { atDoc } from "@/lib/cms/inline";
import { atLabel } from "@/lib/labels";
import { getLabels } from "@/lib/cms/labels";
import { redirectOrNotFound } from "@/lib/cms/redirects";
import { estimateReadingMinutes, formatThaiDate } from "@/lib/format";
import { t } from "@/lib/i18n";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

/** สร้างทุกหน้าบทความเป็นไฟล์สแตติกตอน build */
export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [article, site] = await Promise.all([getArticle(slug), getSite()]);
  if (!article) return {};

  return buildMetadata({
    title: t(article.title),
    description: t(article.excerpt),
    path: `/stories/${article.slug}`,
    siteName: t(site.communityName),
    image: article.coverImage.url,
    type: "article",
    publishedTime: article.publishedAt,
  });
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const [article, site, labels, editing] = await Promise.all([
    getArticle(slug),
    getSite(),
    getLabels(),
    isDraftMode(),
  ]);
  // ลิงก์เก่าที่เคยแชร์ไว้ควรพาไปหน้าใหม่ ไม่ใช่ตกหน้า 404 เงียบ ๆ
  if (!article) return redirectOrNotFound(`/stories/${slug}`);

  const category = article.category;
  const artisan = article.artisan;
  const related = await getRelatedArticles(article, 3);
  const minutes = estimateReadingMinutes(article);
  const path = `/stories/${article.slug}`;

  const at = atDoc("articles", article.id);

  const crumbs = [
    { name: "หน้าแรก", path: "/" },
    { name: "เรื่องเล่าชุมชน", path: "/stories" },
    { name: t(category.title), path: `/stories?category=${category.slug}` },
    { name: t(article.title), path },
  ];

  return (
    <article>
      {/* ---------------- ส่วนหัวบทความ ---------------- */}
      <header className="bg-ink-800 pb-10 pt-10 sm:pb-14">
        <Container size="narrow">
          <div className="flex flex-col gap-6">
            <Breadcrumbs items={crumbs} tone="light" />

            <div className="flex flex-col gap-5">
              <p className="text-xs font-semibold tracking-label text-leaf-300">{t(category.title)}</p>

              <h1 className="font-serif text-display-sm leading-snug font-bold text-rice-100 sm:text-display-md sm:leading-[1.35]">
                <Ed at={at("title")} tone="light">
                  {t(article.title)}
                </Ed>
              </h1>

              <p className="text-base leading-relaxed text-ink-200">
                <Ed at={at("excerpt")} multiline tone="light">
                  {t(article.excerpt)}
                </Ed>
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-300">
                <span>
                  <Ed at={atLabel("article", "writtenBy")} tone="light">
                    {labels.article.writtenBy}
                  </Ed>{" "}
                  {t(article.author)}
                </span>
                <span aria-hidden className="text-ink-500">
                  ·
                </span>
                <time dateTime={article.publishedAt}>{formatThaiDate(article.publishedAt)}</time>
                <span aria-hidden className="text-ink-500">
                  ·
                </span>
                <span>
                  <Ed at={atLabel("article", "readTime")} tone="light">
                    {labels.article.readTime}
                  </Ed>{" "}
                  {minutes}{" "}
                  <Ed at={atLabel("article", "minutes")} tone="light">
                    {labels.article.minutes}
                  </Ed>
                </span>
              </div>
            </div>
          </div>
        </Container>
      </header>

      {/* ---------------- ภาพหน้าปก ---------------- */}
      <div className="bg-ink-800">
        <Container size="wide">
          <div className="relative -mb-16 aspect-16/9 overflow-hidden rounded-2xl bg-ink-900 shadow-lift-lg sm:-mb-24">
            <Image
              src={article.coverImage.url}
              alt={t(article.coverImage.alt)}
              width={article.coverImage.width}
              height={article.coverImage.height}
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="h-full w-full object-cover"
            />
            <EdImage at={at("coverImage")} label="ภาพหน้าปก" current={article.coverImage.id} />
          </div>
        </Container>
      </div>

      {/* ---------------- เนื้อหา ---------------- */}
      <div className="pt-24 pb-16 sm:pt-32 sm:pb-20">
        <Container size="narrow">
          <RichText blocks={article.content} at={at("content")} />

          <div className="mt-12 border-t border-rice-300 pt-8">
            <ShareButtons path={path} title={t(article.title)} />
          </div>

          {/* กล่องประวัติผู้เขียน */}
          <aside className="mt-8 flex flex-col gap-4 rounded-card border border-rice-300 bg-rice-50 p-6 sm:flex-row sm:items-start sm:gap-6">
            {artisan ? (
              <div className="relative shrink-0 self-start rounded-full">
                <Image
                  src={artisan.photo.url}
                  alt={t(artisan.photo.alt)}
                  width={artisan.photo.width}
                  height={artisan.photo.height}
                  sizes="80px"
                  className="h-20 w-20 rounded-full object-cover"
                />
                <EdImage
                  at={`c:artisans:${artisan.id}:photo`}
                  label="ภาพโปรไฟล์ผู้เขียน"
                  current={artisan.photo.id}
                  removable
                  compact
                />
              </div>
            ) : null}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold tracking-label text-leaf-600">
                <Ed at={atLabel("article", "aboutAuthor")}>{labels.article.aboutAuthor}</Ed>
              </p>
              <h2 className="font-serif text-lg font-semibold text-ink-800">{t(article.author)}</h2>
              <p className="text-sm leading-relaxed text-river-500">
                {artisan ? t(artisan.bio) : t(site.aboutSummary)}
              </p>
              <div className="mt-2">
                <ButtonLink href="/about" variant="secondary" className="px-4 py-2 text-sm">
                  <Ed at={atLabel("article", "aboutCommunityButton")}>
                    {labels.article.aboutCommunityButton}
                  </Ed>
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
              <SectionHeading
                atEyebrow={atLabel("article", "relatedEyebrow")}
                atTitle={atLabel("article", "relatedTitle")}
                eyebrow={labels.article.relatedEyebrow}
                title={labels.article.relatedTitle}
              />
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <ArticleCard
                    key={item.slug}
                    article={item}
                    labels={labels.article}
                    editHref={editing ? adminDoc("articles", item.id) : undefined}
                  />
                ))}
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {editing ? <EditToolbar {...editLinksForDoc("article", article.id, t(article.title))} /> : null}

      <JsonLd data={[articleJsonLd(article, site), breadcrumbJsonLd(crumbs)]} />
    </article>
  );
}

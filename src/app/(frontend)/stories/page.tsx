import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { StoriesBrowser } from "@/components/stories-browser";
import { Container } from "@/components/ui";
import { hero, titleBody } from "@/lib/cms/page-content";
import { getArticles, getCategories, getPageGlobal, getSite } from "@/lib/cms/queries";
import { t } from "@/lib/i18n";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

const CRUMBS = [
  { name: "หน้าแรก", path: "/" },
  { name: "เรื่องเล่าชุมชน", path: "/stories" },
];

export async function generateMetadata(): Promise<Metadata> {
  const [site, page, articles] = await Promise.all([
    getSite(),
    getPageGlobal("stories-page"),
    getArticles(),
  ]);
  const content = hero(page);
  return buildMetadata({
    title: t(content.title) || "เรื่องเล่าและข่าวกิจกรรม",
    description: t(content.description) || t(site.aboutSummary),
    path: "/stories",
    siteName: t(site.communityName),
    image: articles[0]?.coverImage.url,
  });
}

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const [params, articles, categories, page] = await Promise.all([
    searchParams,
    getArticles(),
    getCategories("article"),
    getPageGlobal("stories-page"),
  ]);

  const content = hero(page);
  const empty = titleBody(page, "emptyState");

  // รับค่าจาก URL เฉพาะหมวดที่มีอยู่จริง กันค่าที่พิมพ์มั่วมาใน query string
  const validCategory = categories.some((category) => category.slug === params.category)
    ? (params.category as string)
    : null;

  return (
    <>
      <PageHero
        eyebrow={t(content.eyebrow)}
        title={t(content.title)}
        description={t(content.description)}
        crumbs={CRUMBS}
      />

      <section className="py-12 sm:py-16">
        <Container size="wide">
          <StoriesBrowser
            articles={articles}
            categories={categories}
            initialCategory={validCategory}
            initialQuery={params.q ?? ""}
            emptyState={{ title: t(empty.title), body: t(empty.body) }}
          />
        </Container>
      </section>

      <JsonLd data={breadcrumbJsonLd(CRUMBS)} />
    </>
  );
}

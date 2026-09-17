import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { JsonLd } from "@/components/json-ld";
import { EdStyle } from "@/components/editable";
import { PageHero } from "@/components/page-hero";
import { PageStyle, pageStyleTarget } from "@/components/page-style";
import { StoriesBrowser } from "@/components/stories-browser";
import { EditToolbar } from "@/components/edit-mode";
import { Container } from "@/components/ui";
import {
  hero,
  heroConfig,
  readPageStyle,
  readSections,
  sectionAt,
  sectionLabel,
  sectionSkin,
  titleBody,
} from "@/lib/cms/page-content";
import { getArticles, getCategories, getPageGlobal, getSite } from "@/lib/cms/queries";
import { loc } from "@/lib/cms/map";
import { isDraftMode } from "@/lib/cms/draft";
import { editLinksFor } from "@/lib/cms/edit-links";
import { atGlobal } from "@/lib/cms/inline";
import { t } from "@/lib/i18n";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

const DEFAULT_SECTIONS = ["list"];

/** ที่อยู่ของฟิลด์ในหน้านี้ ใช้ผูกข้อความบนหน้าเว็บกับช่องกรอกในหลังบ้าน */
const at = atGlobal("stories-page");

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
  const editing = await isDraftMode();
  const [params, articles, categories, page, site] = await Promise.all([
    searchParams,
    getArticles(),
    getCategories("article"),
    getPageGlobal("stories-page"),
    getSite(),
  ]);

  const visibleSections = readSections(page, DEFAULT_SECTIONS);
  const cta = (page.cta ?? {}) as Record<string, unknown>;

  const content = hero(page);
  const empty = titleBody(page, "emptyState");
  const pageStyle = readPageStyle(page);

  // รับค่าจาก URL เฉพาะหมวดที่มีอยู่จริง กันค่าที่พิมพ์มั่วมาใน query string
  const validCategory = categories.some((category) => category.slug === params.category)
    ? (params.category as string)
    : null;

  return (
    <>
      <PageStyle style={pageStyle} />
      <PageHero
        eyebrow={t(content.eyebrow)}
        title={t(content.title)}
        description={t(content.description)}
        crumbs={CRUMBS}
        at={at("hero")}
        config={heroConfig(page)}
      />

      {visibleSections.map((item, index) => {
        const key = `${item.type}-${index}`;
        if (item.type === "list") {
          const skin = sectionSkin(item);
          return (
            <section key={key} className={`py-12 sm:py-16 ${skin.className}`} style={skin.style}>
              <EdStyle at={sectionAt(at, item)} label={sectionLabel(item.type)} config={item} />
              <Container size="wide">
                <StoriesBrowser
                  articles={articles}
                  categories={categories}
                  initialCategory={validCategory}
                  initialQuery={params.q ?? ""}
                  emptyState={{ title: t(empty.title), body: t(empty.body) }}
                  editing={editing}
                  tone={skin.tone}
                  cardTone={skin.cardTone("dark")}
                />
              </Container>
            </section>
          );
        }
        if (item.type === "cta") {
          return (
            <CtaBand
              key={key}
              site={site}
              eyebrow={loc(cta.eyebrow as never)}
              title={loc(cta.title as never)}
              body={loc(cta.body as never)}
              at={at("cta")}
              styleAt={sectionAt(at, item)}
              config={item}
              editing={editing}
            />
          );
        }
        return null;
      })}

      {editing ? (
        <EditToolbar {...editLinksFor("stories")} styles={[pageStyleTarget(at("pageStyle"), pageStyle)]} />
      ) : null}

      <JsonLd data={breadcrumbJsonLd(CRUMBS)} />
    </>
  );
}

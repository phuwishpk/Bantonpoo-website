import type { Metadata } from "next";
import { CtaBand } from "@/components/cta-band";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { ShopBrowser, type ShopFilters, type SortKey, type ViewMode } from "@/components/shop-browser";
import { EditToolbar } from "@/components/edit-mode";
import { Container } from "@/components/ui";
import type { ProductForm, ProductStatus } from "@/content/types";
import { hero, readSections, sectionSkin, titleBody, typographyOf } from "@/lib/cms/page-content";
import { getCategories, getPageGlobal, getProducts, getSite } from "@/lib/cms/queries";
import { loc } from "@/lib/cms/map";
import { isDraftMode } from "@/lib/cms/draft";
import { editLinksFor } from "@/lib/cms/edit-links";
import { atGlobal } from "@/lib/cms/inline";
import { t } from "@/lib/i18n";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

const DEFAULT_SECTIONS = ["catalogue"];

/** ที่อยู่ของฟิลด์ในหน้านี้ ใช้ผูกข้อความบนหน้าเว็บกับช่องกรอกในหลังบ้าน */
const at = atGlobal("shop-page");

const CRUMBS = [
  { name: "หน้าแรก", path: "/" },
  { name: "สินค้าชุมชน", path: "/shop" },
];

export async function generateMetadata(): Promise<Metadata> {
  const [site, page, products] = await Promise.all([getSite(), getPageGlobal("shop-page"), getProducts()]);
  const content = hero(page);
  return buildMetadata({
    title: t(content.title) || "สินค้าชุมชน",
    description: t(content.description) || t(site.aboutSummary),
    path: "/shop",
    siteName: t(site.communityName),
    image: products[0]?.gallery[0]?.url,
  });
}

const VALID_FORMS: ProductForm[] = [
  "liquid-balm",
  "solid-balm",
  "massage-oil",
  "compress",
  "soap",
  "tea",
  "dried-herb",
  "other",
];
const VALID_STATUSES: ProductStatus[] = ["in-stock", "made-to-order", "sold-out"];
const VALID_SORTS: SortKey[] = ["recommended", "price-asc", "price-desc"];
const VALID_VIEWS: ViewMode[] = ["slide", "grid"];

/** แยกค่าจาก query string ที่คั่นด้วยจุลภาค แล้วเก็บเฉพาะค่าที่รู้จัก */
function parseList<T extends string>(raw: string | undefined, allowed: readonly T[]): T[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter((value): value is T => (allowed as readonly string[]).includes(value));
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    form?: string;
    status?: string;
    q?: string;
    sort?: string;
    view?: string;
  }>;
}) {
  const editing = await isDraftMode();
  const [params, products, categories, page, site] = await Promise.all([
    searchParams,
    getProducts(),
    getCategories("product"),
    getPageGlobal("shop-page"),
    getSite(),
  ]);

  const visibleSections = readSections(page, DEFAULT_SECTIONS);
  const cta = (page.cta ?? {}) as Record<string, unknown>;

  const content = hero(page);
  const empty = titleBody(page, "emptyState");

  const initial: ShopFilters = {
    categories: parseList(
      params.category,
      categories.map((category) => category.slug)
    ),
    forms: parseList(params.form, VALID_FORMS),
    statuses: parseList(params.status, VALID_STATUSES),
    query: params.q ?? "",
    sort: VALID_SORTS.includes(params.sort as SortKey) ? (params.sort as SortKey) : "recommended",
    view: VALID_VIEWS.includes(params.view as ViewMode) ? (params.view as ViewMode) : "slide",
  };

  return (
    <>
      <PageHero
        eyebrow={t(content.eyebrow)}
        title={t(content.title)}
        description={t(content.description)}
        crumbs={CRUMBS}
        at={at("hero")}
        typography={typographyOf(page, "hero")}
      />

      {visibleSections.map((item, index) =>
        item.type === "catalogue" ? (
          <section
            key={`${item.type}-${index}`}
            className={`py-12 sm:py-16 ${sectionSkin(item).className}`}
            style={sectionSkin(item).style}
          >
            <Container size="wide">
              <ShopBrowser
                products={products}
                categories={categories}
                initial={initial}
                emptyState={{ title: t(empty.title), body: t(empty.body) }}
                editing={editing}
              />
            </Container>
          </section>
        ) : item.type === "cta" ? (
          <CtaBand
            key={`${item.type}-${index}`}
            site={site}
            eyebrow={loc(cta.eyebrow as never)}
            title={loc(cta.title as never)}
            body={loc(cta.body as never)}
            at={at("cta")}
            config={item}
            editing={editing}
          />
        ) : null
      )}

      {editing ? <EditToolbar {...editLinksFor("shop")} /> : null}

      <JsonLd data={breadcrumbJsonLd(CRUMBS)} />
    </>
  );
}

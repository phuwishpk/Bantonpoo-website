import type { Metadata } from "next";
import { EditToolbar } from "@/components/edit-mode";
import { JsonLd } from "@/components/json-ld";
import { PageBlocks } from "@/components/page-blocks";
import { PageHero } from "@/components/page-hero";
import { isDraftMode } from "@/lib/cms/draft";
import { editLinksForCustomPage } from "@/lib/cms/edit-links";
import { atDoc } from "@/lib/cms/inline";
import { getLabels } from "@/lib/cms/labels";
import { loc, mapMedia } from "@/lib/cms/map";
import { hero, typographyOf } from "@/lib/cms/page-content";
import { getCustomPage, getCustomPages, getSite } from "@/lib/cms/queries";
import { redirectOrNotFound } from "@/lib/cms/redirects";
import { t } from "@/lib/i18n";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

/**
 * หน้าที่ผู้ดูแลสร้างเองจากหลังบ้าน
 *
 * เป็นเส้นทางแบบ catch-all จึงรับทุกที่อยู่ที่ยังไม่มีหน้าเขียนไว้ในโค้ด
 * Next จับคู่เส้นทางที่เขียนไว้ตรง ๆ (เช่น /about) ก่อนเสมอ หน้าเหล่านั้นจึงไม่ถูกแย่ง
 *
 * เมื่อไม่พบทั้งหน้าที่สร้างเองและทางเปลี่ยนเส้นทาง จึงค่อยคืนหน้า 404
 * — เส้นทางนี้จึงเป็นที่เดียวที่ดักลิงก์เก่าของทั้งเว็บได้
 */

type PageProps = { params: Promise<{ slug: string[] }> };

/** ชื่อลิงก์ของหน้าที่สร้างเองเป็นส่วนเดียวเสมอ (ดู RESERVED_SLUGS ใน Pages.ts) */
function singleSegment(slug: string[]): string | null {
  return slug.length === 1 ? slug[0] : null;
}

export async function generateStaticParams() {
  const pages = await getCustomPages();
  return pages
    .filter((page) => typeof page.slug === "string" && page.slug)
    .map((page) => ({ slug: [String(page.slug)] }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const key = singleSegment(slug);
  if (!key) return {};

  const [page, site] = await Promise.all([getCustomPage(key), getSite()]);
  if (!page) return {};

  const content = hero(page);
  const description = t(loc(page.seoDescription as never)) || t(content.description);

  return {
    ...buildMetadata({
      title: t(loc(page.title as never)),
      description: description || t(site.aboutSummary),
      path: `/${key}`,
      siteName: t(site.communityName),
      image: mapMedia(page.seoImage)?.url,
    }),
    // หน้าที่ตั้งใจให้เข้าถึงด้วยลิงก์ตรงเท่านั้น ต้องบอก Google ด้วย ไม่ใช่แค่ตัดออกจาก sitemap
    ...(page.showInSitemap === false ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function CustomPage({ params }: PageProps) {
  const { slug } = await params;
  const path = `/${slug.join("/")}`;
  const key = singleSegment(slug);

  const page = key ? await getCustomPage(key) : null;
  if (!page) return redirectOrNotFound(path);

  const [site, labels, editing] = await Promise.all([getSite(), getLabels(), isDraftMode()]);

  const content = hero(page);
  const title = t(loc(page.title as never));
  const blocks = Array.isArray(page.layout) ? (page.layout as Record<string, unknown>[]) : [];

  const crumbs = [
    { name: "หน้าแรก", path: "/" },
    { name: title, path },
  ];

  return (
    <>
      <PageHero
        eyebrow={t(content.eyebrow)}
        title={t(content.title) || title}
        description={t(content.description)}
        crumbs={crumbs}
        at={atDoc("pages", page.id as string | number)("hero")}
        typography={typographyOf(page, "hero")}
      />

      <PageBlocks
        blocks={blocks}
        pageId={page.id as string | number}
        site={site}
        labels={labels}
        editing={editing}
      />

      {editing ? (
        <EditToolbar {...editLinksForCustomPage(page.id as string | number, title)} />
      ) : null}

      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}

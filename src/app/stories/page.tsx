import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { StoriesBrowser } from "@/components/stories-browser";
import { Container } from "@/components/ui";
import { getSortedArticles } from "@/content/articles";
import { articleCategories } from "@/content/categories";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "เรื่องเล่าและข่าวกิจกรรม",
  description:
    "บทความเกี่ยวกับภูมิปัญญาช่างตีเหล็ก วิถีชีวิตชาวบ้านต้นโพธิ์ และข่าวกิจกรรมของชุมชนที่เปิดให้ผู้สนใจเข้าร่วม",
  path: "/stories",
  image: "/placeholder/article-steel-sound.svg",
});

const CRUMBS = [
  { name: "หน้าแรก", path: "/" },
  { name: "เรื่องเล่าชุมชน", path: "/stories" },
];

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const articles = getSortedArticles();

  // รับค่าจาก URL เฉพาะหมวดที่มีอยู่จริง กันค่าที่พิมพ์มั่วมาใน query string
  const validCategory = articleCategories.some((category) => category.slug === params.category)
    ? (params.category as string)
    : null;

  return (
    <>
      <PageHero
        eyebrow="เรื่องเล่าและข่าวกิจกรรม"
        title="เรื่องเล่าจากเตาไฟและวิถีชีวิตบ้านต้นโพธิ์"
        description="รวมภูมิปัญญาการตีเหล็ก เรื่องราวของช่างแต่ละคน และข่าวกิจกรรมที่ชุมชนเปิดให้เข้าร่วม"
        crumbs={CRUMBS}
      />

      <section className="py-12 sm:py-16">
        <Container size="wide">
          <StoriesBrowser
            articles={articles}
            initialCategory={validCategory}
            initialQuery={params.q ?? ""}
          />
        </Container>
      </section>

      <JsonLd data={breadcrumbJsonLd(CRUMBS)} />
    </>
  );
}

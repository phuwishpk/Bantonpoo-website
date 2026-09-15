import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { ShopBrowser, type ShopFilters, type SortKey, type ViewMode } from "@/components/shop-browser";
import { Container } from "@/components/ui";
import { productCategories } from "@/content/categories";
import { products } from "@/content/products";
import type { ProductForm, ProductStatus } from "@/content/types";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "สินค้าชุมชน",
  description:
    "ผลิตภัณฑ์สมุนไพรจากวิสาหกิจชุมชนสมุนไพรบ้านต้นโพธิ์ ทั้งยาหม่องน้ำ ยาหม่องตลับ น้ำมันไพล ลูกประคบ สบู่ ชาสมุนไพร และชุดของฝาก",
  path: "/shop",
  image: "/placeholder/product-balm-1.svg",
});

const CRUMBS = [
  { name: "หน้าแรก", path: "/" },
  { name: "สินค้าชุมชน", path: "/shop" },
];

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
  const params = await searchParams;

  const initial: ShopFilters = {
    categories: parseList(
      params.category,
      productCategories.map((category) => category.slug)
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
        eyebrow="สินค้าชุมชน"
        title="ผลิตภัณฑ์สมุนไพรจากบ้านต้นโพธิ์"
        description="ทุกชิ้นระบุรูปแบบ ปริมาณสุทธิ และสมุนไพรหลักในตำรับ สั่งซื้อได้โดยตรงกับกลุ่มวิสาหกิจชุมชนผ่าน LINE หรือโทรศัพท์"
        crumbs={CRUMBS}
      />

      <section className="py-12 sm:py-16">
        <Container size="wide">
          <ShopBrowser products={products} initial={initial} />
        </Container>
      </section>

      <JsonLd data={breadcrumbJsonLd(CRUMBS)} />
    </>
  );
}

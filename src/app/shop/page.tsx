import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { ShopBrowser, type ShopFilters, type SortKey } from "@/components/shop-browser";
import { Container } from "@/components/ui";
import { productCategories } from "@/content/categories";
import { products } from "@/content/products";
import type { ProductStatus, SteelType } from "@/content/types";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "สินค้าชุมชน",
  description:
    "มีดอรัญญิกตีมือจากบ้านต้นโพธิ์ ทั้งมีดทำครัว มีดเดินป่า ดาบมงคลสะสม ของฝาก และสินค้าแปรรูปของกลุ่มแม่บ้าน",
  path: "/shop",
  image: "/placeholder/product-chef-1.svg",
});

const CRUMBS = [
  { name: "หน้าแรก", path: "/" },
  { name: "สินค้าชุมชน", path: "/shop" },
];

const VALID_STEELS: SteelType[] = ["spring-steel", "d2", "damascus", "carbon-1095", "other"];
const VALID_STATUSES: ProductStatus[] = ["in-stock", "made-to-order", "sold-out"];
const VALID_SORTS: SortKey[] = ["recommended", "price-asc", "price-desc"];

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
  searchParams: Promise<{ category?: string; steel?: string; status?: string; q?: string; sort?: string }>;
}) {
  const params = await searchParams;

  const initial: ShopFilters = {
    categories: parseList(
      params.category,
      productCategories.map((category) => category.slug)
    ),
    steels: parseList(params.steel, VALID_STEELS),
    statuses: parseList(params.status, VALID_STATUSES),
    query: params.q ?? "",
    sort: VALID_SORTS.includes(params.sort as SortKey) ? (params.sort as SortKey) : "recommended",
  };

  return (
    <>
      <PageHero
        eyebrow="สินค้าชุมชน"
        title="มีดตีมือและงานหัตถกรรมจากบ้านต้นโพธิ์"
        description="ทุกเล่มระบุชนิดเหล็ก ความยาวใบ วัสดุด้าม และชื่อช่างผู้ตี สั่งซื้อได้โดยตรงกับช่างผ่าน LINE ไม่ผ่านคนกลาง"
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

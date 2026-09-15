import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PhoneIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { ProductOrderButton } from "@/components/line-order-button";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { StickyBuyBar } from "@/components/sticky-buy-bar";
import { Badge, buttonClass, Container, OrnamentDivider, SectionHeading } from "@/components/ui";
import type { Product } from "@/content/types";
import { getProduct, getProducts, getRelatedProducts, getSite } from "@/lib/cms/queries";
import { productFormLabels, productStatusLabels } from "@/lib/product-labels";
import { formatPrice } from "@/lib/format";
import { t } from "@/lib/i18n";
import { telUrl } from "@/lib/line";
import { breadcrumbJsonLd, buildMetadata, productJsonLd } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

/** id ของกล่องปุ่มสั่งซื้อหลัก ใช้เป็นจุดอ้างอิงของแถบติดล่างจอบนมือถือ */
const ORDER_ANCHOR_ID = "order-actions";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [product, site] = await Promise.all([getProduct(slug), getSite()]);
  if (!product) return {};

  return buildMetadata({
    title: t(product.name),
    description: t(product.excerpt),
    path: `/shop/${product.slug}`,
    siteName: t(site.communityName),
    image: product.gallery[0].url,
  });
}

/** แถวในตารางสเปก — แสดงเฉพาะแถวที่มีค่า */
function specRows(product: Product): { label: string; value: string }[] {
  const rows: { label: string; value: string | undefined }[] = [
    { label: "รหัสสินค้า", value: product.sku },
    { label: "รูปแบบ", value: t(productFormLabels[product.form]) },
    { label: "ปริมาณสุทธิ", value: t(product.netContent) },
    { label: "สมุนไพรหลัก", value: t(product.mainHerbs).join(" · ") },
    { label: "อายุการเก็บรักษา", value: product.shelfLife ? t(product.shelfLife) : undefined },
  ];

  return rows.filter((row): row is { label: string; value: string } => Boolean(row.value));
}

const STATUS_TONE = {
  "in-stock": "bg-leaf-600",
  "made-to-order": "bg-ochre-600",
  "sold-out": "bg-ink-500",
} as const;

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const [product, site] = await Promise.all([getProduct(slug), getSite()]);
  if (!product) notFound();

  const category = product.category;
  const artisan = product.artisan;
  const related = await getRelatedProducts(product, 3);
  const specs = specRows(product);

  const crumbs = [
    { name: "หน้าแรก", path: "/" },
    { name: "สินค้าชุมชน", path: "/shop" },
    { name: t(category.title), path: `/shop?category=${category.slug}` },
    { name: t(product.name), path: `/shop/${product.slug}` },
  ];

  return (
    <>
      <div className="border-b border-rice-300 bg-rice-50">
        <Container size="wide">
          <div className="py-4">
            <Breadcrumbs items={crumbs} />
          </div>
        </Container>
      </div>

      <section className="py-8 sm:py-12">
        <Container size="wide">
          <div className="grid gap-8 lg:grid-cols-[3fr_2fr] lg:gap-12">
            {/* ---------------- แกลเลอรี ---------------- */}
            <ProductGallery images={product.gallery} productName={t(product.name)} />

            {/* ---------------- ข้อมูลและการสั่งซื้อ ---------------- */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="text-xs font-semibold tracking-label text-leaf-600 hover:text-leaf-700"
                >
                  {t(category.title)}
                </Link>

                <h1 className="font-serif text-2xl leading-snug font-bold text-ink-800 sm:text-3xl">
                  {t(product.name)}
                </h1>

                <p className="text-[0.9375rem] leading-relaxed text-river-500">{t(product.excerpt)}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {t(product.badges).map((badge) => (
                  <Badge key={badge} tone="ember">
                    {badge}
                  </Badge>
                ))}
              </div>

              <div className="flex items-end justify-between gap-4 border-y border-rice-300 py-5">
                <div>
                  <p className="font-serif text-3xl font-bold text-ink-800">
                    {product.price === null ? (
                      <span className="text-2xl text-river-500">สอบถามราคา</span>
                    ) : (
                      formatPrice(product.price)
                    )}
                  </p>
                  {product.leadTime ? (
                    <p className="mt-1.5 text-xs text-river-500">{t(product.leadTime)}</p>
                  ) : null}
                </div>
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold text-white ${
                    STATUS_TONE[product.status]
                  }`}
                >
                  {t(productStatusLabels[product.status])}
                </span>
              </div>

              {product.externalUseOnly ? (
                <p
                  role="note"
                  className="flex gap-3 rounded-lg border border-ochre-200 bg-ochre-50 px-4 py-3 text-sm leading-relaxed text-ochre-700"
                >
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-ochre-600" />
                  <span>
                    <span className="font-semibold">ใช้ภายนอกเท่านั้น</span> — ห้ามรับประทาน
                    เก็บให้พ้นมือเด็ก และหลีกเลี่ยงบริเวณดวงตาและบาดแผลเปิด
                  </span>
                </p>
              ) : null}

              {/* ---- ปุ่มสั่งซื้อ ---- */}
              <div id={ORDER_ANCHOR_ID} className="flex flex-col gap-3">
                <ProductOrderButton product={product} />
                <a href={telUrl(site)} className={buttonClass("secondary", "w-full")}>
                  <PhoneIcon />
                  โทรสอบถามกลุ่มวิสาหกิจชุมชน {site.phoneDisplay}
                </a>
                <a
                  href={site.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center text-xs text-river-500 underline underline-offset-4 hover:text-ink-800"
                >
                  หรือทักผ่านเพจ Facebook ของวิสาหกิจชุมชน
                </a>
              </div>

              {/* ---- ตารางสเปก ---- */}
              <div className="rounded-card border border-rice-300 bg-rice-50 p-5">
                <h2 className="mb-4 text-xs font-semibold tracking-label text-ink-700">สเปกทางเทคนิค</h2>
                <dl className="flex flex-col">
                  {specs.map((row, index) => (
                    <div
                      key={row.label}
                      className={`flex justify-between gap-4 py-2.5 text-sm ${
                        index > 0 ? "border-t border-rice-200" : ""
                      }`}
                    >
                      <dt className="text-river-500">{row.label}</dt>
                      <dd className="text-right font-medium text-ink-800">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* ---- ประวัติผู้ตี ---- */}
              {artisan ? (
                <div className="flex gap-4 rounded-card border border-rice-300 bg-ink-800 p-5">
                  <Image
                    src={artisan.photo.url}
                    alt={t(artisan.photo.alt)}
                    width={artisan.photo.width}
                    height={artisan.photo.height}
                    sizes="64px"
                    className="h-16 w-16 shrink-0 rounded-full object-cover"
                  />
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[0.6875rem] font-semibold tracking-label text-leaf-300">ผลิตโดย</p>
                    <p className="font-serif text-base font-semibold text-rice-100">{t(artisan.name)}</p>
                    <p className="text-xs text-ink-300">{t(artisan.title)}</p>
                    <Link
                      href="/about"
                      className="mt-1 text-xs font-semibold text-leaf-300 underline-offset-4 hover:underline"
                    >
                      ดูทำเนียบปราชญ์ชุมชนทั้งหมด →
                    </Link>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------- เรื่องเล่าของสินค้า + การดูแล ---------------- */}
      <section className="py-8 sm:py-12">
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col gap-5">
              <SectionHeading eyebrow="เรื่องเล่าของผลิตภัณฑ์" title="ที่มาและจุดเด่น" />
              <div className="prose-craft">
                {t(product.story).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-5">
                <SectionHeading eyebrow="วิธีใช้" title="ใช้อย่างไร" />
                <ol className="flex flex-col gap-3">
                  {t(product.usage).map((step, index) => (
                    <li
                      key={index}
                      className="flex gap-3 rounded-lg border border-rice-300 bg-rice-50 px-4 py-3 text-sm leading-relaxed text-ink-700"
                    >
                      <span
                        aria-hidden
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-leaf-600 text-xs font-semibold text-white"
                      >
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex flex-col gap-5">
                <SectionHeading eyebrow="คำแนะนำ" title="การเก็บรักษาและข้อควรระวัง" />
                <ul className="flex flex-col gap-3">
                  {t(product.careInstructions).map((instruction, index) => (
                    <li
                      key={index}
                      className="flex gap-3 rounded-lg border border-rice-300 bg-rice-50 px-4 py-3 text-sm leading-relaxed text-ink-700"
                    >
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-leaf-500" />
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------- สินค้าที่คล้ายกัน ---------------- */}
      {related.length > 0 ? (
        <section className="pb-24 pt-8 lg:pb-4">
          <Container size="wide">
            <OrnamentDivider />
            <div className="mt-12">
              <SectionHeading eyebrow="อาจถูกใจ" title="สินค้าที่คล้ายกัน" />
              <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-5">
                {related.map((item) => (
                  <ProductCard key={item.slug} product={item} />
                ))}
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      <StickyBuyBar product={product} anchorId={ORDER_ANCHOR_ID} />

      <JsonLd data={[productJsonLd(product, site), breadcrumbJsonLd(crumbs)]} />
    </>
  );
}

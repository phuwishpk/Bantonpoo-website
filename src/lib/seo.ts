import type { Metadata } from "next";
import type { Article, Product, SiteSettings, Workshop } from "@/content/types";
import { formatThaiDate, truncate } from "./format";
import { t } from "./i18n";
import { productFormLabels, productStatusLabels } from "./product-labels";
import { siteUrl } from "./site-url";

export { siteUrl };

export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}

/** สร้าง Metadata มาตรฐานของหน้า — ใส่ canonical และ OpenGraph ให้ครบเสมอ */
export function buildMetadata(options: {
  title: string;
  description: string;
  path: string;
  siteName: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
}): Metadata {
  const url = absoluteUrl(options.path);
  const image = absoluteUrl(options.image ?? "/placeholder/forge-wide.svg");
  const description = truncate(options.description);

  return {
    title: options.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: options.title,
      description,
      url,
      siteName: options.siteName,
      locale: "th_TH",
      type: options.type ?? "website",
      images: [{ url: image }],
      ...(options.publishedTime ? { publishedTime: options.publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description,
      images: [image],
    },
  };
}

/* ------------------------------------------------------------------
   JSON-LD — ช่วยให้ Google เข้าใจว่าหน้าไหนคือสินค้า บทความ หรือสถานที่
   ------------------------------------------------------------------ */

export function localBusinessJsonLd(site: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: t(site.communityName),
    description: t(site.aboutSummary),
    url: siteUrl,
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: t(site.address),
      addressLocality: site.addressLocality,
      addressRegion: site.addressRegion,
      postalCode: site.postalCode,
      addressCountry: "TH",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.mapLatitude,
      longitude: site.mapLongitude,
    },
    sameAs: [site.facebookUrl, site.lineUrl],
  };
}

const STATUS_TO_SCHEMA: Record<Product["status"], string> = {
  "in-stock": "https://schema.org/InStock",
  "made-to-order": "https://schema.org/PreOrder",
  "sold-out": "https://schema.org/OutOfStock",
};

export function productJsonLd(product: Product, site: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: t(product.name),
    sku: product.sku,
    description: t(product.excerpt),
    image: product.gallery.map((media) => absoluteUrl(media.url)),
    material: t(product.mainHerbs).join(", "),
    brand: { "@type": "Brand", name: t(site.communityName) },
    ...(product.price === null
      ? {}
      : {
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "THB",
            availability: STATUS_TO_SCHEMA[product.status],
            url: absoluteUrl(`/shop/${product.slug}`),
            // ระบุชัดว่าการสั่งซื้อทำผ่านช่องทางติดต่อ ไม่ใช่ตะกร้าบนเว็บ
            availableDeliveryMethod: "https://schema.org/OnSitePickup",
          },
        }),
    additionalProperty: [
      { "@type": "PropertyValue", name: "รูปแบบ", value: t(productFormLabels[product.form]) },
      { "@type": "PropertyValue", name: "ปริมาณสุทธิ", value: t(product.netContent) },
      { "@type": "PropertyValue", name: "สถานะ", value: t(productStatusLabels[product.status]) },
      ...(product.mainHerbs.th.length
        ? [{ "@type": "PropertyValue", name: "สมุนไพรหลัก", value: t(product.mainHerbs).join(", ") }]
        : []),
    ],
  };
}

export function articleJsonLd(article: Article, site: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: t(article.title),
    description: t(article.excerpt),
    image: [absoluteUrl(article.coverImage.url)],
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    author: { "@type": "Person", name: t(article.author) },
    publisher: { "@type": "Organization", name: t(site.communityName) },
    mainEntityOfPage: absoluteUrl(`/stories/${article.slug}`),
    inLanguage: "th-TH",
  };
}

export function workshopJsonLd(workshop: Workshop, site: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: t(workshop.title),
    description: t(workshop.summary),
    image: absoluteUrl(workshop.image.url),
    address: { "@type": "PostalAddress", streetAddress: t(site.address), addressCountry: "TH" },
    ...(workshop.pricePerPerson === null
      ? {}
      : { publicAccess: true, isAccessibleForFree: false }),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** แปลงวันที่เป็นข้อความไทยสำหรับแสดงคู่กับ JSON-LD */
export const displayDate = formatThaiDate;

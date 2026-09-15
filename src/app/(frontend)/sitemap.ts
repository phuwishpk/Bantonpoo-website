import type { MetadataRoute } from "next";
import { getArticles, getProducts } from "@/lib/cms/queries";
import { absoluteUrl } from "@/lib/seo";

/** แผนผังเว็บไซต์สำหรับ Google — อัปเดตอัตโนมัติเมื่อเพิ่มบทความหรือสินค้าใน CMS */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, articles] = await Promise.all([getProducts(), getArticles()]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/shop"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/stories"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/tourism"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.6 },
  ];

  return [
    ...staticPages,
    ...products.map((product) => ({
      url: absoluteUrl(`/shop/${product.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...articles.map((article) => ({
      url: absoluteUrl(`/stories/${article.slug}`),
      lastModified: new Date(article.publishedAt),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}

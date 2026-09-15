import type { MetadataRoute } from "next";
import { articles } from "@/content/articles";
import { products } from "@/content/products";
import { absoluteUrl } from "@/lib/seo";

/** แผนผังเว็บไซต์สำหรับ Google — อัปเดตอัตโนมัติเมื่อเพิ่มบทความหรือสินค้า */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/shop"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/stories"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/tourism"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.6 },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(`/shop/${product.slug}`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: absoluteUrl(`/stories/${article.slug}`),
    lastModified: new Date(article.publishedAt),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...articlePages];
}

import { cache } from "react";
import type { ThemeSettings } from "@/lib/theme";
import { DEFAULT_THEME } from "@/lib/theme";
import type {
  Article,
  Artisan,
  Category,
  PlaceOfInterest,
  Product,
  SiteSettings,
  Workshop,
} from "@/content/types";
import { ALL_LOCALES, getCms } from "./client";
import { isDraftMode } from "./draft";
import { readStyle } from "./page-content";
import { loc, mapArticle, mapArtisan, mapCategory, mapMedia, mapPlace, mapProduct, mapWorkshop } from "./map";

/**
 * ฟังก์ชันดึงข้อมูลสำหรับหน้าเว็บ
 *
 * ทุกตัวห่อด้วย cache() ของ React จึงเรียกซ้ำในหน้าเดียวกันได้โดยไม่ยิงฐานข้อมูลซ้ำ
 * และขอข้อมูลด้วย locale "all" เพื่อให้ได้รูปแบบ { th, en } ตรงกับชนิด Localized
 */

const LIMIT = 200;

export const getProducts = cache(async (): Promise<Product[]> => {
  const [cms, draft] = await Promise.all([getCms(), isDraftMode()]);
  const { docs } = await cms.find({
    draft,
    collection: "products",
    locale: ALL_LOCALES,
    depth: 2,
    limit: LIMIT,
    sort: "order",
  });
  return docs.map((doc) => mapProduct(doc as unknown as Record<string, unknown>));
});

export const getProduct = cache(async (slug: string): Promise<Product | null> => {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
});

export const getFeaturedProducts = cache(async (limit = 4): Promise<Product[]> => {
  const products = await getProducts();
  return products.filter((product) => product.featured).slice(0, limit);
});

/** สินค้าที่คล้ายกัน — หมวดเดียวกันก่อน ถ้าไม่พอเติมด้วยสินค้าของผู้ผลิตคนเดียวกัน */
export async function getRelatedProducts(product: Product, limit = 3): Promise<Product[]> {
  const products = await getProducts();
  const sameCategory = products.filter(
    (item) => item.slug !== product.slug && item.category.slug === product.category.slug
  );
  const sameArtisan = products.filter(
    (item) =>
      item.slug !== product.slug &&
      item.category.slug !== product.category.slug &&
      item.artisan.slug === product.artisan.slug
  );
  return [...sameCategory, ...sameArtisan].slice(0, limit);
}

export const getArticles = cache(async (): Promise<Article[]> => {
  const [cms, draft] = await Promise.all([getCms(), isDraftMode()]);
  const { docs } = await cms.find({
    draft,
    collection: "articles",
    locale: ALL_LOCALES,
    depth: 2,
    limit: LIMIT,
    sort: "-publishedAt",
  });
  return docs.map((doc) => mapArticle(doc as unknown as Record<string, unknown>));
});

export const getArticle = cache(async (slug: string): Promise<Article | null> => {
  const articles = await getArticles();
  return articles.find((article) => article.slug === slug) ?? null;
});

export const getLatestArticles = cache(async (limit = 3): Promise<Article[]> => {
  const articles = await getArticles();
  return articles.slice(0, limit);
});

export async function getRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  const articles = (await getArticles()).filter((item) => item.slug !== article.slug);
  const sameCategory = articles.filter((item) => item.category.slug === article.category.slug);
  const rest = articles.filter((item) => item.category.slug !== article.category.slug);
  return [...sameCategory, ...rest].slice(0, limit);
}

export const getArtisans = cache(async (): Promise<Artisan[]> => {
  const [cms, draft] = await Promise.all([getCms(), isDraftMode()]);
  const { docs } = await cms.find({
    draft,
    collection: "artisans",
    locale: ALL_LOCALES,
    depth: 1,
    limit: LIMIT,
    sort: "order",
  });
  return docs
    .map((doc) => mapArtisan(doc))
    .filter((artisan): artisan is Artisan => artisan !== null);
});

export const getWorkshops = cache(async (): Promise<Workshop[]> => {
  const [cms, draft] = await Promise.all([getCms(), isDraftMode()]);
  const { docs } = await cms.find({
    draft,
    collection: "workshops",
    locale: ALL_LOCALES,
    depth: 1,
    limit: LIMIT,
    sort: "order",
  });
  return docs.map((doc) => mapWorkshop(doc as unknown as Record<string, unknown>));
});

export const getPlaces = cache(async (): Promise<PlaceOfInterest[]> => {
  const [cms, draft] = await Promise.all([getCms(), isDraftMode()]);
  const { docs } = await cms.find({
    draft,
    collection: "places",
    locale: ALL_LOCALES,
    depth: 1,
    limit: LIMIT,
    sort: "order",
  });
  return docs.map((doc) => mapPlace(doc as unknown as Record<string, unknown>));
});

export const getCategories = cache(async (type: Category["type"]): Promise<Category[]> => {
  const [cms, draft] = await Promise.all([getCms(), isDraftMode()]);
  const { docs } = await cms.find({
    draft,
    collection: "categories",
    locale: ALL_LOCALES,
    where: { type: { equals: type } },
    limit: LIMIT,
    sort: "order",
  });
  return docs.map((doc) => mapCategory(doc)).filter((c): c is Category => c !== null);
});

export const getSite = cache(async (): Promise<SiteSettings> => {
  const [cms, draft] = await Promise.all([getCms(), isDraftMode()]);
  const doc = (await cms.findGlobal({
    draft,
    slug: "site-settings",
    locale: ALL_LOCALES,
    depth: 1,
  })) as unknown as Record<string, unknown>;

  const logo = mapMedia(doc.logo);
  const favicon = mapMedia(doc.favicon);
  return {
    communityName: loc(doc.communityName as never),
    communityShortName: loc(doc.communityShortName as never),
    tagline: loc(doc.tagline as never),
    aboutSummary: loc(doc.aboutSummary as never),
    phone: String(doc.phone ?? ""),
    phoneDisplay: String(doc.phoneDisplay ?? ""),
    lineId: String(doc.lineId ?? ""),
    lineUrl: String(doc.lineUrl ?? ""),
    facebookUrl: String(doc.facebookUrl ?? ""),
    email: String(doc.email ?? ""),
    address: loc(doc.address as never),
    addressLocality: String(doc.addressLocality ?? ""),
    addressRegion: String(doc.addressRegion ?? ""),
    postalCode: String(doc.postalCode ?? ""),
    mapLatitude: Number(doc.mapLatitude ?? 0),
    mapLongitude: Number(doc.mapLongitude ?? 0),
    openingHours: loc(doc.openingHours as never),
    openingHoursShort: loc(doc.openingHoursShort as never),
    ...(logo ? { logo } : {}),
    ...(favicon ? { favicon } : {}),
  };
});

/**
 * หน้าที่ผู้ดูแลสร้างเอง — คืนข้อมูลดิบให้ตัวเรนเดอร์บล็อกตีความ
 *
 * depth 2 เพื่อให้ภาพในบล็อกถูกดึงมาพร้อมกัน ไม่ต้องยิงถามทีละภาพตอนเรนเดอร์
 */
export const getCustomPages = cache(async (): Promise<Record<string, unknown>[]> => {
  const [cms, draft] = await Promise.all([getCms(), isDraftMode()]);
  const { docs } = await cms.find({
    draft,
    collection: "pages",
    locale: ALL_LOCALES,
    depth: 2,
    limit: LIMIT,
    sort: "title",
  });
  return docs as unknown as Record<string, unknown>[];
});

export const getCustomPage = cache(async (slug: string): Promise<Record<string, unknown> | null> => {
  const pages = await getCustomPages();
  return pages.find((page) => page.slug === slug) ?? null;
});

/** Global ประจำหน้า — คืนข้อมูลดิบให้หน้านั้นตีความเอง */
export const getPageGlobal = cache(async (slug: string): Promise<Record<string, unknown>> => {
  const [cms, draft] = await Promise.all([getCms(), isDraftMode()]);
  return (await cms.findGlobal({
    draft,
    slug: slug as never,
    locale: ALL_LOCALES,
    depth: 2,
  })) as unknown as Record<string, unknown>;
});

/** ค่าธีมสำหรับฉีดตัวแปร CSS ใน layout */
export const getTheme = cache(async (): Promise<ThemeSettings> => {
  const [cms, draft] = await Promise.all([getCms(), isDraftMode()]);
  const doc = (await cms.findGlobal({
    draft, slug: "theme", depth: 0 })) as unknown as Record<string, unknown>;
  const pick = (key: keyof ThemeSettings) =>
    typeof doc[key] === "string" && doc[key] ? (doc[key] as string) : DEFAULT_THEME[key];

  return {
    palette: pick("palette") as string,
    accentColor: typeof doc.accentColor === "string" ? doc.accentColor : undefined,
    surface: pick("surface") as string,
    fontPair: pick("fontPair") as string,
    baseFontSize: pick("baseFontSize") as string,
    radius: pick("radius") as string,
    density: pick("density") as string,
    customCss: typeof doc.customCss === "string" ? doc.customCss : undefined,
    header: readStyle((doc.header ?? {}) as Record<string, unknown>, "dark"),
    footer: readStyle((doc.footer ?? {}) as Record<string, unknown>, "dark"),
  };
});

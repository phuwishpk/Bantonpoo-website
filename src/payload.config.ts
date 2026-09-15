import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { en } from "@payloadcms/translations/languages/en";
import { th } from "@payloadcms/translations/languages/th";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Articles } from "@/collections/Articles";
import { Artisans } from "@/collections/Artisans";
import { Categories } from "@/collections/Categories";
import { Enquiries } from "@/collections/Enquiries";
import { Media } from "@/collections/Media";
import { Places } from "@/collections/Places";
import { Products } from "@/collections/Products";
import { Users } from "@/collections/Users";
import { Workshops } from "@/collections/Workshops";
import { AboutPage } from "@/globals/AboutPage";
import { HomePage } from "@/globals/HomePage";
import { Navigation } from "@/globals/Navigation";
import {
  ContactPage,
  NotFoundPage,
  SeoSettings,
  ShopPage,
  StoriesPage,
  TourismPage,
} from "@/globals/SimplePages";
import { SiteSettings } from "@/globals/SiteSettings";
import { Theme } from "@/globals/Theme";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: " — หลังบ้านบ้านต้นโพธิ์",
    },
  },

  collections: [
    Users,
    Media,
    Categories,
    Artisans,
    Products,
    Articles,
    Workshops,
    Places,
    Enquiries,
  ],

  globals: [
    SiteSettings,
    Navigation,
    Theme,
    SeoSettings,
    HomePage,
    AboutPage,
    ShopPage,
    StoriesPage,
    TourismPage,
    ContactPage,
    NotFoundPage,
  ],

  editor: lexicalEditor(),

  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || "" },
  }),

  /**
   * REST API ของ Payload อยู่ที่ /payload-api ไม่ใช่ /api ตามค่าเริ่มต้น
   * เพราะ /api/contact เป็นของฟอร์มติดต่อบนหน้าเว็บอยู่แล้ว ถ้าใช้ path เดียวกันจะชนกัน
   */
  routes: { api: "/payload-api" },

  // ไม่ได้ใช้ GraphQL และการปิดไว้ช่วยลดพื้นที่ที่ถูกโจมตี
  graphQL: { disable: true },

  /**
   * เปิดสองภาษาไว้ตั้งแต่แรก แม้ตอนนี้จะใช้แต่ภาษาไทย
   * เพราะการเปิด localization ทีหลังคือการย้ายโครงสร้างฐานข้อมูล ไม่ใช่แค่ติ๊กเพิ่ม
   * fallback: true ทำให้ฟิลด์ที่ยังไม่ได้แปลแสดงภาษาไทยแทน เว็บจึงไม่มีช่องว่าง
   */
  localization: {
    locales: [
      { code: "th", label: "ไทย" },
      { code: "en", label: "English" },
    ],
    defaultLocale: "th",
    fallback: true,
  },

  // ภาษาของหน้าจอหลังบ้าน
  i18n: {
    supportedLanguages: { th, en },
    fallbackLanguage: "th",
  },

  secret: process.env.PAYLOAD_SECRET || "",
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  sharp,
});

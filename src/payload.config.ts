import path from "node:path";
import { fileURLToPath } from "node:url";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
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
import { Redirects } from "@/collections/Redirects";
import { migrateOnStart } from "@/lib/cms/migrate-on-start";
import { migrations } from "./migrations";
import { Pages } from "@/collections/Pages";
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
import { UiLabels } from "@/globals/UiLabels";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  admin: {
    user: Users.slug,
    /**
     * ดูตัวอย่างก่อนเผยแพร่
     *
     * หน้าแอดมินจะเปิดเว็บจริงไว้ข้าง ๆ ฟอร์ม ผ่าน /api/preview ซึ่งเปิดโหมดฉบับร่าง
     * ผู้ดูแลกด "บันทึกฉบับร่าง" แล้วเห็นผลทันที โดยที่ผู้เข้าชมทั่วไปยังไม่เห็น
     * จนกว่าจะกด "เผยแพร่"
     */
    livePreview: {
      url: ({ data, collectionConfig, globalConfig }) => {
        const previewOf = (path: string) => `/api/preview?path=${encodeURIComponent(path)}`;

        if (collectionConfig?.slug === "products") return previewOf(`/shop/${data?.slug ?? ""}`);
        if (collectionConfig?.slug === "articles") return previewOf(`/stories/${data?.slug ?? ""}`);

        const byGlobal: Record<string, string> = {
          "home-page": "/",
          "about-page": "/about",
          "shop-page": "/shop",
          "stories-page": "/stories",
          "tourism-page": "/tourism",
          "contact-page": "/contact",
          navigation: "/",
          "site-settings": "/",
          theme: "/",
        };
        return previewOf(byGlobal[globalConfig?.slug ?? ""] ?? "/");
      },
      breakpoints: [
        { name: "mobile", label: "มือถือ", width: 390, height: 844 },
        { name: "tablet", label: "แท็บเล็ต", width: 834, height: 1112 },
        { name: "desktop", label: "คอมพิวเตอร์", width: 1440, height: 900 },
      ],
      collections: ["products", "articles", "pages"],
      globals: [
        "home-page",
        "about-page",
        "shop-page",
        "stories-page",
        "tourism-page",
        "contact-page",
        "navigation",
        "site-settings",
        "theme",
      ],
    },
    importMap: { baseDir: path.resolve(dirname) },
    components: {
      // ปุ่มเปิดเว็บไซต์ในโหมดแก้ไข วางไว้เหนือเมนูหลังบ้าน
      beforeNavLinks: ["/components/admin/OpenSiteButton#OpenSiteButton"],
    },
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
    Pages,
    Enquiries,
    Redirects,
  ],

  globals: [
    SiteSettings,
    Navigation,
    Theme,
    UiLabels,
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

  /**
   * ปรับโครงฐานข้อมูลเองทุกครั้งที่แอปเริ่มทำงานในโหมด production
   *
   * โฮสต์ปิด SSH ไว้ จึงเข้าไปรัน `payload migrate` บนเซิร์ฟเวอร์ไม่ได้ ให้แอปรัน
   * migration ที่ยังค้างเองตอนเปิด (ที่รันไปแล้วจะถูกข้าม ต้นทุนแค่อ่านตารางเดียว)
   * มีผลตอน `next build` ด้วย สำเนาฐานข้อมูลที่ใช้ build จึงตรงกับโค้ดเสมอ
   * รายละเอียดเรื่องการล็อกดูที่ src/lib/cms/migrate-on-start.ts
   */
  onInit: (payload) => migrateOnStart(payload, migrations),

  /**
   * SQLite — เก็บทั้งฐานข้อมูลไว้ในไฟล์เดียว
   *
   * เลือกเพราะโฮสต์เป็น Plesk แบบแชร์ ซึ่งมีให้แค่ MariaDB ที่ Payload ไม่รองรับ
   * และติดตั้ง PostgreSQL เองไม่ได้เพราะไม่มีสิทธิ์ root
   *
   * เหมาะกับเว็บนี้: ผู้ดูแลไม่กี่คน ปริมาณเขียนต่ำมาก และสำรองข้อมูลคือการคัดลอกไฟล์
   * ข้อแลกเปลี่ยนคือการเขียนพร้อมกันถูกจัดคิวทีละคำสั่ง ถ้าวันหนึ่งมีคนแก้พร้อมกันมาก
   * หรือทราฟฟิกสูงขึ้นมาก ค่อยย้ายไป PostgreSQL
   */
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URI || "file:./bantonpoo.db" },
    /**
     * รอสูงสุด 5 วินาทีเมื่อไฟล์ถูกล็อก แทนที่จะล้มทันที
     * กันกรณี Passenger เปิดแอปหลายโพรเซสพร้อมกันแล้วแย่งกันเขียน
     */
    busyTimeout: 5000,
    /**
     * push ปรับโครงฐานข้อมูลให้อัตโนมัติ สะดวกตอนพัฒนา
     * แต่บนเซิร์ฟเวอร์จริงต้องปิด เพราะเมื่อมันไม่แน่ใจว่าคอลัมน์ถูก "สร้างใหม่"
     * หรือ "เปลี่ยนชื่อ" มันจะถามคำถามในเทอร์มินัลแล้วค้างรอคำตอบ
     * ทำให้เว็บขึ้นไม่ได้ — บนเซิร์ฟเวอร์ให้ใช้ไฟล์ migration แทน
     */
    push: process.env.NODE_ENV !== "production",
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

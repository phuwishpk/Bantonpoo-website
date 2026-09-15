import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai, Noto_Serif_Thai, Prompt, Sarabun, Trirong } from "next/font/google";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SiteProvider } from "@/components/site-context";
import { PreviewBar } from "@/components/preview-bar";
import { ThemeStyle } from "@/components/theme-style";
import { getNavigation } from "@/lib/cms/navigation";
import { isDraftMode } from "@/lib/cms/draft";
import { getPageGlobal, getSite, getTheme } from "@/lib/cms/queries";
import { locList } from "@/lib/cms/map";
import { t } from "@/lib/i18n";
import { localBusinessJsonLd, siteUrl } from "@/lib/seo";
import { isNoIndex } from "@/lib/site-url";
import "./globals.css";

/* ฟอนต์: sans สำหรับเนื้อหา, serif สำหรับหัวเรื่อง เพื่อได้อารมณ์งานหัตถกรรม */
const plexThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-thai",
  display: "swap",
});

const serifThai = Noto_Serif_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif-thai",
  display: "swap",
});

/*
  ฟอนต์ทางเลือกที่ผู้ดูแลเลือกได้ในหน้า "ธีมและหน้าตาเว็บ"
  ตั้ง preload: false เพราะเบราว์เซอร์จะโหลดเฉพาะฟอนต์ที่ถูกใช้จริงเท่านั้น
  ถ้า preload ทุกตัวจะเสียแบนด์วิดท์ไปกับฟอนต์ที่ไม่ได้ใช้
*/
const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sarabun",
  display: "swap",
  preload: false,
});

const trirong = Trirong({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-trirong",
  display: "swap",
  preload: false,
});

const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
  display: "swap",
  preload: false,
});

const FONT_VARIABLES = [plexThai, serifThai, sarabun, trirong, prompt]
  .map((font) => font.variable)
  .join(" ");

export async function generateMetadata(): Promise<Metadata> {
  const [site, seo] = await Promise.all([getSite(), getPageGlobal("seo-settings")]);

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${t(site.communityName)} — ${t(site.tagline)}`,
      template: `%s | ${t(site.communityShortName)}`,
    },
    description: t(site.aboutSummary),
    keywords: t(locList(seo.keywords)),
    authors: [{ name: t(site.communityName) }],
    openGraph: {
      type: "website",
      locale: "th_TH",
      siteName: t(site.communityName),
      url: siteUrl,
    },
    // robots.txt อย่างเดียวไม่พอ ถ้าหน้าถูกลิงก์จากที่อื่น Google ยังเก็บได้ ต้องใส่ meta ด้วย
    robots: isNoIndex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#1e232a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [site, nav, theme, draft] = await Promise.all([
    getSite(),
    getNavigation(),
    getTheme(),
    isDraftMode(),
  ]);

  return (
    <html lang="th" className={FONT_VARIABLES}>
      <body className="flex min-h-dvh flex-col font-sans">
        <ThemeStyle theme={theme} />
        <SiteProvider site={site}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-leaf-500 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
          >
            ข้ามไปยังเนื้อหาหลัก
          </a>
          {draft ? <PreviewBar path="/" /> : null}
          <SiteHeader nav={nav} editing={draft} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter site={site} nav={nav} editing={draft} />
        </SiteProvider>
        <JsonLd data={localBusinessJsonLd(site)} />
      </body>
    </html>
  );
}

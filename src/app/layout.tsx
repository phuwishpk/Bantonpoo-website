import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai, Noto_Serif_Thai } from "next/font/google";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/content/site";
import { t } from "@/lib/i18n";
import { localBusinessJsonLd, siteUrl } from "@/lib/seo";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${t(site.communityName)} — ${t(site.tagline)}`,
    template: `%s | ${t(site.communityShortName)}`,
  },
  description: t(site.aboutSummary),
  keywords: [
    "บ้านต้นโพธิ์",
    "ยาหม่องน้ำสมุนไพรบ้านต้นโพธิ์",
    "วิสาหกิจชุมชนสมุนไพร",
    "ชุมชนมอญ",
    "วัดเจตวงศ์",
    "บางขะแยง",
    "ปทุมธานี",
    "ท่องเที่ยวชุมชน",
    "สมุนไพรไทย",
    "ลูกประคบสมุนไพร",
  ],
  authors: [{ name: t(site.communityName) }],
  openGraph: {
    type: "website",
    locale: "th_TH",
    siteName: t(site.communityName),
    url: siteUrl,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1e232a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${plexThai.variable} ${serifThai.variable}`}>
      <body className="flex min-h-dvh flex-col font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-leaf-500 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
        >
          ข้ามไปยังเนื้อหาหลัก
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <JsonLd data={localBusinessJsonLd()} />
      </body>
    </html>
  );
}

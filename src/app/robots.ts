import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { isNoIndex } from "@/lib/site-url";

/**
 * ค่านี้ถูกกำหนดตอน build ไม่ใช่ตอนรัน
 *
 * เคยลองทำเป็น force-dynamic เพื่อให้อ่าน env ตอนรันได้ แต่ Next 16
 * ทำให้ /robots.txt หายไปเลย (404) จึงกลับมาใช้แบบสแตติก
 *
 * ผลคือ SITE_NOINDEX ต้องตั้งตอน build ด้วย — ซึ่งตรงกับพฤติกรรมของแท็ก
 * <meta name="robots"> อยู่แล้ว และ scripts/deploy.sh ส่งค่าให้ตอน build ให้เรียบร้อย
 */
export default function robots(): MetadataRoute.Robots {
  if (isNoIndex) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/payload-api/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

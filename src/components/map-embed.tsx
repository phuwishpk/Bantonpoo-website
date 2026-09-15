import type { SiteSettings } from "@/content/types";

/**
 * แผนที่ Google Maps แบบฝัง
 *
 * ใช้รูปแบบ output=embed ซึ่งไม่ต้องใช้ API key และไม่มีค่าใช้จ่าย
 * รับพิกัดเป็น props เพราะพิกัดมาจาก CMS แล้ว ไม่ใช่ค่าคงที่ในโค้ด
 */
export function MapEmbed({
  site,
  className = "",
  title = "แผนที่ชุมชนบ้านต้นโพธิ์",
}: {
  site: SiteSettings;
  className?: string;
  title?: string;
}) {
  const src = `https://www.google.com/maps?q=${site.mapLatitude},${site.mapLongitude}&hl=th&z=15&output=embed`;
  return (
    <iframe
      src={src}
      title={title}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
      className={`h-full w-full border-0 ${className}`}
    />
  );
}

/** ลิงก์เปิดแอปแผนที่เพื่อนำทาง */
export const directionsUrl = (site: SiteSettings) =>
  `https://www.google.com/maps/dir/?api=1&destination=${site.mapLatitude},${site.mapLongitude}`;

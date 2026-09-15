import { site } from "@/content/site";

/**
 * แผนที่ Google Maps แบบฝัง
 *
 * ใช้รูปแบบ output=embed ซึ่งไม่ต้องใช้ API key และไม่มีค่าใช้จ่าย
 * (ถ้าภายหลังต้องการหมุด/สไตล์กำหนดเอง ค่อยเปลี่ยนไปใช้ Maps Embed API พร้อมคีย์)
 */
export function MapEmbed({ className = "", title = "แผนที่ชุมชนบ้านต้นโพธิ์" }: { className?: string; title?: string }) {
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
export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${site.mapLatitude},${site.mapLongitude}`;

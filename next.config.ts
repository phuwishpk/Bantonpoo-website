import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * standalone รวมเฉพาะ dependency ที่ใช้จริงไว้ใน .next/standalone
   * ทำให้อัปโหลดขึ้นเซิร์ฟเวอร์แล้วรันด้วย `node server.js` ได้เลย
   * ไม่ต้อง npm install บนเครื่องปลายทาง
   */
  output: "standalone",

  // ภาพทั้งหมดในเวอร์ชัน prototype เป็นไฟล์ local (SVG placeholder)
  // เมื่อย้ายไป Payload CMS ให้เพิ่ม remotePatterns ของ storage ที่ใช้จริงตรงนี้
  images: {
    remotePatterns: [],
  },

  // เซิร์ฟเวอร์อยู่หลัง nginx ที่ทำ TLS ให้ จึงต้องเชื่อ X-Forwarded-* header
  // ไม่งั้น Next จะสร้าง URL เป็น http:// แทน https://
  poweredByHeader: false,
};

// withPayload ผูกหน้าแอดมินและ API ของ Payload เข้ากับ Next.js
export default withPayload(nextConfig, { devBundleServerPackages: false });

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ภาพทั้งหมดในเวอร์ชัน prototype เป็นไฟล์ local (SVG placeholder)
  // เมื่อย้ายไป Payload CMS ให้เพิ่ม remotePatterns ของ storage ที่ใช้จริงตรงนี้
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;

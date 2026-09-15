import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * ตรวจคุณภาพโค้ดด้วยกฎมาตรฐานของ Next.js
 * รันด้วย: npm run lint
 */
const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // ไฟล์ที่สร้างอัตโนมัติ ไม่ต้องตรวจ
    ignores: [".next/**", "node_modules/**", "src/content/placeholders.ts"],
  },
];

export default config;

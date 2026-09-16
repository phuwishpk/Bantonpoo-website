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
    ignores: [
      ".next/**",
      "node_modules/**",
      "scripts/seed-data/placeholders.ts",
      // ไฟล์ที่ Payload สร้างอัตโนมัติ
      "src/payload-types.ts",
      "src/app/(payload)/admin/importMap.js",
      // migration ถูกสร้างจากส่วนต่างของสคีมา ห้ามแก้ด้วยมือเพื่อให้ผ่าน lint
      "src/migrations/**",
    ],
  },
];

export default config;

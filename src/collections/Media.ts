import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CollectionConfig } from "payload";
import { anyone, isAdmin, isEditor } from "@/access";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * คลังรูปภาพ
 *
 * alt กับ credit เป็นฟิลด์บังคับโดยตั้งใจ — โปรเจกต์นี้เคยเจอกรณีภาพลิขสิทธิ์
 * ของหน่วยงานอื่นมาแล้ว การบังคับให้ระบุที่มาตั้งแต่ตอนอัปโหลด
 * ทำให้ตรวจย้อนได้เสมอว่ารูปไหนใช้ได้และรูปไหนยังไม่ได้ขออนุญาต
 */
export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "รูปภาพ", plural: "คลังรูปภาพ" },
  admin: { group: "เนื้อหา", description: "รูปทั้งหมดที่ใช้บนเว็บไซต์" },
  access: { read: anyone, create: isEditor, update: isEditor, delete: isAdmin },
  upload: {
    // เก็บนอกโฟลเดอร์แอป เพราะตอน deploy จะเขียนทับโฟลเดอร์แอปทั้งหมด
    staticDir: process.env.UPLOAD_DIR || path.resolve(dirname, "../../uploads"),
    // svg อยู่ในรายการเพราะชุดภาพตัวอย่างของ prototype เป็น svg
    // เมื่อแทนที่ด้วยรูปถ่ายจริงครบแล้ว เอา svg ออกได้เพื่อความปลอดภัย
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"],
    focalPoint: true,
    adminThumbnail: "thumb",
    imageSizes: [
      { name: "thumb", width: 320, height: 320, position: "centre" },
      { name: "card", width: 800 },
      { name: "wide", width: 1600 },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      localized: true,
      label: "คำบรรยายภาพ",
      admin: {
        description: "อธิบายว่าในภาพมีอะไร สำหรับผู้ใช้โปรแกรมอ่านหน้าจอและเพื่อ SEO",
      },
    },
    {
      name: "caption",
      type: "text",
      localized: true,
      label: "คำบรรยายที่แสดงใต้ภาพ",
      admin: { description: "เว้นว่างได้ ถ้าไม่ต้องการให้แสดงข้อความใต้ภาพ" },
    },
    {
      name: "credit",
      type: "text",
      required: true,
      label: "เจ้าของภาพ / แหล่งที่มา",
      admin: { description: 'เช่น "ถ่ายโดยชุมชนบ้านต้นโพธิ์" หรือ "เทศบาลตำบลบางขะแยง (2567)"' },
    },
    {
      name: "usageRights",
      type: "select",
      required: true,
      defaultValue: "own",
      label: "สิทธิ์การใช้งาน",
      options: [
        { label: "ชุมชนถ่ายเอง", value: "own" },
        { label: "ได้รับอนุญาตแล้ว", value: "licensed" },
        { label: "ยังไม่ได้ขออนุญาต — ห้ามนำขึ้นเว็บ", value: "pending" },
      ],
      admin: {
        description: "รูปที่ยังไม่ได้ขออนุญาตจะถูกกันไม่ให้นำไปใช้ในเนื้อหา",
      },
    },
  ],
};

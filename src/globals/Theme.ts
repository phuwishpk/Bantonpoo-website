import type { GlobalConfig } from "payload";
import { anyone, isEditor } from "@/access";
import { revalidateGlobal } from "@/hooks/revalidate";

/**
 * ธีมของเว็บไซต์
 *
 * แนวคิด: ไม่เปิดให้แก้ CSS ดิบเป็นหลัก แต่เปิด "ปุ่มหมุน" ที่ปลอดภัยแทน
 * ทุกค่าในนี้ถูกแปลงเป็นตัวแปร CSS แล้วฉีดทับค่าเดิม ผู้ดูแลจึงเปลี่ยนหน้าตาเว็บได้
 * โดยไม่มีทางทำ layout พัง
 *
 * ช่อง "CSS เพิ่มเติม" มีไว้เป็นทางออกสุดท้าย เปิดให้เฉพาะผู้ดูแลระบบ
 * และผ่านการกรองก่อนนำไปใช้ (ดู src/lib/theme.ts)
 */
export const Theme: GlobalConfig = {
  slug: "theme",
  label: "ธีมและหน้าตาเว็บ",
  admin: {
    group: "ตั้งค่าเว็บไซต์",
    description: "เปลี่ยนสี ตัวอักษร ความมน และความโปร่งของเว็บทั้งหมดจากที่นี่",
  },
  access: { read: anyone, update: isEditor },
  versions: { max: 30, drafts: true },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "สี",
          fields: [
            {
              name: "palette",
              type: "select",
              required: true,
              defaultValue: "leaf",
              label: "ชุดสีหลัก",
              options: [
                { label: "เขียวสมุนไพร (ค่าเริ่มต้น)", value: "leaf" },
                { label: "ส้มอิฐ", value: "ember" },
                { label: "ครามน้ำเงิน", value: "indigo" },
                { label: "แดงชาด", value: "crimson" },
                { label: "กำหนดสีเอง", value: "custom" },
              ],
            },
            {
              name: "accentColor",
              type: "text",
              label: "สีหลัก (รหัสสี)",
              defaultValue: "#2e7d52",
              admin: {
                condition: (_, sibling) => sibling?.palette === "custom",
                description: "ใส่เป็นรหัสสีแบบ #rrggbb เช่น #2e7d52 ระบบจะไล่เฉดอ่อน-เข้มให้เอง",
              },
              validate: (value: unknown) => {
                if (typeof value !== "string" || !/^#[0-9a-fA-F]{6}$/.test(value)) {
                  return "ต้องเป็นรหัสสีแบบ #rrggbb เช่น #2e7d52";
                }
                return true;
              },
            },
            {
              name: "surface",
              type: "select",
              required: true,
              defaultValue: "rice",
              label: "สีพื้นหลังเว็บ",
              options: [
                { label: "ครีมข้าว (ค่าเริ่มต้น)", value: "rice" },
                { label: "ขาวสะอาด", value: "white" },
                { label: "เทาอ่อน", value: "grey" },
              ],
            },
          ],
        },
        {
          label: "ตัวอักษร",
          fields: [
            {
              name: "fontPair",
              type: "select",
              required: true,
              defaultValue: "plex-noto",
              label: "คู่ฟอนต์",
              options: [
                { label: "IBM Plex Sans Thai + Noto Serif Thai (ค่าเริ่มต้น)", value: "plex-noto" },
                { label: "Sarabun + Trirong — ทางการ อ่านง่าย", value: "sarabun-trirong" },
                { label: "Prompt — โมเดิร์น เรียบ", value: "prompt" },
              ],
              admin: { description: "ฟอนต์ถูกโหลดมาพร้อมเว็บ จึงเลือกได้เฉพาะในรายการนี้" },
            },
            {
              name: "baseFontSize",
              type: "select",
              required: true,
              defaultValue: "16",
              label: "ขนาดตัวอักษรพื้นฐาน",
              options: [
                { label: "เล็ก (15px)", value: "15" },
                { label: "ปกติ (16px)", value: "16" },
                { label: "ใหญ่ (17px)", value: "17" },
                { label: "ใหญ่มาก (18px)", value: "18" },
              ],
              admin: { description: "มีผลกับขนาดตัวอักษรทั้งเว็บพร้อมกัน" },
            },
          ],
        },
        {
          label: "รูปทรงและระยะห่าง",
          fields: [
            {
              name: "radius",
              type: "select",
              required: true,
              defaultValue: "medium",
              label: "ความมนของมุม",
              options: [
                { label: "คม", value: "sharp" },
                { label: "มนเล็กน้อย (ค่าเริ่มต้น)", value: "medium" },
                { label: "มนมาก", value: "round" },
              ],
            },
            {
              name: "density",
              type: "select",
              required: true,
              defaultValue: "normal",
              label: "ความโปร่งของหน้า",
              options: [
                { label: "กระชับ — เนื้อหาชิดกัน", value: "compact" },
                { label: "มาตรฐาน (ค่าเริ่มต้น)", value: "normal" },
                { label: "โปร่ง — เว้นระยะมาก", value: "airy" },
              ],
              admin: { description: "ปรับระยะห่างทุกจุดในเว็บพร้อมกัน" },
            },
          ],
        },
        {
          label: "CSS เพิ่มเติม",
          description:
            "สำหรับผู้ดูแลระบบที่เขียน CSS เป็นเท่านั้น — ใช้เมื่อปุ่มด้านบนปรับไม่ได้ตามต้องการ",
          fields: [
            {
              name: "customCss",
              type: "textarea",
              label: "CSS เพิ่มเติม",
              // เปิดให้เฉพาะ admin เพราะ CSS ที่ผิดพลาดทำให้หน้าเว็บอ่านไม่ได้
              access: { update: ({ req }) => req.user?.role === "admin" },
              admin: {
                rows: 12,
                description:
                  "ระบบจะกรอง @import, url() ที่ชี้ออกนอกเว็บ และแท็ก HTML ออกก่อนใช้งานเสมอ · จำกัด 8,000 ตัวอักษร · ถ้าเว็บเพี้ยน ให้ลบข้อความในช่องนี้แล้วบันทึกใหม่",
              },
              maxLength: 8000,
            },
          ],
        },
      ],
    },
  ],
};

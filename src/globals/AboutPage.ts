import type { GlobalConfig } from "payload";
import { anyone, isEditor } from "@/access";
import {
  heroFields,
  linkFields,
  proseBlocksField,
  sectionHeadingField,
  statsField,
  textListField,
} from "@/fields";
import { revalidatePage } from "@/hooks/revalidate";

export const AboutPage: GlobalConfig = {
  slug: "about-page",
  label: "หน้าเกี่ยวกับชุมชน",
  admin: { group: "เนื้อหาประจำหน้า" },
  access: { read: anyone, update: isEditor },
  versions: { max: 20 },
  hooks: { afterChange: [revalidatePage("/about")] },
  fields: [
    {
      type: "tabs",
      tabs: [
        { label: "หัวหน้าเพจ", fields: [heroFields()] },
        {
          label: "ประวัติชุมชน",
          fields: [
            sectionHeadingField("historySection", "หัวข้อส่วนประวัติ"),
            { name: "historyImage", type: "upload", relationTo: "media", label: "ภาพประกอบ" },
            proseBlocksField("historyContent", "เนื้อหาประวัติ"),
            statsField("facts", "ตัวเลขของชุมชน", 4),
            {
              name: "historyLink",
              type: "group",
              label: "ลิงก์อ่านเพิ่มเติม",
              fields: linkFields(),
            },
          ],
        },
        {
          label: "ทุนชุมชน",
          fields: [
            sectionHeadingField("assetsSection", "หัวข้อส่วนทุนชุมชน"),
            {
              name: "assets",
              type: "array",
              label: "รายการทุนชุมชน",
              labels: { singular: "รายการ", plural: "ทุนชุมชน" },
              fields: [
                { name: "title", type: "text", required: true, localized: true, label: "ชื่อ" },
                { name: "body", type: "textarea", required: true, localized: true, label: "คำอธิบาย" },
              ],
            },
          ],
        },
        {
          label: "ปราชญ์ชุมชนและปิดท้าย",
          fields: [
            sectionHeadingField("artisansSection", "หัวข้อส่วนทำเนียบปราชญ์ชุมชน"),
            {
              name: "closing",
              type: "group",
              label: "กล่องปิดท้าย",
              fields: [
                { name: "title", type: "text", required: true, localized: true, label: "หัวเรื่อง" },
                { name: "body", type: "textarea", localized: true, label: "เนื้อหา" },
                { name: "image", type: "upload", relationTo: "media", label: "ภาพ" },
                { name: "primaryButton", type: "group", label: "ปุ่มหลัก", fields: linkFields() },
                { name: "secondaryButton", type: "group", label: "ปุ่มรอง", fields: linkFields() },
              ],
            },
            textListField({
              name: "references",
              label: "แหล่งอ้างอิง",
              itemLabel: "แหล่งอ้างอิง",
              multiline: true,
              description: "แสดงท้ายหน้า เพื่อให้ผู้อ่านตรวจสอบที่มาของข้อมูลได้",
            }),
          ],
        },
      ],
    },
  ],
};

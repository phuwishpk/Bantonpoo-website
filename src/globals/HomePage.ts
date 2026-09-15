import type { GlobalConfig } from "payload";
import { anyone, isEditor } from "@/access";
import { linkFields, sectionHeadingField, statsField } from "@/fields";
import { revalidatePage } from "@/hooks/revalidate";

export const HomePage: GlobalConfig = {
  slug: "home-page",
  label: "หน้าแรก",
  admin: { group: "เนื้อหาประจำหน้า" },
  access: { read: anyone, update: isEditor },
  versions: { max: 20 },
  hooks: { afterChange: [revalidatePage("/")] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "แบนเนอร์บนสุด",
          fields: [
            {
              name: "hero",
              type: "group",
              label: "แบนเนอร์",
              fields: [
                { name: "eyebrow", type: "text", localized: true, label: "ข้อความนำ (ตัวเล็กสีเขียว)" },
                {
                  name: "titleLines",
                  type: "array",
                  required: true,
                  minRows: 1,
                  maxRows: 4,
                  label: "หัวเรื่อง (บรรทัดละแถว)",
                  labels: { singular: "บรรทัด", plural: "บรรทัด" },
                  localized: true,
                  admin: {
                    description:
                      "แยกเป็นบรรทัดเองเพราะภาษาไทยไม่มีช่องว่างระหว่างคำ ถ้าปล่อยให้เบราว์เซอร์ตัดเองอาจตัดกลางคำ",
                  },
                  fields: [
                    { name: "text", type: "text", required: true, label: "ข้อความ" },
                    { name: "accent", type: "checkbox", label: "ใช้สีเขียวเน้น" },
                  ],
                },
                { name: "subtitle", type: "textarea", required: true, localized: true, label: "คำโปรย" },
                { name: "primaryButton", type: "group", label: "ปุ่มหลัก", fields: linkFields() },
                { name: "secondaryButton", type: "group", label: "ปุ่มรอง", fields: linkFields() },
                { name: "image", type: "upload", relationTo: "media", label: "ภาพด้านขวา" },
                { name: "imageCaption", type: "text", localized: true, label: "คำบรรยายใต้ภาพ" },
                statsField("stats", "ตัวเลขใต้ปุ่ม", 3),
              ],
            },
          ],
        },
        {
          label: "จุดเด่นชุมชน",
          fields: [
            {
              name: "highlights",
              type: "array",
              minRows: 3,
              maxRows: 3,
              label: "การ์ดจุดเด่น",
              labels: { singular: "การ์ด", plural: "การ์ดจุดเด่น" },
              fields: [
                {
                  name: "icon",
                  type: "select",
                  required: true,
                  label: "ไอคอน",
                  // จำกัดเป็นตัวเลือกเพื่อให้ไอคอนเข้าชุดกับดีไซน์เสมอ
                  options: [
                    { label: "ใบไม้ (สมุนไพร)", value: "leaf" },
                    { label: "เจดีย์ (วัด/วัฒนธรรม)", value: "temple" },
                    { label: "ครก (การแปรรูป)", value: "mortar" },
                    { label: "กลุ่มคน (ชุมชน)", value: "users" },
                    { label: "หมุดแผนที่", value: "map-pin" },
                  ],
                },
                { name: "title", type: "text", required: true, localized: true, label: "หัวเรื่อง" },
                {
                  name: "body",
                  type: "textarea",
                  required: true,
                  localized: true,
                  maxLength: 220,
                  label: "เนื้อหา",
                },
              ],
            },
          ],
        },
        {
          label: "ลำดับและการแสดงส่วนต่าง ๆ",
          description: "ลากเพื่อสลับลำดับ ติ๊กออกเพื่อซ่อน และเลือกรูปแบบการวางของแต่ละส่วน",
          fields: [
            {
              name: "sections",
              type: "array",
              label: "ส่วนต่าง ๆ ของหน้าแรก",
              labels: { singular: "ส่วน", plural: "ส่วนต่าง ๆ" },
              admin: {
                description:
                  "ส่วนที่ไม่ได้อยู่ในรายการนี้จะไม่แสดงบนหน้าเว็บ · แบนเนอร์บนสุดอยู่ที่ตำแหน่งแรกเสมอ แก้ลำดับไม่ได้",
              },
              fields: [
                {
                  name: "type",
                  type: "select",
                  required: true,
                  label: "ส่วนไหน",
                  // ค่าเหล่านี้ผูกกับคอมโพเนนต์ในโค้ด จึงเป็นตัวเลือกไม่ใช่ช่องพิมพ์
                  options: [
                    { label: "การ์ดจุดเด่นชุมชน", value: "highlights" },
                    { label: "สินค้าแนะนำ", value: "featured-products" },
                    { label: "เรื่องเล่าเด่น", value: "spotlight" },
                    { label: "ฐานเรียนรู้และกิจกรรม", value: "workshops" },
                    { label: "บทความล่าสุด", value: "latest-articles" },
                    { label: "กล่องชวนติดต่อ", value: "cta" },
                  ],
                },
                { name: "enabled", type: "checkbox", defaultValue: true, label: "แสดงส่วนนี้" },
                {
                  name: "background",
                  type: "select",
                  defaultValue: "page",
                  label: "พื้นหลัง",
                  options: [
                    { label: "สีพื้นของหน้า", value: "page" },
                    { label: "พื้นเข้ม", value: "dark" },
                    { label: "พื้นอ่อนตัดกัน", value: "tint" },
                  ],
                  admin: {
                    condition: (_, sibling) =>
                      ["highlights", "featured-products", "workshops", "latest-articles"].includes(
                        sibling?.type
                      ),
                  },
                },
                {
                  name: "columns",
                  type: "select",
                  defaultValue: "auto",
                  label: "จำนวนคอลัมน์",
                  options: [
                    { label: "ตามค่าเริ่มต้น", value: "auto" },
                    { label: "2 คอลัมน์", value: "2" },
                    { label: "3 คอลัมน์", value: "3" },
                    { label: "4 คอลัมน์", value: "4" },
                  ],
                  admin: {
                    condition: (_, sibling) =>
                      ["highlights", "featured-products", "workshops", "latest-articles"].includes(
                        sibling?.type
                      ),
                  },
                },
                {
                  name: "limit",
                  type: "number",
                  min: 1,
                  max: 12,
                  label: "จำนวนรายการที่แสดง",
                  admin: {
                    condition: (_, sibling) =>
                      ["featured-products", "latest-articles", "workshops"].includes(sibling?.type),
                    description: "เว้นว่างไว้เพื่อใช้ค่าเริ่มต้น",
                  },
                },
              ],
            },
          ],
        },
        {
          label: "หัวข้อแต่ละส่วน",
          fields: [
            sectionHeadingField("featuredSection", "ส่วนสินค้าแนะนำ"),
            sectionHeadingField("experienceSection", "ส่วนกิจกรรม"),
            sectionHeadingField("storiesSection", "ส่วนบทความล่าสุด"),
            {
              name: "spotlight",
              type: "group",
              label: "ส่วนเรื่องเล่าเด่น",
              fields: [
                { name: "eyebrow", type: "text", localized: true, label: "ข้อความนำ" },
                {
                  name: "article",
                  type: "relationship",
                  relationTo: "articles",
                  label: "บทความที่จะแสดง",
                  admin: { description: "เว้นว่างได้ ระบบจะซ่อนส่วนนี้ไป" },
                },
                { name: "quote", type: "textarea", localized: true, label: "ข้อความอ้างอิง" },
                { name: "attribution", type: "text", localized: true, label: "ที่มาของข้อความ" },
              ],
            },
          ],
        },
        {
          label: "กล่องปิดท้าย",
          fields: [
            {
              name: "cta",
              type: "group",
              label: "กล่องชวนติดต่อ",
              fields: [
                { name: "eyebrow", type: "text", localized: true, label: "ข้อความนำ" },
                { name: "title", type: "text", required: true, localized: true, label: "หัวเรื่อง" },
                { name: "body", type: "textarea", localized: true, label: "เนื้อหา" },
              ],
            },
          ],
        },
      ],
    },
  ],
};

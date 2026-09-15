import type { GlobalConfig } from "payload";
import { anyone, isEditor } from "@/access";
import {
  linkFields,
  sectionHeadingField,
  sectionsField,
  statsField,
  typographyCollapsible,
} from "@/fields";
import { revalidatePage } from "@/hooks/revalidate";

export const HomePage: GlobalConfig = {
  slug: "home-page",
  label: "หน้าแรก",
  admin: { group: "เนื้อหาประจำหน้า" },
  access: { read: anyone, update: isEditor },
  // drafts เปิดไว้เพื่อให้ดูตัวอย่างก่อนเผยแพร่ได้ — บันทึกฉบับร่างจะยังไม่ขึ้นเว็บจริง
  versions: { max: 20, drafts: true },
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
                typographyCollapsible("ตัวอักษรและการจัดวางของแบนเนอร์"),
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
            sectionsField({
              types: [
                { label: "การ์ดจุดเด่นชุมชน", value: "highlights" },
                { label: "สินค้าแนะนำ", value: "featured-products" },
                { label: "เรื่องเล่าเด่น", value: "spotlight" },
                { label: "ฐานเรียนรู้และกิจกรรม", value: "workshops" },
                { label: "บทความล่าสุด", value: "latest-articles" },
                { label: "กล่องชวนติดต่อ", value: "cta" },
              ],
              gridTypes: ["highlights", "featured-products", "workshops", "latest-articles"],
              limitTypes: ["featured-products", "latest-articles", "workshops"],
              description:
                "ลากเพื่อสลับลำดับ ติ๊กออกเพื่อซ่อน · แบนเนอร์บนสุดอยู่ตำแหน่งแรกเสมอ แก้ลำดับไม่ได้",
            }),
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

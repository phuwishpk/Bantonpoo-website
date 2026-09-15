import type { CollectionConfig } from "payload";
import { anyone, isAdmin, isEditor } from "@/access";
import { slugField, textListField } from "@/fields";
import { revalidateArticles } from "@/hooks/revalidate";

/**
 * เนื้อหาบทความใช้ฟิลด์ชนิด blocks ไม่ใช่ rich text แบบอิสระ
 *
 * เหตุผล: หน้าเว็บเรนเดอร์แต่ละบล็อกด้วยสไตล์ที่ออกแบบไว้แล้ว การให้ผู้ดูแล
 * เลือกบล็อกจากรายการจึงได้ผลลัพธ์ที่หน้าตาสม่ำเสมอ และทำหน้าพังไม่ได้
 * ตรงกับแนวทาง "แก้ข้อมูลเชิงระบบ" ที่ตกลงกันไว้
 *
 * ข้อแลก: ยังจัดตัวหนา/ตัวเอียง/ลิงก์ภายในย่อหน้าไม่ได้
 * ถ้าภายหลังต้องการ ให้เปลี่ยนฟิลด์ text ของบล็อก paragraph เป็น richText
 */
export const Articles: CollectionConfig = {
  slug: "articles",
  labels: { singular: "บทความ", plural: "เรื่องเล่าและข่าว" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "publishedAt", "featured"],
    group: "เนื้อหา",
  },
  access: { read: anyone, create: isEditor, update: isEditor, delete: isAdmin },
  versions: { maxPerDoc: 20, drafts: true },
  defaultSort: "-publishedAt",
  hooks: { afterChange: [revalidateArticles], afterDelete: [revalidateArticles] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "ข้อมูลบทความ",
          fields: [
            { name: "title", type: "text", required: true, localized: true, label: "ชื่อเรื่อง" },
            {
              name: "excerpt",
              type: "textarea",
              required: true,
              localized: true,
              maxLength: 300,
              label: "คำโปรย",
            },
            {
              name: "coverImage",
              type: "upload",
              relationTo: "media",
              required: true,
              label: "ภาพหน้าปก",
            },
            {
              name: "category",
              type: "relationship",
              relationTo: "categories",
              required: true,
              label: "หมวดหมู่",
              filterOptions: { type: { equals: "article" } },
            },
            {
              name: "author",
              type: "text",
              required: true,
              localized: true,
              defaultValue: "กองบรรณาธิการชุมชนบ้านต้นโพธิ์",
              label: "ผู้เขียน",
            },
            {
              name: "artisan",
              type: "relationship",
              relationTo: "artisans",
              label: "ผู้เขียนเป็นปราชญ์ชุมชนคนใด",
              admin: { description: "ใส่เมื่อผู้เขียนอยู่ในทำเนียบ จะดึงภาพและประวัติมาแสดงท้ายบทความ" },
            },
          ],
        },
        {
          label: "เนื้อหา",
          fields: [
            {
              name: "content",
              type: "blocks",
              required: true,
              minRows: 1,
              label: "เนื้อหาบทความ",
              labels: { singular: "บล็อก", plural: "บล็อกเนื้อหา" },
              blocks: [
                {
                  slug: "heading",
                  labels: { singular: "หัวข้อ", plural: "หัวข้อ" },
                  fields: [
                    { name: "text", type: "text", required: true, localized: true, label: "ข้อความ" },
                    {
                      name: "level",
                      type: "select",
                      required: true,
                      defaultValue: "2",
                      label: "ระดับหัวข้อ",
                      options: [
                        { label: "หัวข้อใหญ่", value: "2" },
                        { label: "หัวข้อย่อย", value: "3" },
                      ],
                    },
                  ],
                },
                {
                  slug: "paragraph",
                  labels: { singular: "ย่อหน้า", plural: "ย่อหน้า" },
                  fields: [
                    { name: "text", type: "textarea", required: true, localized: true, label: "ข้อความ" },
                  ],
                },
                {
                  slug: "list",
                  labels: { singular: "รายการ", plural: "รายการ" },
                  fields: [
                    {
                      name: "style",
                      type: "select",
                      required: true,
                      defaultValue: "bullet",
                      label: "รูปแบบ",
                      options: [
                        { label: "จุดนำหน้า", value: "bullet" },
                        { label: "ตัวเลข", value: "number" },
                      ],
                    },
                    textListField({ name: "items", label: "หัวข้อย่อย", itemLabel: "ข้อ", multiline: true, minRows: 1 }),
                  ],
                },
                {
                  slug: "image",
                  labels: { singular: "ภาพประกอบ", plural: "ภาพประกอบ" },
                  fields: [
                    { name: "media", type: "upload", relationTo: "media", required: true, label: "ภาพ" },
                  ],
                },
                {
                  slug: "quote",
                  labels: { singular: "คำพูดอ้างอิง", plural: "คำพูดอ้างอิง" },
                  fields: [
                    { name: "text", type: "textarea", required: true, localized: true, label: "ข้อความ" },
                    { name: "attribution", type: "text", localized: true, label: "ที่มา / ผู้พูด" },
                  ],
                },
                {
                  slug: "youtube",
                  labels: { singular: "วิดีโอ YouTube", plural: "วิดีโอ YouTube" },
                  fields: [
                    {
                      name: "videoId",
                      type: "text",
                      required: true,
                      label: "รหัสวิดีโอ",
                      admin: { description: "ส่วนหลัง v= ในลิงก์ เช่น dQw4w9WgXcQ" },
                    },
                    { name: "title", type: "text", required: true, localized: true, label: "คำบรรยายวิดีโอ" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    slugField("title"),
    {
      name: "publishedAt",
      type: "date",
      required: true,
      label: "วันที่เผยแพร่",
      admin: { position: "sidebar", date: { pickerAppearance: "dayOnly", displayFormat: "d MMM yyyy" } },
    },
    { name: "featured", type: "checkbox", label: "แสดงบนหน้าแรก", admin: { position: "sidebar" } },
  ],
};

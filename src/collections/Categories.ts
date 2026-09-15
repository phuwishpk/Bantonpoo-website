import type { CollectionConfig } from "payload";
import { anyone, isAdmin, isEditor } from "@/access";
import { slugField } from "@/fields";

export const Categories: CollectionConfig = {
  slug: "categories",
  labels: { singular: "หมวดหมู่", plural: "หมวดหมู่" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "type", "order"],
    group: "เนื้อหา",
    description: "หมวดหมู่ใช้ร่วมกันทั้งสินค้าและบทความ แยกด้วยช่อง “ใช้กับ”",
  },
  access: { read: anyone, create: isEditor, update: isEditor, delete: isAdmin },
  defaultSort: "order",
  fields: [
    { name: "title", type: "text", required: true, localized: true, label: "ชื่อหมวดหมู่" },
    slugField("title"),
    {
      name: "type",
      type: "select",
      required: true,
      label: "ใช้กับ",
      options: [
        { label: "สินค้า", value: "product" },
        { label: "บทความ", value: "article" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "description", type: "textarea", localized: true, label: "คำอธิบายหมวดหมู่" },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      label: "ลำดับการแสดง",
      admin: { position: "sidebar", description: "เลขน้อยขึ้นก่อน" },
    },
  ],
};

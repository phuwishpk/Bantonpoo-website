import type { CollectionConfig } from "payload";
import { anyone, isAdmin, isEditor } from "@/access";
import { slugField, textListField } from "@/fields";
import { revalidateProducts } from "@/hooks/revalidate";

export const Products: CollectionConfig = {
  slug: "products",
  labels: { singular: "สินค้า", plural: "สินค้าชุมชน" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "category", "price", "status", "featured"],
    group: "เนื้อหา",
  },
  access: { read: anyone, create: isEditor, update: isEditor, delete: isAdmin },
  defaultSort: "order",
  hooks: { afterChange: [revalidateProducts], afterDelete: [revalidateProducts] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "ข้อมูลหลัก",
          fields: [
            { name: "name", type: "text", required: true, localized: true, label: "ชื่อสินค้า" },
            {
              name: "excerpt",
              type: "textarea",
              required: true,
              localized: true,
              maxLength: 300,
              label: "คำโปรยสั้น",
              admin: { description: "ใช้บนการ์ดสินค้าและในผลการค้นหาของ Google" },
            },
            {
              name: "category",
              type: "relationship",
              relationTo: "categories",
              required: true,
              label: "หมวดหมู่",
              filterOptions: { type: { equals: "product" } },
            },
            {
              name: "artisan",
              type: "relationship",
              relationTo: "artisans",
              required: true,
              label: "ผู้ผลิต",
            },
            {
              name: "gallery",
              type: "array",
              required: true,
              minRows: 1,
              label: "รูปสินค้า",
              labels: { singular: "รูป", plural: "รูปสินค้า" },
              admin: { description: "รูปแรกคือรูปหลักที่ใช้บนการ์ดและแคตตาล็อก" },
              fields: [{ name: "image", type: "upload", relationTo: "media", required: true }],
            },
            textListField({
              name: "story",
              label: "เรื่องเล่าของผลิตภัณฑ์",
              itemLabel: "ย่อหน้า",
              multiline: true,
            }),
            textListField({
              name: "badges",
              label: "ป้ายจุดเด่น",
              itemLabel: "ป้าย",
              maxRows: 4,
              description: "แสดงบนการ์ดและหน้าสินค้า ไม่ควรเกิน 4 ป้าย",
            }),
          ],
        },
        {
          label: "ราคาและสถานะ",
          fields: [
            {
              name: "price",
              type: "number",
              min: 0,
              label: "ราคา (บาท)",
              admin: { description: 'เว้นว่างไว้ถ้าต้องการให้ขึ้นว่า "สอบถามราคา"' },
            },
            {
              name: "status",
              type: "select",
              required: true,
              defaultValue: "in-stock",
              label: "สถานะ",
              options: [
                { label: "พร้อมส่ง", value: "in-stock" },
                { label: "สั่งทำล่วงหน้า", value: "made-to-order" },
                { label: "สินค้าหมด", value: "sold-out" },
              ],
            },
            {
              name: "leadTime",
              type: "text",
              localized: true,
              label: "ระยะเวลาสั่งทำ",
              admin: {
                condition: (data) => data?.status === "made-to-order",
                description: 'เช่น "แจ้งล่วงหน้าอย่างน้อย 7 วัน"',
              },
            },
            { name: "featured", type: "checkbox", label: "แสดงบนหน้าแรก" },
            { name: "order", type: "number", defaultValue: 0, label: "ลำดับการแสดง" },
          ],
        },
        {
          label: "รายละเอียดผลิตภัณฑ์",
          fields: [
            {
              name: "form",
              type: "select",
              required: true,
              label: "รูปแบบผลิตภัณฑ์",
              options: [
                { label: "ยาหม่องน้ำ", value: "liquid-balm" },
                { label: "ยาหม่องแบบตลับ", value: "solid-balm" },
                { label: "น้ำมันนวด", value: "massage-oil" },
                { label: "ลูกประคบ", value: "compress" },
                { label: "สบู่และของใช้", value: "soap" },
                { label: "ชาสมุนไพร", value: "tea" },
                { label: "สมุนไพรอบแห้ง", value: "dried-herb" },
                { label: "อื่น ๆ", value: "other" },
              ],
            },
            {
              name: "netContent",
              type: "text",
              required: true,
              localized: true,
              label: "ปริมาณสุทธิ",
              admin: { description: 'เช่น "ขวดแก้ว 20 มล." หรือ "ลูกละ 100 กรัม"' },
            },
            textListField({ name: "mainHerbs", label: "สมุนไพรหลัก", itemLabel: "สมุนไพร" }),
            textListField({
              name: "usage",
              label: "วิธีใช้",
              itemLabel: "ขั้นตอน",
              multiline: true,
              required: true,
              minRows: 1,
            }),
            { name: "shelfLife", type: "text", localized: true, label: "อายุการเก็บรักษา" },
            textListField({
              name: "careInstructions",
              label: "การเก็บรักษาและข้อควรระวัง",
              itemLabel: "ข้อ",
              multiline: true,
              required: true,
              minRows: 1,
            }),
          ],
        },
        {
          label: "ความปลอดภัยและการจดแจ้ง",
          fields: [
            {
              name: "externalUseOnly",
              type: "checkbox",
              defaultValue: true,
              label: "ใช้ภายนอกเท่านั้น (ห้ามรับประทาน)",
              admin: {
                description:
                  "ติ๊กแล้วหน้าสินค้าจะขึ้นกล่องเตือนอัตโนมัติ — ต้องไม่ติ๊กเฉพาะสินค้าที่รับประทานได้ เช่น ชาสมุนไพร",
              },
            },
            {
              name: "registrationType",
              type: "select",
              defaultValue: "none",
              label: "ประเภทการจดแจ้ง",
              options: [
                { label: "ยังไม่ได้จดแจ้ง", value: "none" },
                { label: "เครื่องสำอาง (อย.)", value: "fda-cosmetic" },
                { label: "ผลิตภัณฑ์สมุนไพร (อย.)", value: "fda-herbal" },
                { label: "มาตรฐานผลิตภัณฑ์ชุมชน (มผช.)", value: "tcps" },
              ],
            },
            {
              name: "registrationNo",
              type: "text",
              label: "เลขที่ใบรับแจ้ง / เลขมาตรฐาน",
              admin: {
                condition: (data) => data?.registrationType && data.registrationType !== "none",
                description: "กฎหมายกำหนดให้แสดงเลขนี้ หากผลิตภัณฑ์ได้จดแจ้งไว้",
              },
            },
          ],
        },
      ],
    },
    slugField("name"),
    {
      name: "sku",
      type: "text",
      required: true,
      unique: true,
      label: "รหัสสินค้า",
      admin: { position: "sidebar", description: "ใช้อ้างอิงตอนลูกค้าสั่งซื้อทาง LINE" },
    },
  ],
};

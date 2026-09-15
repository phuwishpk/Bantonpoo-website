import type { Block, CollectionConfig } from "payload";
import { anyone, isAdmin, isEditor } from "@/access";
import {
  blockStyleFields,
  heroFields,
  sectionHeadingField,
  slugField,
  textListField,
} from "@/fields";
import { revalidateCustomPage } from "@/hooks/revalidate";

/**
 * หน้าที่ผู้ดูแลสร้างเองได้ทั้งหน้า
 *
 * ต่างจาก Global ประจำหน้า (หน้าแรก / เกี่ยวกับชุมชน / ฯลฯ) ตรงที่หน้าเหล่านั้นมีโครง
 * ตายตัวเพราะผูกกับดีไซน์เฉพาะของมัน ส่วนหน้าในคอลเลกชันนี้ประกอบจาก "บล็อก"
 * ที่ลากสลับลำดับได้ จึงสร้างหน้าใหม่ได้โดยไม่ต้องแก้โค้ด
 *
 * ทางเลือกที่ตัดทิ้ง: ตัวสร้างหน้าแบบลากวางอิสระ (page builder เต็มรูปแบบ)
 * ยืดหยุ่นกว่าก็จริง แต่ทำให้หน้าออกมาไม่เข้าชุดกับที่เหลือของเว็บได้ง่ายมาก
 * ชุดบล็อกที่จำกัดไว้แบบนี้ให้ผลลัพธ์ที่ยังดูเป็นเว็บเดียวกันเสมอ
 */

/** หัวข้อของบล็อก — ใช้ซ้ำในหลายบล็อกที่มีหัวเรื่องนำหน้าเนื้อหา */
const heading = sectionHeadingField("heading", "หัวข้อของส่วนนี้");

const proseBlock: Block = {
  slug: "prose",
  labels: { singular: "เนื้อหาข้อความ", plural: "เนื้อหาข้อความ" },
  fields: [
    {
      name: "content",
      type: "blocks",
      required: true,
      minRows: 1,
      label: "เนื้อหา",
      labels: { singular: "ย่อหน้า/หัวข้อ", plural: "เนื้อหา" },
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
      ],
    },
    blockStyleFields(),
  ],
};

const imageTextBlock: Block = {
  slug: "imageText",
  labels: { singular: "ภาพคู่ข้อความ", plural: "ภาพคู่ข้อความ" },
  fields: [
    { name: "image", type: "upload", relationTo: "media", required: true, label: "ภาพ" },
    {
      name: "imagePosition",
      type: "select",
      defaultValue: "left",
      label: "ตำแหน่งภาพ",
      options: [
        { label: "ภาพอยู่ซ้าย", value: "left" },
        { label: "ภาพอยู่ขวา", value: "right" },
      ],
    },
    { name: "title", type: "text", required: true, localized: true, label: "หัวเรื่อง" },
    { name: "body", type: "textarea", required: true, localized: true, label: "เนื้อหา" },
    {
      name: "button",
      type: "group",
      label: "ปุ่ม (ไม่บังคับ)",
      fields: [
        { name: "label", type: "text", localized: true, label: "ข้อความบนปุ่ม" },
        { name: "href", type: "text", label: "ลิงก์ปลายทาง", admin: { description: "เช่น /shop" } },
      ],
    },
    blockStyleFields(),
  ],
};

const cardsBlock: Block = {
  slug: "cards",
  labels: { singular: "การ์ดหลายใบ", plural: "การ์ดหลายใบ" },
  fields: [
    heading,
    {
      name: "items",
      type: "array",
      required: true,
      minRows: 1,
      maxRows: 12,
      label: "การ์ด",
      labels: { singular: "การ์ด", plural: "การ์ด" },
      fields: [
        {
          name: "icon",
          type: "select",
          defaultValue: "leaf",
          label: "ไอคอน",
          // จำกัดเป็นตัวเลือกเพื่อให้ไอคอนเข้าชุดกับดีไซน์เสมอ
          options: [
            { label: "ใบไม้ (สมุนไพร)", value: "leaf" },
            { label: "เจดีย์ (วัด/วัฒนธรรม)", value: "temple" },
            { label: "ครก (การแปรรูป)", value: "mortar" },
            { label: "กลุ่มคน (ชุมชน)", value: "users" },
            { label: "หมุดแผนที่", value: "map-pin" },
            { label: "ไม่ใส่ไอคอน", value: "none" },
          ],
        },
        { name: "title", type: "text", required: true, localized: true, label: "หัวเรื่อง" },
        { name: "body", type: "textarea", required: true, localized: true, label: "เนื้อหา" },
      ],
    },
    blockStyleFields({ columns: true }),
  ],
};

const statsBlock: Block = {
  slug: "stats",
  labels: { singular: "ตัวเลขสำคัญ", plural: "ตัวเลขสำคัญ" },
  fields: [
    heading,
    {
      name: "items",
      type: "array",
      required: true,
      minRows: 1,
      maxRows: 6,
      label: "ตัวเลข",
      labels: { singular: "ตัวเลข", plural: "ตัวเลข" },
      fields: [
        { name: "value", type: "text", required: true, localized: true, label: "ตัวเลข" },
        { name: "label", type: "text", required: true, localized: true, label: "คำอธิบาย" },
      ],
    },
    blockStyleFields({ columns: true }),
  ],
};

const galleryBlock: Block = {
  slug: "gallery",
  labels: { singular: "แกลเลอรีภาพ", plural: "แกลเลอรีภาพ" },
  fields: [
    heading,
    {
      name: "images",
      type: "array",
      required: true,
      minRows: 1,
      maxRows: 24,
      label: "ภาพ",
      labels: { singular: "ภาพ", plural: "ภาพ" },
      fields: [{ name: "image", type: "upload", relationTo: "media", required: true, label: "ภาพ" }],
    },
    blockStyleFields({ columns: true }),
  ],
};

const ctaBlock: Block = {
  slug: "cta",
  labels: { singular: "กล่องชวนติดต่อ", plural: "กล่องชวนติดต่อ" },
  fields: [
    { name: "eyebrow", type: "text", localized: true, label: "ข้อความนำ" },
    { name: "title", type: "text", required: true, localized: true, label: "หัวเรื่อง" },
    { name: "body", type: "textarea", localized: true, label: "เนื้อหา" },
    blockStyleFields(),
  ],
};

const collectionBlock: Block = {
  slug: "collection",
  labels: { singular: "ดึงเนื้อหาจากคลัง", plural: "ดึงเนื้อหาจากคลัง" },
  fields: [
    heading,
    {
      name: "source",
      type: "select",
      required: true,
      defaultValue: "products",
      label: "ดึงจาก",
      // ค่าเหล่านี้ผูกกับคอมโพเนนต์ในโค้ด จึงเป็นตัวเลือกไม่ใช่ช่องพิมพ์
      options: [
        { label: "สินค้าชุมชน", value: "products" },
        { label: "บทความและเรื่องเล่า", value: "articles" },
        { label: "ฐานเรียนรู้และกิจกรรม", value: "workshops" },
        { label: "จุดเช็กอินในชุมชน", value: "places" },
      ],
    },
    {
      name: "limit",
      type: "number",
      min: 1,
      max: 12,
      defaultValue: 3,
      label: "จำนวนที่แสดง",
      admin: { description: "เว้นว่างไว้เพื่อแสดงทั้งหมด" },
    },
    {
      name: "link",
      type: "group",
      label: "ลิงก์ดูทั้งหมด (ไม่บังคับ)",
      fields: [
        { name: "label", type: "text", localized: true, label: "ข้อความ" },
        { name: "href", type: "text", label: "ลิงก์ปลายทาง" },
      ],
    },
    blockStyleFields({ columns: true }),
  ],
};

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "หน้าที่สร้างเอง", plural: "หน้าที่สร้างเอง" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
    group: "เนื้อหาประจำหน้า",
    description:
      "สร้างหน้าใหม่ได้เองโดยไม่ต้องแก้โค้ด · หน้าใหม่จะอยู่ที่ที่อยู่เว็บ /ชื่อลิงก์ และเพิ่มเข้าเมนูได้จากหน้า “เมนูนำทาง”",
  },
  access: { read: anyone, create: isEditor, update: isEditor, delete: isAdmin },
  versions: { maxPerDoc: 20, drafts: true },
  hooks: { afterChange: [revalidateCustomPage], afterDelete: [revalidateCustomPage] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "เนื้อหา",
          fields: [
            { name: "title", type: "text", required: true, localized: true, label: "ชื่อหน้า" },
            heroFields(),
            {
              name: "layout",
              type: "blocks",
              required: true,
              minRows: 1,
              label: "ส่วนต่าง ๆ ของหน้า",
              labels: { singular: "ส่วน", plural: "ส่วนต่าง ๆ" },
              admin: {
                description:
                  "ลากเพื่อสลับลำดับ · แต่ละส่วนปรับสี ฟอนต์ และการจัดวางของตัวเองได้ในกล่องพับด้านล่างของส่วนนั้น",
              },
              blocks: [
                proseBlock,
                imageTextBlock,
                cardsBlock,
                statsBlock,
                galleryBlock,
                collectionBlock,
                ctaBlock,
              ],
            },
          ],
        },
        {
          label: "ที่อยู่และการค้นหา",
          fields: [
            {
              name: "seoDescription",
              type: "textarea",
              localized: true,
              maxLength: 300,
              label: "คำอธิบายสำหรับ Google และตอนแชร์ลิงก์",
              admin: { description: "เว้นว่างได้ ระบบจะใช้คำโปรยของแถบหัวหน้าเพจแทน" },
            },
            {
              name: "seoImage",
              type: "upload",
              relationTo: "media",
              label: "ภาพตอนแชร์ลิงก์",
            },
            {
              name: "showInSitemap",
              type: "checkbox",
              defaultValue: true,
              label: "ให้ Google เก็บหน้านี้",
              admin: { description: "ติ๊กออกสำหรับหน้าที่ต้องการให้เข้าถึงด้วยลิงก์ตรงเท่านั้น" },
            },
          ],
        },
      ],
    },
    {
      ...slugField("title"),
      admin: {
        position: "sidebar",
        description:
          "ที่อยู่ของหน้านี้ เช่น ใส่ activity จะได้ /activity · เว้นว่างได้ ระบบจะสร้างให้จากชื่อหน้า · เปลี่ยนแล้วลิงก์เดิมจะใช้ไม่ได้ ให้เพิ่ม “ทางเปลี่ยนเส้นทาง” ไว้ด้วย",
      },
      validate: (value: unknown) => {
        if (typeof value !== "string" || !value.trim()) return true; // ระบบสร้างให้จากชื่อหน้า
        // ชื่อลิงก์ต้องเป็นส่วนเดียว ไม่มี / คั่น ไม่งั้นจะชนกับเส้นทางที่มีอยู่ในโค้ด
        if (value.includes("/")) return "ใส่ได้เฉพาะชื่อเดียว ห้ามมีเครื่องหมาย /";
        if (RESERVED_SLUGS.has(value)) return `“${value}” เป็นที่อยู่ของหน้าที่มีอยู่แล้ว ใช้ชื่ออื่น`;
        return true;
      },
    },
  ],
};

/**
 * ที่อยู่ที่มีหน้าอยู่แล้วในโค้ด
 *
 * ถ้าปล่อยให้ตั้งชื่อซ้ำได้ หน้าที่สร้างใหม่จะไม่มีวันถูกเปิดเลย เพราะเส้นทางที่เขียน
 * ไว้ในโค้ดถูกจับคู่ก่อนเส้นทางแบบไดนามิกเสมอ — ผู้ดูแลจะงงว่าทำไมสร้างแล้วไม่ขึ้น
 */
export const RESERVED_SLUGS = new Set([
  "about",
  "shop",
  "stories",
  "tourism",
  "contact",
  "admin",
  "api",
  "payload-api",
  "robots.txt",
  "sitemap.xml",
]);

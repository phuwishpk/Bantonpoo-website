import type { GlobalConfig } from "payload";
import { anyone, isEditor } from "@/access";
import { revalidateGlobal } from "@/hooks/revalidate";

/**
 * รายการหน้าที่มีอยู่จริงในเว็บ
 *
 * ทำเป็นตัวเลือกแทนช่องพิมพ์ URL เอง เพื่อไม่ให้พิมพ์ผิดแล้วได้ลิงก์เสีย
 * เมื่อเพิ่มหน้าใหม่ในโค้ด ต้องมาเพิ่มตัวเลือกที่นี่ด้วย
 */
export const PAGE_OPTIONS = [
  { label: "หน้าแรก", value: "/" },
  { label: "เกี่ยวกับชุมชน", value: "/about" },
  { label: "เรื่องเล่า", value: "/stories" },
  { label: "สินค้าชุมชน", value: "/shop" },
  { label: "ท่องเที่ยว", value: "/tourism" },
  { label: "ติดต่อเรา", value: "/contact" },
];

const linkTypeField = {
  name: "linkType",
  type: "select" as const,
  required: true,
  defaultValue: "page",
  label: "ประเภทลิงก์",
  options: [
    { label: "หน้าหลักของเว็บ", value: "page" },
    { label: "หน้าที่สร้างเอง", value: "custom" },
    { label: "ลิงก์ภายนอก", value: "external" },
  ],
};

/**
 * ลิงก์ไปยังหน้าที่ผู้ดูแลสร้างเอง
 *
 * ใช้ความสัมพันธ์แทนการพิมพ์ที่อยู่เอง เพราะถ้าเปลี่ยนชื่อลิงก์ของหน้านั้นภายหลัง
 * เมนูจะตามไปเองโดยอัตโนมัติ ไม่กลายเป็นลิงก์เสีย
 */
const customPageField = {
  name: "customPage",
  type: "relationship" as const,
  relationTo: "pages" as const,
  label: "เลือกหน้าที่สร้างเอง",
  admin: {
    condition: (_: unknown, sibling: { linkType?: string }) => sibling?.linkType === "custom",
  },
};

const pageField = {
  name: "page",
  type: "select" as const,
  label: "เลือกหน้า",
  options: PAGE_OPTIONS,
  admin: {
    condition: (_: unknown, sibling: { linkType?: string }) =>
      sibling?.linkType !== "external" && sibling?.linkType !== "custom",
  },
};

const urlField = {
  name: "url",
  type: "text" as const,
  label: "ลิงก์ภายนอก",
  admin: {
    condition: (_: unknown, sibling: { linkType?: string }) => sibling?.linkType === "external",
    description: "ต้องขึ้นต้นด้วย https://",
  },
};

export const Navigation: GlobalConfig = {
  slug: "navigation",
  label: "เมนูนำทาง",
  admin: { group: "ตั้งค่าเว็บไซต์", description: "แก้เมนูบน ปุ่มติดต่อ และเมนูท้ายเว็บ" },
  access: { read: anyone, update: isEditor },
  // drafts เปิดไว้เพื่อให้ดูตัวอย่างก่อนเผยแพร่ได้ — บันทึกฉบับร่างจะยังไม่ขึ้นเว็บจริง
  versions: { max: 20, drafts: true },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: "mainMenu",
      type: "array",
      label: "เมนูบน (navbar)",
      // เกิน 8 รายการเมนูจะล้นบนจอโน้ตบุ๊ก
      maxRows: 8,
      labels: { singular: "เมนู", plural: "เมนูบน" },
      fields: [
        { name: "label", type: "text", required: true, localized: true, label: "ข้อความที่แสดง" },
        {
          ...linkTypeField,
          options: [...linkTypeField.options, { label: "เมนูย่อย (ไม่ลิงก์ไปไหน)", value: "dropdown" }],
        },
        pageField,
        customPageField,
        urlField,
        {
          name: "children",
          type: "array",
          label: "เมนูย่อย",
          // รองรับ 2 ชั้นพอ ลึกกว่านี้ใช้ยากบนมือถือ
          maxRows: 6,
          labels: { singular: "เมนูย่อย", plural: "เมนูย่อย" },
          admin: {
            condition: (_: unknown, sibling: { linkType?: string }) => sibling?.linkType === "dropdown",
          },
          fields: [
            { name: "label", type: "text", required: true, localized: true, label: "ข้อความที่แสดง" },
            linkTypeField,
            pageField,
            customPageField,
            urlField,
          ],
        },
      ],
    },
    {
      name: "headerCta",
      type: "group",
      label: "ปุ่มมุมขวาบน",
      fields: [
        { name: "enabled", type: "checkbox", defaultValue: true, label: "แสดงปุ่มนี้" },
        {
          name: "label",
          type: "text",
          localized: true,
          defaultValue: "สั่งซื้อ / สอบถาม",
          label: "ข้อความบนปุ่ม",
        },
        {
          name: "action",
          type: "select",
          defaultValue: "line",
          label: "กดแล้วไปไหน",
          options: [
            { label: "เปิดแชท LINE ของชุมชน", value: "line" },
            { label: "โทรออก", value: "phone" },
            { label: "ไปหน้าติดต่อเรา", value: "contact" },
          ],
        },
      ],
    },
    {
      name: "mobileMenu",
      type: "group",
      label: "เมนูบนมือถือ (drawer)",
      admin: { description: "ข้อความในเมนูที่เลื่อนออกมาเมื่อกดปุ่มสามขีดบนมือถือ" },
      fields: [
        {
          name: "title",
          type: "text",
          localized: true,
          defaultValue: "เมนู",
          label: "หัวข้อด้านบนของเมนู",
        },
        {
          name: "contactHeading",
          type: "text",
          localized: true,
          defaultValue: "ติดต่อชุมชนโดยตรง",
          label: "หัวข้อกล่องติดต่อด้านล่าง",
        },
        {
          name: "lineButtonPrefix",
          type: "text",
          localized: true,
          defaultValue: "แอดไลน์",
          label: "ข้อความนำหน้าปุ่ม LINE",
          admin: { description: "ระบบจะต่อท้ายด้วย LINE ID จากหน้าข้อมูลชุมชนให้เอง" },
        },
        {
          name: "phoneButtonPrefix",
          type: "text",
          localized: true,
          defaultValue: "โทร",
          label: "ข้อความนำหน้าปุ่มโทร",
          admin: { description: "ระบบจะต่อท้ายด้วยเบอร์โทรจากหน้าข้อมูลชุมชนให้เอง" },
        },
      ],
    },
    {
      name: "footerColumns",
      type: "array",
      label: "คอลัมน์ลิงก์ท้ายเว็บ",
      maxRows: 3,
      labels: { singular: "คอลัมน์", plural: "คอลัมน์ท้ายเว็บ" },
      fields: [
        { name: "heading", type: "text", required: true, localized: true, label: "หัวคอลัมน์" },
        {
          name: "links",
          type: "array",
          label: "ลิงก์",
          labels: { singular: "ลิงก์", plural: "ลิงก์" },
          fields: [
            { name: "label", type: "text", required: true, localized: true, label: "ข้อความ" },
            linkTypeField,
            pageField,
            customPageField,
            urlField,
          ],
        },
      ],
    },
  ],
};

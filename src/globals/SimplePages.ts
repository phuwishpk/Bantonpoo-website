import type { GlobalConfig } from "payload";
import { anyone, isEditor } from "@/access";
import { heroFields, linkFields, sectionHeadingField, sectionsField, textListField } from "@/fields";
import { revalidatePage } from "@/hooks/revalidate";

/** ข้อความตอนที่ตัวกรองไม่เจอผลลัพธ์ */
const emptyStateField = {
  name: "emptyState",
  type: "group" as const,
  label: "ข้อความตอนไม่พบผลลัพธ์",
  fields: [
    { name: "title", type: "text" as const, required: true, localized: true, label: "หัวเรื่อง" },
    { name: "body", type: "textarea" as const, localized: true, label: "คำอธิบาย" },
  ],
};

/** กล่องชวนติดต่อท้ายหน้า ใช้ได้หลายหน้า */
const ctaField = {
  name: "cta",
  type: "group" as const,
  label: "กล่องชวนติดต่อ",
  admin: { description: 'แสดงเมื่อเพิ่มส่วน "กล่องชวนติดต่อ" ไว้ในลำดับด้านบน' },
  fields: [
    { name: "eyebrow", type: "text" as const, localized: true, label: "ข้อความนำ" },
    { name: "title", type: "text" as const, localized: true, label: "หัวเรื่อง" },
    { name: "body", type: "textarea" as const, localized: true, label: "เนื้อหา" },
  ],
};

export const ShopPage: GlobalConfig = {
  slug: "shop-page",
  label: "หน้าสินค้าชุมชน",
  admin: { group: "เนื้อหาประจำหน้า" },
  access: { read: anyone, update: isEditor },
  // drafts เปิดไว้เพื่อให้ดูตัวอย่างก่อนเผยแพร่ได้ — บันทึกฉบับร่างจะยังไม่ขึ้นเว็บจริง
  versions: { max: 20, drafts: true },
  hooks: { afterChange: [revalidatePage("/shop")] },
  fields: [
    heroFields(),
    sectionsField({
      types: [
        { label: "ตัวกรองและรายการสินค้า", value: "catalogue" },
        { label: "กล่องชวนติดต่อ", value: "cta" },
      ],
      description: "หน้าสินค้ามีส่วนหลักคือรายการสินค้า เพิ่มกล่องชวนติดต่อท้ายหน้าได้",
    }),
    emptyStateField,
    ctaField,
  ],
};

export const StoriesPage: GlobalConfig = {
  slug: "stories-page",
  label: "หน้าเรื่องเล่า",
  admin: { group: "เนื้อหาประจำหน้า" },
  access: { read: anyone, update: isEditor },
  // drafts เปิดไว้เพื่อให้ดูตัวอย่างก่อนเผยแพร่ได้ — บันทึกฉบับร่างจะยังไม่ขึ้นเว็บจริง
  versions: { max: 20, drafts: true },
  hooks: { afterChange: [revalidatePage("/stories")] },
  fields: [
    heroFields(),
    sectionsField({
      types: [
        { label: "ตัวกรองและรายการบทความ", value: "list" },
        { label: "กล่องชวนติดต่อ", value: "cta" },
      ],
    }),
    emptyStateField,
    ctaField,
  ],
};

export const TourismPage: GlobalConfig = {
  slug: "tourism-page",
  label: "หน้าท่องเที่ยว",
  admin: { group: "เนื้อหาประจำหน้า" },
  access: { read: anyone, update: isEditor },
  // drafts เปิดไว้เพื่อให้ดูตัวอย่างก่อนเผยแพร่ได้ — บันทึกฉบับร่างจะยังไม่ขึ้นเว็บจริง
  versions: { max: 20, drafts: true },
  hooks: { afterChange: [revalidatePage("/tourism")] },
  fields: [
    heroFields(),
    sectionsField({
      types: [
        { label: "ฐานเรียนรู้และกิจกรรม", value: "workshops" },
        { label: "จุดเช็กอินในชุมชน", value: "places" },
        { label: "แผนที่และการเดินทาง", value: "travel" },
        { label: "กล่องชวนติดต่อ", value: "cta" },
      ],
      gridTypes: ["places"],
      limitTypes: ["workshops", "places"],
    }),
    sectionHeadingField("workshopsSection", "หัวข้อส่วนฐานเรียนรู้"),
    sectionHeadingField("placesSection", "หัวข้อส่วนจุดเช็กอิน"),
    sectionHeadingField("travelSection", "หัวข้อส่วนการเดินทาง"),
    {
      name: "travelOptions",
      type: "array",
      label: "วิธีการเดินทาง",
      labels: { singular: "วิธี", plural: "วิธีการเดินทาง" },
      fields: [
        { name: "title", type: "text", required: true, localized: true, label: "หัวข้อ" },
        { name: "body", type: "textarea", required: true, localized: true, label: "รายละเอียด" },
      ],
    },
    ctaField,
    {
      name: "notice",
      type: "group",
      label: "กล่องก่อนออกเดินทาง",
      fields: [
        { name: "title", type: "text", required: true, localized: true, label: "หัวเรื่อง" },
        { name: "body", type: "textarea", required: true, localized: true, label: "เนื้อหา" },
      ],
    },
  ],
};

export const ContactPage: GlobalConfig = {
  slug: "contact-page",
  label: "หน้าติดต่อเรา",
  admin: { group: "เนื้อหาประจำหน้า" },
  access: { read: anyone, update: isEditor },
  // drafts เปิดไว้เพื่อให้ดูตัวอย่างก่อนเผยแพร่ได้ — บันทึกฉบับร่างจะยังไม่ขึ้นเว็บจริง
  versions: { max: 20, drafts: true },
  hooks: { afterChange: [revalidatePage("/contact")] },
  fields: [
    heroFields(),
    sectionsField({
      types: [
        { label: "การ์ดช่องทางติดต่อ", value: "channels" },
        { label: "ฟอร์มและแผนที่", value: "form" },
      ],
      gridTypes: ["channels"],
    }),
    {
      name: "channels",
      type: "array",
      label: "การ์ดช่องทางติดต่อ",
      maxRows: 4,
      labels: { singular: "ช่องทาง", plural: "ช่องทางติดต่อ" },
      fields: [
        {
          name: "channel",
          type: "select",
          required: true,
          label: "ช่องทาง",
          // ค่าเหล่านี้ผูกกับไอคอนและลิงก์ในโค้ด จึงเป็นตัวเลือกไม่ใช่ช่องพิมพ์
          options: [
            { label: "LINE Official Account", value: "line" },
            { label: "โทรศัพท์", value: "phone" },
            { label: "Facebook", value: "facebook" },
            { label: "อีเมล", value: "email" },
          ],
        },
        { name: "label", type: "text", required: true, localized: true, label: "หัวข้อการ์ด" },
        { name: "note", type: "textarea", required: true, localized: true, label: "คำอธิบาย" },
        { name: "highlight", type: "checkbox", label: "เน้นการ์ดนี้ (พื้นสีอ่อน)" },
      ],
    },
    sectionHeadingField("formSection", "หัวข้อส่วนฟอร์ม"),
    textListField({
      name: "formTopics",
      label: "ตัวเลือกหัวข้อในฟอร์ม",
      itemLabel: "หัวข้อ",
      required: true,
      minRows: 1,
    }),
    {
      name: "formSuccess",
      type: "group",
      label: "ข้อความหลังส่งสำเร็จ",
      fields: [
        { name: "title", type: "text", required: true, localized: true, label: "หัวเรื่อง" },
        { name: "body", type: "textarea", required: true, localized: true, label: "เนื้อหา" },
      ],
    },
  ],
};

export const NotFoundPage: GlobalConfig = {
  slug: "not-found-page",
  label: "หน้าไม่พบข้อมูล (404)",
  admin: { group: "เนื้อหาประจำหน้า" },
  access: { read: anyone, update: isEditor },
  hooks: { afterChange: [revalidatePage("/")] },
  fields: [
    { name: "title", type: "text", required: true, localized: true, label: "หัวเรื่อง" },
    { name: "description", type: "textarea", required: true, localized: true, label: "คำอธิบาย" },
    {
      name: "buttons",
      type: "array",
      label: "ปุ่ม",
      maxRows: 3,
      labels: { singular: "ปุ่ม", plural: "ปุ่ม" },
      fields: linkFields(),
    },
  ],
};

export const SeoSettings: GlobalConfig = {
  slug: "seo-settings",
  label: "SEO และการวิเคราะห์",
  admin: { group: "ตั้งค่าเว็บไซต์" },
  access: { read: anyone, update: isEditor },
  hooks: { afterChange: [revalidatePage("/")] },
  fields: [
    textListField({
      name: "keywords",
      label: "คำค้นหลักของเว็บ",
      itemLabel: "คำค้น",
      description: "ใช้ในแท็ก meta keywords",
    }),
    {
      name: "defaultOgImage",
      type: "upload",
      relationTo: "media",
      label: "ภาพเริ่มต้นตอนแชร์ลิงก์",
      admin: { description: "ใช้เมื่อหน้านั้นไม่มีภาพของตัวเอง" },
    },
    {
      name: "ga4MeasurementId",
      type: "text",
      label: "Google Analytics 4 Measurement ID",
      admin: { description: "เช่น G-XXXXXXXXXX — เว้นว่างไว้ถ้ายังไม่ใช้" },
    },
  ],
};

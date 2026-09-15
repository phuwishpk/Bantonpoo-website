import type { CollectionConfig } from "payload";
import { isAdmin, isEditor } from "@/access";

/**
 * ข้อความจากฟอร์มติดต่อบนหน้าเว็บ
 *
 * สร้างโดย route handler เท่านั้น ผู้ดูแลอ่านและปิดงานได้
 * แต่แก้เนื้อหาที่ผู้ส่งกรอกมาไม่ได้ เพื่อให้ยังเป็นหลักฐานตามที่ส่งมาจริง
 */
export const Enquiries: CollectionConfig = {
  slug: "enquiries",
  labels: { singular: "ข้อความ", plural: "ข้อความจากฟอร์มติดต่อ" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "topic", "status", "createdAt"],
    group: "กล่องข้อความ",
    description: "ข้อความที่ส่งเข้ามาจากฟอร์มติดต่อบนหน้าเว็บ",
  },
  access: {
    create: () => true, // route handler เป็นผู้สร้าง
    read: isEditor,
    update: isEditor,
    delete: isAdmin,
  },
  defaultSort: "-createdAt",
  fields: [
    { name: "name", type: "text", required: true, label: "ชื่อผู้ติดต่อ", access: { update: () => false } },
    { name: "phone", type: "text", required: true, label: "เบอร์ติดต่อ", access: { update: () => false } },
    { name: "topic", type: "text", required: true, label: "หัวข้อ", access: { update: () => false } },
    { name: "message", type: "textarea", required: true, label: "ข้อความ", access: { update: () => false } },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      label: "สถานะ",
      options: [
        { label: "ใหม่ ยังไม่ได้ติดต่อกลับ", value: "new" },
        { label: "ติดต่อกลับแล้ว", value: "contacted" },
        { label: "ปิดเรื่องแล้ว", value: "closed" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "note",
      type: "textarea",
      label: "บันทึกภายใน",
      admin: { description: "เห็นเฉพาะผู้ดูแล ไม่แสดงบนเว็บ" },
    },
  ],
};

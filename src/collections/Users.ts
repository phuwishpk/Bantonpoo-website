import type { CollectionConfig } from "payload";
import { isAdmin, isAdminField, isLoggedIn } from "@/access";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "ผู้ใช้", plural: "ผู้ใช้หลังบ้าน" },
  auth: {
    tokenExpiration: 60 * 60 * 8, // ออกจากระบบอัตโนมัติหลัง 8 ชั่วโมง
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000, // ล็อก 10 นาทีหลังใส่รหัสผิดครบ 5 ครั้ง
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role"],
    group: "ตั้งค่าระบบ",
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isLoggedIn,
    // admin แก้ได้ทุกคน คนอื่นแก้ได้เฉพาะโปรไฟล์ตัวเอง
    update: ({ req }) =>
      req.user?.role === "admin" ? true : { id: { equals: req.user?.id } },
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "ชื่อ-นามสกุล",
      admin: { description: "ชื่อนี้จะขึ้นในประวัติการแก้ไขเนื้อหา" },
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      label: "บทบาท",
      access: { update: isAdminField },
      options: [
        { label: "ผู้ดูแลระบบ", value: "admin" },
        { label: "ผู้แก้ไขเนื้อหา", value: "editor" },
        { label: "ดูอย่างเดียว", value: "viewer" },
      ],
    },
  ],
};

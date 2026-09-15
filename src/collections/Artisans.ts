import type { CollectionConfig } from "payload";
import { APIError } from "payload";
import { anyone, isAdmin, isEditor } from "@/access";
import { slugField } from "@/fields";

/**
 * ปราชญ์ชุมชนและผู้ผลิต
 *
 * คนในนี้เป็นบุคคลจริง ระบบจึงบังคับให้บันทึกความยินยอมก่อนเผยแพร่
 * เพื่อไม่ให้ประวัติหรือภาพของใครขึ้นเว็บโดยที่เจ้าตัวยังไม่ได้อนุญาต
 */
export const Artisans: CollectionConfig = {
  slug: "artisans",
  labels: { singular: "ปราชญ์ชุมชน", plural: "ทำเนียบปราชญ์ชุมชน" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "title", "consentBio", "consentPhoto"],
    group: "เนื้อหา",
  },
  access: { read: anyone, create: isEditor, update: isEditor, delete: isAdmin },
  defaultSort: "order",
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data;
        // กันไม่ให้เผยแพร่ข้อมูลบุคคลก่อนได้รับความยินยอม
        if (!data.consentBio) {
          throw new APIError("ยังไม่ได้ติ๊กว่าเจ้าตัวยินยอมให้เผยแพร่ประวัติ จึงบันทึกไม่ได้", 400);
        }
        if (data.photo && !data.consentPhoto) {
          throw new APIError("มีภาพถ่ายแต่ยังไม่ได้ติ๊กว่าเจ้าตัวยินยอมให้เผยแพร่ภาพ", 400);
        }
        return data;
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true, localized: true, label: "ชื่อ-นามสกุล" },
    slugField("name"),
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
      label: "บทบาทในชุมชน",
      admin: { description: 'เช่น "ประธานกลุ่มวิสาหกิจชุมชนสมุนไพรบ้านต้นโพธิ์"' },
    },
    { name: "specialty", type: "text", localized: true, label: "ความเชี่ยวชาญ" },
    { name: "bio", type: "textarea", localized: true, label: "ประวัติโดยย่อ" },
    { name: "photo", type: "upload", relationTo: "media", label: "ภาพโปรไฟล์" },
    {
      name: "source",
      type: "text",
      localized: true,
      label: "แหล่งอ้างอิงข้อมูล",
      admin: { description: 'เช่น "วิกิชุมชน ศูนย์มานุษยวิทยาสิรินธร (2567)"' },
    },
    {
      type: "collapsible",
      label: "ความยินยอม (บังคับ)",
      admin: { initCollapsed: false },
      fields: [
        {
          name: "consentBio",
          type: "checkbox",
          required: true,
          label: "เจ้าตัวยินยอมให้เผยแพร่ชื่อและประวัติ",
        },
        {
          name: "consentPhoto",
          type: "checkbox",
          label: "เจ้าตัวยินยอมให้เผยแพร่ภาพถ่าย",
          admin: { description: "ต้องติ๊กถ้ามีการใส่ภาพโปรไฟล์" },
        },
        { name: "consentDate", type: "date", label: "วันที่ได้รับความยินยอม" },
      ],
    },
    { name: "order", type: "number", defaultValue: 0, label: "ลำดับ", admin: { position: "sidebar" } },
  ],
};

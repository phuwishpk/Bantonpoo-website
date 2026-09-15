import type { CollectionConfig } from "payload";
import { anyone, isAdmin, isEditor } from "@/access";
import { slugField, textListField } from "@/fields";
import { revalidateTourism } from "@/hooks/revalidate";

export const Workshops: CollectionConfig = {
  slug: "workshops",
  labels: { singular: "ฐานเรียนรู้", plural: "ฐานเรียนรู้และกิจกรรม" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "duration", "pricePerPerson", "order"],
    group: "เนื้อหา",
  },
  access: { read: anyone, create: isEditor, update: isEditor, delete: isAdmin },
  defaultSort: "order",
  hooks: { afterChange: [revalidateTourism], afterDelete: [revalidateTourism] },
  fields: [
    { name: "title", type: "text", required: true, localized: true, label: "ชื่อกิจกรรม" },
    slugField("title"),
    { name: "summary", type: "textarea", required: true, localized: true, label: "คำโปรยสั้น" },
    { name: "image", type: "upload", relationTo: "media", required: true, label: "ภาพกิจกรรม" },
    textListField({
      name: "description",
      label: "รายละเอียดกิจกรรม",
      itemLabel: "ย่อหน้า",
      multiline: true,
      required: true,
      minRows: 1,
    }),
    { name: "duration", type: "text", required: true, localized: true, label: "ระยะเวลา" },
    {
      name: "pricePerPerson",
      type: "number",
      min: 0,
      label: "ค่าบริการต่อคน (บาท)",
      admin: { description: 'เว้นว่างไว้ถ้าต้องการให้ขึ้นว่า "สอบถามราคา"' },
    },
    {
      type: "row",
      fields: [
        { name: "minParticipants", type: "number", required: true, defaultValue: 1, label: "รับขั้นต่ำ (คน)" },
        { name: "maxParticipants", type: "number", required: true, defaultValue: 20, label: "รับสูงสุด (คน)" },
      ],
    },
    textListField({
      name: "bookingNotes",
      label: "เงื่อนไขการจอง",
      itemLabel: "ข้อ",
      multiline: true,
    }),
    { name: "takeaway", type: "text", localized: true, label: "สิ่งที่ได้กลับบ้าน" },
    { name: "order", type: "number", defaultValue: 0, label: "ลำดับ", admin: { position: "sidebar" } },
  ],
};

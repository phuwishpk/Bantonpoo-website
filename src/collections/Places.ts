import type { CollectionConfig } from "payload";
import { anyone, isAdmin, isEditor } from "@/access";
import { slugField } from "@/fields";
import { revalidateTourism } from "@/hooks/revalidate";

export const Places: CollectionConfig = {
  slug: "places",
  labels: { singular: "จุดเช็กอิน", plural: "จุดเช็กอินในชุมชน" },
  admin: { useAsTitle: "name", defaultColumns: ["name", "kind", "order"], group: "เนื้อหา" },
  access: { read: anyone, create: isEditor, update: isEditor, delete: isAdmin },
  defaultSort: "order",
  hooks: { afterChange: [revalidateTourism], afterDelete: [revalidateTourism] },
  fields: [
    { name: "name", type: "text", required: true, localized: true, label: "ชื่อสถานที่" },
    slugField("name"),
    {
      name: "kind",
      type: "select",
      required: true,
      defaultValue: "landmark",
      label: "ประเภท",
      options: [
        { label: "ฐานเรียนรู้", value: "workshop-site" },
        { label: "ที่พัก", value: "homestay" },
        { label: "จุดเช็กอิน", value: "landmark" },
        { label: "ร้านค้า", value: "shop" },
      ],
    },
    { name: "description", type: "textarea", required: true, localized: true, label: "คำอธิบาย" },
    { name: "openingHours", type: "text", localized: true, label: "เวลาเปิด-ปิด" },
    { name: "image", type: "upload", relationTo: "media", required: true, label: "ภาพ" },
    { name: "order", type: "number", defaultValue: 0, label: "ลำดับ", admin: { position: "sidebar" } },
  ],
};

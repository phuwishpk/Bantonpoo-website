import type { CollectionConfig } from "payload";
import { anyone, isAdmin, isEditor } from "@/access";
import { revalidateRedirect } from "@/hooks/revalidate";

/**
 * ทางเปลี่ยนเส้นทาง — พาลิงก์เก่าไปยังหน้าใหม่
 *
 * ใช้เมื่อเปลี่ยน slug หรือลบหน้าทิ้ง ถ้าไม่มีรายการเหล่านี้ ลิงก์ที่เคยแชร์ไว้
 * ในเฟซบุ๊กหรือไลน์จะกลายเป็นหน้า 404 และอันดับใน Google ที่สะสมมาก็หายไปด้วย
 *
 * ระบบตรวจรายการนี้ "ตอนที่หาหน้าไม่เจอเท่านั้น" จึงไม่มีภาระเพิ่มกับหน้าที่มีอยู่จริง
 * ผลที่ตามมาคือเปลี่ยนเส้นทางของ URL ที่ยังมีหน้าอยู่ไม่ได้ — ต้องลบหรือเปลี่ยน slug ก่อน
 */

/** เส้นทางภายในเว็บ: ขึ้นต้นด้วย / หนึ่งตัว ไม่มีช่องว่าง และไม่ใช่ // ที่พาออกนอกเว็บ */
const INTERNAL_PATH = /^\/(?!\/)[^\s?#]*$/;

export const Redirects: CollectionConfig = {
  slug: "redirects",
  labels: { singular: "ทางเปลี่ยนเส้นทาง", plural: "ทางเปลี่ยนเส้นทาง" },
  admin: {
    useAsTitle: "from",
    defaultColumns: ["from", "to", "permanent", "enabled"],
    group: "ตั้งค่าเว็บไซต์",
    description:
      "เมื่อเปลี่ยนชื่อลิงก์ (slug) หรือลบหน้าทิ้ง ให้เพิ่มรายการที่นี่ ลิงก์เก่าที่เคยแชร์ไว้จะพาไปหน้าใหม่แทนที่จะเจอหน้า 404",
  },
  access: { read: anyone, create: isEditor, update: isEditor, delete: isAdmin },
  defaultSort: "from",
  hooks: { afterChange: [revalidateRedirect], afterDelete: [revalidateRedirect] },
  fields: [
    {
      name: "from",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: "ลิงก์เดิม",
      admin: {
        description: "ใส่เฉพาะส่วนหลังชื่อโดเมน เช่น /shop/old-balm · ต้องขึ้นต้นด้วย /",
      },
      validate: (value: unknown) => {
        if (typeof value !== "string" || !INTERNAL_PATH.test(value)) {
          return "ต้องเป็นเส้นทางในเว็บ เช่น /shop/old-balm";
        }
        return true;
      },
      hooks: {
        // ตัด / ท้ายและช่องว่างออกให้เหมือนกันทุกแถว ไม่งั้นจะมีแถวซ้ำที่ดูเหมือนกัน
        beforeValidate: [({ value }) => normalisePath(value)],
      },
    },
    {
      name: "to",
      type: "text",
      required: true,
      label: "ลิงก์ปลายทาง",
      admin: { description: "เส้นทางในเว็บ เช่น /shop/new-balm หรือลิงก์เต็มที่ขึ้นต้นด้วย https://" },
      validate: (value: unknown, { siblingData }: { siblingData?: { from?: unknown } }) => {
        if (typeof value !== "string" || !value.trim()) return "จำเป็นต้องระบุค่า";
        const target = value.trim();
        if (!INTERNAL_PATH.test(target) && !/^https:\/\/[^\s]+$/.test(target)) {
          return "ต้องเป็นเส้นทางในเว็บ เช่น /shop/new-balm หรือลิงก์ที่ขึ้นต้นด้วย https://";
        }
        // ชี้กลับหาตัวเองจะวนไม่รู้จบจนเบราว์เซอร์ตัดการเชื่อมต่อ
        if (typeof siblingData?.from === "string" && normalisePath(siblingData.from) === normalisePath(target)) {
          return "ลิงก์ปลายทางซ้ำกับลิงก์เดิม จะทำให้วนไม่รู้จบ";
        }
        return true;
      },
      hooks: {
        beforeValidate: [({ value }) => (typeof value === "string" ? value.trim() : value)],
      },
    },
    {
      name: "permanent",
      type: "checkbox",
      defaultValue: true,
      label: "ย้ายถาวร",
      admin: {
        description:
          "ติ๊กไว้เมื่อย้ายถาวร (308) — Google จะโอนอันดับของลิงก์เก่าไปให้หน้าใหม่ · ติ๊กออกเมื่อย้ายชั่วคราว (307)",
      },
    },
    {
      name: "enabled",
      type: "checkbox",
      defaultValue: true,
      label: "เปิดใช้งาน",
      admin: { description: "ติ๊กออกเพื่อหยุดใช้ชั่วคราวโดยไม่ต้องลบทิ้ง" },
    },
    {
      name: "note",
      type: "text",
      label: "บันทึกช่วยจำ",
      admin: { description: "เช่น “เปลี่ยนชื่อสินค้าเมื่อ ก.ย. 2569” เพื่อให้คนอื่นรู้ที่มา" },
    },
  ],
};

/** ตัดช่องว่างและ / ท้ายออก เพื่อให้เทียบกับเส้นทางที่ผู้เข้าชมเปิดได้ตรง ๆ */
export function normalisePath(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length > 1 ? trimmed.replace(/\/+$/, "") : trimmed;
}

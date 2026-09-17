import type { GlobalConfig } from "payload";
import { anyone, isEditor } from "@/access";
import { revalidateGlobal } from "@/hooks/revalidate";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "ข้อมูลชุมชน",
  admin: { group: "ตั้งค่าเว็บไซต์", description: "ชื่อ ข้อมูลติดต่อ ที่ตั้ง และเวลาทำการ ใช้ทั้งเว็บ" },
  access: { read: anyone, update: isEditor },
  // drafts เปิดไว้เพื่อให้ดูตัวอย่างก่อนเผยแพร่ได้ — บันทึกฉบับร่างจะยังไม่ขึ้นเว็บจริง
  versions: { max: 20, drafts: true },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "ข้อมูลทั่วไป",
          fields: [
            {
              name: "communityName",
              type: "text",
              required: true,
              localized: true,
              label: "ชื่อเต็มของกลุ่ม",
            },
            {
              name: "communityShortName",
              type: "text",
              required: true,
              localized: true,
              label: "ชื่อย่อ (แสดงคู่โลโก้)",
            },
            {
              name: "tagline",
              type: "text",
              required: true,
              localized: true,
              label: "บรรทัดรองใต้โลโก้",
            },
            {
              name: "logo",
              type: "upload",
              relationTo: "media",
              label: "โลโก้",
              admin: {
                description:
                  "แสดงบนแถบเมนูและท้ายเว็บตามสัดส่วนจริงของรูป (ไม่ตัดขอบ) · พื้นหลังตรงนั้นเป็นสีเข้ม ใช้ PNG พื้นโปร่งใสจะดูดีที่สุด — ถ้าว่างจะใช้ใบโพธิ์",
              },
            },
            {
              name: "favicon",
              type: "upload",
              relationTo: "media",
              label: "ไอคอนเว็บ (favicon)",
              admin: {
                description:
                  "รูปเล็กบนแท็บเบราว์เซอร์และหน้าจอโทรศัพท์ ใช้ PNG สี่เหลี่ยมจัตุรัสอย่างน้อย 512×512 — ถ้าว่างจะใช้โลโก้",
              },
            },
            {
              name: "aboutSummary",
              type: "textarea",
              required: true,
              localized: true,
              label: "ข้อความแนะนำชุมชน",
              admin: { description: "ใช้ท้ายเว็บ และเป็นคำอธิบายเว็บไซต์ในผลค้นหา Google" },
            },
          ],
        },
        {
          label: "ติดต่อ",
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "phone",
                  type: "text",
                  required: true,
                  label: "เบอร์โทร (สำหรับกดโทร)",
                  admin: { description: "รูปแบบสากล เช่น +66818220774" },
                },
                {
                  name: "phoneDisplay",
                  type: "text",
                  required: true,
                  label: "เบอร์โทร (สำหรับแสดง)",
                  admin: { description: "เช่น 08-1822-0774" },
                },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "lineId", type: "text", required: true, label: "LINE ID" },
                { name: "lineUrl", type: "text", required: true, label: "ลิงก์เปิดแชท LINE" },
              ],
            },
            { name: "facebookUrl", type: "text", required: true, label: "ลิงก์เพจ Facebook" },
            { name: "email", type: "email", required: true, label: "อีเมล" },
          ],
        },
        {
          label: "ที่ตั้ง",
          fields: [
            { name: "address", type: "textarea", required: true, localized: true, label: "ที่อยู่เต็ม" },
            {
              type: "row",
              fields: [
                { name: "addressLocality", type: "text", required: true, label: "อำเภอ/เขต" },
                { name: "addressRegion", type: "text", required: true, label: "จังหวัด" },
                { name: "postalCode", type: "text", required: true, label: "รหัสไปรษณีย์" },
              ],
            },
            {
              type: "row",
              // เก็บพิกัดเป็นตัวเลขสองช่อง ไม่ใช้ฟิลด์ point ของ Payload
              // เพราะฟิลด์ point ต้องการส่วนขยาย PostGIS ซึ่งไม่ได้ติดตั้งไว้
              fields: [
                { name: "mapLatitude", type: "number", required: true, label: "ละติจูด" },
                { name: "mapLongitude", type: "number", required: true, label: "ลองจิจูด" },
              ],
            },
          ],
        },
        {
          label: "เวลาทำการ",
          fields: [
            {
              name: "openingHours",
              type: "text",
              required: true,
              localized: true,
              label: "เวลาทำการ (ข้อความเต็ม)",
            },
            {
              name: "openingHoursShort",
              type: "text",
              required: true,
              localized: true,
              label: "เวลาทำการ (ข้อความสั้น)",
              admin: { description: "ใช้ในที่แคบ เช่น เมนูบนมือถือและแถบท้ายเว็บ" },
            },
          ],
        },
      ],
    },
  ],
};

import type { Field, GlobalConfig } from "payload";
import { anyone, isEditor } from "@/access";
import { revalidateGlobal } from "@/hooks/revalidate";

/**
 * ข้อความบนปุ่มและป้ายกำกับ
 *
 * ต่างจาก Global ประจำหน้าตรงที่นี่คือ "คำเรียก" ที่ใช้ซ้ำทั้งเว็บ เช่น คำว่า
 * "ผลิตโดย" ที่ขึ้นใต้ทุกสินค้า ไม่ใช่เนื้อหาของหน้าใดหน้าหนึ่ง เดิมเขียนตายตัว
 * อยู่ในโค้ด ผู้ดูแลจึงเปลี่ยนเองไม่ได้เลยแม้จะเป็นแค่คำเดียว
 *
 * ทุกช่องมีค่าตั้งต้นอยู่แล้ว (ดู DEFAULT_LABELS ใน src/lib/cms/labels.ts)
 * เว้นว่างไว้เว็บก็ยังแสดงคำเดิม ไม่มีทางกลายเป็นช่องว่าง
 */

/** ช่องข้อความหนึ่งช่องพร้อมค่าตั้งต้น — ย่อให้สั้นเพราะไฟล์นี้มีเกือบห้าสิบช่อง */
function label(name: string, text: string, value: string, multiline = false): Field {
  const common = { name, localized: true as const, label: text, defaultValue: value };
  return multiline
    ? { ...common, type: "textarea", admin: { rows: 3 } }
    : { ...common, type: "text" };
}

function group(name: string, text: string, fields: Field[]): Field {
  return { name, type: "group", label: text, fields };
}

export const UiLabels: GlobalConfig = {
  slug: "ui-labels",
  label: "ข้อความบนปุ่มและป้ายกำกับ",
  admin: {
    group: "ตั้งค่าเว็บไซต์",
    description:
      "คำเรียกที่ใช้ซ้ำทั้งเว็บ เช่น “ผลิตโดย” หรือ “เวลาทำการ” · เว้นว่างไว้จะใช้คำตั้งต้นของระบบ",
  },
  access: { read: anyone, update: isEditor },
  versions: { max: 20, drafts: true },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "ทั่วไป",
          fields: [
            group("general", "ข้อความทั่วไป", [
              label("askPrice", "เมื่อสินค้าไม่ได้ระบุราคา", "สอบถามราคา"),
              label("askServicePrice", "เมื่อกิจกรรมไม่ได้ระบุค่าบริการ", "สอบถามค่าบริการ"),
              label("viewAllProducts", "ลิงก์ดูสินค้าทั้งหมด", "ดูสินค้าทั้งหมด"),
              label("viewAllWorkshops", "ลิงก์ดูกิจกรรมทั้งหมด", "ดูกิจกรรมทั้งหมด"),
              label("viewAllArticles", "ลิงก์ดูบทความทั้งหมด", "ดูบทความทั้งหมด"),
              label("readFullArticle", "ลิงก์อ่านบทความเต็ม", "อ่านบทความฉบับเต็ม"),
              label("openInMaps", "ปุ่มเปิดแผนที่", "เปิดนำทางด้วย Google Maps"),
            ]),
          ],
        },
        {
          label: "สินค้า",
          fields: [
            group("product", "หน้าสินค้าและการ์ดสินค้า", [
              label("madeBy", "ป้ายเหนือชื่อผู้ผลิต", "ผลิตโดย"),
              label("viewArtisans", "ลิงก์ไปทำเนียบปราชญ์ชุมชน", "ดูทำเนียบปราชญ์ชุมชนทั้งหมด →"),
              label("specs", "หัวตารางข้อมูลสินค้า", "สเปกทางเทคนิค"),
              label("sku", "แถวรหัสสินค้า", "รหัสสินค้า"),
              label("form", "แถวรูปแบบผลิตภัณฑ์", "รูปแบบ"),
              label("netContent", "แถวปริมาณสุทธิ", "ปริมาณสุทธิ"),
              label("mainHerbs", "แถวสมุนไพรหลัก", "สมุนไพรหลัก"),
              label("shelfLife", "แถวอายุการเก็บรักษา", "อายุการเก็บรักษา"),
              label("externalUseTitle", "หัวข้อคำเตือนใช้ภายนอก", "ใช้ภายนอกเท่านั้น"),
              label(
                "externalUseBody",
                "รายละเอียดคำเตือนใช้ภายนอก",
                "ห้ามรับประทาน เก็บให้พ้นมือเด็ก และหลีกเลี่ยงบริเวณดวงตาและบาดแผลเปิด",
                true
              ),
              label("callGroup", "ปุ่มโทรหากลุ่มวิสาหกิจ", "โทรสอบถามกลุ่มวิสาหกิจชุมชน"),
              label("facebookHint", "ลิงก์ทักผ่านเฟซบุ๊ก", "หรือทักผ่านเพจ Facebook ของวิสาหกิจชุมชน"),
              label("storyEyebrow", "ข้อความนำส่วนเรื่องเล่าสินค้า", "เรื่องเล่าของผลิตภัณฑ์"),
              label("storyTitle", "หัวเรื่องส่วนเรื่องเล่าสินค้า", "ที่มาและจุดเด่น"),
              label("usageEyebrow", "ข้อความนำส่วนวิธีใช้", "วิธีใช้"),
              label("usageTitle", "หัวเรื่องส่วนวิธีใช้", "ใช้อย่างไร"),
              label("careEyebrow", "ข้อความนำส่วนการเก็บรักษา", "คำแนะนำ"),
              label("careTitle", "หัวเรื่องส่วนการเก็บรักษา", "การเก็บรักษาและข้อควรระวัง"),
              label("relatedEyebrow", "ข้อความนำส่วนสินค้าคล้ายกัน", "อาจถูกใจ"),
              label("relatedTitle", "หัวเรื่องส่วนสินค้าคล้ายกัน", "สินค้าที่คล้ายกัน"),
              label("filters", "หัวข้อกล่องตัวกรอง", "ตัวกรอง"),
              label("sortBy", "หัวข้อตัวเลือกการเรียง", "เรียงตาม"),
              label("resultsUnit", "หน่วยนับผลลัพธ์", "รายการ"),
            ]),
          ],
        },
        {
          label: "บทความ",
          fields: [
            group("article", "หน้าบทความและการ์ดบทความ", [
              label("writtenBy", "ป้ายนำหน้าชื่อผู้เขียน", "เขียนโดย"),
              label("readTime", "ป้ายนำหน้าเวลาอ่าน", "ใช้เวลาอ่าน"),
              label("minutes", "หน่วยเวลาอ่าน", "นาที"),
              label("share", "หัวข้อปุ่มแชร์", "แชร์บทความนี้"),
              label("aboutAuthor", "หัวข้อกล่องผู้เขียน", "เกี่ยวกับผู้เขียน"),
              label("aboutCommunityButton", "ปุ่มในกล่องผู้เขียน", "รู้จักชุมชนและครูช่างทั้งหมด"),
              label("relatedEyebrow", "ข้อความนำส่วนบทความเกี่ยวข้อง", "อ่านต่อ"),
              label("relatedTitle", "หัวเรื่องส่วนบทความเกี่ยวข้อง", "บทความที่เกี่ยวข้อง"),
              label("resultsUnit", "หน่วยนับผลลัพธ์", "บทความ"),
            ]),
          ],
        },
        {
          label: "ท่องเที่ยว",
          fields: [
            group("tourism", "หน้าท่องเที่ยวและกิจกรรม", [
              label("duration", "ป้ายระยะเวลา", "ระยะเวลา"),
              label("participants", "ป้ายจำนวนผู้เข้าร่วม", "จำนวนผู้เข้าร่วม"),
              label("participantsUnit", "หน่วยจำนวนผู้เข้าร่วม", "คน / รอบ"),
              label("price", "ป้ายค่าบริการ", "ค่าบริการ"),
              label("perPerson", "หน่วยค่าบริการ", "/ คน"),
              label("bookingTerms", "หัวข้อเงื่อนไขการจอง", "เงื่อนไขการจอง"),
              label("takeaway", "ป้ายสิ่งที่ได้กลับบ้าน", "ได้กลับบ้าน:"),
              label("bookViaLine", "ปุ่มจองผ่าน LINE", "จองกิจกรรมผ่าน LINE"),
              label("callToBook", "ปุ่มโทรนัดหมาย", "โทรนัดหมาย"),
            ]),
          ],
        },
        {
          label: "ติดต่อและท้ายเว็บ",
          fields: [
            group("contact", "หน้าติดต่อและท้ายเว็บ", [
              label("location", "หัวข้อที่ตั้ง", "ที่ตั้ง"),
              label("openingHours", "หัวข้อเวลาทำการ", "เวลาทำการ"),
              label("coordinates", "ป้ายนำหน้าพิกัด", "พิกัด"),
              label("contactCommunity", "หัวคอลัมน์ติดต่อท้ายเว็บ", "ติดต่อชุมชน"),
              label("directions", "ปุ่มนำทางท้ายเว็บ", "นำทางด้วย Google Maps"),
              label("copyright", "ข้อความสงวนลิขสิทธิ์", "สงวนลิขสิทธิ์"),
            ]),
          ],
        },
        {
          label: "เกี่ยวกับชุมชน",
          fields: [
            group("about", "หน้าเกี่ยวกับชุมชน", [
              label("role", "ป้ายนำหน้าบทบาทของปราชญ์ชุมชน", "บทบาท"),
              label("source", "ป้ายนำหน้าที่มาข้อมูล", "ที่มาข้อมูล"),
              label("references", "หัวข้อกล่องแหล่งอ้างอิง", "แหล่งอ้างอิง"),
            ]),
          ],
        },
      ],
    },
  ],
};

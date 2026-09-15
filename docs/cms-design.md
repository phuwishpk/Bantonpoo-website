# ออกแบบระบบ CMS — เว็บไซต์ชุมชนบ้านต้นโพธิ์

เอกสารนี้ออกแบบระบบหลังบ้านสำหรับเว็บไซต์ชุมชนบ้านต้นโพธิ์ ให้ผู้ดูแลแก้ไขและเพิ่มเนื้อหาได้
**ทุกส่วนของเว็บโดยไม่ต้องแตะโค้ด รวมถึงเมนูนำทาง (navbar)**

เขียนจากสถานะโค้ดปัจจุบัน (Next.js 16 + prototype ที่ใช้ข้อมูลจาก `src/content/`)
ยังไม่ได้ติดตั้ง ต้องอ่านและอนุมัติก่อนลงมือ — ดูหัวข้อ [สิ่งที่ต้องตัดสินใจก่อนเริ่ม](#สิ่งที่ต้องตัดสินใจก่อนเริ่ม)

---

## 1. เป้าหมายและข้อจำกัด

**เป้าหมาย**

1. คนในชุมชนแก้เนื้อหาเองได้ โดยไม่ต้องรู้จัก Git หรือ HTML
2. ครอบคลุม **ทุกข้อความและทุกรูปบนเว็บ** ไม่เหลือค่าที่ฝังในโค้ด
3. แก้เมนูนำทาง ปุ่ม CTA และเมนูท้ายเว็บได้
4. ผิดพลาดแล้วย้อนกลับได้ และดูตัวอย่างก่อนเผยแพร่ได้

**ข้อจำกัดที่ออกแบบเผื่อไว้**

| ข้อจำกัด | ผลต่อการออกแบบ |
| --- | --- |
| ผู้ใช้หลักไม่ใช่สายเทคนิค | ใช้ฟอร์มที่มีรูปทรงตายตัว **ไม่ใช้ตัวสร้างหน้าแบบลากบล็อกอิสระ** ผู้ใช้ทำหน้าพังไม่ได้ |
| ข้อมูลผู้คนเป็นบุคคลจริง | มีฟิลด์บันทึกความยินยอมและแหล่งอ้างอิงแยกต่างหาก |
| ภาพมีปัญหาลิขสิทธิ์ | ฟิลด์เครดิตภาพเป็น **ฟิลด์บังคับ** อัปโหลดโดยไม่ระบุที่มาไม่ได้ |
| สินค้าเป็นสมุนไพร | มีฟิลด์ความปลอดภัยบังคับ และคำเตือนตายตัวที่แก้ทิ้งไม่ได้ |
| งบจำกัด | เลือกสแตกที่มี free tier ครบทั้ง hosting, database และ storage |

---

## 2. สถาปัตยกรรม

```
┌──────────────── HostAtom Cloud VPS (Ubuntu 24.04) ────────────────┐
│                                                                    │
│   nginx  :443  ──TLS (Let's Encrypt)──▶  Next.js :3000            │
│                                            /(frontend)  เว็บสาธารณะ │
│                                            /(payload)/admin  แอดมิน │
│                                                                    │
│   PostgreSQL :5432 (ฟังเฉพาะ 127.0.0.1 ไม่เปิดออกอินเทอร์เน็ต)      │
│   /srv/bantonpoo/uploads/  รูปที่อัปโหลดผ่าน CMS                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
        โดเมนทดสอบ: bantonpoo.phuwish.com (กันไม่ให้ Google เก็บดัชนี)
```

ขั้นตอนติดตั้งเซิร์ฟเวอร์ทั้งหมดอยู่ใน **[docs/deploy-vps.md](./deploy-vps.md)**

**ทำไมเป็น PostgreSQL**

Payload รองรับฐานข้อมูลแค่ 3 ตัวคือ **MongoDB, Postgres และ SQLite — ไม่รองรับ MySQL/MariaDB**
([เอกสาร Payload](https://payloadcms.com/docs/database/overview))
บน VPS ที่ควบคุมเองได้เต็ม **Postgres คือตัวเลือกที่ถูกต้อง** เพราะเป็น adapter
ที่ Payload ทดสอบและรองรับดีที่สุด รองรับผู้เขียนพร้อมกันหลายคน และสำรองด้วย `pg_dump` ได้มาตรฐาน

> SQLite จะเหมาะกว่าถ้าอยู่บนโฮสต์แบบแชร์ที่ลง Postgres ไม่ได้ — ซึ่งไม่ใช่กรณีนี้

**ทำไมถึงเป็น Payload ไม่ใช่ Strapi หรือ WordPress** — ตัดสินใจไว้ตั้งแต่ต้นโปรเจกต์
Payload รันอยู่ใน Next.js โปรเจกต์เดียวกัน จึง deploy ที่เดียว ไม่มีค่าใช้จ่ายเพิ่ม
และดึงข้อมูลผ่าน **Local API** (เรียกฐานข้อมูลตรง ไม่ผ่าน HTTP) ซึ่งเร็วกว่าและไม่ต้องจัดการ CORS หรือ API key

**Local API หน้าตาแบบนี้**

```ts
// src/lib/cms/products.ts — เรียกใน Server Component ได้ตรง ๆ
import { getPayload } from "payload";
import config from "@payload-config";

export async function getProduct(slug: string) {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "products",
    where: { slug: { equals: slug } },
    depth: 2,          // ดึง relationship ลึก 2 ชั้น (หมวดหมู่ + ผู้ผลิต + รูป)
    limit: 1,
  });
  return docs[0] ?? null;
}
```

---

## 3. บัญชีสิ่งที่แก้ได้ทั้งหมด

ตารางนี้คือสัญญาของระบบ — **ทุกข้อความและทุกรูปบนเว็บต้องอยู่ในตารางนี้**
คอลัมน์ขวาคือที่อยู่ในหลังบ้าน

| หน้า / ส่วน | สิ่งที่แก้ได้ | เก็บที่ |
| --- | --- | --- |
| **เมนูบน (navbar)** | รายการเมนู ลำดับ เมนูย่อย ลิงก์ | Global `navigation` → เมนูบน |
| **ปุ่มมุมขวาบน** | เปิด/ปิด ข้อความ ปลายทาง (LINE / โทร / หน้าติดต่อ) | Global `navigation` → ปุ่มมุมขวาบน |
| **เมนูบนมือถือ (drawer)** | หัวข้อเมนู หัวข้อกล่องติดต่อ ข้อความนำหน้าปุ่ม LINE และปุ่มโทร | Global `navigation` → เมนูบนมือถือ |
| **โลโก้ + ชื่อชุมชน** | รูปโลโก้ (อัปโหลดได้) ชื่อย่อ บรรทัดรองใต้โลโก้ | Global `site-settings` |
| **เมนูท้ายเว็บ** | คอลัมน์ลิงก์ ข้อความลิขสิทธิ์ ไอคอนโซเชียล | Global `navigation` |
| **หน้าแรก** | Hero (หัวเรื่อง 3 บรรทัด คำโปรย ปุ่ม ภาพ คำบรรยายภาพ) | Global `home-page` |
| | ตัวเลข 3 ช่องใต้ปุ่ม | Global `home-page` |
| | การ์ดจุดเด่น 3 ใบ (ไอคอน หัวเรื่อง เนื้อหา) | Global `home-page` |
| | หัวข้อและคำโปรยของทุก section | Global `home-page` |
| | เลือกบทความที่จะขึ้น Story Spotlight + คำพูดอ้างอิง | Global `home-page` |
| | กล่อง CTA ปิดท้าย | Global `home-page` |
| **เกี่ยวกับชุมชน** | Hero, เนื้อหาประวัติ (rich text), ภาพประกอบ | Global `about-page` |
| | ตัวเลขชุมชน 4 ช่อง | Global `about-page` |
| | ทุนชุมชน (เพิ่ม/ลบ/เรียงลำดับได้) | Global `about-page` |
| | รายการแหล่งอ้างอิง | Global `about-page` |
| **สินค้า (หน้ารวม)** | Hero, ชื่อหมวดหมู่ | Global `shop-page` + `categories` |
| **สินค้า (รายชิ้น)** | ทุกฟิลด์ของสินค้า | Collection `products` |
| **เรื่องเล่า (หน้ารวม)** | Hero, ชื่อหมวดหมู่ | Global `stories-page` + `categories` |
| **บทความ** | ทุกฟิลด์ รวมเนื้อหา rich text | Collection `articles` |
| **ท่องเที่ยว** | Hero, ปุ่มด้านบน | Global `tourism-page` |
| | ฐานเรียนรู้ทั้งหมด | Collection `workshops` |
| | จุดเช็กอินทั้งหมด | Collection `places` |
| | วิธีการเดินทาง (เพิ่ม/ลบได้) | Global `tourism-page` |
| | กล่อง "ก่อนออกเดินทาง" | Global `tourism-page` |
| **ติดต่อเรา** | Hero, การ์ดช่องทางติดต่อ 4 ใบ | Global `contact-page` |
| | ตัวเลือกหัวข้อในฟอร์ม | Global `contact-page` |
| | ข้อความตอบกลับหลังส่งฟอร์ม | Global `contact-page` |
| **ทำเนียบปราชญ์ชุมชน** | ชื่อ บทบาท ประวัติ ภาพ ความยินยอม | Collection `artisans` |
| **หน้า 404** | หัวเรื่อง คำอธิบาย ปุ่ม | Global `not-found-page` |
| **ข้อมูลติดต่อทุกที่บนเว็บ** | โทร LINE Facebook อีเมล ที่อยู่ พิกัด เวลาทำการ | Global `site-settings` |
| **SEO** | title template, คำค้น, ภาพ OG, GA4 ID | Global `seo-settings` |
| **ข้อความจากฟอร์ม** | อ่าน/ทำเครื่องหมายว่าตอบแล้ว | Collection `enquiries` |

> **ยังฝังอยู่ในโค้ดโดยตั้งใจ** — ป้ายกำกับสำหรับโปรแกรมอ่านหน้าจอ (`aria-label`) เช่น "เปิดเมนู"
> "ปิดเมนู" เพราะเป็นข้อความช่วยการเข้าถึง ไม่ใช่เนื้อหาที่ผู้อ่านทั่วไปเห็น
> รวมถึงชื่อสถานะสินค้า (`พร้อมส่ง`/`สั่งทำล่วงหน้า`/`สินค้าหมด`),
> ชื่อรูปแบบผลิตภัณฑ์, ตัวเลือกการเรียงลำดับ และคำเตือน "ใช้ภายนอกเท่านั้น"
> เพราะค่าเหล่านี้ผูกกับตรรกะของโค้ดและกฎหมาย ถ้าเปิดให้แก้แล้วพิมพ์ผิดจะทำให้ตัวกรองพัง
> หรือทำให้คำเตือนความปลอดภัยหายไป

---

## 4. Collections

### 4.1 `users` — ผู้ใช้หลังบ้าน

| ฟิลด์ | ชนิด | หมายเหตุ |
| --- | --- | --- |
| `email` | email | ใช้ล็อกอิน |
| `name` | text | ชื่อที่แสดงในประวัติการแก้ไข |
| `role` | select | `admin` / `editor` / `viewer` |

```ts
export const Users: CollectionConfig = {
  slug: "users",
  auth: { tokenExpiration: 60 * 60 * 8, maxLoginAttempts: 5, lockTime: 10 * 60 * 1000 },
  admin: { useAsTitle: "name", group: "ตั้งค่าระบบ" },
  access: {
    // มีแต่ admin ที่สร้าง/ลบผู้ใช้ได้ คนอื่นแก้ได้เฉพาะโปรไฟล์ตัวเอง
    create: isAdmin,
    delete: isAdmin,
    read: isLoggedIn,
    update: ({ req }) => (isAdmin({ req }) ? true : { id: { equals: req.user?.id } }),
  },
  fields: [
    { name: "name", type: "text", required: true, label: "ชื่อ-นามสกุล" },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      access: { update: isAdminFieldLevel }, // กันไม่ให้ editor เลื่อนขั้นตัวเอง
      options: [
        { label: "ผู้ดูแลระบบ", value: "admin" },
        { label: "ผู้แก้ไขเนื้อหา", value: "editor" },
        { label: "ดูอย่างเดียว", value: "viewer" },
      ],
    },
  ],
};
```

### 4.2 `media` — คลังรูปภาพ

**จุดสำคัญ: `alt` และ `credit` เป็นฟิลด์บังคับ** เพราะโปรเจกต์นี้เคยเจอปัญหาภาพลิขสิทธิ์
ของเทศบาลและกลุ่มสมุนไพรมาแล้ว — อัปโหลดโดยไม่ระบุที่มาและสิทธิ์การใช้งานไม่ได้

| ฟิลด์ | ชนิด | บังคับ | หมายเหตุ |
| --- | --- | --- | --- |
| `alt` | text | ✅ | คำบรรยายภาพสำหรับ screen reader และ SEO |
| `caption` | text | | คำบรรยายที่แสดงใต้ภาพ |
| `credit` | text | ✅ | เจ้าของภาพ เช่น "ถ่ายโดยชุมชน" หรือ "เทศบาลตำบลบางขะแยง (2567)" |
| `usageRights` | select | ✅ | `own` ชุมชนถ่ายเอง / `licensed` ได้รับอนุญาตแล้ว / `pending` ยังไม่ได้ขอ |

```ts
export const Media: CollectionConfig = {
  slug: "media",
  admin: { group: "เนื้อหา" },
  access: { read: () => true, create: isEditor, update: isEditor, delete: isAdmin },
  upload: {
    // ให้ Payload ย่อภาพให้ตรงกับขนาดที่หน้าเว็บใช้จริง
    imageSizes: [
      { name: "thumb", width: 160, height: 160, position: "centre" },
      { name: "card", width: 800 },
      { name: "wide", width: 1600 },
    ],
    adminThumbnail: "thumb",
    focalPoint: true,
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  },
  fields: [
    { name: "alt", type: "text", required: true, localized: true, label: "คำบรรยายภาพ (สำหรับ screen reader)" },
    { name: "caption", type: "text", localized: true, label: "คำบรรยายที่แสดงใต้ภาพ" },
    { name: "credit", type: "text", required: true, label: "เจ้าของภาพ / แหล่งที่มา" },
    {
      name: "usageRights",
      type: "select",
      required: true,
      defaultValue: "own",
      label: "สิทธิ์การใช้งาน",
      options: [
        { label: "ชุมชนถ่ายเอง", value: "own" },
        { label: "ได้รับอนุญาตแล้ว", value: "licensed" },
        { label: "ยังไม่ได้ขออนุญาต — ห้ามเผยแพร่", value: "pending" },
      ],
    },
  ],
  hooks: {
    // กันไม่ให้ภาพที่ยังไม่ได้ขออนุญาตหลุดขึ้นเว็บจริง
    beforeChange: [blockPendingRightsOnPublish],
  },
};
```

### 4.3 `categories` — หมวดหมู่ (ใช้ร่วมทั้งสินค้าและบทความ)

| ฟิลด์ | ชนิด | หมายเหตุ |
| --- | --- | --- |
| `title` | text (localized) | ชื่อหมวด |
| `slug` | text | สร้างอัตโนมัติจาก title แก้ได้ |
| `type` | select | `product` / `article` |
| `description` | textarea (localized) | คำโปรยของหมวด |
| `order` | number | ลำดับการแสดงในตัวกรอง |

### 4.4 `artisans` — ปราชญ์ชุมชนและผู้ผลิต

⚠️ **เป็นบุคคลจริง** ระบบต้องบังคับให้บันทึกความยินยอมก่อนเผยแพร่

| ฟิลด์ | ชนิด | บังคับ | หมายเหตุ |
| --- | --- | --- | --- |
| `name` | text (localized) | ✅ | |
| `slug` | text | ✅ | |
| `title` | text (localized) | ✅ | บทบาท เช่น "ประธานกลุ่มวิสาหกิจชุมชน" |
| `specialty` | text (localized) | | |
| `bio` | textarea (localized) | | |
| `photo` | upload → media | | |
| `source` | text (localized) | | แหล่งอ้างอิงของข้อมูล |
| `consentBio` | checkbox | ✅ | เจ้าตัวยินยอมให้เผยแพร่ประวัติ |
| `consentPhoto` | checkbox | ✅ | เจ้าตัวยินยอมให้เผยแพร่ภาพ |
| `consentDate` | date | | วันที่ได้รับความยินยอม |

```ts
hooks: {
  beforeValidate: [
    ({ data }) => {
      // เผยแพร่ไม่ได้ถ้ายังไม่ได้รับความยินยอม
      if (data?._status === "published" && !data?.consentBio) {
        throw new APIError("ยังไม่ได้บันทึกความยินยอมเรื่องประวัติ จึงเผยแพร่ไม่ได้", 400);
      }
      if (data?._status === "published" && data?.photo && !data?.consentPhoto) {
        throw new APIError("ยังไม่ได้บันทึกความยินยอมเรื่องภาพถ่าย จึงเผยแพร่ไม่ได้", 400);
      }
      return data;
    },
  ],
}
```

### 4.5 `products` — ผลิตภัณฑ์สมุนไพร

ตรงกับ type `Product` ใน [`src/content/types.ts`](../src/content/types.ts) แบบ 1 ต่อ 1

| ฟิลด์ | ชนิด | บังคับ | หมายเหตุ |
| --- | --- | --- | --- |
| `name` | text (localized) | ✅ | |
| `slug` | text | ✅ | ไม่ซ้ำ |
| `sku` | text | ✅ | ไม่ซ้ำ ใช้อ้างอิงตอนสั่งซื้อทาง LINE |
| `category` | relationship → categories | ✅ | กรองเฉพาะ `type = product` |
| `price` | number | | เว้นว่าง = แสดง "สอบถามราคา" |
| `status` | select | ✅ | `in-stock` / `made-to-order` / `sold-out` |
| `form` | select | ✅ | ยาหม่องน้ำ / ตลับ / น้ำมันนวด / ลูกประคบ / สบู่ / ชา / สมุนไพรอบแห้ง / อื่น ๆ |
| `netContent` | text (localized) | ✅ | เช่น "ขวดแก้ว 20 มล." |
| `mainHerbs` | array of text (localized) | | สมุนไพรหลักในตำรับ ใช้ค้นหาได้ |
| `usage` | array of textarea (localized) | ✅ | วิธีใช้ทีละขั้น |
| `shelfLife` | text (localized) | | |
| `externalUseOnly` | checkbox | ✅ | ติ๊กแล้วหน้าเว็บขึ้นกล่องเตือนอัตโนมัติ |
| `registrationNo` | text | | เลขที่ใบรับแจ้ง อย. / เลข มผช. — กฎหมายกำหนดให้แสดงถ้ามี |
| `registrationType` | select | | `fda-cosmetic` เครื่องสำอาง / `fda-herbal` ผลิตภัณฑ์สมุนไพร / `tcps` มผช. / `none` ยังไม่ได้จดแจ้ง |
| `artisan` | relationship → artisans | ✅ | |
| `excerpt` | textarea (localized) | ✅ | จำกัด 200 ตัวอักษร |
| `story` | array of textarea (localized) | | ที่มาและจุดเด่น |
| `badges` | array of text (localized) | | ป้ายจุดเด่น สูงสุด 4 |
| `gallery` | array of upload → media | ✅ | อย่างน้อย 1 รูป |
| `leadTime` | text (localized) | | แสดงเมื่อ status = made-to-order |
| `careInstructions` | array of textarea (localized) | ✅ | การเก็บรักษาและข้อควรระวัง |
| `featured` | checkbox | | ขึ้นหน้าแรก |
| `order` | number | | ลำดับใน "แนะนำ" |

```ts
versions: { drafts: true, maxPerDoc: 20 },
admin: {
  useAsTitle: "name",
  defaultColumns: ["name", "category", "price", "status", "featured", "updatedAt"],
  group: "เนื้อหา",
  livePreview: { url: ({ data }) => `${SITE}/shop/${data.slug}?preview=1` },
},
```

### 4.6 `articles` — บทความและข่าว

| ฟิลด์ | ชนิด | หมายเหตุ |
| --- | --- | --- |
| `title` `slug` `excerpt` | text / text / textarea (localized) | |
| `category` | relationship → categories (`type = article`) | |
| `coverImage` | upload → media | |
| `author` | text (localized) | ค่าเริ่มต้น "กองบรรณาธิการชุมชนบ้านต้นโพธิ์" |
| `artisan` | relationship → artisans | ใส่เมื่อผู้เขียนเป็นคนในทำเนียบ |
| `publishedAt` | date | |
| `content` | **richText (Lexical)** | รองรับหัวข้อ ย่อหน้า รายการ ภาพพร้อมคำบรรยาย คำพูดอ้างอิง และ YouTube |
| `featured` | checkbox | |

Lexical ตั้งค่าให้เหลือเฉพาะปุ่มที่ชุมชนต้องใช้จริง เพื่อไม่ให้หน้าแอดมินรก

```ts
editor: lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter((f) => !["superscript", "subscript", "checklist"].includes(f.key)),
    HeadingFeature({ enabledHeadingSizes: ["h2", "h3"] }),
    BlocksFeature({ blocks: [ImageWithCaptionBlock, QuoteBlock, YouTubeBlock] }),
  ],
}),
```

### 4.7 `workshops` — ฐานเรียนรู้

`title` · `slug` · `summary` · `description` (array) · `duration` · `pricePerPerson` (null = สอบถามราคา) ·
`minParticipants` · `maxParticipants` · `bookingNotes` (array) · `image` · `takeaway` · `order`

### 4.8 `places` — จุดเช็กอินในชุมชน

`name` · `slug` · `kind` (select: ฐานเรียนรู้/ที่พัก/จุดเช็กอิน/ร้านค้า) · `description` ·
`openingHours` · `image` · `order`

### 4.9 `enquiries` — ข้อความจากฟอร์มติดต่อ

สร้างโดยระบบเท่านั้น แอดมินอ่านและปิดงานได้ แต่แก้เนื้อหาไม่ได้

| ฟิลด์ | ชนิด | หมายเหตุ |
| --- | --- | --- |
| `name` `phone` `topic` `message` | text | มาจากฟอร์ม |
| `status` | select | `new` / `contacted` / `closed` |
| `note` | textarea | บันทึกภายในของผู้ดูแล |
| `submittedAt` | date | |

```ts
access: {
  create: () => true,          // route handler เป็นคนสร้าง
  read: isEditor,
  update: isEditor,            // แก้ได้เฉพาะ status กับ note
  delete: isAdmin,
},
```

### 4.10 `redirects` — ทางเปลี่ยนเส้นทาง (ไม่บังคับ แต่แนะนำ)

เมื่อแก้ slug ของสินค้าหรือบทความที่เคยแชร์ออกไปแล้ว ลิงก์เดิมจะไม่ตาย
ใช้ปลั๊กอิน `@payloadcms/plugin-redirects`

---

## 5. Globals

Global = เอกสารเดี่ยวที่มีชุดเดียวทั้งเว็บ เหมาะกับ "ตั้งค่า" และ "เนื้อหาประจำหน้า"

### 5.1 `navigation` — เมนูนำทาง ⭐

หัวใจของข้อที่ขอมา แก้เมนูบน ปุ่ม CTA และเมนูท้ายเว็บได้ทั้งหมด

```ts
export const Navigation: GlobalConfig = {
  slug: "navigation",
  label: "เมนูนำทาง",
  admin: { group: "ตั้งค่าเว็บไซต์" },
  access: { read: () => true, update: isEditor },
  versions: { drafts: false, max: 20 },   // เก็บประวัติไว้ย้อนได้
  fields: [
    {
      name: "mainMenu",
      type: "array",
      label: "เมนูบน (navbar)",
      maxRows: 8,                          // เกินนี้เมนูจะล้นบนจอโน้ตบุ๊ก
      admin: { components: { RowLabel: NavRowLabel } },
      fields: [
        { name: "label", type: "text", required: true, localized: true, label: "ข้อความที่แสดง" },
        {
          name: "linkType",
          type: "select",
          required: true,
          defaultValue: "page",
          label: "ประเภทลิงก์",
          options: [
            { label: "หน้าในเว็บ", value: "page" },
            { label: "ลิงก์ภายนอก", value: "external" },
            { label: "เมนูย่อย (ไม่ลิงก์ไปไหน)", value: "dropdown" },
          ],
        },
        {
          name: "page",
          type: "select",
          label: "เลือกหน้า",
          admin: { condition: (_, sibling) => sibling.linkType === "page" },
          options: PAGE_OPTIONS,           // ดูด้านล่าง
        },
        {
          name: "url",
          type: "text",
          label: "URL",
          admin: { condition: (_, sibling) => sibling.linkType === "external" },
          validate: requireAbsoluteUrl,
        },
        {
          name: "children",
          type: "array",
          label: "เมนูย่อย",
          maxRows: 6,
          // รองรับ 2 ชั้นพอ ลึกกว่านี้ใช้ยากบนมือถือ
          admin: { condition: (_, sibling) => sibling.linkType === "dropdown" },
          fields: [
            { name: "label", type: "text", required: true, localized: true },
            { name: "page", type: "select", options: PAGE_OPTIONS },
            { name: "url", type: "text" },
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
        { name: "label", type: "text", localized: true, defaultValue: "สั่งซื้อ / สอบถาม" },
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
      name: "footerColumns",
      type: "array",
      label: "คอลัมน์ลิงก์ท้ายเว็บ",
      maxRows: 3,
      fields: [
        { name: "heading", type: "text", required: true, localized: true },
        {
          name: "links",
          type: "array",
          fields: [
            { name: "label", type: "text", required: true, localized: true },
            { name: "page", type: "select", options: PAGE_OPTIONS },
            { name: "url", type: "text" },
          ],
        },
      ],
    },
    { name: "footerNote", type: "text", localized: true, label: "ข้อความท้ายสุด (ลิขสิทธิ์)" },
  ],
};

/**
 * รายการหน้าที่มีอยู่จริงในเว็บ
 * ทำเป็น select ไม่ใช่ช่องพิมพ์ URL เอง เพื่อไม่ให้พิมพ์ผิดแล้วได้ลิงก์เสีย
 * เมื่อเพิ่มหน้าใหม่ในโค้ด ต้องมาเพิ่มตัวเลือกที่นี่ด้วย
 */
const PAGE_OPTIONS = [
  { label: "หน้าแรก", value: "/" },
  { label: "เกี่ยวกับชุมชน", value: "/about" },
  { label: "เรื่องเล่า", value: "/stories" },
  { label: "สินค้าชุมชน", value: "/shop" },
  { label: "ท่องเที่ยว", value: "/tourism" },
  { label: "ติดต่อเรา", value: "/contact" },
];
```

**ฝั่งหน้าเว็บ** — [`src/lib/nav.ts`](../src/lib/nav.ts) เปลี่ยนจากอาร์เรย์คงที่เป็นฟังก์ชันดึงจาก CMS
[`SiteHeader`](../src/components/site-header.tsx) รับเมนูมาทาง props จาก layout
(ตัว header เป็น Client Component จึงรับข้อมูลเป็น props ไม่เรียก CMS เอง)

### 5.2 `site-settings` — ข้อมูลชุมชน

ตรงกับ type `SiteSettings` ปัจจุบัน แบ่งเป็นแท็บให้หาง่าย

| แท็บ | ฟิลด์ |
| --- | --- |
| ข้อมูลทั่วไป | `communityName` `communityShortName` `tagline` `logo` `aboutSummary` |
| ติดต่อ | `phone` `phoneDisplay` `lineId` `lineUrl` `facebookUrl` `email` |
| ที่ตั้ง | `address` `addressLocality` `addressRegion` `postalCode` `mapLatitude` `mapLongitude` |
| เวลาทำการ | `openingHours` `openingHoursShort` |
| ระบบ | `siteUrl` |

> พิกัดใช้ `number` สองช่อง ไม่ใช้ฟิลด์ `point` ของ Payload เพราะฟิลด์ `point`
> บน Postgres ต้องเปิดส่วนขยาย PostGIS ซึ่ง Neon free tier ไม่ได้เปิดมาให้

### 5.3 Global ประจำหน้า

แต่ละหน้ามี Global ของตัวเอง รูปทรงตายตัว แก้ข้อความได้แต่ทำ layout พังไม่ได้

| Global | เนื้อหาที่แก้ได้ |
| --- | --- |
| `home-page` | hero (eyebrow, 3 บรรทัดหัวเรื่อง, คำโปรย, ปุ่ม 2 ปุ่ม, ภาพ, คำบรรยายภาพ), ตัวเลข 3 ช่อง, การ์ดจุดเด่น 3 ใบ, หัวข้อ+คำโปรยของ 4 section, บทความ spotlight + คำพูดอ้างอิง, กล่อง CTA |
| `about-page` | hero, ภาพประวัติ, เนื้อหา rich text, ตัวเลขชุมชน 4 ช่อง, ทุนชุมชน (array), แหล่งอ้างอิง (array), กล่องปิดท้าย |
| `shop-page` | hero (eyebrow, หัวเรื่อง, คำโปรย), ข้อความตอนไม่พบสินค้า |
| `stories-page` | hero, ข้อความตอนไม่พบบทความ |
| `tourism-page` | hero + ปุ่ม, หัวข้อ 3 section, วิธีการเดินทาง (array), กล่อง "ก่อนออกเดินทาง" |
| `contact-page` | hero, การ์ดช่องทางติดต่อ (array), หัวข้อฟอร์ม, ตัวเลือกหัวข้อในฟอร์ม, ข้อความหลังส่งสำเร็จ |
| `not-found-page` | หัวเรื่อง คำอธิบาย ปุ่ม |
| `seo-settings` | title template, คำค้นเริ่มต้น, ภาพ OG เริ่มต้น, GA4 Measurement ID, เปิด/ปิด noindex |

ตัวอย่างการ์ดจุดเด่นหน้าแรก — จำกัดไอคอนเป็นตัวเลือก ไม่ให้อัปโหลดเอง จะได้ไม่หลุดสไตล์

```ts
{
  name: "highlights",
  type: "array",
  label: "การ์ดจุดเด่น",
  minRows: 3,
  maxRows: 3,
  fields: [
    {
      name: "icon",
      type: "select",
      required: true,
      options: [
        { label: "ใบไม้ (สมุนไพร)", value: "leaf" },
        { label: "เจดีย์ (วัด/วัฒนธรรม)", value: "temple" },
        { label: "ครก (การแปรรูป)", value: "mortar" },
        { label: "กลุ่มคน (ชุมชน)", value: "users" },
        { label: "หมุดแผนที่", value: "map-pin" },
      ],
    },
    { name: "title", type: "text", required: true, localized: true },
    { name: "body", type: "textarea", required: true, localized: true, maxLength: 200 },
  ],
}
```

---

## 6. สิทธิ์ผู้ใช้และขั้นตอนการทำงาน

| บทบาท | สิทธิ์ |
| --- | --- |
| **admin** | ทุกอย่าง รวมจัดการผู้ใช้ ลบเนื้อหา และแก้ตั้งค่าระบบ |
| **editor** | สร้าง/แก้/เผยแพร่เนื้อหาและ Global ทั้งหมด แต่ลบถาวรไม่ได้และจัดการผู้ใช้ไม่ได้ |
| **viewer** | เข้าดูหลังบ้านได้อย่างเดียว เหมาะกับคนที่ต้องตรวจก่อนเผยแพร่ |

```ts
export const isAdmin: Access = ({ req }) => req.user?.role === "admin";
export const isEditor: Access = ({ req }) => ["admin", "editor"].includes(req.user?.role ?? "");
export const isLoggedIn: Access = ({ req }) => Boolean(req.user);
```

**ขั้นตอนเผยแพร่** — ทุก collection เปิด `versions.drafts`

```
สร้าง/แก้ → บันทึกฉบับร่าง → กด "ดูตัวอย่าง" (Live Preview) → กดเผยแพร่ → เว็บอัปเดตทันที
                                                                    ↑
                                            ย้อนกลับไปเวอร์ชันก่อนหน้าได้ตลอด (เก็บ 20 เวอร์ชัน)
```

---

## 7. ภาษา (i18n)

โครงรองรับสองภาษาวางไว้ในโค้ดแล้ว (`Localized<T>` + `t()` ใน [`src/lib/i18n.ts`](../src/lib/i18n.ts))
ฝั่ง Payload เปิดด้วย

```ts
localization: {
  locales: [
    { code: "th", label: "ไทย" },
    { code: "en", label: "English" },
  ],
  defaultLocale: "th",
  fallback: true,   // ถ้ายังไม่ได้แปล ให้ใช้ภาษาไทยแทน เว็บจึงไม่มีช่องว่าง
},
```

ฟิลด์ที่ผู้อ่านเห็นทุกฟิลด์ตั้ง `localized: true` ส่วนฟิลด์ที่เป็นข้อมูลระบบ
(`slug`, `sku`, `price`, `status`, ลิงก์, พิกัด) ไม่ต้อง

**ยังไม่ต้องเปิด EN ตอนนี้** — ใส่ `locales` ไว้ได้เลย ผู้ใช้จะเห็นแค่ปุ่มสลับภาษาในหลังบ้าน
เมื่อพร้อมค่อยเปลี่ยน routing เป็น `/[locale]/...`

---

## 8. ดูตัวอย่างและอัปเดตหน้าเว็บ

**Live Preview** — Payload แสดงหน้าเว็บจริงข้างฟอร์ม อัปเดตตามที่พิมพ์แบบเรียลไทม์

**On-demand revalidation** — เมื่อกดเผยแพร่ ให้ล้างแคชเฉพาะหน้าที่เกี่ยวข้อง
ไม่ต้อง build ใหม่ทั้งเว็บ

```ts
// hooks/revalidate.ts
export const revalidateProduct: CollectionAfterChangeHook = ({ doc, previousDoc }) => {
  revalidateTag("products");                    // หน้ารวมสินค้าและหน้าแรก
  revalidatePath(`/shop/${doc.slug}`);
  // slug เปลี่ยน ต้องล้างหน้าเดิมด้วย ไม่งั้นลิงก์เก่าจะค้างอยู่ในแคช
  if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
    revalidatePath(`/shop/${previousDoc.slug}`);
  }
  return doc;
};
```

Global ที่กระทบทั้งเว็บ (`navigation`, `site-settings`) ให้ `revalidatePath("/", "layout")`

---

## 9. การต่อกับหน้าเว็บที่มีอยู่

ข่าวดีคือ prototype ออกแบบเผื่อไว้แล้ว — type ใน `src/content/types.ts` ตรงกับ collection แบบ 1 ต่อ 1
และทุกหน้าเรียกข้อมูลผ่านฟังก์ชัน ไม่ได้แตะอาร์เรย์ตรง ๆ

```
ก่อน                                      หลัง
src/content/products.ts                   src/lib/cms/products.ts
  export const products = [...]             export async function getProducts()
  export function getProduct(slug)            → payload.find({ collection: "products" })
  export function getFeaturedProducts()     export async function getProduct(slug)
                                            export async function getFeaturedProducts()
```

**สิ่งที่ต้องแก้ในหน้าเว็บ** — เปลี่ยนฟังก์ชันเป็น `async` และ `await` เท่านั้น
ส่วน component ที่รับ props (`ProductCard`, `ProductCatalog`, `ArticleCard`, ...) **ไม่ต้องแก้เลย**

| ไฟล์ที่ต้องแตะ | สิ่งที่เปลี่ยน |
| --- | --- |
| `src/content/*.ts` | แทนที่ด้วย `src/lib/cms/*.ts` |
| `src/app/**/page.tsx` | เติม `await` หน้าฟังก์ชันดึงข้อมูล |
| `src/app/layout.tsx` | ดึง `navigation` + `site-settings` แล้วส่งเป็น props ให้ header/footer |
| `src/components/site-header.tsx` | รับเมนูทาง props แทน import จาก `nav.ts` |
| `src/components/site-footer.tsx` | เช่นเดียวกัน |
| `src/app/api/contact/route.ts` | เขียนลง collection `enquiries` + ส่งอีเมลแจ้งเตือน |

---

## 10. โครงไฟล์ที่จะเพิ่ม

```
src/
├── payload.config.ts                 ตั้งค่ากลาง
├── payload-types.ts                  สร้างอัตโนมัติ (อย่าแก้มือ)
├── collections/
│   ├── Users.ts  Media.ts  Categories.ts  Artisans.ts
│   ├── Products.ts  Articles.ts  Workshops.ts  Places.ts  Enquiries.ts
├── globals/
│   ├── Navigation.ts  SiteSettings.ts  SeoSettings.ts
│   └── pages/  HomePage.ts  AboutPage.ts  ShopPage.ts  StoriesPage.ts
│                TourismPage.ts  ContactPage.ts  NotFoundPage.ts
├── access/          isAdmin.ts  isEditor.ts
├── hooks/           revalidate.ts  slugify.ts  consentGuard.ts
├── lib/cms/         products.ts  articles.ts  artisans.ts  workshops.ts  globals.ts
└── app/(payload)/   admin/[[...segments]]/  api/[...slug]/
```

---

## 11. การขึ้นเซิร์ฟเวอร์และโดเมนทดสอบ

ขั้นตอนละเอียดอยู่ใน **[docs/deploy-vps.md](./deploy-vps.md)** — สรุปสาระสำคัญที่มีผลกับการออกแบบ CMS

### สภาพแวดล้อม

| | โดเมน | ใช้ทำอะไร |
| --- | --- | --- |
| **ทดสอบ** | `bantonpoo.phuwish.com` | ชุมชนลองแก้เนื้อหา ปิดไม่ให้ Google เก็บดัชนี |
| **จริง** | โดเมนของชุมชน (ยังไม่กำหนด) | เว็บสาธารณะ |

### สิ่งที่ CMS ต้องออกแบบเผื่อ

**รูปที่อัปโหลดต้องอยู่นอกโฟลเดอร์แอป** — deploy คือการเขียนทับ `/srv/bantonpoo/current`
ถ้า Payload เก็บรูปไว้ข้างในจะหายทุกครั้งที่อัปเดตเว็บ จึงตั้ง

```ts
upload: {
  // ชี้ออกไปนอกโฟลเดอร์ที่ถูกเขียนทับตอน deploy
  staticDir: process.env.UPLOAD_DIR || path.resolve(dirname, "../uploads"),
}
```

**build ที่เครื่องตัวเอง ไม่ build บนเซิร์ฟเวอร์** — VPS แผนเริ่มต้นมี RAM 2GB และ 1 vCore
`next build` อาจกินจนเว็บที่รันอยู่ล่มไปด้วย ใช้ `npm run deploy` ซึ่ง build แล้ว rsync ขึ้นไปให้

**ตัวแปรที่ต้องตั้งตอน build ไม่ใช่แค่ตอนรัน** — `NEXT_PUBLIC_SITE_URL` และ `SITE_NOINDEX`
มีผลกับแท็ก `<meta>` ที่ถูกสร้างตอน build เปลี่ยนค่าแล้วต้อง deploy ใหม่ ไม่ใช่แค่รีสตาร์ต

### การสำรองข้อมูล

```bash
sudo -u postgres pg_dump bantonpoo | gzip > backups/db-$(date +%F).sql.gz
tar czf backups/uploads-$(date +%F).tar.gz -C /srv/bantonpoo uploads
```

ตั้ง cron รายวันและเก็บย้อนหลัง 30 วัน — รายละเอียดในคู่มือ deploy

## 12. แผนการติดตั้ง

| เฟส | งาน | ผลลัพธ์ที่จับต้องได้ |
| --- | --- | --- |
| **0** ✅ | เตรียมแอปให้ build แบบ standalone + สคริปต์ deploy + คู่มือตั้งเซิร์ฟเวอร์ | **พร้อมขึ้น `bantonpoo.phuwish.com` แล้ว** เหลือรัน `npm run deploy` |
| **1** ✅ | ติดตั้ง Payload + PostgreSQL + `users` + `media` | **ล็อกอิน `/admin` และอัปโหลดรูปได้แล้ว** |
| **2** ✅ | `site-settings` + `navigation` | **แก้เมนูและข้อมูลติดต่อจากหลังบ้านได้จริง** |
| **3** ✅ | `categories` + `artisans` + `products` | แก้สินค้าได้ หน้าร้านดึงจาก CMS |
| **4** ✅ | `articles` (blocks) + `workshops` + `places` | เนื้อหาทั้งหมดย้ายเข้า CMS |
| **5** ✅ | Global ประจำหน้าทั้ง 7 ตัว | ไม่เหลือข้อความฝังในโค้ด |
| **6** ◐ | `enquiries` + กันสแปมตามความถี่ | ฟอร์มติดต่อบันทึกลง CMS แล้ว — **ยังไม่ได้ส่งอีเมลแจ้งเตือน** |
| **7** ◐ | revalidation + สคริปต์ย้ายข้อมูล ✅ · **Live Preview และอบรมผู้ใช้ยังไม่ได้ทำ** | ส่งมอบให้ชุมชนดูแลเอง |

เฟส 0–5 ทำเสร็จแล้ว เฟส 6–7 เหลือบางส่วน — เดิมวางไว้ว่าเฟส 2 ทำให้เห็นผลเร็วที่สุด และตอบโจทย์ "แก้ navbar ได้" ที่ขอมาโดยตรง

**สคริปต์ย้ายข้อมูล** — เขียน `scripts/seed-from-content.ts` อ่านจาก `src/content/*.ts` เดิม
แล้วยิงเข้า Local API ทำให้ข้อมูลที่มีอยู่ตอนนี้ขึ้น CMS ครบโดยไม่ต้องพิมพ์ใหม่

---

## สิ่งที่ตัดสินใจแล้ว

| # | เรื่อง | ข้อสรุป |
| --- | --- | --- |
| 1 | โฮสติ้ง | **HostAtom Cloud VPS** (Ubuntu + root SSH) |
| 2 | ฐานข้อมูล | **PostgreSQL** ติดตั้งบน VPS เดียวกัน ฟังเฉพาะ 127.0.0.1 |
| 3 | ที่เก็บรูป | **โฟลเดอร์ `/srv/bantonpoo/uploads`** บน VPS สำรองพร้อมฐานข้อมูล |
| 4 | โดเมนทดสอบ | **`bantonpoo.phuwish.com`** เปิด `SITE_NOINDEX=1` |
| 5 | รูปแบบการแก้เนื้อหา | **ข้อมูลเชิงระบบ** (โครงสร้างตายตัว) ไม่ทำตัวสร้างหน้าแบบลากบล็อก |
| 6 | สิทธิ์ใช้เนื้อหา | ได้รับอนุญาตจากชุมชนแล้ว |

## ที่ยังต้องตัดสินใจ

| # | เรื่อง | ทางเลือก | ที่แนะนำ |
| --- | --- | --- | --- |
| 7 | เปิดภาษาอังกฤษไหม | เปิดเลย / ไทยอย่างเดียว | **ต้องตัดสินก่อนลงข้อมูล** เปิดทีหลังต้อง migrate ฐานข้อมูล |
| 8 | ผู้ใช้หลังบ้าน | กี่คน ใครเป็น admin | รอรายชื่อและอีเมล |
| 9 | ส่งอีเมลแจ้งเตือนฟอร์ม | SMTP ของโดเมน / Resend / ไม่ส่ง | **Resend** free tier 3,000 ฉบับ/เดือน ตั้งง่ายกว่าดูแล SMTP เอง |
| 10 | GraphQL | เปิด / ปิด | **ปิด** ไม่ได้ใช้ และลดพื้นที่ที่ถูกโจมตี |
| 11 | เลขจดแจ้ง อย./มผช. ของสินค้า | มี / ไม่มี | ถ้ามีต้องแสดงบนหน้าสินค้า (เตรียมฟิลด์ไว้แล้ว) |

**ค่าใช้จ่ายรวม: ค่า VPS ตามแผนที่ใช้อยู่** ไม่มีค่าฐานข้อมูล ที่เก็บไฟล์ หรือโดเมนทดสอบเพิ่ม

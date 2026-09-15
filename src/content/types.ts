/**
 * โครงสร้างข้อมูลกลางของเว็บ
 *
 * type เหล่านี้ตั้งใจให้ "ตรงกับ Payload collections" ที่จะสร้างในเฟสถัดไป
 * แบบ 1 ต่อ 1 — ตอนย้ายจาก mock ไป CMS จริง ให้เปลี่ยนเฉพาะตัว fetch
 * ใน src/content/*.ts เท่านั้น ส่วน component ทั้งหมดไม่ต้องแก้
 *
 * เรื่องภาษา: ทุกฟิลด์ที่เป็นข้อความสำหรับผู้อ่านใช้ชนิด Localized<T>
 * ตอนนี้เก็บเฉพาะ th เมื่อเปิดภาษาอังกฤษให้เติม en เข้าไปในอ็อบเจกต์เดิม
 * แล้วเรียกผ่าน t() ใน src/lib/i18n.ts — ไม่ต้องรื้อ schema
 */

export type Locale = "th" | "en";

export type Localized<T = string> = {
  th: T;
  en?: T;
};

/** ไฟล์รูปภาพ — ตรงกับ Payload Media collection */
export type Media = {
  url: string;
  alt: Localized;
  width: number;
  height: number;
  caption?: Localized;
};

/** Categories — ใช้ร่วมกันทั้งบทความและสินค้า แยกด้วยฟิลด์ type */
export type Category = {
  slug: string;
  title: Localized;
  type: "article" | "product";
  description?: Localized;
};

/**
 * ปราชญ์ชุมชนและผู้ผลิต — ใช้ในทำเนียบปราชญ์ชุมชนและป้ายผู้ผลิตในหน้าสินค้า
 *
 * ⚠️ เป็นบุคคลจริง ห้ามแต่งประวัติเพิ่มเอง ฟิลด์ bio ต้องมาจากเจ้าตัวหรือ
 *    แหล่งอ้างอิงที่ตรวจสอบได้เท่านั้น
 */
export type Artisan = {
  id: string | number;
  slug: string;
  name: Localized;
  /** ฉายา/ตำแหน่ง เช่น "ครูช่างประจำโรงปั้นบ้านต้นโพธิ์" */
  title: Localized;
  specialty: Localized;
  bio: Localized;
  photo: Media;
  /** ที่มาของข้อมูล เพื่อให้ตรวจย้อนได้ว่าประวัตินี้มาจากไหน */
  source?: Localized;
};

export type ProductStatus = "in-stock" | "made-to-order" | "sold-out";

/** รูปแบบผลิตภัณฑ์ — ใช้เป็นตัวกรองในหน้าสินค้า */
export type ProductForm =
  | "liquid-balm"
  | "solid-balm"
  | "massage-oil"
  | "compress"
  | "soap"
  | "tea"
  | "dried-herb"
  | "other";

export type Product = {
  /** id ในฐานข้อมูล ใช้ทำลิงก์ไปหน้าแก้ไขในหลังบ้าน */
  id: string | number;
  slug: string;
  /** รหัสสินค้าที่ใช้อ้างอิงเวลาสั่งซื้อทางไลน์ */
  sku: string;
  name: Localized;
  category: Category;
  /** ราคาเป็นบาท — ถ้าเป็น null หน้าเว็บจะขึ้น "สอบถามราคา" แทนตัวเลข */
  price: number | null;
  status: ProductStatus;
  form: ProductForm;
  /** ปริมาณสุทธิ เช่น "ขวด 20 มล." หรือ "ลูกละ 100 กรัม" */
  netContent: Localized;
  /** สมุนไพรหลักในตำรับ — แสดงในตารางสเปกและใช้ค้นหา */
  mainHerbs: Localized<string[]>;
  /** วิธีใช้ */
  usage: Localized<string[]>;
  /** อายุการเก็บรักษา */
  shelfLife?: Localized;
  /**
   * ใช้ภายนอกเท่านั้น (ห้ามรับประทาน)
   * เป็นข้อมูลความปลอดภัย ต้องแสดงชัดเจนในหน้าสินค้า
   */
  externalUseOnly: boolean;
  /** ประเภทการจดแจ้ง — ถ้าไม่ใช่ none ต้องแสดงเลขที่บนหน้าสินค้า */
  registrationType: "none" | "fda-cosmetic" | "fda-herbal" | "tcps";
  registrationNo?: string;
  artisan: Artisan;
  /** สรุปสั้นสำหรับการ์ดสินค้าและ meta description */
  excerpt: Localized;
  /** Product Story — เล่าที่มาของผลิตภัณฑ์ */
  story: Localized<string[]>;
  /** ป้ายจุดเด่น เช่น "ทำมือในชุมชน", "สินค้าเรือธง" */
  badges: Localized<string[]>;
  gallery: Media[];
  /** ระยะเวลาสั่งทำ แสดงเฉพาะสินค้าสถานะ made-to-order */
  leadTime?: Localized;
  careInstructions: Localized<string[]>;
  featured: boolean;
};

export type Article = {
  id: string | number;
  slug: string;
  title: Localized;
  category: Category;
  excerpt: Localized;
  coverImage: Media;
  /** ชื่อผู้เขียน — ถ้าเป็นคนในทำเนียบให้ผูก artisan ไว้ด้วย */
  author: Localized;
  artisan?: Artisan;
  publishedAt: string;
  /** เนื้อหาแบบ block — ตรงกับ Rich Text ของ Payload (Lexical) */
  content: ContentBlock[];
  gallery?: Media[];
  featured: boolean;
};

/**
 * บล็อกเนื้อหาบทความ
 * ชุดนี้ครอบคลุมสิ่งที่สเปกต้องการ: หัวข้อ, ย่อหน้า, รายการ,
 * ภาพพร้อมคำบรรยาย, คำพูดของช่าง (blockquote) และวิดีโอ YouTube
 */
export type ContentBlock =
  | { type: "heading"; level: 2 | 3; text: Localized }
  | { type: "paragraph"; text: Localized }
  | { type: "list"; style: "bullet" | "number"; items: Localized<string[]> }
  | { type: "image"; media: Media }
  | { type: "quote"; text: Localized; attribution?: Localized }
  | { type: "youtube"; videoId: string; title: Localized };

export type Workshop = {
  id: string | number;
  slug: string;
  title: Localized;
  summary: Localized;
  description: Localized<string[]>;
  /** ระยะเวลา เช่น "2 ชั่วโมง" */
  duration: Localized;
  /** ค่าบริการต่อคน — null = สอบถามราคา */
  pricePerPerson: number | null;
  minParticipants: number;
  maxParticipants: number;
  bookingNotes: Localized<string[]>;
  image: Media;
  /** สิ่งที่ผู้ร่วมกิจกรรมได้กลับบ้าน */
  takeaway?: Localized;
};

/** จุดเช็กอิน/ที่พักในชุมชน แสดงบนหน้าท่องเที่ยว */
export type PlaceOfInterest = {
  id: string | number;
  slug: string;
  name: Localized;
  kind: "workshop-site" | "homestay" | "landmark" | "shop";
  description: Localized;
  openingHours?: Localized;
  image: Media;
};

/** Site Settings (Global) — แก้ครั้งเดียวมีผลทั้งเว็บ */
export type SiteSettings = {
  communityName: Localized;
  communityShortName: Localized;
  tagline: Localized;
  aboutSummary: Localized;
  phone: string;
  phoneDisplay: string;
  lineId: string;
  lineUrl: string;
  facebookUrl: string;
  email: string;
  address: Localized;
  /** ใช้ประกอบ schema.org PostalAddress */
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  mapLatitude: number;
  mapLongitude: number;
  openingHours: Localized;
  /** เวอร์ชันสั้นสำหรับที่แคบ เช่น drawer บนมือถือ */
  openingHoursShort: Localized;
  logo?: Media;
  // โดเมนไม่ได้อยู่ที่นี่ — อ่านจาก NEXT_PUBLIC_SITE_URL ใน src/lib/site-url.ts
  // เพราะเป็นค่าที่ต่างกันระหว่างเครื่องทดสอบกับเครื่องจริง ไม่ใช่เนื้อหาที่แอดมินแก้
};

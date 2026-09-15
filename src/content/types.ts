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

/** ช่างฝีมือ / ครูช่าง — ใช้ในทำเนียบครูช่างและ Craftsman Badge ในหน้าสินค้า */
export type Craftsman = {
  slug: string;
  name: Localized;
  /** ฉายา/ตำแหน่ง เช่น "ครูช่างประจำซุ้มตีมีดบ้านต้นโพธิ์" */
  title: Localized;
  /** จำนวนปีที่ทำงานตีเหล็ก */
  yearsOfCraft: number;
  specialty: Localized;
  bio: Localized;
  photo: Media;
};

export type ProductStatus = "in-stock" | "made-to-order" | "sold-out";

/** ชนิดเหล็ก — ใช้เป็นตัวกรองในหน้าสินค้า */
export type SteelType = "spring-steel" | "d2" | "damascus" | "carbon-1095" | "other";

export type Product = {
  slug: string;
  /** รหัสสินค้าที่ใช้อ้างอิงเวลาสั่งซื้อทางไลน์ */
  sku: string;
  name: Localized;
  categorySlug: string;
  /** ราคาเป็นบาท — ถ้าเป็น null หน้าเว็บจะขึ้น "สอบถามราคา" แทนตัวเลข */
  price: number | null;
  status: ProductStatus;
  steelType: SteelType;
  /** สเปกเชิงตัวเลข หน่วยเซนติเมตร/มิลลิเมตร */
  bladeLengthCm?: number;
  spineThicknessMm?: number;
  totalLengthCm?: number;
  weightG?: number;
  handleMaterial: Localized;
  sheath?: Localized;
  craftsmanSlug: string;
  /** สรุปสั้นสำหรับการ์ดสินค้าและ meta description */
  excerpt: Localized;
  /** Product Story — เล่าที่มาของมีดเล่มนี้ */
  story: Localized<string[]>;
  /** ป้ายการันตี เช่น "เหล็กแหนบแท้ 100%", "ตีโดยครูช่าง" */
  badges: Localized<string[]>;
  gallery: Media[];
  /** ระยะเวลาสั่งทำ แสดงเฉพาะสินค้าสถานะ made-to-order */
  leadTime?: Localized;
  careInstructions: Localized<string[]>;
  featured: boolean;
};

export type Article = {
  slug: string;
  title: Localized;
  categorySlug: string;
  excerpt: Localized;
  coverImage: Media;
  /** ชื่อผู้เขียน — ถ้าเป็นช่างในชุมชนให้ใส่ craftsmanSlug คู่กัน */
  author: Localized;
  craftsmanSlug?: string;
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
  heroTitle: Localized;
  heroSubtitle: Localized;
  aboutSummary: Localized;
  phone: string;
  phoneDisplay: string;
  lineId: string;
  lineUrl: string;
  facebookUrl: string;
  email: string;
  address: Localized;
  mapLatitude: number;
  mapLongitude: number;
  mapEmbedQuery: string;
  openingHours: Localized;
  /** เวอร์ชันสั้นสำหรับที่แคบ เช่น drawer บนมือถือ */
  openingHoursShort: Localized;
  /** โดเมนจริงตอน deploy — ใช้ประกอบ canonical URL, sitemap, OG image */
  siteUrl: string;
};

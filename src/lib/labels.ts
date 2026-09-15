/**
 * คำเรียกที่ใช้ซ้ำทั้งเว็บ — ค่าตั้งต้นและชนิดข้อมูล
 *
 * แยกจาก src/lib/cms/labels.ts โดยตั้งใจ ไฟล์นั้นเรียก Payload ซึ่งทำงานได้เฉพาะ
 * ฝั่งเซิร์ฟเวอร์ ถ้าคอมโพเนนต์ฝั่งไคลเอนต์ import ไปด้วย Payload ทั้งก้อนจะถูกลาก
 * เข้าบันเดิลของเบราว์เซอร์แล้ว build พังทันที ไฟล์นี้จึงไม่ import อะไรจาก cms เลย
 *
 * ค่าตั้งต้นอยู่ฝั่งโค้ด ไม่ได้อยู่ในฐานข้อมูลอย่างเดียว เพราะถ้าฐานข้อมูลยังไม่ถูก seed
 * หรือถูกกู้คืนมาไม่ครบ หน้าเว็บก็ยังอ่านรู้เรื่อง
 */

export const DEFAULT_LABELS = {
  general: {
    askPrice: "สอบถามราคา",
    askServicePrice: "สอบถามค่าบริการ",
    viewAllProducts: "ดูสินค้าทั้งหมด",
    viewAllWorkshops: "ดูกิจกรรมทั้งหมด",
    viewAllArticles: "ดูบทความทั้งหมด",
    readFullArticle: "อ่านบทความฉบับเต็ม",
    openInMaps: "เปิดนำทางด้วย Google Maps",
  },
  product: {
    madeBy: "ผลิตโดย",
    viewArtisans: "ดูทำเนียบปราชญ์ชุมชนทั้งหมด →",
    specs: "สเปกทางเทคนิค",
    sku: "รหัสสินค้า",
    form: "รูปแบบ",
    netContent: "ปริมาณสุทธิ",
    mainHerbs: "สมุนไพรหลัก",
    shelfLife: "อายุการเก็บรักษา",
    externalUseTitle: "ใช้ภายนอกเท่านั้น",
    externalUseBody: "ห้ามรับประทาน เก็บให้พ้นมือเด็ก และหลีกเลี่ยงบริเวณดวงตาและบาดแผลเปิด",
    callGroup: "โทรสอบถามกลุ่มวิสาหกิจชุมชน",
    facebookHint: "หรือทักผ่านเพจ Facebook ของวิสาหกิจชุมชน",
    storyEyebrow: "เรื่องเล่าของผลิตภัณฑ์",
    storyTitle: "ที่มาและจุดเด่น",
    usageEyebrow: "วิธีใช้",
    usageTitle: "ใช้อย่างไร",
    careEyebrow: "คำแนะนำ",
    careTitle: "การเก็บรักษาและข้อควรระวัง",
    relatedEyebrow: "อาจถูกใจ",
    relatedTitle: "สินค้าที่คล้ายกัน",
    filters: "ตัวกรอง",
    sortBy: "เรียงตาม",
    resultsUnit: "รายการ",
  },
  article: {
    writtenBy: "เขียนโดย",
    readTime: "ใช้เวลาอ่าน",
    minutes: "นาที",
    share: "แชร์บทความนี้",
    aboutAuthor: "เกี่ยวกับผู้เขียน",
    aboutCommunityButton: "รู้จักชุมชนและครูช่างทั้งหมด",
    relatedEyebrow: "อ่านต่อ",
    relatedTitle: "บทความที่เกี่ยวข้อง",
    resultsUnit: "บทความ",
  },
  tourism: {
    duration: "ระยะเวลา",
    participants: "จำนวนผู้เข้าร่วม",
    participantsUnit: "คน / รอบ",
    price: "ค่าบริการ",
    perPerson: "/ คน",
    bookingTerms: "เงื่อนไขการจอง",
    takeaway: "ได้กลับบ้าน:",
    bookViaLine: "จองกิจกรรมผ่าน LINE",
    callToBook: "โทรนัดหมาย",
  },
  contact: {
    location: "ที่ตั้ง",
    openingHours: "เวลาทำการ",
    coordinates: "พิกัด",
    contactCommunity: "ติดต่อชุมชน",
    directions: "นำทางด้วย Google Maps",
    copyright: "สงวนลิขสิทธิ์",
  },
  about: {
    role: "บทบาท",
    source: "ที่มาข้อมูล",
    references: "แหล่งอ้างอิง",
  },
} as const;

export type LabelGroup = keyof typeof DEFAULT_LABELS;
export type Labels = { [G in LabelGroup]: { [K in keyof (typeof DEFAULT_LABELS)[G]]: string } };

/** ที่อยู่ของป้ายกำกับหนึ่งช่อง ใช้กับการแก้ข้อความบนหน้าเว็บ */
export function atLabel<G extends LabelGroup>(
  group: G,
  key: keyof (typeof DEFAULT_LABELS)[G] & string
): string {
  return `g:ui-labels:${group}.${key}`;
}

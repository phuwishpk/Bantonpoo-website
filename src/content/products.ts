import { img } from "./media";
import type { Product, SteelType } from "./types";

/** ป้ายชื่อชนิดเหล็ก ใช้ทั้งในตัวกรองและตารางสเปก */
export const steelTypeLabels: Record<SteelType, { th: string }> = {
  "spring-steel": { th: "เหล็กแหนบโบราณ" },
  d2: { th: "เหล็กกล้า D2" },
  damascus: { th: "เหล็กดามัสกัส" },
  "carbon-1095": { th: "เหล็กคาร์บอน 1095" },
  other: { th: "วัสดุอื่น ๆ" },
};

export const productStatusLabels = {
  "in-stock": { th: "พร้อมส่ง" },
  "made-to-order": { th: "สั่งทำล่วงหน้า" },
  "sold-out": { th: "สินค้าหมด" },
} as const;

const CARE_CARBON = [
  "ล้างด้วยน้ำสะอาดแล้วเช็ดให้แห้งสนิททันทีหลังใช้งาน อย่าแช่ทิ้งไว้ในอ่าง",
  "ชโลมน้ำมันบาง ๆ (น้ำมันมะพร้าว น้ำมันคาเมลเลีย หรือน้ำมันจักร) ที่ใบมีดก่อนเก็บ",
  "หลีกเลี่ยงการล้างในเครื่องล้างจาน ความร้อนและสารเคมีจะทำให้เหล็กเป็นสนิมและด้ามไม้แตก",
  "หากขึ้นสนิมจุดเล็ก ใช้จุกไม้ก๊อกจุ่มน้ำมันถูเบา ๆ จนสนิมหลุด แล้วเช็ดแห้ง",
  "ลับคมด้วยหินลับน้ำเป็นระยะ ไม่แนะนำเครื่องลับไฟฟ้าเพราะความร้อนจะทำให้คมอ่อนลง",
];

export const products: Product[] = [
  {
    slug: "aranyik-slicer-8",
    sku: "BTP-KC-001",
    name: { th: "มีดแล่เนื้ออรัญญิก ขนาด 8 นิ้ว" },
    categorySlug: "kitchen-knives",
    price: 890,
    status: "in-stock",
    steelType: "spring-steel",
    bladeLengthCm: 20.5,
    spineThicknessMm: 2.8,
    totalLengthCm: 33,
    weightG: 210,
    handleMaterial: { th: "ไม้ประดู่" },
    sheath: { th: "ปลอกไม้เนื้อแข็ง" },
    craftsmanSlug: "somchai",
    excerpt: {
      th: "มีดแล่ทรงไทยที่ใช้กันมาตั้งแต่รุ่นยาย ใบบางเฉียบ น้ำหนักสมดุลกลางด้าม แล่เนื้อและปลาได้ลื่นมือ",
    },
    story: {
      th: [
        "เล่มนี้ตีจากเหล็กแหนบรถบรรทุกที่ผ่านการใช้งานมาแล้ว ครูช่างสมชายบอกว่าเหล็กแหนบเก่าให้เนื้อที่ “นิ่งกว่า” เหล็กใหม่ เพราะผ่านแรงกดซ้ำ ๆ มาจนโครงสร้างเข้าที่",
        "การขึ้นรูปใช้การตีมือล้วนบนทั่งเหล็กอายุกว่าห้าสิบปี ตีซ้ำราว 600 ครั้งต่อหนึ่งเล่ม แล้วจึงชุบแข็งในน้ำมันที่อุณหภูมิห้อง ก่อนอบคลายเครียดเพื่อลดโอกาสใบร้าว",
        "ด้ามไม้ประดู่ถูกเหลาและขัดด้วยมือให้เข้ากับอุ้งมือ ปลายด้ามผายเล็กน้อยเพื่อกันมือลื่นเวลาแล่เนื้อเปียก",
      ],
    },
    badges: { th: ["เหล็กแหนบแท้ 100%", "ตีมือทุกเล่ม", "ตีโดยครูช่าง"] },
    gallery: [
      img("product-chef-1", "มีดแล่เนื้ออรัญญิกวางบนพื้นไม้ เห็นทั้งเล่ม"),
      img("product-chef-2", "รายละเอียดใบมีดและรอยตีบนผิวเหล็ก"),
      img("product-chef-3", "ด้ามไม้ประดู่ขัดมัน เห็นลายไม้ชัดเจน"),
      img("product-chef-4", "มีดขณะใช้แล่เนื้อบนเขียงไม้"),
    ],
    careInstructions: { th: CARE_CARBON },
    featured: true,
  },
  {
    slug: "bushcraft-classic",
    sku: "BTP-OD-004",
    name: { th: "มีดเดินป่าทรงคลาสสิก พร้อมซองหนัง" },
    categorySlug: "outdoor-knives",
    price: 1450,
    status: "in-stock",
    steelType: "spring-steel",
    bladeLengthCm: 12,
    spineThicknessMm: 4.5,
    totalLengthCm: 24.5,
    weightG: 260,
    handleMaterial: { th: "ไม้ชิงชัน" },
    sheath: { th: "ซองหนังวัวแท้ เย็บมือ" },
    craftsmanSlug: "prasert",
    excerpt: {
      th: "สันหนา 4.5 มม. ทนงานสับและงัด เนื้อเหล็กเหนียวไม่บิ่นง่าย มาพร้อมซองหนังวัวเย็บมือในชุมชน",
    },
    story: {
      th: [
        "ช่างประเสริฐออกแบบทรงนี้จากมีดที่ชาวบ้านพกติดตัวไปสวนจริง ๆ ใบสั้นพอให้ควบคุมได้ แต่สันหนาพอจะใช้ค้อนเคาะผ่าไม้ฟืนได้โดยไม่บิ่น",
        "ชุบแข็งเฉพาะช่วงคม (differential hardening) เพื่อให้คมแข็งทนแต่สันยังเหนียว รับแรงกระแทกได้โดยไม่หัก",
        "ซองหนังเย็บด้วยมือโดยกลุ่มแม่บ้านในชุมชน ใช้หนังวัวฟอกฝาดหนา 3 มม. ยิ่งใช้ยิ่งเข้ารูปตามมีด",
      ],
    },
    badges: { th: ["เหล็กแหนบแท้ 100%", "ซองหนังเย็บมือ", "ชุบแข็งเฉพาะคม"] },
    gallery: [
      img("product-bushcraft-1", "มีดเดินป่าทรงคลาสสิกวางคู่กับซองหนัง"),
      img("product-bushcraft-2", "ซองหนังวัวเย็บมือ เห็นรอยเย็บชัดเจน"),
      img("product-bushcraft-3", "รายละเอียดสันมีดหนาและแนวคม"),
    ],
    careInstructions: { th: CARE_CARBON },
    featured: true,
  },
  {
    slug: "damascus-folder",
    sku: "BTP-CL-011",
    name: { th: "มีดพับเหล็กดามัสกัส 128 ชั้น" },
    categorySlug: "collectible",
    price: 2200,
    status: "made-to-order",
    steelType: "damascus",
    bladeLengthCm: 8.5,
    spineThicknessMm: 3.2,
    totalLengthCm: 19.5,
    weightG: 140,
    handleMaterial: { th: "ไม้มะค่าโมงคู่กับทองเหลือง" },
    craftsmanSlug: "thawee",
    excerpt: {
      th: "พับเหล็กสองชนิดซ้อนกัน 128 ชั้น ได้ลายน้ำไหลที่ไม่ซ้ำกันสักเล่ม งานสั่งทำโดยช่างทวี",
    },
    story: {
      th: [
        "เหล็กดามัสกัสเล่มนี้เกิดจากการซ้อนเหล็กสองชนิดที่กินกรดต่างกัน แล้วตีพับทบซ้ำจนได้ 128 ชั้น ลายที่เห็นคือหน้าตัดของชั้นเหล็กเหล่านั้น",
        "เพราะลายเกิดจากการพับด้วยมือ มีดแต่ละเล่มจึงมีลายไม่ซ้ำกัน แม้ช่างคนเดียวกันจะตีด้วยวิธีเดียวกันก็ตาม",
        "ระบบพับใช้สปริงเหล็กแบบ slip joint ทำมือทั้งชุด ปรับความฝืดให้พับเก็บได้แน่นมือแต่ไม่ต้องออกแรงมาก",
      ],
    },
    badges: { th: ["ลายไม่ซ้ำทุกเล่ม", "งานสั่งทำ", "ตีโดยครูช่าง"] },
    gallery: [
      img("product-damascus-1", "มีดพับเหล็กดามัสกัสกางออกเต็มเล่ม"),
      img("product-damascus-2", "ลายน้ำไหลของเหล็กดามัสกัสบนใบมีด"),
      img("product-damascus-3", "มีดพับเก็บอยู่ในฝ่ามือ"),
    ],
    leadTime: { th: "ใช้เวลาทำประมาณ 4–6 สัปดาห์หลังยืนยันแบบ" },
    careInstructions: {
      th: [
        ...CARE_CARBON.slice(0, 2),
        "เหล็กดามัสกัสต้องการการชโลมน้ำมันบ่อยกว่าปกติ เพราะลายจะจางลงหากปล่อยให้ผิวออกซิไดซ์",
        "หยอดน้ำมันที่จุดหมุนของระบบพับทุก 2–3 เดือน",
      ],
    },
    featured: true,
  },
  {
    slug: "mini-knife-keychain",
    sku: "BTP-SV-021",
    name: { th: "พวงกุญแจมีดจิ๋วอรัญญิก" },
    categorySlug: "souvenir",
    price: 150,
    status: "in-stock",
    steelType: "other",
    totalLengthCm: 6.5,
    weightG: 18,
    handleMaterial: { th: "ไม้สักขัดมัน" },
    craftsmanSlug: "wanpen",
    excerpt: {
      th: "มีดอรัญญิกย่อส่วนขนาดเท่านิ้วก้อย ตีด้วยมือจริงทุกขั้นตอน เป็นของฝากที่เล่าเรื่องชุมชนได้ในชิ้นเดียว",
    },
    story: {
      th: [
        "ทำจากเศษเหล็กที่เหลือจากการตีมีดเล่มใหญ่ แทนที่จะทิ้ง ช่างวันเพ็ญนำมาย่อส่วนเป็นมีดจิ๋วที่มีทุกอย่างครบเหมือนเล่มจริง ทั้งใบ ด้าม และปลอก",
        "เป็นของฝากที่ขายดีที่สุดของชุมชน และมักถูกซื้อเป็นของที่ระลึกให้ผู้มาเยือนเป็นหมู่คณะ",
      ],
    },
    badges: { th: ["ทำมือทุกชิ้น", "ของฝากยอดนิยม"] },
    gallery: [
      img("product-keychain-1", "พวงกุญแจมีดจิ๋วพร้อมปลอกไม้"),
      img("product-keychain-2", "พวงกุญแจมีดจิ๋วเทียบขนาดกับฝ่ามือ"),
    ],
    careInstructions: {
      th: ["เช็ดด้วยผ้าแห้งเมื่อเปียกน้ำ", "ไม่ใช่ของเล่น ควรเก็บให้พ้นมือเด็กเล็ก"],
    },
    featured: true,
  },
  {
    slug: "santoku-d2",
    sku: "BTP-KC-006",
    name: { th: "มีดซันโตกุเหล็กกล้า D2" },
    categorySlug: "kitchen-knives",
    price: 1980,
    status: "in-stock",
    steelType: "d2",
    bladeLengthCm: 17.5,
    spineThicknessMm: 2.2,
    totalLengthCm: 30,
    weightG: 185,
    handleMaterial: { th: "ไม้พะยูง" },
    craftsmanSlug: "somchai",
    excerpt: {
      th: "ทรงซันโตกุสากลบนเหล็ก D2 ที่คมอยู่ทนกว่าเหล็กแหนบหลายเท่า เหมาะกับครัวที่ใช้งานหนักทุกวัน",
    },
    story: {
      th: [
        "เป็นรุ่นที่ชุมชนพัฒนาขึ้นหลังมีลูกค้าร้านอาหารขอมีดที่ลับคมไม่บ่อย ครูช่างสมชายจึงเลือกเหล็ก D2 ซึ่งมีโครเมียมสูง คมอยู่ทนและกันสนิมได้ดีกว่าเหล็กแหนบ",
        "แลกกันตรงที่ D2 ลับยากกว่า ต้องใช้หินเพชรหรือหินน้ำเกรนสูง แต่เมื่อคมแล้วจะอยู่ได้นานหลายเท่า",
        "ทรงใบเป็นซันโตกุญี่ปุ่นที่ปรับให้ปลายมนขึ้นเล็กน้อยตามการใช้งานแบบครัวไทย ซึ่งสับและหั่นสลับกันบ่อย",
      ],
    },
    badges: { th: ["เหล็ก D2 แท้", "คมอยู่ทน", "ตีโดยครูช่าง"] },
    gallery: [
      img("product-santoku-1", "มีดซันโตกุเหล็ก D2 วางเต็มเล่ม"),
      img("product-santoku-2", "รายละเอียดแนวคมของมีดซันโตกุ"),
    ],
    careInstructions: {
      th: [
        "เช็ดให้แห้งหลังใช้งาน แม้ D2 จะกันสนิมได้ดีกว่าแต่ไม่ใช่สเตนเลส",
        "ลับด้วยหินเพชรหรือหินน้ำเกรน 1000 ขึ้นไป หินธรรมชาติทั่วไปอาจกินเนื้อเหล็กไม่ลง",
        "ห้ามใช้สับกระดูกแข็งหรือของแช่แข็ง ใบบางอาจบิ่น",
      ],
    },
    featured: true,
  },
  {
    slug: "thai-cleaver",
    sku: "BTP-KC-003",
    name: { th: "มีดอีโต้ครัวไทย ด้ามไม้แดง" },
    categorySlug: "kitchen-knives",
    price: 650,
    status: "in-stock",
    steelType: "spring-steel",
    bladeLengthCm: 18,
    spineThicknessMm: 4,
    totalLengthCm: 31,
    weightG: 420,
    handleMaterial: { th: "ไม้แดง" },
    craftsmanSlug: "prasert",
    excerpt: {
      th: "มีดอีโต้หนักมือทรงไทยแท้ สับกระดูกไก่ ฟักทอง และมะพร้าวได้สบาย เป็นเล่มที่ทุกครัวไทยควรมี",
    },
    story: {
      th: [
        "ทรงอีโต้ที่บ้านต้นโพธิ์ตีกันมาตั้งแต่รุ่นแรก น้ำหนักถูกจงใจให้อยู่ที่หัวใบมีด เพื่อให้แรงสับมาจากน้ำหนักมีดเอง ไม่ต้องออกแรงเหวี่ยง",
        "ช่างประเสริฐตีเล่มนี้ให้สันหนาเป็นพิเศษ เพราะรู้ว่าคนซื้อจะเอาไปสับกระดูกและผ่ามะพร้าวจริง ๆ",
      ],
    },
    badges: { th: ["เหล็กแหนบแท้ 100%", "ทรงไทยดั้งเดิม"] },
    gallery: [
      img("product-cleaver-1", "มีดอีโต้ครัวไทยวางบนเขียงไม้"),
      img("product-cleaver-2", "ด้ามไม้แดงของมีดอีโต้"),
    ],
    careInstructions: { th: CARE_CARBON },
    featured: false,
  },
  {
    slug: "ceremonial-sword",
    sku: "BTP-CL-015",
    name: { th: "ดาบมงคลสั่งทำ พร้อมฝักไม้แกะสลัก" },
    categorySlug: "collectible",
    price: null,
    status: "made-to-order",
    steelType: "carbon-1095",
    bladeLengthCm: 68,
    spineThicknessMm: 6,
    totalLengthCm: 95,
    weightG: 1250,
    handleMaterial: { th: "ไม้มงคลตามผู้สั่ง หุ้มด้วยเชือกถัก" },
    sheath: { th: "ฝักไม้แกะสลักลายไทย" },
    craftsmanSlug: "thawee",
    excerpt: {
      th: "งานสั่งทำเฉพาะราย ตีโดยช่างทวี ใช้เวลากว่าสองเดือน แกะสลักฝักตามลายที่ผู้สั่งเลือก",
    },
    story: {
      th: [
        "ดาบมงคลไม่ใช่สินค้าสำเร็จรูป ทุกเล่มเริ่มจากการพูดคุยกับผู้สั่งว่าจะใช้ในโอกาสใด ความยาวและน้ำหนักที่เหมาะกับผู้ถือ และลายที่ต้องการบนฝัก",
        "ช่างทวีตีจากเหล็กคาร์บอน 1095 ซึ่งให้คมที่คมจัดและขัดขึ้นเงาได้สวย ใช้เวลาขึ้นรูปและปรับสมดุลราวหนึ่งเดือน ตามด้วยงานฝักและงานถักด้ามอีกหนึ่งเดือน",
        "ราคาขึ้นอยู่กับความยาว ความซับซ้อนของลายแกะ และชนิดไม้ที่เลือก กรุณาทักมาคุยรายละเอียดกับช่างโดยตรง",
      ],
    },
    badges: { th: ["งานสั่งทำเฉพาะราย", "ตีโดยครูช่าง", "แกะสลักด้วยมือ"] },
    gallery: [
      img("product-sword-1", "ดาบมงคลวางคู่กับฝักไม้แกะสลัก"),
      img("product-sword-2", "ฝักไม้แกะสลักลายไทย"),
      img("product-sword-3", "ลวดลายบนใบดาบ"),
    ],
    leadTime: { th: "ใช้เวลาทำ 8–10 สัปดาห์หลังยืนยันแบบและมัดจำ" },
    careInstructions: {
      th: [
        "ชโลมน้ำมันกันสนิมทุกเดือน แม้ไม่ได้หยิบใช้งาน",
        "เก็บในที่แห้ง หลีกเลี่ยงการเก็บในฝักตลอดเวลาเพราะไม้จะอมความชื้น",
        "ใช้ผ้านุ่มเช็ด ห้ามใช้กระดาษทรายหรือน้ำยาขัดโลหะที่มีสารกัดกร่อน",
      ],
    },
    featured: false,
  },
  {
    slug: "chili-paste",
    sku: "BTP-FP-031",
    name: { th: "น้ำพริกเผาสูตรกลุ่มแม่บ้านบ้านต้นโพธิ์" },
    categorySlug: "farm-products",
    price: 120,
    status: "in-stock",
    steelType: "other",
    weightG: 220,
    handleMaterial: { th: "—" },
    craftsmanSlug: "wanpen",
    excerpt: {
      th: "น้ำพริกเผาเคี่ยวมือในกระทะเหล็กที่ตีเองในชุมชน ไม่ใส่วัตถุกันเสีย บรรจุขวดแก้ว 220 กรัม",
    },
    story: {
      th: [
        "กลุ่มแม่บ้านเคี่ยวน้ำพริกเผาในกระทะเหล็กที่ช่างในชุมชนตีขึ้นเอง ใช้หอมแดงและกระเทียมจากแปลงในตำบล",
        "ไม่ใส่วัตถุกันเสีย เก็บในตู้เย็นได้ประมาณ 3 เดือน",
      ],
    },
    badges: { th: ["ไม่ใส่วัตถุกันเสีย", "ผลิตในชุมชน"] },
    gallery: [
      img("product-chili-1", "ขวดน้ำพริกเผาสูตรชุมชน"),
      img("product-chili-2", "วัตถุดิบสำหรับทำน้ำพริกเผา"),
    ],
    careInstructions: { th: ["เก็บในตู้เย็นหลังเปิดขวด", "ใช้ช้อนแห้งสะอาดตักทุกครั้ง"] },
    featured: false,
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getFeaturedProducts(limit = 4): Product[] {
  return products.filter((product) => product.featured).slice(0, limit);
}

/** สินค้าที่คล้ายกัน — หมวดเดียวกันก่อน ถ้าไม่พอเติมด้วยสินค้าของช่างคนเดียวกัน */
export function getRelatedProducts(product: Product, limit = 3): Product[] {
  const sameCategory = products.filter(
    (candidate) => candidate.slug !== product.slug && candidate.categorySlug === product.categorySlug
  );
  const sameCraftsman = products.filter(
    (candidate) =>
      candidate.slug !== product.slug &&
      candidate.categorySlug !== product.categorySlug &&
      candidate.craftsmanSlug === product.craftsmanSlug
  );
  return [...sameCategory, ...sameCraftsman].slice(0, limit);
}

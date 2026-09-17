import type {
  Article,
  Artisan,
  Category,
  ContentBlock,
  Localized,
  Media,
  PlaceOfInterest,
  Product,
  Workshop,
} from "@/content/types";

/* ------------------------------------------------------------------
   ตัวแปลงจากรูปแบบที่ Payload คืนมา เป็นชนิดที่คอมโพเนนต์ใช้
   ------------------------------------------------------------------ */

type LocaleMap = Record<string, unknown> | string | null | undefined;

/** ข้อความที่แปลได้ — Payload คืนมาเป็น { th, en } อยู่แล้วเมื่อขอ locale: "all" */
export function loc(value: LocaleMap): Localized {
  if (typeof value === "string") return { th: value };
  if (!value || typeof value !== "object") return { th: "" };
  const th = typeof value.th === "string" ? value.th : "";
  const en = typeof value.en === "string" && value.en ? value.en : undefined;
  return en ? { th, en } : { th };
}

type Row = { value?: string | null };

/** รายการข้อความที่แปลได้ — Payload เก็บเป็นอาร์เรย์ของแถว ต้องดึงเฉพาะค่า */
export function locList(value: unknown): Localized<string[]> {
  if (Array.isArray(value)) {
    return { th: (value as Row[]).map((row) => row?.value ?? "").filter(Boolean) };
  }
  if (!value || typeof value !== "object") return { th: [] };
  const record = value as Record<string, Row[] | undefined>;
  const pick = (rows?: Row[]) => (rows ?? []).map((row) => row?.value ?? "").filter(Boolean);
  const th = pick(record.th);
  const en = record.en ? pick(record.en) : undefined;
  return en && en.length ? { th, en } : { th };
}

type MediaDoc = {
  id?: string | number;
  url?: string | null;
  width?: number | null;
  height?: number | null;
  alt?: LocaleMap;
  caption?: LocaleMap;
  sizes?: { thumb?: { url?: string | null } | null } | null;
};

export function mapMedia(value: unknown): Media | null {
  if (!value || typeof value !== "object") return null;
  const doc = value as MediaDoc;
  if (!doc.url) return null;
  const caption = loc(doc.caption);
  const thumbUrl = doc.sizes?.thumb?.url;
  return {
    ...(doc.id !== undefined ? { id: doc.id } : {}),
    url: doc.url,
    width: doc.width ?? 1200,
    height: doc.height ?? 1200,
    alt: loc(doc.alt),
    ...(caption.th ? { caption } : {}),
    ...(thumbUrl ? { thumbUrl } : {}),
  };
}

/** ใช้เมื่อฟิลด์รูปเป็นฟิลด์บังคับ — ถ้าไม่มีรูปถือว่าข้อมูลผิดพลาด */
function requireMedia(value: unknown, context: string): Media {
  const media = mapMedia(value);
  if (!media) throw new Error(`ไม่พบรูปภาพของ ${context}`);
  return media;
}

export function mapCategory(value: unknown): Category | null {
  if (!value || typeof value !== "object") return null;
  const doc = value as { slug?: string; title?: LocaleMap; type?: string; description?: LocaleMap };
  if (!doc.slug) return null;
  const description = loc(doc.description);
  return {
    slug: doc.slug,
    title: loc(doc.title),
    type: doc.type === "article" ? "article" : "product",
    ...(description.th ? { description } : {}),
  };
}

export function mapArtisan(value: unknown): Artisan | null {
  if (!value || typeof value !== "object") return null;
  const doc = value as Record<string, unknown>;
  if (!doc.slug) return null;
  const source = loc(doc.source as LocaleMap);
  return {
    id: doc.id as string | number,
    slug: String(doc.slug),
    name: loc(doc.name as LocaleMap),
    title: loc(doc.title as LocaleMap),
    specialty: loc(doc.specialty as LocaleMap),
    bio: loc(doc.bio as LocaleMap),
    photo: mapMedia(doc.photo) ?? {
      url: "/placeholder/member-pimsiri.svg",
      width: 800,
      height: 800,
      alt: { th: "ไม่มีภาพ" },
    },
    ...(source.th ? { source } : {}),
  };
}

export function mapProduct(doc: Record<string, unknown>): Product {
  const category = mapCategory(doc.category);
  const artisan = mapArtisan(doc.artisan);
  if (!category) throw new Error(`สินค้า ${String(doc.slug)} ไม่มีหมวดหมู่`);
  if (!artisan) throw new Error(`สินค้า ${String(doc.slug)} ไม่มีผู้ผลิต`);

  // จำลำดับแถวไว้ก่อนตัดแถวที่ไม่มีรูป — ใช้ตอนแก้รูปจากหน้าเว็บ (ดู Product.galleryRows)
  const rows = ((doc.gallery as { image?: unknown }[] | undefined) ?? [])
    .map((row, index) => ({ media: mapMedia(row?.image), index }))
    .filter((row): row is { media: Media; index: number } => row.media !== null);
  const gallery = rows.map((row) => row.media);
  const galleryRows = rows.map((row) => row.index);

  const leadTime = loc(doc.leadTime as LocaleMap);
  const shelfLife = loc(doc.shelfLife as LocaleMap);

  return {
    id: (doc.id as string | number) ?? "",
    slug: String(doc.slug),
    sku: String(doc.sku),
    name: loc(doc.name as LocaleMap),
    category,
    artisan,
    price: typeof doc.price === "number" ? doc.price : null,
    status: (doc.availability as Product["status"]) ?? "in-stock",
    form: (doc.form as Product["form"]) ?? "other",
    netContent: loc(doc.netContent as LocaleMap),
    mainHerbs: locList(doc.mainHerbs),
    usage: locList(doc.usage),
    ...(shelfLife.th ? { shelfLife } : {}),
    externalUseOnly: Boolean(doc.externalUseOnly),
    registrationType: (doc.registrationType as Product["registrationType"]) ?? "none",
    ...(doc.registrationNo ? { registrationNo: String(doc.registrationNo) } : {}),
    excerpt: loc(doc.excerpt as LocaleMap),
    story: locList(doc.story),
    badges: locList(doc.badges),
    gallery,
    galleryRows,
    ...(leadTime.th ? { leadTime } : {}),
    careInstructions: locList(doc.careInstructions),
    featured: Boolean(doc.featured),
  };
}

type Block = Record<string, unknown> & { blockType?: string };

function mapBlock(block: Block): ContentBlock | null {
  switch (block.blockType) {
    case "heading":
      return {
        type: "heading",
        level: block.level === "3" ? 3 : 2,
        text: loc(block.text as LocaleMap),
      };
    case "paragraph":
      return { type: "paragraph", text: loc(block.text as LocaleMap) };
    case "list":
      return {
        type: "list",
        style: block.style === "number" ? "number" : "bullet",
        items: locList(block.items),
      };
    case "image": {
      const media = mapMedia(block.media);
      return media ? { type: "image", media } : null;
    }
    case "quote": {
      const attribution = loc(block.attribution as LocaleMap);
      return {
        type: "quote",
        text: loc(block.text as LocaleMap),
        ...(attribution.th ? { attribution } : {}),
      };
    }
    case "youtube":
      return {
        type: "youtube",
        videoId: String(block.videoId),
        title: loc(block.title as LocaleMap),
      };
    default:
      return null;
  }
}

export function mapArticle(doc: Record<string, unknown>): Article {
  const category = mapCategory(doc.category);
  if (!category) throw new Error(`บทความ ${String(doc.slug)} ไม่มีหมวดหมู่`);
  const artisan = mapArtisan(doc.artisan);

  return {
    id: (doc.id as string | number) ?? "",
    slug: String(doc.slug),
    title: loc(doc.title as LocaleMap),
    category,
    excerpt: loc(doc.excerpt as LocaleMap),
    coverImage: requireMedia(doc.coverImage, `บทความ ${String(doc.slug)}`),
    author: loc(doc.author as LocaleMap),
    ...(artisan ? { artisan } : {}),
    // Payload เก็บวันที่เป็น ISO เต็ม แต่หน้าเว็บใช้แค่ส่วนวันที่
    publishedAt: String(doc.publishedAt ?? "").slice(0, 10),
    content: ((doc.content as Block[] | undefined) ?? [])
      .map((block, index): ContentBlock | null => {
        const mapped = mapBlock(block);
        return mapped ? { ...mapped, sourceIndex: index } : null;
      })
      .filter((block): block is ContentBlock => block !== null),
    featured: Boolean(doc.featured),
  };
}

export function mapWorkshop(doc: Record<string, unknown>): Workshop {
  const takeaway = loc(doc.takeaway as LocaleMap);
  return {
    id: doc.id as string | number,
    slug: String(doc.slug),
    title: loc(doc.title as LocaleMap),
    summary: loc(doc.summary as LocaleMap),
    description: locList(doc.description),
    duration: loc(doc.duration as LocaleMap),
    pricePerPerson: typeof doc.pricePerPerson === "number" ? doc.pricePerPerson : null,
    minParticipants: Number(doc.minParticipants ?? 1),
    maxParticipants: Number(doc.maxParticipants ?? 20),
    bookingNotes: locList(doc.bookingNotes),
    image: requireMedia(doc.image, `ฐานเรียนรู้ ${String(doc.slug)}`),
    ...(takeaway.th ? { takeaway } : {}),
  };
}

export function mapPlace(doc: Record<string, unknown>): PlaceOfInterest {
  const openingHours = loc(doc.openingHours as LocaleMap);
  return {
    id: doc.id as string | number,
    slug: String(doc.slug),
    name: loc(doc.name as LocaleMap),
    kind: (doc.kind as PlaceOfInterest["kind"]) ?? "landmark",
    description: loc(doc.description as LocaleMap),
    ...(openingHours.th ? { openingHours } : {}),
    image: requireMedia(doc.image, `จุดเช็กอิน ${String(doc.slug)}`),
  };
}

import { deny, messageOf, requireEditor } from "@/lib/cms/inline-request";

/**
 * คลังรูปสำหรับตัวเลือกรูปบนหน้าเว็บ (โหมดแก้ไข)
 *
 *   GET  ?page=1&q=คำค้น   รายการรูปที่ใช้บนเว็บได้ (ไม่รวมรูปที่ยังไม่ได้ขออนุญาต)
 *   POST multipart          อัปโหลดรูปใหม่ พร้อมคำบรรยายภาพ เจ้าของภาพ และสิทธิ์การใช้งาน
 *
 * ทั้งสองทางต้องเป็นผู้ดูแลที่แก้เนื้อหาได้ (ตรวจเหมือน /api/inline-edit)
 * และผ่าน Local API ด้วยสิทธิ์ของผู้ใช้คนนั้น ไม่ข้ามการตรวจสิทธิ์ของ Payload
 *
 * การอัปโหลดตรงนี้เข้มกว่าหลังบ้านโดยตั้งใจ: รับเฉพาะรูปถ่ายชนิดที่เบราว์เซอร์แสดงได้
 * ไม่รับ SVG (ฝังสคริปต์ได้) และตรวจชนิดไฟล์จากเนื้อไฟล์จริง ไม่เชื่อนามสกุลหรือชนิดที่เบราว์เซอร์บอก
 */

const LOCALE = "th" as const;
const PAGE_SIZE = 24;

/** ใหญ่กว่านี้ให้ย่อก่อน — รูปจากกล้องมือถือปกติไม่เกิน 5–6 MB */
const MAX_FILE_BYTES = 8 * 1024 * 1024;

type MediaDoc = {
  id: number | string;
  url?: string | null;
  filename?: string | null;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
  sizes?: { thumb?: { url?: string | null } | null } | null;
};

function summarise(doc: MediaDoc) {
  return {
    id: doc.id,
    url: doc.url ?? "",
    thumbUrl: doc.sizes?.thumb?.url ?? doc.url ?? "",
    alt: doc.alt ?? "",
    filename: doc.filename ?? "",
    width: doc.width ?? null,
    height: doc.height ?? null,
  };
}

/* ------------------------------------------------------------------
   รายการรูป
   ------------------------------------------------------------------ */

export async function GET(request: Request) {
  const auth = await requireEditor(request);
  if (auth instanceof Response) return auth;
  const { cms, user } = auth;

  const params = new URL(request.url).searchParams;
  const page = Math.min(Math.max(Number.parseInt(params.get("page") ?? "1", 10) || 1, 1), 500);
  const query = (params.get("q") ?? "").trim().slice(0, 80);

  const allowed = { usageRights: { not_equals: "pending" } };
  const where = query
    ? {
        and: [
          allowed,
          { or: [{ alt: { like: query } }, { filename: { like: query } }, { credit: { like: query } }] },
        ],
      }
    : allowed;

  const result = await cms.find({
    collection: "media",
    where: where as never,
    sort: "-createdAt",
    limit: PAGE_SIZE,
    page,
    depth: 0,
    locale: LOCALE,
    user,
    overrideAccess: false,
  });

  return Response.json({
    ok: true,
    docs: (result.docs as unknown as MediaDoc[]).map(summarise),
    page: result.page ?? page,
    hasNextPage: result.hasNextPage,
  });
}

/* ------------------------------------------------------------------
   อัปโหลด
   ------------------------------------------------------------------ */

const KINDS = [
  { mime: "image/jpeg", ext: "jpg", test: (b: Buffer) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: "image/png",
    ext: "png",
    test: (b: Buffer) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  {
    mime: "image/webp",
    ext: "webp",
    test: (b: Buffer) => b.toString("latin1", 0, 4) === "RIFF" && b.toString("latin1", 8, 12) === "WEBP",
  },
  {
    mime: "image/avif",
    ext: "avif",
    test: (b: Buffer) => b.toString("latin1", 4, 8) === "ftyp" && /^avi[fs]$/.test(b.toString("latin1", 8, 12)),
  },
];

/** ข้อความสั้นหนึ่งบรรทัด — ตัดอักขระควบคุมและช่องว่างซ้อน */
function line(raw: FormDataEntryValue | null, max: number): string | null {
  if (typeof raw !== "string") return null;
  const text = raw.replace(/\p{Cc}/gu, " ").replace(/\s+/g, " ").trim();
  return text && text.length <= max ? text : null;
}

/** ชื่อไฟล์ที่ปลอดภัย — เก็บตัวอักษรไทย/อังกฤษ/ตัวเลข ส่วนนามสกุลใช้ตามชนิดไฟล์จริง */
function safeName(original: string, ext: string): string {
  const base = original
    .replace(/\.[^.]*$/, "")
    .normalize("NFC")
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "image"}.${ext}`;
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
    return deny("รูปแบบคำขอไม่ถูกต้อง", 415);
  }
  // กันก่อนอ่านเนื้อคำขอ — ไม่ต้องรับไฟล์ใหญ่ทั้งก้อนเข้าหน่วยความจำก่อนค่อยปฏิเสธ
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_FILE_BYTES + 64 * 1024) return deny("ไฟล์ใหญ่เกิน 8 MB ย่อรูปก่อนแล้วลองใหม่", 413);

  const auth = await requireEditor(request);
  if (auth instanceof Response) return auth;
  const { cms, user } = auth;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return deny("อ่านไฟล์ที่ส่งมาไม่ได้", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return deny("ยังไม่ได้เลือกไฟล์รูป", 400);
  if (file.size > MAX_FILE_BYTES) return deny("ไฟล์ใหญ่เกิน 8 MB ย่อรูปก่อนแล้วลองใหม่", 413);

  const alt = line(form.get("alt"), 300);
  if (!alt) return deny("กรอกคำบรรยายภาพ (ไม่เกิน 300 ตัวอักษร)", 400);
  const credit = line(form.get("credit"), 200);
  if (!credit) return deny("กรอกเจ้าของภาพหรือแหล่งที่มา (ไม่เกิน 200 ตัวอักษร)", 400);
  const usageRights = form.get("usageRights");
  if (usageRights !== "own" && usageRights !== "licensed") {
    return deny("เลือกสิทธิ์การใช้งาน — รูปที่ยังไม่ได้ขออนุญาตอัปโหลดขึ้นเว็บไม่ได้", 400);
  }

  const data = Buffer.from(await file.arrayBuffer());
  const kind = KINDS.find((candidate) => candidate.test(data));
  if (!kind) return deny("รองรับเฉพาะรูป JPG, PNG, WebP และ AVIF", 415);

  try {
    const doc = (await cms.create({
      collection: "media",
      data: { alt, credit, usageRights } as never,
      file: { data, mimetype: kind.mime, name: safeName(file.name, kind.ext), size: data.length },
      locale: LOCALE,
      user,
      overrideAccess: false,
    })) as unknown as MediaDoc;
    return Response.json({ ok: true, media: summarise(doc) });
  } catch (error) {
    return deny(messageOf(error), 422);
  }
}

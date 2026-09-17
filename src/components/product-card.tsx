import Image from "next/image";
import Link from "next/link";
import { productStatusLabels } from "@/lib/product-labels";
import type { Product } from "@/content/types";
import { formatPrice } from "@/lib/format";
import { DEFAULT_LABELS, type Labels } from "@/lib/labels";
import { t } from "@/lib/i18n";
import { INK, type Tone } from "@/lib/tone";
import { EditButton } from "./edit-mode";
import { InlineImageEdit } from "./inline-image";
import { QuickOrderButton } from "./line-order-button";
import { Badge } from "./ui";

const STATUS_TONE = {
  "in-stock": "bg-leaf-600",
  "made-to-order": "bg-ochre-600",
  "sold-out": "bg-ink-500",
} as const;

export function ProductCard({
  product,
  showQuickOrder = false,
  priority = false,
  editHref,
  labels = DEFAULT_LABELS.general,
  tone = "dark",
}: {
  product: Product;
  showQuickOrder?: boolean;
  priority?: boolean;
  /**
   * ส่งมาเฉพาะตอนอยู่ในโหมดแก้ไข เพื่อไม่ให้ลิงก์หลังบ้านหลุดไปหาผู้เข้าชมทั่วไป
   * ใช้เป็นสัญญาณเปิดปุ่มเปลี่ยนรูปหลักด้วย
   */
  editHref?: string;
  /**
   * ป้ายกำกับจากหลังบ้าน — รับเป็น prop ไม่ใช่เรียก hook เอง
   * เพราะการ์ดนี้ถูกใช้ทั้งจากหน้าเซิร์ฟเวอร์และจากตัวกรองฝั่งไคลเอนต์
   * ถ้าใช้ hook จะต้องประกาศเป็น client component ทั้งไฟล์โดยไม่จำเป็น
   */
  labels?: Labels["general"];
  /** โทนตัวอักษรบนการ์ด — "light" เมื่อการ์ดเป็นสีเข้ม (ดู skin.cardTone) */
  tone?: Tone;
}) {
  const ink = INK[tone];
  const category = product.category;
  const [cover, hoverImage] = product.gallery;
  const badge = t(product.badges)[0];

  return (
    <article
      className={`box group relative flex flex-col overflow-hidden rounded-card border transition duration-300 ease-craft hover:-translate-y-1 hover:shadow-lift ${
        tone === "light" ? "border-white/10 bg-white/[0.04] hover:border-white/25" : "border-rice-300 bg-rice-50 hover:border-rice-400"
      }`}
    >
      {editHref ? <EditButton href={editHref} label="แก้สินค้านี้" /> : null}

      <div className="relative aspect-square overflow-hidden bg-ink-800">
        <Image
          src={cover.url}
          alt={t(cover.alt)}
          width={cover.width}
          height={cover.height}
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="h-full w-full object-cover transition duration-500 ease-craft group-hover:scale-[1.04]"
        />
        {/* สลับเป็นรูปที่สองเมื่อเอาเมาส์ชี้ — ช่วยให้เห็นอีกมุมโดยไม่ต้องกดเข้าไป */}
        {hoverImage ? (
          <Image
            src={hoverImage.url}
            alt=""
            aria-hidden
            width={hoverImage.width}
            height={hoverImage.height}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-craft group-hover:opacity-100 motion-reduce:hidden"
          />
        ) : null}

        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-2xs font-semibold text-white ${
            STATUS_TONE[product.status]
          }`}
        >
          {t(productStatusLabels[product.status])}
        </span>

        {editHref ? (
          <InlineImageEdit
            at={`c:products:${product.id}:gallery.${product.galleryRows?.[0] ?? 0}.image`}
            label="รูปหลักของสินค้า"
            current={cover.id}
          />
        ) : null}
      </div>

      <div className="@container flex flex-1 flex-col gap-3 p-4">
        {category ? (
          <p className={`text-2xs font-semibold tracking-wide ${ink.body}`}>{t(category.title)}</p>
        ) : null}

        <h3 className={`font-serif text-base leading-snug font-semibold ${ink.title}`}>
          {/* ลิงก์ครอบทั้งการ์ดด้วย ::after เพื่อให้กดตรงไหนก็เข้าหน้าสินค้าได้ */}
          <Link href={`/shop/${product.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {t(product.name)}
          </Link>
        </h3>

        {badge ? (
          <div className="flex flex-wrap gap-1.5">
            <Badge tone={tone === "light" ? "dark" : "ember"}>{badge}</Badge>
          </div>
        ) : null}

        {/*
          วัดจากความกว้างการ์ด ไม่ใช่จอ — การ์ดสองคอลัมน์บนมือถือแคบเกินจะวางราคาคู่ปุ่มสั่งซื้อ
          จึงเรียงซ้อนกันและให้ปุ่มเต็มความกว้างแทน
        */}
        <div className="mt-auto flex flex-col gap-2 pt-2 @[12rem]:flex-row @[12rem]:items-end @[12rem]:justify-between @[12rem]:gap-3">
          <p className={`font-serif text-lg font-semibold ${ink.title}`}>
            {product.price === null ? (
              <span className={`text-base ${ink.body}`}>{labels.askPrice}</span>
            ) : (
              formatPrice(product.price)
            )}
          </p>
          {showQuickOrder ? <QuickOrderButton product={product} tone={tone} /> : null}
        </div>
      </div>
    </article>
  );
}

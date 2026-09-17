import Image from "next/image";
import Link from "next/link";
import { productStatusLabels } from "@/lib/product-labels";
import type { Product } from "@/content/types";
import { formatPrice } from "@/lib/format";
import { DEFAULT_LABELS, type Labels } from "@/lib/labels";
import { t } from "@/lib/i18n";
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
}) {
  const category = product.category;
  const [cover, hoverImage] = product.gallery;
  const badge = t(product.badges)[0];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card border border-rice-300 bg-rice-50 transition duration-300 ease-craft hover:-translate-y-1 hover:border-rice-400 hover:shadow-lift">
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

      <div className="flex flex-1 flex-col gap-3 p-4">
        {category ? (
          <p className="text-2xs font-semibold tracking-wide text-river-500">{t(category.title)}</p>
        ) : null}

        <h3 className="font-serif text-base leading-snug font-semibold text-ink-800">
          {/* ลิงก์ครอบทั้งการ์ดด้วย ::after เพื่อให้กดตรงไหนก็เข้าหน้าสินค้าได้ */}
          <Link href={`/shop/${product.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {t(product.name)}
          </Link>
        </h3>

        {badge ? (
          <div className="flex flex-wrap gap-1.5">
            <Badge tone="ember">{badge}</Badge>
          </div>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <p className="font-serif text-lg font-semibold text-ink-800">
            {product.price === null ? (
              <span className="text-base text-river-500">{labels.askPrice}</span>
            ) : (
              formatPrice(product.price)
            )}
          </p>
          {showQuickOrder ? <QuickOrderButton product={product} /> : null}
        </div>
      </div>
    </article>
  );
}

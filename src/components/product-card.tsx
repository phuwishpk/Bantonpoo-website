import Image from "next/image";
import Link from "next/link";
import { getCategory } from "@/content/categories";
import { productStatusLabels } from "@/content/products";
import type { Product } from "@/content/types";
import { formatPrice } from "@/lib/format";
import { t } from "@/lib/i18n";
import { QuickOrderButton } from "./line-order-button";
import { Badge } from "./ui";

const STATUS_TONE = {
  "in-stock": "bg-emerald-600",
  "made-to-order": "bg-ember-500",
  "sold-out": "bg-steel-500",
} as const;

export function ProductCard({
  product,
  showQuickOrder = false,
  priority = false,
}: {
  product: Product;
  showQuickOrder?: boolean;
  priority?: boolean;
}) {
  const category = getCategory(product.categorySlug, "product");
  const [cover, hoverImage] = product.gallery;
  const badge = t(product.badges)[0];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card border border-rice-300 bg-rice-50 transition duration-300 ease-craft hover:-translate-y-1 hover:border-rice-400 hover:shadow-lift">
      <div className="relative aspect-square overflow-hidden bg-steel-800">
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
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold text-white ${
            STATUS_TONE[product.status]
          }`}
        >
          {t(productStatusLabels[product.status])}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {category ? (
          <p className="text-[0.6875rem] font-semibold tracking-wide text-forged-500">{t(category.title)}</p>
        ) : null}

        <h3 className="font-serif text-base leading-snug font-semibold text-steel-800">
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
          <p className="font-serif text-lg font-semibold text-steel-800">
            {product.price === null ? (
              <span className="text-base text-forged-500">สอบถามราคา</span>
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

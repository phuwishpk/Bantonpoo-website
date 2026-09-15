import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { SiteSettings } from "@/content/types";
import { loc, mapMedia } from "@/lib/cms/map";
import { COLUMN_CLASS, readBlockConfig, rowsOf, sectionSkin } from "@/lib/cms/page-content";
import {
  getArticles,
  getPlaces,
  getProducts,
  getWorkshops,
} from "@/lib/cms/queries";
import { atDoc } from "@/lib/cms/inline";
import type { Labels } from "@/lib/labels";
import { formatPrice } from "@/lib/format";
import { t } from "@/lib/i18n";
import { ArticleCard } from "./article-card";
import { CtaBand } from "./cta-band";
import { Ed } from "./editable";
import { CARD_ICONS, type CardIconName, LeafIcon } from "./icons";
import { ProductCard } from "./product-card";
import { SectionHeading } from "./section-heading";
import { ArrowLink, ButtonLink, Container } from "./ui";

/**
 * เรนเดอร์หน้าที่ผู้ดูแลสร้างเองจากบล็อกที่เลือกไว้
 *
 * แต่ละบล็อกกลายเป็น <section> หนึ่งก้อน และใช้ตัวแปลงสี/ตัวอักษรตัวเดียวกับ
 * หน้าประจำ (sectionSkin) ผลลัพธ์จึงเข้าชุดกับที่เหลือของเว็บเสมอ
 *
 * @param pageId id ของหน้า ใช้ผูกข้อความกับช่องกรอกในหลังบ้านเพื่อคลิกแก้บนหน้าเว็บ
 */
export async function PageBlocks({
  blocks,
  pageId,
  site,
  labels,
  editing,
}: {
  blocks: Record<string, unknown>[];
  pageId: string | number;
  site: SiteSettings;
  labels: Labels;
  editing: boolean;
}) {
  const at = atDoc("pages", pageId);

  return (
    <>
      {blocks.map((block, index) => (
        <PageBlock
          key={index}
          block={block}
          at={`layout.${index}`}
          make={at}
          site={site}
          labels={labels}
          editing={editing}
        />
      ))}
    </>
  );
}

type BlockProps = {
  block: Record<string, unknown>;
  /** เส้นทางของบล็อกนี้ในเอกสาร เช่น layout.2 */
  at: string;
  /** ตัวสร้างที่อยู่เต็มจากเส้นทางข้างต้น */
  make: (path: string) => string;
  site: SiteSettings;
  labels: Labels;
  editing: boolean;
};

async function PageBlock({ block, at, make, site, labels, editing }: BlockProps) {
  const config = readBlockConfig(block);
  const skin = sectionSkin(config);
  const columns = COLUMN_CLASS[config.columns];
  const tone = skin.onDark ? "light" : "dark";
  const style = skin.style as CSSProperties | undefined;

  const headingGroup = (block.heading ?? {}) as Record<string, unknown>;
  const sectionHeading = (
    <SectionHeading
      at={make(`${at}.heading`)}
      eyebrow={t(loc(headingGroup.eyebrow as never))}
      title={t(loc(headingGroup.title as never))}
      description={t(loc(headingGroup.description as never))}
      tone={tone}
    />
  );
  const hasHeading = Boolean(t(loc(headingGroup.title as never)));

  switch (block.blockType) {
    /* ---------------- เนื้อหาข้อความ ---------------- */
    case "prose": {
      const items = rowsOf(block, "content", (row) => row);
      return (
        <section className={`py-12 sm:py-16 ${skin.className}`} style={style}>
          <Container size="wide">
            <div className="prose-craft">
              {items.map((item, itemIndex) => {
                const path = make(`${at}.content.${itemIndex}`);
                if (item.blockType === "heading") {
                  return (
                    <Ed
                      key={itemIndex}
                      as={String(item.level) === "3" ? "h3" : "h2"}
                      at={`${path}.text`}
                      tone={tone}
                    >
                      {t(loc(item.text as never))}
                    </Ed>
                  );
                }
                if (item.blockType === "list") {
                  const entries = rowsOf(item, "items", (row) => String(row.value ?? ""));
                  const children = entries.map((entry, entryIndex) => (
                    <Ed
                      key={entryIndex}
                      as="li"
                      at={`${path}.items.${entryIndex}.value`}
                      multiline
                      tone={tone}
                    >
                      {entry}
                    </Ed>
                  ));
                  return String(item.style) === "number" ? (
                    <ol key={itemIndex}>{children}</ol>
                  ) : (
                    <ul key={itemIndex}>{children}</ul>
                  );
                }
                return (
                  <Ed key={itemIndex} as="p" at={`${path}.text`} multiline tone={tone}>
                    {t(loc(item.text as never))}
                  </Ed>
                );
              })}
            </div>
          </Container>
        </section>
      );
    }

    /* ---------------- ภาพคู่ข้อความ ---------------- */
    case "imageText": {
      const image = mapMedia(block.image);
      const button = (block.button ?? {}) as Record<string, unknown>;
      const buttonLabel = t(loc(button.label as never));
      const imageFirst = block.imagePosition !== "right";

      return (
        <section className={`py-12 sm:py-16 ${skin.className}`} style={style}>
          <Container size="wide">
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
              {image ? (
                <div
                  className={`relative overflow-hidden rounded-2xl bg-ink-800 ${
                    imageFirst ? "" : "lg:order-2"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={t(image.alt)}
                    width={image.width}
                    height={image.height}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}

              <div className="flex flex-col gap-5">
                <h2
                  className={`font-serif text-2xl leading-snug font-semibold sm:text-3xl ${
                    skin.onDark ? "text-rice-100" : "text-ink-800"
                  }`}
                >
                  <Ed at={make(`${at}.title`)} tone={tone}>
                    {t(loc(block.title as never))}
                  </Ed>
                </h2>
                <p className={`text-md leading-relaxed ${skin.onDark ? "text-ink-200" : "text-river-500"}`}>
                  <Ed at={make(`${at}.body`)} multiline tone={tone}>
                    {t(loc(block.body as never))}
                  </Ed>
                </p>
                {buttonLabel ? (
                  <div>
                    <ButtonLink href={String(button.href ?? "/")} variant={skin.onDark ? "onDark" : "primary"}>
                      <Ed at={make(`${at}.button.label`)} tone={tone}>
                        {buttonLabel}
                      </Ed>
                    </ButtonLink>
                  </div>
                ) : null}
              </div>
            </div>
          </Container>
        </section>
      );
    }

    /* ---------------- การ์ดหลายใบ ---------------- */
    case "cards": {
      const items = rowsOf(block, "items", (row) => row);
      return (
        <section className={`py-12 sm:py-16 ${skin.className}`} style={style}>
          <Container size="wide">
            {hasHeading ? sectionHeading : null}
            <div className={`grid gap-5 ${hasHeading ? "mt-8" : ""} ${columns ?? "md:grid-cols-3"}`}>
              {items.map((item, itemIndex) => {
                const name = String(item.icon ?? "leaf") as CardIconName;
                const Icon = CARD_ICONS[name] ?? LeafIcon;
                return (
                  <div
                    key={itemIndex}
                    className={`flex flex-col gap-4 rounded-card border p-6 transition duration-300 ease-craft ${
                      skin.onDark
                        ? "border-white/10 bg-white/[0.03] hover:border-leaf-500/50"
                        : "border-rice-300 bg-rice-50 hover:border-leaf-200 hover:shadow-lift"
                    }`}
                  >
                    {item.icon !== "none" ? (
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-leaf-50 text-leaf-600">
                        <Icon className="h-6 w-6" />
                      </span>
                    ) : null}
                    <h3
                      className={`font-serif text-lg font-semibold ${
                        skin.onDark ? "text-rice-100" : "text-ink-800"
                      }`}
                    >
                      <Ed at={make(`${at}.items.${itemIndex}.title`)} tone={tone}>
                        {t(loc(item.title as never))}
                      </Ed>
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${
                        skin.onDark ? "text-ink-300" : "text-river-500"
                      }`}
                    >
                      <Ed at={make(`${at}.items.${itemIndex}.body`)} multiline tone={tone}>
                        {t(loc(item.body as never))}
                      </Ed>
                    </p>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>
      );
    }

    /* ---------------- ตัวเลขสำคัญ ---------------- */
    case "stats": {
      const items = rowsOf(block, "items", (row) => row);
      return (
        <section className={`py-12 sm:py-16 ${skin.className}`} style={style}>
          <Container size="wide">
            {hasHeading ? sectionHeading : null}
            <dl
              className={`grid gap-6 ${hasHeading ? "mt-8" : ""} ${
                columns ?? "grid-cols-2 lg:grid-cols-4"
              }`}
            >
              {items.map((item, itemIndex) => (
                <div key={itemIndex}>
                  <dt className="font-serif text-2xl font-bold text-leaf-600">
                    <Ed at={make(`${at}.items.${itemIndex}.value`)} tone={tone}>
                      {t(loc(item.value as never))}
                    </Ed>
                  </dt>
                  <dd
                    className={`mt-1 text-xs leading-relaxed ${
                      skin.onDark ? "text-ink-300" : "text-river-500"
                    }`}
                  >
                    <Ed at={make(`${at}.items.${itemIndex}.label`)} tone={tone}>
                      {t(loc(item.label as never))}
                    </Ed>
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>
      );
    }

    /* ---------------- แกลเลอรีภาพ ---------------- */
    case "gallery": {
      const images = rowsOf(block, "images", (row) => mapMedia(row.image)).filter(
        (image): image is NonNullable<typeof image> => image !== null
      );
      return (
        <section className={`py-12 sm:py-16 ${skin.className}`} style={style}>
          <Container size="wide">
            {hasHeading ? sectionHeading : null}
            <div className={`grid gap-4 ${hasHeading ? "mt-8" : ""} ${columns ?? "sm:grid-cols-3"}`}>
              {images.map((image, imageIndex) => (
                <figure key={imageIndex} className="overflow-hidden rounded-card bg-ink-800">
                  <div className="relative aspect-4/3">
                    <Image
                      src={image.url}
                      alt={t(image.alt)}
                      width={image.width}
                      height={image.height}
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {t(image.caption ?? { th: "" }) ? (
                    <figcaption
                      className={`px-4 py-3 text-xs leading-relaxed ${
                        skin.onDark ? "text-ink-300" : "text-river-500"
                      }`}
                    >
                      {t(image.caption ?? { th: "" })}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          </Container>
        </section>
      );
    }

    /* ---------------- ดึงเนื้อหาจากคลัง ---------------- */
    case "collection":
      return (
        <section className={`py-12 sm:py-16 ${skin.className}`} style={style}>
          <Container size="wide">
            {hasHeading ? sectionHeading : null}
            <div className={`${hasHeading ? "mt-8" : ""}`}>
              <CollectionItems
                source={String(block.source ?? "products")}
                limit={typeof block.limit === "number" ? block.limit : undefined}
                columns={columns}
                labels={labels}
                tone={tone}
                editing={editing}
              />
            </div>
            <CollectionLink block={block} at={at} make={make} tone={tone} />
          </Container>
        </section>
      );

    /* ---------------- กล่องชวนติดต่อ ---------------- */
    case "cta":
      return (
        <CtaBand
          site={site}
          eyebrow={loc(block.eyebrow as never)}
          title={loc(block.title as never)}
          body={loc(block.body as never)}
          at={make(at)}
          config={config}
          editing={editing}
        />
      );

    default:
      return null;
  }
}

/** ลิงก์ "ดูทั้งหมด" ใต้บล็อกดึงเนื้อหา — แสดงเมื่อกรอกข้อความไว้เท่านั้น */
function CollectionLink({
  block,
  at,
  make,
  tone,
}: Pick<BlockProps, "block" | "at" | "make"> & { tone: "dark" | "light" }) {
  const link = (block.link ?? {}) as Record<string, unknown>;
  const label = t(loc(link.label as never));
  if (!label) return null;

  return (
    <div className="mt-8">
      <ArrowLink href={String(link.href ?? "/")} tone={tone}>
        <Ed at={make(`${at}.link.label`)} tone={tone}>
          {label}
        </Ed>
      </ArrowLink>
    </div>
  );
}

/** รายการที่ดึงมาจากคลังเนื้อหา — จัดหน้าแบบเดียวกับที่ใช้ในหน้าประจำ */
async function CollectionItems({
  source,
  limit,
  columns,
  labels,
  tone,
}: {
  source: string;
  limit?: number;
  columns?: string;
  labels: Labels;
  tone: "dark" | "light";
  editing: boolean;
}) {
  const take = <T,>(items: T[]) => items.slice(0, limit ?? items.length);

  if (source === "products") {
    const products = take(await getProducts());
    return (
      <div className={`grid gap-4 lg:gap-5 ${columns ?? "grid-cols-2 lg:grid-cols-4"}`}>
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} labels={labels.general} />
        ))}
      </div>
    );
  }

  if (source === "articles") {
    const articles = take(await getArticles());
    return (
      <div className={`grid gap-5 ${columns ?? "md:grid-cols-3"}`}>
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} labels={labels.article} />
        ))}
      </div>
    );
  }

  const items =
    source === "workshops"
      ? take(await getWorkshops()).map((workshop) => ({
          key: workshop.slug,
          href: "/tourism",
          image: workshop.image,
          title: t(workshop.title),
          body: t(workshop.summary),
          meta:
            workshop.pricePerPerson === null
              ? labels.general.askServicePrice
              : `${formatPrice(workshop.pricePerPerson)} ${labels.tourism.perPerson}`,
        }))
      : take(await getPlaces()).map((place) => ({
          key: place.slug,
          href: "/tourism",
          image: place.image,
          title: t(place.name),
          body: t(place.description),
          meta: place.openingHours ? t(place.openingHours) : "",
        }));

  return (
    <div className={`grid gap-5 ${columns ?? "md:grid-cols-3"}`}>
      {items.map((item) => (
        <article
          key={item.key}
          className={`group relative flex flex-col overflow-hidden rounded-card border transition duration-300 ease-craft hover:-translate-y-1 ${
            tone === "light"
              ? "border-white/10 bg-white/[0.03]"
              : "border-rice-300 bg-rice-50 hover:shadow-lift"
          }`}
        >
          <div className="relative aspect-3/2 overflow-hidden bg-ink-800">
            <Image
              src={item.image.url}
              alt={t(item.image.alt)}
              width={item.image.width}
              height={item.image.height}
              sizes="(max-width: 768px) 100vw, 33vw"
              className="h-full w-full object-cover transition duration-500 ease-craft group-hover:scale-[1.04]"
            />
          </div>
          <div className="flex flex-1 flex-col gap-3 p-5">
            <h3
              className={`font-serif text-lg leading-snug font-semibold ${
                tone === "light" ? "text-rice-100" : "text-ink-800"
              }`}
            >
              <Link href={item.href} className="after:absolute after:inset-0 after:content-['']">
                {item.title}
              </Link>
            </h3>
            <p className={`text-sm leading-relaxed ${tone === "light" ? "text-ink-300" : "text-river-500"}`}>
              {item.body}
            </p>
            {item.meta ? (
              <p className="mt-auto pt-2 text-sm font-semibold text-leaf-600">{item.meta}</p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

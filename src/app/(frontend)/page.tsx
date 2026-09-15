import Image from "next/image";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import {
  LeafIcon,
  LineIcon,
  MapPinIcon,
  MortarIcon,
  PhoneIcon,
  TempleIcon,
  UsersIcon,
} from "@/components/icons";
import { Ed } from "@/components/editable";
import { EditToolbar } from "@/components/edit-mode";
import { ProductCard } from "@/components/product-card";
import { ArrowLink, ButtonLink, buttonClass, Container, EyebrowLabel } from "@/components/ui";
import { SectionHeading } from "@/components/section-heading";
import {
  COLUMN_CLASS,
  hero,
  link,
  media,
  readSections,
  sectionSkin,
  rowsOf,
  section,
  stats,
  titleBody,
  typographyOf,
  typographySkin,
} from "@/lib/cms/page-content";
import {
  getArticle,
  getFeaturedProducts,
  getLatestArticles,
  getPageGlobal,
  getSite,
  getWorkshops,
} from "@/lib/cms/queries";
import { loc } from "@/lib/cms/map";
import { formatPrice } from "@/lib/format";
import { isDraftMode } from "@/lib/cms/draft";
import { adminDoc, editLinksFor } from "@/lib/cms/edit-links";
import { atGlobal } from "@/lib/cms/inline";
import { atLabel } from "@/lib/labels";
import { getLabels } from "@/lib/cms/labels";
import { t } from "@/lib/i18n";
import { telUrl } from "@/lib/line";

/** ลำดับมาตรฐาน ใช้เมื่อยังไม่ได้ตั้งค่าในหลังบ้าน */
const DEFAULT_SECTIONS = [
  "highlights",
  "featured-products",
  "spotlight",
  "workshops",
  "latest-articles",
  "cta",
];

/** ไอคอนที่เลือกได้ในหลังบ้าน — จำกัดไว้เพื่อให้เข้าชุดกับดีไซน์เสมอ */
const ICONS = {
  leaf: LeafIcon,
  temple: TempleIcon,
  mortar: MortarIcon,
  users: UsersIcon,
  "map-pin": MapPinIcon,
} as const;

/** ที่อยู่ของฟิลด์ในหน้านี้ ใช้ผูกข้อความบนหน้าเว็บกับช่องกรอกในหลังบ้าน */
const at = atGlobal("home-page");

export default async function HomePage() {
  const editing = await isDraftMode();
  const [page, site, featuredProducts, latestArticles, workshops, labels] = await Promise.all([
    getPageGlobal("home-page"),
    getSite(),
    getFeaturedProducts(4),
    getLatestArticles(3),
    getWorkshops(),
    getLabels(),
  ]);

  const heroContent = hero(page);
  const heroGroup = (page.hero ?? {}) as Record<string, unknown>;
  const heroImage = media(heroGroup, "image");
  const heroStats = stats(heroGroup, "stats");
  const titleLines = rowsOf(heroGroup, "titleLines", (row) => ({
    text: loc(row.text as never),
    accent: Boolean(row.accent),
  }));
  const primary = link(heroGroup, "primaryButton");
  const secondary = link(heroGroup, "secondaryButton");
  const heroSkin = typographySkin(typographyOf(page, "hero"));

  const highlights = rowsOf(page, "highlights", (row) => ({
    icon: (row.icon as keyof typeof ICONS) ?? "leaf",
    title: loc(row.title as never),
    body: loc(row.body as never),
  }));

  const visibleSections = readSections(page, DEFAULT_SECTIONS);

  const spotlightGroup = (page.spotlight ?? {}) as Record<string, unknown>;
  const spotlightSlug =
    spotlightGroup.article && typeof spotlightGroup.article === "object"
      ? String((spotlightGroup.article as { slug?: string }).slug ?? "")
      : "";
  const spotlight = spotlightSlug ? await getArticle(spotlightSlug) : null;
  const cta = titleBody(page, "cta");

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section
        className={`relative overflow-hidden bg-ink-800 ${heroSkin.className}`}
        style={heroSkin.style}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-1/4 h-[36rem] w-[36rem] rounded-full bg-leaf-500/20 blur-[120px]"
        />
        <Container size="wide">
          <div className="grid items-center gap-10 py-14 lg:min-h-[85vh] lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
            <div className="flex flex-col gap-7">
              {t(heroContent.eyebrow) || editing ? (
                <EyebrowLabel tone="light">
                  <Ed at={at("hero.eyebrow")} tone="light" placeholder="ข้อความนำ">
                    {t(heroContent.eyebrow)}
                  </Ed>
                </EyebrowLabel>
              ) : null}

              {/*
                ภาษาไทยไม่มีช่องว่างระหว่างคำ เบราว์เซอร์จึงเดาจุดตัดบรรทัดเอง
                และตัดคำวิสามานยนามผิดตำแหน่งได้ จึงให้ผู้ดูแลกำหนดบรรทัดเองจากหลังบ้าน
              */}
              <h1 className="font-serif text-display-sm leading-[1.4] font-bold text-rice-100 sm:text-display-md lg:text-display-lg lg:leading-[1.35]">
                {titleLines.map((line, index) => (
                  <Ed
                    key={index}
                    as="span"
                    at={at(`hero.titleLines.${index}.text`)}
                    tone="light"
                    className={`block ${index > 0 ? "mt-2" : ""} ${line.accent ? "text-leaf-300" : ""}`}
                  >
                    {t(line.text)}
                  </Ed>
                ))}
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-ink-200 sm:text-lg">
                <Ed at={at("hero.subtitle")} multiline tone="light" placeholder="คำโปรย">
                  {t(loc(heroGroup.subtitle as never)) || t(site.aboutSummary)}
                </Ed>
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={primary.href} variant="primary" className="sm:w-auto">
                  <Ed at={at("hero.primaryButton.label")} tone="light">
                    {t(primary.label)}
                  </Ed>
                </ButtonLink>
                <ButtonLink href={secondary.href} variant="onDark" className="sm:w-auto">
                  <Ed at={at("hero.secondaryButton.label")} tone="light">
                    {t(secondary.label)}
                  </Ed>
                </ButtonLink>
              </div>

              {heroStats.length > 0 ? (
                <dl className="mt-2 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
                  {heroStats.map((stat, index) => (
                    <div key={index}>
                      <dt className="font-serif text-2xl font-semibold text-leaf-300">
                        <Ed at={at(`hero.stats.${index}.value`)} tone="light">
                          {t(stat.value)}
                        </Ed>
                      </dt>
                      <dd className="mt-1 text-xs leading-relaxed text-ink-300">
                        <Ed at={at(`hero.stats.${index}.label`)} tone="light">
                          {t(stat.label)}
                        </Ed>
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>

            {heroImage ? (
              <div className="relative">
                <div className="relative aspect-4/5 overflow-hidden rounded-2xl border border-white/10 shadow-lift-lg">
                  <Image
                    src={heroImage.url}
                    alt={t(heroImage.alt)}
                    width={heroImage.width}
                    height={heroImage.height}
                    priority
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="h-full w-full object-cover"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink-950/80 to-transparent"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 p-5 text-sm text-rice-100">
                    <Ed at={at("hero.imageCaption")} tone="light" placeholder="คำบรรยายใต้ภาพ">
                      {t(loc(heroGroup.imageCaption as never))}
                    </Ed>
                  </figcaption>
                </div>
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      {visibleSections.map((item, index) => {
        const skin = sectionSkin(item);
        const columns = COLUMN_CLASS[item.columns];
        const key = `${item.type}-${index}`;

        switch (item.type) {
          case "highlights":
            return highlights.length > 0 ? (
              <section key={key} className={`py-16 sm:py-20 ${skin.className}`} style={skin.style}>
                <Container size="wide">
                  <div className={`grid gap-5 ${columns ?? "md:grid-cols-3"}`}>
                    {highlights.map((highlight, cardIndex) => {
                      const Icon = ICONS[highlight.icon] ?? LeafIcon;
                      return (
                        <div
                          key={cardIndex}
                          className="flex flex-col gap-4 rounded-card border border-rice-300 bg-rice-50 p-6 transition duration-300 ease-craft hover:border-leaf-200 hover:shadow-lift"
                        >
                          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-leaf-50 text-leaf-600">
                            <Icon className="h-6 w-6" />
                          </span>
                          <h3 className="font-serif text-lg font-semibold text-ink-800">
                            <Ed at={at(`highlights.${cardIndex}.title`)}>{t(highlight.title)}</Ed>
                          </h3>
                          <p className="text-sm leading-relaxed text-river-500">
                            <Ed at={at(`highlights.${cardIndex}.body`)} multiline>
                              {t(highlight.body)}
                            </Ed>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </Container>
              </section>
            ) : null;

          case "featured-products":
            return (
              <section key={key} className={`py-12 sm:py-16 ${skin.className}`} style={skin.style}>
                <Container size="wide">
                  <SectionHeading
                    at={at("featuredSection")}
                    eyebrow={t(section(page, "featuredSection").eyebrow)}
                    title={t(section(page, "featuredSection").title)}
                    description={t(section(page, "featuredSection").description)}
                    tone={skin.onDark ? "light" : "dark"}
                    action={
                      <ArrowLink href="/shop" tone={skin.onDark ? "light" : "dark"}>
                        <Ed at={atLabel("general", "viewAllProducts")} tone={skin.onDark ? "light" : "dark"}>
                          {labels.general.viewAllProducts}
                        </Ed>
                      </ArrowLink>
                    }
                  />
                  <div className={`mt-8 grid gap-4 lg:gap-5 ${columns ?? "grid-cols-2 lg:grid-cols-4"}`}>
                    {featuredProducts.slice(0, item.limit ?? featuredProducts.length).map((product) => (
                      <ProductCard
                        key={product.slug}
                        product={product}
                        showQuickOrder
                        editHref={editing ? adminDoc("products", product.id) : undefined}
                        labels={labels.general}
                      />
                    ))}
                  </div>
                </Container>
              </section>
            );

          case "spotlight":
            return spotlight ? (
              <section key={key} className={`py-16 sm:py-20 ${skin.className}`} style={skin.style}>
                <Container size="wide">
                  <div className="overflow-hidden rounded-2xl bg-ink-800">
                    <div className="grid lg:grid-cols-2">
                      <div className="relative min-h-64 lg:min-h-full">
                        <Image
                          src={spotlight.coverImage.url}
                          alt={t(spotlight.coverImage.alt)}
                          width={spotlight.coverImage.width}
                          height={spotlight.coverImage.height}
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-center gap-5 p-8 sm:p-12">
                        <EyebrowLabel tone="light">
                          <Ed at={at("spotlight.eyebrow")} tone="light" placeholder="ข้อความนำ">
                            {t(loc(spotlightGroup.eyebrow as never))}
                          </Ed>
                        </EyebrowLabel>
                        <h2 className="font-serif text-2xl leading-snug font-semibold text-rice-100 sm:text-3xl">
                          {t(spotlight.title)}
                        </h2>
                        <p className="text-md leading-relaxed text-ink-200">
                          {t(spotlight.excerpt)}
                        </p>
                        {t(loc(spotlightGroup.quote as never)) || editing ? (
                          <blockquote className="border-l-2 border-leaf-500 pl-4 font-serif text-base leading-relaxed text-rice-100">
                            <Ed at={at("spotlight.quote")} multiline tone="light" placeholder="ข้อความอ้างอิง">
                              {t(loc(spotlightGroup.quote as never))}
                            </Ed>
                            <footer className="mt-2 font-sans text-xs text-ink-300">
                              —{" "}
                              <Ed at={at("spotlight.attribution")} tone="light" placeholder="ที่มาของข้อความ">
                                {t(loc(spotlightGroup.attribution as never))}
                              </Ed>
                            </footer>
                          </blockquote>
                        ) : null}
                        <div>
                          <ArrowLink href={`/stories/${spotlight.slug}`} tone="light">
                            <Ed at={atLabel("general", "readFullArticle")} tone="light">
                              {labels.general.readFullArticle}
                            </Ed>
                          </ArrowLink>
                        </div>
                      </div>
                    </div>
                  </div>
                </Container>
              </section>
            ) : null;

          case "workshops":
            return (
              <section key={key} className={`py-12 sm:py-16 ${skin.className}`} style={skin.style}>
                <Container size="wide">
                  <SectionHeading
                    at={at("experienceSection")}
                    eyebrow={t(section(page, "experienceSection").eyebrow)}
                    title={t(section(page, "experienceSection").title)}
                    description={t(section(page, "experienceSection").description)}
                    tone={skin.onDark ? "light" : "dark"}
                    action={
                      <ArrowLink href="/tourism" tone={skin.onDark ? "light" : "dark"}>
                        <Ed at={atLabel("general", "viewAllWorkshops")} tone={skin.onDark ? "light" : "dark"}>
                          {labels.general.viewAllWorkshops}
                        </Ed>
                      </ArrowLink>
                    }
                  />
                  <div className={`mt-8 grid gap-5 ${columns ?? "md:grid-cols-3"}`}>
                    {workshops.slice(0, item.limit ?? workshops.length).map((workshop) => (
                      <article
                        key={workshop.slug}
                        className="group relative flex flex-col overflow-hidden rounded-card border border-rice-300 bg-rice-50 transition duration-300 ease-craft hover:-translate-y-1 hover:shadow-lift"
                      >
                        <div className="relative aspect-3/2 overflow-hidden bg-ink-800">
                          <Image
                            src={workshop.image.url}
                            alt={t(workshop.image.alt)}
                            width={workshop.image.width}
                            height={workshop.image.height}
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="h-full w-full object-cover transition duration-500 ease-craft group-hover:scale-[1.04]"
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-3 p-5">
                          <h3 className="font-serif text-lg leading-snug font-semibold text-ink-800">
                            <Link href="/tourism" className="after:absolute after:inset-0 after:content-['']">
                              {t(workshop.title)}
                            </Link>
                          </h3>
                          <p className="text-sm leading-relaxed text-river-500">{t(workshop.summary)}</p>
                          <p className="mt-auto pt-2 text-sm font-semibold text-leaf-600">
                            {workshop.pricePerPerson === null
                              ? labels.general.askServicePrice
                              : `${formatPrice(workshop.pricePerPerson)} ${labels.tourism.perPerson}`}
                            <span className="ml-2 font-normal text-river-400">· {t(workshop.duration)}</span>
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </Container>
              </section>
            );

          case "latest-articles":
            return (
              <section key={key} className={`py-16 sm:py-20 ${skin.className}`} style={skin.style}>
                <Container size="wide">
                  <SectionHeading
                    at={at("storiesSection")}
                    eyebrow={t(section(page, "storiesSection").eyebrow)}
                    title={t(section(page, "storiesSection").title)}
                    tone={skin.onDark ? "light" : "dark"}
                    action={
                      <ArrowLink href="/stories" tone={skin.onDark ? "light" : "dark"}>
                        <Ed at={atLabel("general", "viewAllArticles")} tone={skin.onDark ? "light" : "dark"}>
                          {labels.general.viewAllArticles}
                        </Ed>
                      </ArrowLink>
                    }
                  />
                  <div className={`mt-8 grid gap-5 ${columns ?? "md:grid-cols-3"}`}>
                    {latestArticles.slice(0, item.limit ?? latestArticles.length).map((article) => (
                      <ArticleCard
                        key={article.slug}
                        article={article}
                        editHref={editing ? adminDoc("articles", article.id) : undefined}
                        labels={labels.article}
                      />
                    ))}
                  </div>
                </Container>
              </section>
            );

          case "cta":
            return (
              <section key={key} className={`pb-4 pt-8 ${skin.className}`} style={skin.style}>
                <Container size="wide">
                  <div className="relative overflow-hidden rounded-2xl bg-ink-800 px-6 py-12 text-center sm:px-12 sm:py-16">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-leaf-500/25 blur-[100px]"
                    />
                    <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
                      <EyebrowLabel tone="light">
                        <Ed at={at("cta.eyebrow")} tone="light" placeholder="ข้อความนำ">
                          {t(loc((page.cta as Record<string, unknown>)?.eyebrow as never))}
                        </Ed>
                      </EyebrowLabel>
                      <h2 className="font-serif text-2xl leading-snug font-semibold text-rice-100 sm:text-3xl">
                        <Ed at={at("cta.title")} tone="light">
                          {t(cta.title)}
                        </Ed>
                      </h2>
                      <p className="text-md leading-relaxed text-ink-200">
                        <Ed at={at("cta.body")} multiline tone="light" placeholder="เนื้อหา">
                          {t(cta.body)}
                        </Ed>
                      </p>
                      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        <a
                          href={site.lineUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={buttonClass("primary")}
                        >
                          <LineIcon />
                          แอดไลน์ {site.lineId}
                        </a>
                        <a href={telUrl(site)} className={buttonClass("onDark")}>
                          <PhoneIcon />
                          โทร {site.phoneDisplay}
                        </a>
                        <ButtonLink href="/contact" variant="onDark">
                          <MapPinIcon />
                          ดูแผนที่และการเดินทาง
                        </ButtonLink>
                      </div>
                    </div>
                  </div>
                </Container>
              </section>
            );

          default:
            return null;
        }
      })}

      {editing ? <EditToolbar {...editLinksFor("home")} /> : null}
    </>
  );
}

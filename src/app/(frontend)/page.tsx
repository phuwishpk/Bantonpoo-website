import Image from "next/image";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { LeafIcon, MapPinIcon, MortarIcon, TempleIcon, UsersIcon } from "@/components/icons";
import { CtaBand } from "@/components/cta-band";
import { Ed, EdImage, EdStyle } from "@/components/editable";
import { EditToolbar } from "@/components/edit-mode";
import { PageStyle, pageStyleTarget } from "@/components/page-style";
import { ProductCard } from "@/components/product-card";
import { ArrowLink, ButtonLink, Container, EyebrowLabel } from "@/components/ui";
import { SectionHeading } from "@/components/section-heading";
import {
  COLUMN_CLASS,
  hero,
  heroConfig,
  link,
  media,
  readPageStyle,
  readSections,
  sectionAt,
  sectionLabel,
  sectionSkin,
  rowsOf,
  section,
  stats,
  titleBody,
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
import { INK } from "@/lib/tone";

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
  const heroStyle = heroConfig(page);
  const heroSkin = sectionSkin(heroStyle);
  const heroTone = heroSkin.tone;
  const heroInk = INK[heroTone];
  const pageStyle = readPageStyle(page);

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
  const ctaGroup = (page.cta ?? {}) as Record<string, unknown>;

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <PageStyle style={pageStyle} />

      <section className={`overflow-hidden ${heroSkin.className}`} style={heroSkin.style}>
        <EdStyle
          at={at("hero")}
          label="แบนเนอร์บนสุด"
          config={heroStyle}
          cards={false}
          fallbackBackground="dark"
          placement="inside"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-1/4 h-[36rem] w-[36rem] rounded-full bg-leaf-500/20 blur-[120px]"
        />
        <Container size="wide">
          <div className="grid items-center gap-10 py-14 lg:min-h-[85vh] lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
            <div className="flex flex-col gap-7">
              {t(heroContent.eyebrow) || editing ? (
                <EyebrowLabel tone={heroTone === "light" ? "light" : "ember"}>
                  <Ed at={at("hero.eyebrow")} tone={heroTone} placeholder="ข้อความนำ">
                    {t(heroContent.eyebrow)}
                  </Ed>
                </EyebrowLabel>
              ) : null}

              {/*
                ภาษาไทยไม่มีช่องว่างระหว่างคำ เบราว์เซอร์จึงเดาจุดตัดบรรทัดเอง
                และตัดคำวิสามานยนามผิดตำแหน่งได้ จึงให้ผู้ดูแลกำหนดบรรทัดเองจากหลังบ้าน
              */}
              <h1
                className={`font-serif text-display-sm leading-[1.4] font-bold sm:text-display-md lg:text-display-lg lg:leading-[1.35] ${heroInk.title}`}
              >
                {titleLines.map((line, index) => (
                  <Ed
                    key={index}
                    as="span"
                    at={at(`hero.titleLines.${index}.text`)}
                    tone={heroTone}
                    className={`block ${index > 0 ? "mt-2" : ""} ${line.accent ? heroInk.accent : ""}`}
                  >
                    {t(line.text)}
                  </Ed>
                ))}
              </h1>

              <p
                className={`max-w-xl text-base leading-relaxed sm:text-lg ${
                  heroTone === "light" ? "text-ink-200" : "text-river-500"
                }`}
              >
                <Ed at={at("hero.subtitle")} multiline tone={heroTone} placeholder="คำโปรย">
                  {t(loc(heroGroup.subtitle as never)) || t(site.aboutSummary)}
                </Ed>
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={primary.href} variant="primary" className="sm:w-auto">
                  <Ed at={at("hero.primaryButton.label")} tone={heroTone}>
                    {t(primary.label)}
                  </Ed>
                </ButtonLink>
                <ButtonLink
                  href={secondary.href}
                  variant={heroTone === "light" ? "onDark" : "secondary"}
                  className="sm:w-auto"
                >
                  <Ed at={at("hero.secondaryButton.label")} tone={heroTone}>
                    {t(secondary.label)}
                  </Ed>
                </ButtonLink>
              </div>

              {heroStats.length > 0 ? (
                <dl className={`mt-2 grid max-w-lg grid-cols-3 gap-4 border-t pt-6 ${heroInk.line}`}>
                  {heroStats.map((stat, index) => (
                    <div key={index}>
                      <dt className={`font-serif text-2xl font-semibold ${heroInk.accent}`}>
                        <Ed at={at(`hero.stats.${index}.value`)} tone={heroTone}>
                          {t(stat.value)}
                        </Ed>
                      </dt>
                      <dd className={`mt-1 text-xs leading-relaxed ${heroInk.body}`}>
                        <Ed at={at(`hero.stats.${index}.label`)} tone={heroTone}>
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
                {/* แท็บเล็ตใช้ภาพแนวนอน — ภาพ 4:5 กว้างเต็มจอสูงเกือบ 900px */}
                <div className="relative aspect-4/5 overflow-hidden rounded-2xl border border-white/10 shadow-lift-lg sm:aspect-4/3 lg:aspect-4/5">
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
                  <EdImage at={at("hero.image")} label="ภาพหลัก" current={heroImage.id} removable />
                  {/* อยู่เหนือปุ่มเปลี่ยนรูป คำบรรยายจึงยังคลิกแก้ได้ในโหมดแก้ไข */}
                  <figcaption className="absolute inset-x-0 bottom-0 z-30 p-5 text-sm text-rice-100">
                    <Ed at={at("hero.imageCaption")} tone="light" placeholder="คำบรรยายใต้ภาพ">
                      {t(loc(heroGroup.imageCaption as never))}
                    </Ed>
                  </figcaption>
                </div>
              </div>
            ) : (
              <EdImage
                empty
                at={at("hero.image")}
                label="ภาพหลัก"
                hint="แนะนำภาพแนวตั้ง สัดส่วน 4:5"
                className="aspect-4/5 w-full sm:aspect-4/3 lg:aspect-4/5"
              />
            )}
          </div>
        </Container>
      </section>

      {visibleSections.map((item, index) => {
        const skin = sectionSkin(item);
        const tone = skin.tone;
        const columns = COLUMN_CLASS[item.columns];
        const key = `${item.type}-${index}`;
        const styleButton = (
          <EdStyle at={sectionAt(at, item)} label={sectionLabel(item.type)} config={item} />
        );

        switch (item.type) {
          case "highlights":
            return highlights.length > 0 ? (
              <section key={key} className={`py-16 sm:py-20 ${skin.className}`} style={skin.style}>
                {styleButton}
                <Container size="wide">
                  <div className={`grid gap-5 ${columns ?? "md:grid-cols-3"}`}>
                    {highlights.map((highlight, cardIndex) => {
                      const Icon = ICONS[highlight.icon] ?? LeafIcon;
                      const cardTone = skin.cardTone("dark");
                      const ink = INK[cardTone];
                      return (
                        <div
                          key={cardIndex}
                          className={`box flex flex-col gap-4 rounded-card border p-6 transition duration-300 ease-craft hover:shadow-lift ${ink.card}`}
                        >
                          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-leaf-50 text-leaf-600">
                            <Icon className="h-6 w-6" />
                          </span>
                          <h3 className={`font-serif text-lg font-semibold ${ink.title}`}>
                            <Ed at={at(`highlights.${cardIndex}.title`)} tone={cardTone}>
                              {t(highlight.title)}
                            </Ed>
                          </h3>
                          <p className={`text-sm leading-relaxed ${ink.body}`}>
                            <Ed at={at(`highlights.${cardIndex}.body`)} multiline tone={cardTone}>
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
                {styleButton}
                <Container size="wide">
                  <SectionHeading
                    at={at("featuredSection")}
                    eyebrow={t(section(page, "featuredSection").eyebrow)}
                    title={t(section(page, "featuredSection").title)}
                    description={t(section(page, "featuredSection").description)}
                    tone={tone}
                    action={
                      <ArrowLink href="/shop" tone={tone}>
                        <Ed at={atLabel("general", "viewAllProducts")} tone={tone}>
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
                        tone={skin.cardTone("dark")}
                      />
                    ))}
                  </div>
                </Container>
              </section>
            );

          case "spotlight": {
            // กล่องเรื่องเล่าเด่นเป็นพื้นเข้มโดยตั้งต้น — สีการ์ดสีอ่อนจะเปลี่ยนเป็นแบบพื้นอ่อน
            const boxTone = skin.cardTone("light");
            const ink = INK[boxTone];
            return spotlight ? (
              <section key={key} className={`py-16 sm:py-20 ${skin.className}`} style={skin.style}>
                {styleButton}
                <Container size="wide">
                  <div
                    className={`box overflow-hidden rounded-2xl ${
                      boxTone === "light" ? "border border-white/10 bg-ink-800" : "border border-rice-300 bg-rice-50"
                    }`}
                  >
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
                        <EdImage
                          at={`c:articles:${spotlight.id}:coverImage`}
                          label="ภาพหน้าปกบทความ"
                          current={spotlight.coverImage.id}
                        />
                      </div>
                      <div className="flex flex-col justify-center gap-5 p-8 sm:p-12">
                        <EyebrowLabel tone={boxTone === "light" ? "light" : "ember"}>
                          <Ed at={at("spotlight.eyebrow")} tone={boxTone} placeholder="ข้อความนำ">
                            {t(loc(spotlightGroup.eyebrow as never))}
                          </Ed>
                        </EyebrowLabel>
                        <h2 className={`font-serif text-2xl leading-snug font-semibold sm:text-3xl ${ink.title}`}>
                          {t(spotlight.title)}
                        </h2>
                        <p
                          className={`text-md leading-relaxed ${
                            boxTone === "light" ? "text-ink-200" : "text-river-500"
                          }`}
                        >
                          {t(spotlight.excerpt)}
                        </p>
                        {t(loc(spotlightGroup.quote as never)) || editing ? (
                          <blockquote
                            className={`border-l-2 border-leaf-500 pl-4 font-serif text-base leading-relaxed ${ink.title}`}
                          >
                            <Ed at={at("spotlight.quote")} multiline tone={boxTone} placeholder="ข้อความอ้างอิง">
                              {t(loc(spotlightGroup.quote as never))}
                            </Ed>
                            <footer className={`mt-2 font-sans text-xs ${ink.body}`}>
                              —{" "}
                              <Ed at={at("spotlight.attribution")} tone={boxTone} placeholder="ที่มาของข้อความ">
                                {t(loc(spotlightGroup.attribution as never))}
                              </Ed>
                            </footer>
                          </blockquote>
                        ) : null}
                        <div>
                          <ArrowLink href={`/stories/${spotlight.slug}`} tone={boxTone}>
                            <Ed at={atLabel("general", "readFullArticle")} tone={boxTone}>
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
          }

          case "workshops": {
            const cardTone = skin.cardTone("dark");
            const ink = INK[cardTone];
            return (
              <section key={key} className={`py-12 sm:py-16 ${skin.className}`} style={skin.style}>
                {styleButton}
                <Container size="wide">
                  <SectionHeading
                    at={at("experienceSection")}
                    eyebrow={t(section(page, "experienceSection").eyebrow)}
                    title={t(section(page, "experienceSection").title)}
                    description={t(section(page, "experienceSection").description)}
                    tone={tone}
                    action={
                      <ArrowLink href="/tourism" tone={tone}>
                        <Ed at={atLabel("general", "viewAllWorkshops")} tone={tone}>
                          {labels.general.viewAllWorkshops}
                        </Ed>
                      </ArrowLink>
                    }
                  />
                  <div className={`mt-8 grid gap-5 ${columns ?? "md:grid-cols-3"}`}>
                    {workshops.slice(0, item.limit ?? workshops.length).map((workshop) => (
                      <article
                        key={workshop.slug}
                        className={`box group relative flex flex-col overflow-hidden rounded-card border transition duration-300 ease-craft hover:-translate-y-1 hover:shadow-lift ${ink.card}`}
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
                          <EdImage
                            at={`c:workshops:${workshop.id}:image`}
                            label="ภาพกิจกรรม"
                            current={workshop.image.id}
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-3 p-5">
                          <h3 className={`font-serif text-lg leading-snug font-semibold ${ink.title}`}>
                            <Link href="/tourism" className="after:absolute after:inset-0 after:content-['']">
                              {t(workshop.title)}
                            </Link>
                          </h3>
                          <p className={`text-sm leading-relaxed ${ink.body}`}>{t(workshop.summary)}</p>
                          <p className={`mt-auto pt-2 text-sm font-semibold ${ink.accent}`}>
                            {workshop.pricePerPerson === null
                              ? labels.general.askServicePrice
                              : `${formatPrice(workshop.pricePerPerson)} ${labels.tourism.perPerson}`}
                            <span className={`ml-2 font-normal ${ink.muted}`}>· {t(workshop.duration)}</span>
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </Container>
              </section>
            );
          }

          case "latest-articles":
            return (
              <section key={key} className={`py-16 sm:py-20 ${skin.className}`} style={skin.style}>
                {styleButton}
                <Container size="wide">
                  <SectionHeading
                    at={at("storiesSection")}
                    eyebrow={t(section(page, "storiesSection").eyebrow)}
                    title={t(section(page, "storiesSection").title)}
                    tone={tone}
                    action={
                      <ArrowLink href="/stories" tone={tone}>
                        <Ed at={atLabel("general", "viewAllArticles")} tone={tone}>
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
                        tone={skin.cardTone("dark")}
                      />
                    ))}
                  </div>
                </Container>
              </section>
            );

          case "cta":
            return (
              <CtaBand
                key={key}
                site={site}
                eyebrow={loc(ctaGroup.eyebrow as never)}
                title={cta.title}
                body={cta.body}
                at={at("cta")}
                styleAt={sectionAt(at, item)}
                config={item}
                editing={editing}
              />
            );

          default:
            return null;
        }
      })}

      {editing ? (
        <EditToolbar {...editLinksFor("home")} styles={[pageStyleTarget(at("pageStyle"), pageStyle)]} />
      ) : null}
    </>
  );
}

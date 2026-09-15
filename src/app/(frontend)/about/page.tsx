import Image from "next/image";
import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { Ed } from "@/components/editable";
import { EditToolbar } from "@/components/edit-mode";
import { PageHero } from "@/components/page-hero";
import { ArrowLink, ButtonLink, Container, OrnamentDivider } from "@/components/ui";
import { SectionHeading } from "@/components/section-heading";
import { loc } from "@/lib/cms/map";
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
  textList,
  titleBody,
  typographyOf,
} from "@/lib/cms/page-content";
import { getArtisans, getPageGlobal, getSite } from "@/lib/cms/queries";
import { isDraftMode } from "@/lib/cms/draft";
import { editLinksFor } from "@/lib/cms/edit-links";
import { atDoc, atGlobal } from "@/lib/cms/inline";
import { atLabel } from "@/lib/labels";
import { getLabels } from "@/lib/cms/labels";
import { t } from "@/lib/i18n";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

/** ส่วนที่ใช้พื้นเข้มเป็นค่าเริ่มต้น จึงต้องใช้ตัวอักษรสีอ่อนเมื่อยังไม่ได้เลือกสีเอง */
const DARK_BY_DEFAULT = new Set(["assets"]);

const DEFAULT_SECTIONS = ["history", "assets", "artisans", "closing", "references"];

const CRUMBS = [
  { name: "หน้าแรก", path: "/" },
  { name: "เกี่ยวกับชุมชน", path: "/about" },
];

/** ที่อยู่ของฟิลด์ในหน้านี้ ใช้ผูกข้อความบนหน้าเว็บกับช่องกรอกในหลังบ้าน */
const at = atGlobal("about-page");

export async function generateMetadata(): Promise<Metadata> {
  const [site, page] = await Promise.all([getSite(), getPageGlobal("about-page")]);
  const content = hero(page);
  return buildMetadata({
    title: t(content.title) || "เกี่ยวกับชุมชน",
    description: t(content.description) || t(site.aboutSummary),
    path: "/about",
    siteName: t(site.communityName),
    image: media(page, "historyImage")?.url,
  });
}

export default async function AboutPage() {
  const editing = await isDraftMode();
  const [page, artisans, labels] = await Promise.all([
    getPageGlobal("about-page"),
    getArtisans(),
    getLabels(),
  ]);

  const content = hero(page);
  const heritageImage = media(page, "historyImage");
  const historyBlocks = rowsOf(page, "historyContent", (row) => ({
    type: String(row.blockType ?? "paragraph"),
    text: loc(row.text as never),
  }));
  const facts = stats(page, "facts");
  const historyLink = link(page, "historyLink");
  const assets = rowsOf(page, "assets", (row) => ({
    title: loc(row.title as never),
    body: loc(row.body as never),
  }));
  const closing = titleBody(page, "closing");
  const closingGroup = (page.closing ?? {}) as Record<string, unknown>;
  const closingImage = media(closingGroup, "image");
  const closingPrimary = link(closingGroup, "primaryButton");
  const closingSecondary = link(closingGroup, "secondaryButton");
  const references = t(textList(page, "references"));
  const visibleSections = readSections(page, DEFAULT_SECTIONS);

  return (
    <>
      <PageHero
        eyebrow={t(content.eyebrow)}
        title={t(content.title)}
        description={t(content.description)}
        crumbs={CRUMBS}
        at={at("hero")}
        typography={typographyOf(page, "hero")}
      />

      {visibleSections.map((item, index) => {
        const skin = sectionSkin(item, DARK_BY_DEFAULT.has(item.type));
        const columns = COLUMN_CLASS[item.columns];
        const key = `${item.type}-${index}`;

        switch (item.type) {
          case "history":
            return (
              <section key={key} className={`py-16 sm:py-20 ${skin.className}`} style={skin.style}>
                <Container size="wide">
                  <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
                    {heritageImage ? (
                      <div className="relative overflow-hidden rounded-2xl bg-ink-800 lg:sticky lg:top-24">
                        <Image
                          src={heritageImage.url}
                          alt={t(heritageImage.alt)}
                          width={heritageImage.width}
                          height={heritageImage.height}
                          priority
                          sizes="(max-width: 1024px) 100vw, 45vw"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : null}

                    <div className="flex flex-col gap-6">
                      <SectionHeading
                        at={at("historySection")}
                        eyebrow={t(section(page, "historySection").eyebrow)}
                        title={t(section(page, "historySection").title)}
                        tone={skin.onDark ? "light" : "dark"}
                      />
                      <div className="prose-craft">
                        {historyBlocks.map((block, blockIndex) => (
                          <Ed
                            key={blockIndex}
                            as={block.type === "heading" ? "h2" : "p"}
                            at={at(`historyContent.${blockIndex}.text`)}
                            multiline={block.type !== "heading"}
                          >
                            {t(block.text)}
                          </Ed>
                        ))}
                      </div>

                      {facts.length > 0 ? (
                        <dl className="grid grid-cols-2 gap-4 border-t border-rice-300 pt-6">
                          {facts.map((fact, factIndex) => (
                            <div key={factIndex}>
                              <dt className="font-serif text-xl font-bold text-leaf-600">
                                <Ed at={at(`facts.${factIndex}.value`)}>{t(fact.value)}</Ed>
                              </dt>
                              <dd className="mt-1 text-xs leading-relaxed text-river-500">
                                <Ed at={at(`facts.${factIndex}.label`)}>{t(fact.label)}</Ed>
                              </dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}

                      <div>
                        <ArrowLink href={historyLink.href}>
                          <Ed at={at("historyLink.label")}>{t(historyLink.label)}</Ed>
                        </ArrowLink>
                      </div>
                    </div>
                  </div>
                </Container>
              </section>
            );

          case "assets":
            return (
              <section key={key} className={`py-16 sm:py-20 ${skin.className || "bg-ink-800"}`} style={skin.style}>
                <Container size="wide">
                  <SectionHeading
                    at={at("assetsSection")}
                    eyebrow={t(section(page, "assetsSection").eyebrow)}
                    title={t(section(page, "assetsSection").title)}
                    description={t(section(page, "assetsSection").description)}
                    tone={skin.onDark ? "light" : "dark"}
                  />
                  <ol className={`mt-10 grid gap-4 ${columns ?? "sm:grid-cols-2 lg:grid-cols-3"}`}>
                    {assets.slice(0, item.limit ?? assets.length).map((asset, assetIndex) => (
                      <li
                        key={assetIndex}
                        className="flex flex-col gap-3 rounded-card border border-white/10 bg-white/[0.03] p-5 transition duration-300 ease-craft hover:border-leaf-500/50 hover:bg-white/[0.06]"
                      >
                        <span className="font-serif text-2xl font-bold text-leaf-300">
                          {String(assetIndex + 1).padStart(2, "0")}
                        </span>
                        <h3 className="font-serif text-base font-semibold text-rice-100">
                          <Ed at={at(`assets.${assetIndex}.title`)} tone={skin.onDark ? "light" : "dark"}>
                            {t(asset.title)}
                          </Ed>
                        </h3>
                        <p className="text-sm leading-relaxed text-ink-300">
                          <Ed
                            at={at(`assets.${assetIndex}.body`)}
                            multiline
                            tone={skin.onDark ? "light" : "dark"}
                          >
                            {t(asset.body)}
                          </Ed>
                        </p>
                      </li>
                    ))}
                  </ol>
                </Container>
              </section>
            );

          case "artisans":
            return (
              <section key={key} className={`py-16 sm:py-20 ${skin.className}`} style={skin.style}>
                <Container size="wide">
                  <SectionHeading
                    at={at("artisansSection")}
                    eyebrow={t(section(page, "artisansSection").eyebrow)}
                    title={t(section(page, "artisansSection").title)}
                    description={t(section(page, "artisansSection").description)}
                    tone={skin.onDark ? "light" : "dark"}
                  />
                  <div className={`mt-10 grid gap-5 ${columns ?? "sm:grid-cols-2 lg:max-w-3xl"}`}>
                    {artisans.slice(0, item.limit ?? artisans.length).map((artisan) => {
                      const atArtisan = atDoc("artisans", artisan.id);
                      return (
                      <article
                        key={artisan.slug}
                        className="flex flex-col overflow-hidden rounded-card border border-rice-300 bg-rice-50 transition duration-300 ease-craft hover:-translate-y-1 hover:shadow-lift"
                      >
                        <div className="relative aspect-square overflow-hidden bg-rice-300">
                          <Image
                            src={artisan.photo.url}
                            alt={t(artisan.photo.alt)}
                            width={artisan.photo.width}
                            height={artisan.photo.height}
                            sizes="(max-width: 640px) 100vw, 25vw"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-2.5 p-5">
                          <h3 className="font-serif text-base font-semibold text-ink-800">
                            <Ed at={atArtisan("name")}>{t(artisan.name)}</Ed>
                          </h3>
                          <p className="text-xs font-medium text-leaf-600">
                            <Ed at={atArtisan("title")}>{t(artisan.title)}</Ed>
                          </p>
                          <p className="text-sm leading-relaxed text-river-500">
                            <Ed at={atArtisan("bio")} multiline>
                              {t(artisan.bio)}
                            </Ed>
                          </p>
                          <div className="mt-auto flex flex-col gap-1 border-t border-rice-300 pt-3">
                            <p className="text-xs text-river-400">
                              <Ed at={atLabel("about", "role")}>{labels.about.role}</Ed>:{" "}
                              {t(artisan.specialty)}
                            </p>
                            {artisan.source ? (
                              <p className="text-2xs text-river-400">
                                <Ed at={atLabel("about", "source")}>{labels.about.source}</Ed>:{" "}
                                {t(artisan.source)}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </article>
                      );
                    })}
                  </div>
                </Container>
              </section>
            );

          case "closing":
            return (
              <section key={key} className={`pb-4 pt-8 ${skin.className}`} style={skin.style}>
                <Container size="wide">
                  <OrnamentDivider />
                  <div className="mt-12 grid items-center gap-8 overflow-hidden rounded-2xl border border-rice-300 bg-rice-50 lg:grid-cols-2">
                    {closingImage ? (
                      <div className="relative aspect-video lg:aspect-auto lg:h-full">
                        <Image
                          src={closingImage.url}
                          alt={t(closingImage.alt)}
                          width={closingImage.width}
                          height={closingImage.height}
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="flex flex-col gap-5 p-8 sm:p-10">
                      <h2 className="font-serif text-2xl leading-snug font-semibold text-ink-800">
                        <Ed at={at("closing.title")}>{t(closing.title)}</Ed>
                      </h2>
                      <p className="text-md leading-relaxed text-river-500">
                        <Ed at={at("closing.body")} multiline placeholder="เนื้อหา">
                          {t(closing.body)}
                        </Ed>
                      </p>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <ButtonLink href={closingPrimary.href}>
                          <Ed at={at("closing.primaryButton.label")}>{t(closingPrimary.label)}</Ed>
                        </ButtonLink>
                        <ButtonLink href={closingSecondary.href} variant="secondary">
                          <Ed at={at("closing.secondaryButton.label")}>{t(closingSecondary.label)}</Ed>
                        </ButtonLink>
                      </div>
                    </div>
                  </div>
                </Container>
              </section>
            );

          case "references":
            /* ระบุให้ชัดว่าข้อมูลประวัติและตัวเลขมาจากไหน */
            return references.length > 0 ? (
              <section key={key} className={`pt-16 ${skin.className}`} style={skin.style}>
                <Container size="wide">
                  <div className="rounded-card border border-rice-300 bg-rice-50 p-6">
                    <h2 className="mb-3 text-xs font-semibold tracking-label text-river-500">
                      <Ed at={atLabel("about", "references")}>{labels.about.references}</Ed>
                    </h2>
                    <ul className="flex flex-col gap-2 text-sm leading-relaxed text-river-500">
                      {references.map((reference, referenceIndex) => (
                        <Ed
                          key={referenceIndex}
                          as="li"
                          at={at(`references.${referenceIndex}.value`)}
                          multiline
                        >
                          {reference}
                        </Ed>
                      ))}
                    </ul>
                  </div>
                </Container>
              </section>
            ) : null;

          default:
            return null;
        }
      })}

      {editing ? <EditToolbar {...editLinksFor("about")} /> : null}

      <JsonLd data={breadcrumbJsonLd(CRUMBS)} />
    </>
  );
}

import Image from "next/image";
import type { Metadata } from "next";
import { ClockIcon, LineIcon, MapPinIcon, PhoneIcon, UsersIcon } from "@/components/icons";
import { CtaBand } from "@/components/cta-band";
import { JsonLd } from "@/components/json-ld";
import { WorkshopBookingButton } from "@/components/line-order-button";
import { directionsUrl, MapEmbed } from "@/components/map-embed";
import { EditToolbar } from "@/components/edit-mode";
import { PageHero } from "@/components/page-hero";
import { buttonClass, Container, OrnamentDivider, SectionHeading } from "@/components/ui";
import {
  COLUMN_CLASS,
  hero,
  readSections,
  sectionSkin,
  rowsOf,
  section,
  titleBody,
} from "@/lib/cms/page-content";
import { getPageGlobal, getPlaces, getSite, getWorkshops } from "@/lib/cms/queries";
import { loc } from "@/lib/cms/map";
import { formatPrice } from "@/lib/format";
import { isDraftMode } from "@/lib/cms/draft";
import { editLinksFor } from "@/lib/cms/edit-links";
import { t } from "@/lib/i18n";
import { telUrl } from "@/lib/line";
import { breadcrumbJsonLd, buildMetadata, workshopJsonLd } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [site, page] = await Promise.all([getSite(), getPageGlobal("tourism-page")]);
  const content = hero(page);
  return buildMetadata({
    title: t(content.title) || "การท่องเที่ยวและกิจกรรม",
    description: t(content.description) || t(site.aboutSummary),
    path: "/tourism",
    siteName: t(site.communityName),
  });
}

/** ส่วนที่ใช้พื้นเข้มเป็นค่าเริ่มต้น จึงต้องใช้ตัวอักษรสีอ่อนเมื่อยังไม่ได้เลือกสีเอง */
const DARK_BY_DEFAULT = new Set(["places"]);

const DEFAULT_SECTIONS = ["workshops", "places", "travel"];

const CRUMBS = [
  { name: "หน้าแรก", path: "/" },
  { name: "ท่องเที่ยวและกิจกรรม", path: "/tourism" },
];

const PLACE_KIND_LABELS = {
  "workshop-site": "ฐานเรียนรู้",
  homestay: "ที่พัก",
  landmark: "จุดเช็กอิน",
  shop: "ร้านค้า",
} as const;

export default async function TourismPage() {
  const editing = await isDraftMode();
  const [page, site, workshops, places] = await Promise.all([
    getPageGlobal("tourism-page"),
    getSite(),
    getWorkshops(),
    getPlaces(),
  ]);

  const content = hero(page);
  const travelOptions = rowsOf(page, "travelOptions", (row) => ({
    title: loc(row.title as never),
    body: loc(row.body as never),
  }));
  const notice = titleBody(page, "notice");
  const visibleSections = readSections(page, DEFAULT_SECTIONS);
  const cta = (page.cta ?? {}) as Record<string, unknown>;

  return (
    <>
      <PageHero
        eyebrow={t(content.eyebrow)}
        title={t(content.title)}
        description={t(content.description)}
        crumbs={CRUMBS}
      >
        <div className="flex flex-wrap gap-3 pt-2">
          <a href={site.lineUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("primary")}>
            <LineIcon />
            จองกิจกรรมผ่าน LINE
          </a>
          <a href={telUrl(site)} className={buttonClass("onDark")}>
            <PhoneIcon />
            โทรนัดหมาย {site.phoneDisplay}
          </a>
        </div>
      </PageHero>

      {visibleSections.map((item, index) => {
        const skin = sectionSkin(item, DARK_BY_DEFAULT.has(item.type));
        const columns = COLUMN_CLASS[item.columns];
        const key = `${item.type}-${index}`;

        switch (item.type) {
          case "workshops":
            return (
              <section key={key} className={`py-14 sm:py-20 ${skin.className}`} style={skin.style}>

        <Container size="wide">
          <SectionHeading
            eyebrow={t(section(page, "workshopsSection").eyebrow)}
            title={t(section(page, "workshopsSection").title)}
            description={t(section(page, "workshopsSection").description)}
          />

          <div className="mt-10 flex flex-col gap-8">
            {workshops.slice(0, item.limit ?? workshops.length).map((workshop, workshopIndex) => (
              <article
                key={workshop.slug}
                className="grid overflow-hidden rounded-2xl border border-rice-300 bg-rice-50 lg:grid-cols-[1fr_1.2fr]"
              >
                <div className={`relative aspect-3/2 lg:aspect-auto ${workshopIndex % 2 === 1 ? "lg:order-2" : ""}`}>
                  <Image
                    src={workshop.image.url}
                    alt={t(workshop.image.alt)}
                    width={workshop.image.width}
                    height={workshop.image.height}
                    priority={workshopIndex === 0}
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-col gap-5 p-6 sm:p-8">
                  <div className="flex flex-col gap-3">
                    <h3 className="font-serif text-xl leading-snug font-semibold text-ink-800 sm:text-2xl">
                      {t(workshop.title)}
                    </h3>
                    <p className="text-md leading-relaxed text-river-500">{t(workshop.summary)}</p>
                  </div>

                  <dl className="grid grid-cols-2 gap-4 border-y border-rice-300 py-4 sm:grid-cols-3">
                    <div className="flex flex-col gap-1">
                      <dt className="flex items-center gap-1.5 text-xs text-river-500">
                        <ClockIcon className="h-4 w-4" />
                        ระยะเวลา
                      </dt>
                      <dd className="text-sm font-semibold text-ink-800">{t(workshop.duration)}</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="flex items-center gap-1.5 text-xs text-river-500">
                        <UsersIcon className="h-4 w-4" />
                        จำนวนผู้เข้าร่วม
                      </dt>
                      <dd className="text-sm font-semibold text-ink-800">
                        {workshop.minParticipants}–{workshop.maxParticipants} คน / รอบ
                      </dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="text-xs text-river-500">ค่าบริการ</dt>
                      <dd className="font-serif text-lg font-bold text-leaf-600">
                        {workshop.pricePerPerson === null
                          ? "สอบถามราคา"
                          : `${formatPrice(workshop.pricePerPerson)} / คน`}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex flex-col gap-2 text-sm leading-relaxed text-ink-700">
                    {t(workshop.description).map((paragraph, paragraphIndex) => (
                      <p key={paragraphIndex}>{paragraph}</p>
                    ))}
                  </div>

                  {workshop.takeaway ? (
                    <p className="rounded-lg bg-leaf-50 px-4 py-3 text-sm text-leaf-700">
                      <span className="font-semibold">ได้กลับบ้าน:</span> {t(workshop.takeaway)}
                    </p>
                  ) : null}

                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-semibold tracking-label text-ink-700">เงื่อนไขการจอง</h4>
                    <ul className="flex flex-col gap-1.5">
                      {t(workshop.bookingNotes).map((note, noteIndex) => (
                        <li key={noteIndex} className="flex gap-2.5 text-sm leading-relaxed text-river-500">
                          <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-leaf-500" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-1">
                    <WorkshopBookingButton workshop={workshop} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
              </section>
            );

          case "places":
            return (
              <section key={key} className={`py-14 sm:py-20 ${skin.className || "bg-ink-800"}`} style={skin.style}>

        <Container size="wide">
          <SectionHeading
            eyebrow={t(section(page, "placesSection").eyebrow)}
            title={t(section(page, "placesSection").title)}
            description={t(section(page, "placesSection").description)}
            tone="light"
          />
          <div className={`mt-10 grid gap-5 ${columns ?? "sm:grid-cols-2 lg:grid-cols-4"}`}>
            {places.slice(0, item.limit ?? places.length).map((place) => (
              <article
                key={place.slug}
                className="flex flex-col overflow-hidden rounded-card border border-white/10 bg-white/[0.03] transition duration-300 ease-craft hover:border-leaf-500/50"
              >
                <div className="relative aspect-3/2">
                  <Image
                    src={place.image.url}
                    alt={t(place.image.alt)}
                    width={place.image.width}
                    height={place.image.height}
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-ink-950/80 px-2.5 py-1 text-2xs font-semibold text-leaf-300">
                    {PLACE_KIND_LABELS[place.kind]}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2.5 p-5">
                  <h3 className="font-serif text-base font-semibold text-rice-100">{t(place.name)}</h3>
                  <p className="text-sm leading-relaxed text-ink-300">{t(place.description)}</p>
                  {place.openingHours ? (
                    <p className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-ink-400">
                      <ClockIcon className="h-3.5 w-3.5" />
                      {t(place.openingHours)}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </Container>
              </section>
            );

          case "travel":
            return (
              <section key={key} className={`py-14 sm:py-20 ${skin.className}`} style={skin.style}>

        <Container size="wide">
          <SectionHeading
            eyebrow={t(section(page, "travelSection").eyebrow)}
            title={t(section(page, "travelSection").title)}
            description={t(site.address)}
          />

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
            <div className="overflow-hidden rounded-2xl border border-rice-300">
              <div className="aspect-4/3">
                <MapEmbed site={site} />
              </div>
              <a
                href={directionsUrl(site)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-rice-50 py-3.5 text-sm font-semibold text-ink-800 transition-colors hover:bg-rice-200"
              >
                <MapPinIcon className="h-[18px] w-[18px]" />
                เปิดนำทางด้วย Google Maps
              </a>
            </div>

            <div className="flex flex-col gap-4">
              {travelOptions.map((option) => (
                <div key={t(option.title)} className="rounded-card border border-rice-300 bg-rice-50 p-5">
                  <h3 className="mb-2 font-serif text-base font-semibold text-ink-800">{t(option.title)}</h3>
                  <p className="text-sm leading-relaxed text-river-500">{t(option.body)}</p>
                </div>
              ))}

              <div className="rounded-card border border-leaf-200 bg-leaf-50 p-5">
                <h3 className="mb-2 font-serif text-base font-semibold text-leaf-800">{t(notice.title)}</h3>
                <p className="text-sm leading-relaxed text-leaf-700">
                  {t(site.openingHours)} {t(notice.body)} (โทร {site.phoneDisplay} หรือไลน์ {site.lineId})
                </p>
              </div>
            </div>
          </div>

          <div className="mt-14">
            <OrnamentDivider />
          </div>
        </Container>
              </section>
            );

          case "cta":
            return (
              <CtaBand
                key={key}
                site={site}
                eyebrow={loc(cta.eyebrow as never)}
                title={loc(cta.title as never)}
                body={loc(cta.body as never)}
              />
            );

          default:
            return null;
        }
      })}

      {editing ? <EditToolbar {...editLinksFor("tourism")} /> : null}

      <JsonLd data={[...workshops.map((w) => workshopJsonLd(w, site)), breadcrumbJsonLd(CRUMBS)]} />
    </>
  );
}

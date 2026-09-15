import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { ClockIcon, FacebookIcon, LineIcon, MailIcon, MapPinIcon, PhoneIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { directionsUrl, MapEmbed } from "@/components/map-embed";
import { PageHero } from "@/components/page-hero";
import { EditToolbar } from "@/components/edit-mode";
import { Container, SectionHeading } from "@/components/ui";
import { loc } from "@/lib/cms/map";
import {
  COLUMN_CLASS,
  hero,
  readSections,
  sectionSkin,
  rowsOf,
  section,
  textList,
  titleBody,
} from "@/lib/cms/page-content";
import { getPageGlobal, getSite } from "@/lib/cms/queries";
import { isDraftMode } from "@/lib/cms/draft";
import { editLinksFor } from "@/lib/cms/edit-links";
import { t } from "@/lib/i18n";
import { telUrl } from "@/lib/line";
import { breadcrumbJsonLd, buildMetadata, localBusinessJsonLd } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [site, page] = await Promise.all([getSite(), getPageGlobal("contact-page")]);
  const content = hero(page);
  return buildMetadata({
    title: t(content.title) || "ติดต่อเรา",
    description: t(content.description) || t(site.address),
    path: "/contact",
    siteName: t(site.communityName),
  });
}

const DEFAULT_SECTIONS = ["channels", "form"];

const CRUMBS = [
  { name: "หน้าแรก", path: "/" },
  { name: "ติดต่อเรา", path: "/contact" },
];

/** ไอคอนและปลายทางของแต่ละช่องทาง ผูกกับโค้ดเพราะเป็นตรรกะ ไม่ใช่เนื้อหา */
const CHANNEL_META = {
  line: { icon: LineIcon, external: true },
  phone: { icon: PhoneIcon, external: false },
  facebook: { icon: FacebookIcon, external: true },
  email: { icon: MailIcon, external: false },
} as const;

type ChannelKey = keyof typeof CHANNEL_META;

export default async function ContactPage() {
  const editing = await isDraftMode();
  const [page, site] = await Promise.all([getPageGlobal("contact-page"), getSite()]);

  const content = hero(page);
  const formSuccess = titleBody(page, "formSuccess");
  const topics = t(textList(page, "formTopics"));
  const visibleSections = readSections(page, DEFAULT_SECTIONS);

  const channelValue: Record<ChannelKey, string> = {
    line: site.lineId,
    phone: site.phoneDisplay,
    facebook: t(site.communityName),
    email: site.email,
  };
  const channelHref: Record<ChannelKey, string> = {
    line: site.lineUrl,
    phone: telUrl(site),
    facebook: site.facebookUrl,
    email: `mailto:${site.email}`,
  };

  const channels = rowsOf(page, "channels", (row) => {
    const key = (row.channel as ChannelKey) ?? "line";
    return {
      key,
      label: loc(row.label as never),
      note: loc(row.note as never),
      highlight: Boolean(row.highlight),
      value: channelValue[key],
      href: channelHref[key],
      external: CHANNEL_META[key].external,
      icon: CHANNEL_META[key].icon,
    };
  });

  return (
    <>
      <PageHero
        eyebrow={t(content.eyebrow)}
        title={t(content.title)}
        description={t(content.description)}
        crumbs={CRUMBS}
      />

      {visibleSections.map((item, index) => {
        const skin = sectionSkin(item);
        const columns = COLUMN_CLASS[item.columns];
        const key = `${item.type}-${index}`;

        switch (item.type) {
          case "channels":
            return (
              <section key={key} className={`py-14 sm:py-16 ${skin.className}`} style={skin.style}>

        <Container size="wide">
          <div className={`grid gap-4 ${columns ?? "sm:grid-cols-2"}`}>
            {channels.map((channel) => {
              const Icon = channel.icon;
              return (
                <a
                  key={channel.key}
                  href={channel.href}
                  {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`group flex gap-4 rounded-card border p-5 transition duration-300 ease-craft hover:-translate-y-0.5 hover:shadow-lift ${
                    channel.highlight
                      ? "border-leaf-200 bg-leaf-50"
                      : "border-rice-300 bg-rice-50 hover:border-ink-400"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                      channel.highlight ? "bg-leaf-500 text-white" : "bg-ink-800 text-rice-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold tracking-label text-river-500">{t(channel.label)}</p>
                    <p className="font-serif text-lg font-semibold text-ink-800">{channel.value}</p>
                    <p className="mt-1 text-sm leading-relaxed text-river-500">{t(channel.note)}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </Container>
              </section>
            );

          case "form":
            return (
              <section key={key} className="pb-16 sm:pb-20">

        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            <div className="flex flex-col gap-7">
              <SectionHeading
                eyebrow={t(section(page, "formSection").eyebrow)}
                title={t(section(page, "formSection").title)}
                description={t(section(page, "formSection").description)}
              />
              <ContactForm
                topics={topics}
                success={{ title: t(formSuccess.title), body: t(formSuccess.body) }}
              />
            </div>

            <div className="flex flex-col gap-5">
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

              <div className="flex flex-col gap-4 rounded-card border border-rice-300 bg-rice-50 p-5">
                <div className="flex gap-3">
                  <MapPinIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-leaf-600" />
                  <div>
                    <p className="text-xs font-semibold tracking-label text-river-500">ที่ตั้ง</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-800">{t(site.address)}</p>
                    <p className="mt-1 text-xs text-river-400">
                      พิกัด {site.mapLatitude}, {site.mapLongitude}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 border-t border-rice-300 pt-4">
                  <ClockIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-leaf-600" />
                  <div>
                    <p className="text-xs font-semibold tracking-label text-river-500">เวลาทำการ</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-800">{t(site.openingHours)}</p>
                  </div>
                </div>
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

      {editing ? <EditToolbar {...editLinksFor("contact")} /> : null}

      <JsonLd data={[localBusinessJsonLd(site), breadcrumbJsonLd(CRUMBS)]} />
    </>
  );
}

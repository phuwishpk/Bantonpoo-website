import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { ClockIcon, FacebookIcon, LineIcon, MailIcon, MapPinIcon, PhoneIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { directionsUrl, MapEmbed } from "@/components/map-embed";
import { PageHero } from "@/components/page-hero";
import { Ed, EdStyle } from "@/components/editable";
import { EditToolbar } from "@/components/edit-mode";
import { PageStyle, pageStyleTarget } from "@/components/page-style";
import { Container } from "@/components/ui";
import { SectionHeading } from "@/components/section-heading";
import { loc } from "@/lib/cms/map";
import {
  COLUMN_CLASS,
  hero,
  heroConfig,
  readPageStyle,
  readSections,
  sectionAt,
  sectionLabel,
  sectionSkin,
  rowsOf,
  section,
  textList,
  titleBody,
} from "@/lib/cms/page-content";
import { getPageGlobal, getSite } from "@/lib/cms/queries";
import { isDraftMode } from "@/lib/cms/draft";
import { editLinksFor } from "@/lib/cms/edit-links";
import { atGlobal } from "@/lib/cms/inline";
import { atLabel } from "@/lib/labels";
import { getLabels } from "@/lib/cms/labels";
import { t } from "@/lib/i18n";
import { telUrl } from "@/lib/line";
import { INK } from "@/lib/tone";
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

/** ที่อยู่ของฟิลด์ในหน้านี้ ใช้ผูกข้อความบนหน้าเว็บกับช่องกรอกในหลังบ้าน */
const at = atGlobal("contact-page");

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

/** อีเมลไม่มีจุดตัดบรรทัด — เปิดให้ขึ้นบรรทัดใหม่หลัง @ แทนการแตกกลางชื่อโดเมนบนจอแคบ */
function breakableEmail(email: string) {
  const index = email.indexOf("@");
  if (index < 0) return email;
  return (
    <>
      {email.slice(0, index + 1)}
      <wbr />
      {email.slice(index + 1)}
    </>
  );
}

export default async function ContactPage() {
  const editing = await isDraftMode();
  const [page, site, labels] = await Promise.all([
    getPageGlobal("contact-page"),
    getSite(),
    getLabels(),
  ]);

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

  const pageStyle = readPageStyle(page);

  return (
    <>
      <PageStyle style={pageStyle} />
      <PageHero
        eyebrow={t(content.eyebrow)}
        title={t(content.title)}
        description={t(content.description)}
        crumbs={CRUMBS}
        at={at("hero")}
        config={heroConfig(page)}
      />

      {visibleSections.map((item, index) => {
        const skin = sectionSkin(item);
        const tone = skin.tone;
        const columns = COLUMN_CLASS[item.columns];
        const key = `${item.type}-${index}`;
        const styleButton = (
          <EdStyle at={sectionAt(at, item)} label={sectionLabel(item.type)} config={item} />
        );

        switch (item.type) {
          case "channels": {
            const cardTone = skin.cardTone("dark");
            const ink = INK[cardTone];
            return (
              <section key={key} className={`py-14 sm:py-16 ${skin.className}`} style={skin.style}>
                {styleButton}
                <Container size="wide">
                  <div className={`grid gap-4 ${columns ?? "sm:grid-cols-2"}`}>
                    {channels.map((channel, channelIndex) => {
                      const Icon = channel.icon;
                      // การ์ดที่เน้นใช้พื้นสีเน้นอ่อนเสมอ จึงใช้ตัวอักษรเข้มแม้การ์ดอื่นจะเป็นสีเข้ม
                      const channelTone = channel.highlight ? "dark" : cardTone;
                      const channelInk = channel.highlight ? INK.dark : ink;
                      return (
                        <a
                          key={channel.key}
                          href={channel.href}
                          {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          // min-w-0 ทั้งการ์ดและกล่องข้อความ — ค่าที่ตัดบรรทัดไม่ได้ (อีเมลยาว) จะได้ไม่ดันการ์ดล้นจอ 320px
                          className={`group flex min-w-0 gap-4 rounded-card border p-5 transition duration-300 ease-craft hover:-translate-y-0.5 hover:shadow-lift ${
                            channel.highlight ? "border-leaf-200 bg-leaf-50" : `box ${ink.card}`
                          }`}
                        >
                          <span
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                              channel.highlight
                                ? "bg-leaf-500 text-white"
                                : cardTone === "light"
                                  ? "bg-rice-100 text-ink-800"
                                  : "bg-ink-800 text-rice-100"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="flex min-w-0 flex-col gap-1">
                            <p className={`text-xs font-semibold tracking-label ${channelInk.body}`}>
                              <Ed at={at(`channels.${channelIndex}.label`)} tone={channelTone}>
                                {t(channel.label)}
                              </Ed>
                            </p>
                            <p className={`font-serif text-lg font-semibold ${channelInk.title}`}>
                              {channel.key === "email" ? breakableEmail(channel.value) : channel.value}
                            </p>
                            <p className={`mt-1 text-sm leading-relaxed ${channelInk.body}`}>
                              <Ed at={at(`channels.${channelIndex}.note`)} multiline tone={channelTone}>
                                {t(channel.note)}
                              </Ed>
                            </p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </Container>
              </section>
            );
          }

          case "form": {
            const cardTone = skin.cardTone("dark");
            const ink = INK[cardTone];
            return (
              <section key={key} className={`pb-16 sm:pb-20 ${skin.className}`} style={skin.style}>
                {styleButton}
                <Container size="wide">
                  <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
                    <div className="flex flex-col gap-7">
                      <SectionHeading
                        at={at("formSection")}
                        eyebrow={t(section(page, "formSection").eyebrow)}
                        title={t(section(page, "formSection").title)}
                        description={t(section(page, "formSection").description)}
                        tone={tone}
                      />
                      <ContactForm
                        topics={topics}
                        success={{ title: t(formSuccess.title), body: t(formSuccess.body) }}
                        tone={tone}
                      />
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className={`box overflow-hidden rounded-2xl border ${ink.card}`}>
                        <div className="aspect-4/3">
                          <MapEmbed site={site} />
                        </div>
                        <a
                          href={directionsUrl(site)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors ${ink.title} ${ink.hover}`}
                        >
                          <MapPinIcon className="h-[18px] w-[18px]" />
                          <Ed at={atLabel("general", "openInMaps")} tone={cardTone}>
                            {labels.general.openInMaps}
                          </Ed>
                        </a>
                      </div>

                      <div className={`box flex flex-col gap-4 rounded-card border p-5 ${ink.card}`}>
                        <div className="flex gap-3">
                          <MapPinIcon className={`mt-0.5 h-[18px] w-[18px] shrink-0 ${ink.accent}`} />
                          <div>
                            <p className={`text-xs font-semibold tracking-label ${ink.body}`}>
                              <Ed at={atLabel("contact", "location")} tone={cardTone}>
                                {labels.contact.location}
                              </Ed>
                            </p>
                            <p className={`mt-1 text-sm leading-relaxed ${ink.title}`}>{t(site.address)}</p>
                            <p className={`mt-1 text-xs ${ink.muted}`}>
                              <Ed at={atLabel("contact", "coordinates")} tone={cardTone}>
                                {labels.contact.coordinates}
                              </Ed>{" "}
                              {site.mapLatitude}, {site.mapLongitude}
                            </p>
                          </div>
                        </div>

                        <div className={`flex gap-3 border-t pt-4 ${ink.line}`}>
                          <ClockIcon className={`mt-0.5 h-[18px] w-[18px] shrink-0 ${ink.accent}`} />
                          <div>
                            <p className={`text-xs font-semibold tracking-label ${ink.body}`}>
                              <Ed at={atLabel("contact", "openingHours")} tone={cardTone}>
                                {labels.contact.openingHours}
                              </Ed>
                            </p>
                            <p className={`mt-1 text-sm leading-relaxed ${ink.title}`}>{t(site.openingHours)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Container>
              </section>
            );
          }

          default:
            return null;
        }
      })}

      {editing ? (
        <EditToolbar {...editLinksFor("contact")} styles={[pageStyleTarget(at("pageStyle"), pageStyle)]} />
      ) : null}

      <JsonLd data={[localBusinessJsonLd(site), breadcrumbJsonLd(CRUMBS)]} />
    </>
  );
}

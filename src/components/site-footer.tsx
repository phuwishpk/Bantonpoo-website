import Link from "next/link";
import type { NavData } from "@/lib/cms/navigation";
import type { SiteSettings } from "@/content/types";
import { atGlobal } from "@/lib/cms/inline";
import { atLabel, type Labels } from "@/lib/labels";
import { chromeSkin, readStyle, type StyleConfig } from "@/lib/cms/page-content";
import { t } from "@/lib/i18n";
import { telUrl } from "@/lib/line";
import { Ed, EdStyle } from "./editable";
import { FacebookIcon, LineIcon, MailIcon, MapPinIcon, PhoneIcon } from "./icons";
import { directionsUrl, MapEmbed } from "./map-embed";
import { SiteLogo } from "./site-logo";
import { Container } from "./ui";

const atNav = atGlobal("navigation");
const atSite = atGlobal("site-settings");

/** คลาสของส่วนท้ายตามโทนของพื้น — พื้นเข้มเป็นค่าเริ่มต้นของดีไซน์ */
const FOOTER_INK = {
  light: {
    text: "text-ink-200",
    body: "text-ink-300",
    icon: "text-ink-400",
    heading: "text-leaf-300",
    link: "text-ink-300 hover:text-white",
    social: "border-white/15 text-rice-100 hover:border-leaf-500 hover:text-leaf-300",
    line: "border-white/10",
    map: "bg-white/5 text-rice-100 hover:bg-white/10",
    fine: "text-ink-400",
  },
  dark: {
    text: "text-ink-700",
    body: "text-river-500",
    icon: "text-river-400",
    heading: "text-leaf-600",
    link: "text-river-500 hover:text-ink-900",
    social: "border-rice-300 text-ink-700 hover:border-leaf-500 hover:text-leaf-600",
    line: "border-rice-300",
    map: "bg-rice-50 text-ink-800 hover:bg-rice-200",
    fine: "text-river-400",
  },
} as const;

export function SiteFooter({
  site,
  nav,
  labels,
  editing = false,
  style = readStyle({}, "dark"),
}: {
  site: SiteSettings;
  nav: NavData;
  labels: Labels;
  /** ส่งต่อให้โลโก้ซึ่งใช้ได้ทั้งฝั่งเซิร์ฟเวอร์และไคลเอนต์ ส่วนที่เหลือใช้ <Ed> ตัดสินเอง */
  editing?: boolean;
  /** สีของส่วนท้าย จากหน้า "ธีมและหน้าตาเว็บ" */
  style?: StyleConfig;
}) {
  const skin = chromeSkin(style);
  const tone = skin.onDark ? "light" : "dark";
  const ink = FOOTER_INK[tone];

  return (
    <footer className={`relative mt-24 ${skin.className} ${ink.text}`} style={skin.style}>
      <EdStyle at="g:theme:footer" label="ส่วนท้ายเว็บ" config={style} cards={false} fallbackBackground="dark" />
      <Container size="wide" className="py-14">
        {/* แท็บเล็ต: ข้อมูลชุมชนเต็มแถว แล้ววางเมนูคู่ช่องทางติดต่อ แทนการเรียงยาวลงมาทีละคอลัมน์ */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.3fr]">
          <div className="flex flex-col gap-5 md:col-span-2 lg:col-span-1">
            <SiteLogo site={site} editing={editing} tone={tone} />
            <p className={`max-w-sm text-sm leading-relaxed ${ink.body}`}>
              <Ed at={atSite("aboutSummary")} multiline tone={tone}>
                {t(site.aboutSummary)}
              </Ed>
            </p>
            <div className="flex gap-2">
              <a
                href={site.lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-lg border p-2.5 transition-colors ${ink.social}`}
                aria-label={`LINE Official Account ${site.lineId}`}
              >
                <LineIcon />
              </a>
              <a
                href={site.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-lg border p-2.5 transition-colors ${ink.social}`}
                aria-label="Facebook Fanpage ของชุมชน"
              >
                <FacebookIcon />
              </a>
              <a
                href={`mailto:${site.email}`}
                className={`rounded-lg border p-2.5 transition-colors ${ink.social}`}
                aria-label={`ส่งอีเมลถึง ${site.email}`}
              >
                <MailIcon />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {nav.footerColumns.map((column, columnIndex) => (
              <nav key={columnIndex} aria-label={t(column.heading)} className="flex flex-col gap-4">
                <h2 className={`text-xs font-semibold tracking-label ${ink.heading}`}>
                  <Ed at={atNav(`footerColumns.${columnIndex}.heading`)} tone={tone}>
                    {t(column.heading)}
                  </Ed>
                </h2>
                <ul className="flex flex-col gap-2.5">
                  {column.links.map((item, linkIndex) => (
                    <li key={`${item.href}-${linkIndex}`}>
                      <Link
                        href={item.href}
                        {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className={`text-sm transition-colors ${ink.link}`}
                      >
                        <Ed
                          at={atNav(`footerColumns.${columnIndex}.links.${linkIndex}.label`)}
                          tone={tone}
                        >
                          {t(item.label)}
                        </Ed>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <h2 className={`text-xs font-semibold tracking-label ${ink.heading}`}>
              <Ed at={atLabel("contact", "contactCommunity")} tone={tone}>
                {labels.contact.contactCommunity}
              </Ed>
            </h2>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex gap-3">
                <MapPinIcon className={`mt-0.5 h-[18px] w-[18px] shrink-0 ${ink.icon}`} />
                <span className={ink.body}>
                  <Ed at={atSite("address")} multiline tone={tone}>
                    {t(site.address)}
                  </Ed>
                </span>
              </li>
              <li className="flex gap-3">
                <PhoneIcon className={`mt-0.5 h-[18px] w-[18px] shrink-0 ${ink.icon}`} />
                <a href={telUrl(site)} className={`transition-colors ${ink.link}`}>
                  {site.phoneDisplay}
                </a>
              </li>
              <li className="flex gap-3">
                <LineIcon className={`mt-0.5 h-[18px] w-[18px] shrink-0 ${ink.icon}`} />
                <a
                  href={site.lineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-colors ${ink.link}`}
                >
                  LINE {site.lineId}
                </a>
              </li>
            </ul>

            <div className={`mt-1 overflow-hidden rounded-xl border ${ink.line}`}>
              <div className="h-40">
                <MapEmbed site={site} title="แผนที่ย่อชุมชนบ้านต้นโพธิ์" />
              </div>
              <a
                href={directionsUrl(site)}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold transition-colors ${ink.map}`}
              >
                <MapPinIcon className="h-4 w-4" />
                <Ed at={atLabel("contact", "directions")} tone={tone}>
                  {labels.contact.directions}
                </Ed>
              </a>
            </div>
          </div>
        </div>
      </Container>

      <div className={`border-t ${ink.line}`}>
        <Container size="wide">
          <div
            className={`flex flex-col gap-2 py-5 text-xs sm:flex-row sm:items-center sm:justify-between ${ink.fine}`}
          >
            <p>
              © {new Date().getFullYear()} {t(site.communityName)} ·{" "}
              <Ed at={atLabel("contact", "copyright")} tone={tone}>
                {labels.contact.copyright}
              </Ed>
            </p>
            <p>
              <Ed at={atSite("openingHoursShort")} tone={tone}>
                {t(site.openingHoursShort)}
              </Ed>
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}

import Link from "next/link";
import type { NavData } from "@/lib/cms/navigation";
import type { SiteSettings } from "@/content/types";
import { atGlobal } from "@/lib/cms/inline";
import { atLabel, type Labels } from "@/lib/labels";
import { t } from "@/lib/i18n";
import { telUrl } from "@/lib/line";
import { Ed } from "./editable";
import { FacebookIcon, LineIcon, MailIcon, MapPinIcon, PhoneIcon } from "./icons";
import { directionsUrl, MapEmbed } from "./map-embed";
import { SiteLogo } from "./site-logo";
import { Container } from "./ui";

const atNav = atGlobal("navigation");
const atSite = atGlobal("site-settings");

export function SiteFooter({
  site,
  nav,
  labels,
  editing = false,
}: {
  site: SiteSettings;
  nav: NavData;
  labels: Labels;
  /** ส่งต่อให้โลโก้ซึ่งใช้ได้ทั้งฝั่งเซิร์ฟเวอร์และไคลเอนต์ ส่วนที่เหลือใช้ <Ed> ตัดสินเอง */
  editing?: boolean;
}) {
  return (
    <footer className="mt-24 bg-ink-800 text-ink-200">
      <Container size="wide" className="py-14">
        {/* แท็บเล็ต: ข้อมูลชุมชนเต็มแถว แล้ววางเมนูคู่ช่องทางติดต่อ แทนการเรียงยาวลงมาทีละคอลัมน์ */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.3fr]">
          <div className="flex flex-col gap-5 md:col-span-2 lg:col-span-1">
            <SiteLogo site={site} editing={editing} />
            <p className="max-w-sm text-sm leading-relaxed text-ink-300">
              <Ed at={atSite("aboutSummary")} multiline tone="light">
                {t(site.aboutSummary)}
              </Ed>
            </p>
            <div className="flex gap-2">
              <a
                href={site.lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/15 p-2.5 text-rice-100 transition-colors hover:border-leaf-500 hover:text-leaf-300"
                aria-label={`LINE Official Account ${site.lineId}`}
              >
                <LineIcon />
              </a>
              <a
                href={site.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/15 p-2.5 text-rice-100 transition-colors hover:border-leaf-500 hover:text-leaf-300"
                aria-label="Facebook Fanpage ของชุมชน"
              >
                <FacebookIcon />
              </a>
              <a
                href={`mailto:${site.email}`}
                className="rounded-lg border border-white/15 p-2.5 text-rice-100 transition-colors hover:border-leaf-500 hover:text-leaf-300"
                aria-label={`ส่งอีเมลถึง ${site.email}`}
              >
                <MailIcon />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {nav.footerColumns.map((column, columnIndex) => (
              <nav key={columnIndex} aria-label={t(column.heading)} className="flex flex-col gap-4">
                <h2 className="text-xs font-semibold tracking-label text-leaf-300">
                  <Ed at={atNav(`footerColumns.${columnIndex}.heading`)} tone="light">
                    {t(column.heading)}
                  </Ed>
                </h2>
                <ul className="flex flex-col gap-2.5">
                  {column.links.map((item, linkIndex) => (
                    <li key={`${item.href}-${linkIndex}`}>
                      <Link
                        href={item.href}
                        {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="text-sm text-ink-300 transition-colors hover:text-white"
                      >
                        <Ed
                          at={atNav(`footerColumns.${columnIndex}.links.${linkIndex}.label`)}
                          tone="light"
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
            <h2 className="text-xs font-semibold tracking-label text-leaf-300">
              <Ed at={atLabel("contact", "contactCommunity")} tone="light">
                {labels.contact.contactCommunity}
              </Ed>
            </h2>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex gap-3">
                <MapPinIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-ink-400" />
                <span className="text-ink-300">
                  <Ed at={atSite("address")} multiline tone="light">
                    {t(site.address)}
                  </Ed>
                </span>
              </li>
              <li className="flex gap-3">
                <PhoneIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-ink-400" />
                <a href={telUrl(site)} className="text-ink-300 transition-colors hover:text-white">
                  {site.phoneDisplay}
                </a>
              </li>
              <li className="flex gap-3">
                <LineIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-ink-400" />
                <a
                  href={site.lineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-300 transition-colors hover:text-white"
                >
                  LINE {site.lineId}
                </a>
              </li>
            </ul>

            <div className="mt-1 overflow-hidden rounded-xl border border-white/10">
              <div className="h-40">
                <MapEmbed site={site} title="แผนที่ย่อชุมชนบ้านต้นโพธิ์" />
              </div>
              <a
                href={directionsUrl(site)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white/5 py-2.5 text-xs font-semibold text-rice-100 transition-colors hover:bg-white/10"
              >
                <MapPinIcon className="h-4 w-4" />
                <Ed at={atLabel("contact", "directions")} tone="light">
                  {labels.contact.directions}
                </Ed>
              </a>
            </div>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container size="wide">
          <div className="flex flex-col gap-2 py-5 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {t(site.communityName)} ·{" "}
              <Ed at={atLabel("contact", "copyright")} tone="light">
                {labels.contact.copyright}
              </Ed>
            </p>
            <p>
              <Ed at={atSite("openingHoursShort")} tone="light">
                {t(site.openingHoursShort)}
              </Ed>
            </p>
          </div>
        </Container>
      </div>
    </footer>
  );
}

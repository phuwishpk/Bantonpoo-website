import Link from "next/link";
import { site } from "@/content/site";
import { t } from "@/lib/i18n";
import { telUrl } from "@/lib/line";
import { mainNav } from "@/lib/nav";
import { FacebookIcon, LineIcon, MailIcon, MapPinIcon, PhoneIcon } from "./icons";
import { directionsUrl, MapEmbed } from "./map-embed";
import { SiteLogo } from "./site-logo";
import { Container } from "./ui";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink-800 text-ink-200">
      <Container size="wide" className="py-14">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1.3fr]">
          <div className="flex flex-col gap-5">
            <SiteLogo />
            <p className="max-w-sm text-sm leading-relaxed text-ink-300">{t(site.aboutSummary)}</p>
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

          <nav aria-label="เมนูท้ายเว็บ" className="flex flex-col gap-4">
            <h2 className="text-xs font-semibold tracking-label text-leaf-300">เมนู</h2>
            <ul className="flex flex-col gap-2.5">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-ink-300 transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-semibold tracking-label text-leaf-300">ติดต่อชุมชน</h2>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex gap-3">
                <MapPinIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-ink-400" />
                <span className="text-ink-300">{t(site.address)}</span>
              </li>
              <li className="flex gap-3">
                <PhoneIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-ink-400" />
                <a href={telUrl} className="text-ink-300 transition-colors hover:text-white">
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
                <MapEmbed title="แผนที่ย่อชุมชนบ้านต้นโพธิ์" />
              </div>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white/5 py-2.5 text-xs font-semibold text-rice-100 transition-colors hover:bg-white/10"
              >
                <MapPinIcon className="h-4 w-4" />
                นำทางด้วย Google Maps
              </a>
            </div>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container size="wide">
          <div className="flex flex-col gap-2 py-5 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {t(site.communityName)} · สงวนลิขสิทธิ์
            </p>
            <p>{t(site.openingHoursShort)}</p>
          </div>
        </Container>
      </div>
    </footer>
  );
}

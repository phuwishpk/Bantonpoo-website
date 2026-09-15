import type { Localized, SiteSettings } from "@/content/types";
import { t } from "@/lib/i18n";
import { telUrl } from "@/lib/line";
import { LineIcon, MapPinIcon, PhoneIcon } from "./icons";
import { ButtonLink, buttonClass, Container, EyebrowLabel } from "./ui";

/**
 * กล่องชวนติดต่อท้ายหน้า
 *
 * แยกออกมาเป็นคอมโพเนนต์เพราะผู้ดูแลเพิ่มส่วนนี้เข้าไปในหน้าไหนก็ได้
 * จากรายการ "ลำดับและการแสดงส่วนต่าง ๆ"
 */
export function CtaBand({
  site,
  eyebrow,
  title,
  body,
}: {
  site: SiteSettings;
  eyebrow: Localized;
  title: Localized;
  body: Localized;
}) {
  if (!t(title)) return null;

  return (
    <section className="pb-4 pt-8">
      <Container size="wide">
        <div className="relative overflow-hidden rounded-2xl bg-ink-800 px-6 py-12 text-center sm:px-12 sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-leaf-500/25 blur-[100px]"
          />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
            {t(eyebrow) ? <EyebrowLabel tone="light">{t(eyebrow)}</EyebrowLabel> : null}
            <h2 className="font-serif text-2xl leading-snug font-semibold text-rice-100 sm:text-3xl">
              {t(title)}
            </h2>
            {t(body) ? (
              <p className="text-md leading-relaxed text-ink-200">{t(body)}</p>
            ) : null}
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
}

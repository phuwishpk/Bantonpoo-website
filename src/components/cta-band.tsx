import type { CSSProperties } from "react";
import type { Localized, SiteSettings } from "@/content/types";
import { type SectionConfig, sectionSkin } from "@/lib/cms/page-content";
import { t } from "@/lib/i18n";
import { telUrl } from "@/lib/line";
import { Ed } from "./editable";
import { LineIcon, MapPinIcon, PhoneIcon } from "./icons";
import { ButtonLink, buttonClass, Container, EyebrowLabel } from "./ui";

/**
 * กล่องชวนติดต่อท้ายหน้า
 *
 * แยกออกมาเป็นคอมโพเนนต์เพราะผู้ดูแลเพิ่มส่วนนี้เข้าไปในหน้าไหนก็ได้
 * จากรายการ "ลำดับและการแสดงส่วนต่าง ๆ"
 *
 * @param at     ที่อยู่ของกลุ่มฟิลด์ เช่น g:shop-page:cta
 * @param config การตั้งค่าสี ตัวอักษร และการจัดวางของส่วนนี้
 */
export function CtaBand({
  site,
  eyebrow,
  title,
  body,
  at,
  config,
  editing = false,
}: {
  site: SiteSettings;
  eyebrow: Localized;
  title: Localized;
  body: Localized;
  at?: string;
  config?: SectionConfig;
  /** ในโหมดแก้ไขต้องแสดงกล่องเสมอ ไม่งั้นหัวเรื่องที่ยังว่างอยู่จะไม่มีที่ให้คลิกกรอก */
  editing?: boolean;
}) {
  if (!t(title) && !editing) return null;

  const skin = config ? sectionSkin(config) : null;

  return (
    <section className={`pb-4 pt-8 ${skin?.className ?? ""}`} style={skin?.style as CSSProperties}>
      <Container size="wide">
        <div className="relative overflow-hidden rounded-2xl bg-ink-800 px-6 py-12 text-center sm:px-12 sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-leaf-500/25 blur-[100px]"
          />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
            {t(eyebrow) || editing ? (
              <EyebrowLabel tone="light">
                {at ? (
                  <Ed at={`${at}.eyebrow`} tone="light" placeholder="ข้อความนำ">
                    {t(eyebrow)}
                  </Ed>
                ) : (
                  t(eyebrow)
                )}
              </EyebrowLabel>
            ) : null}

            <h2 className="font-serif text-2xl leading-snug font-semibold text-rice-100 sm:text-3xl">
              {at ? (
                <Ed at={`${at}.title`} tone="light" placeholder="หัวเรื่องกล่องชวนติดต่อ">
                  {t(title)}
                </Ed>
              ) : (
                t(title)
              )}
            </h2>

            {t(body) || editing ? (
              <p className="text-md leading-relaxed text-ink-200">
                {at ? (
                  <Ed at={`${at}.body`} multiline tone="light" placeholder="เนื้อหา">
                    {t(body)}
                  </Ed>
                ) : (
                  t(body)
                )}
              </p>
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

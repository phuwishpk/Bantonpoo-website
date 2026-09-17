import type { Localized, SiteSettings } from "@/content/types";
import { type SectionConfig, sectionSkin } from "@/lib/cms/page-content";
import { t } from "@/lib/i18n";
import { telUrl } from "@/lib/line";
import { INK } from "@/lib/tone";
import { Ed, EdStyle } from "./editable";
import { LineIcon, MapPinIcon, PhoneIcon } from "./icons";
import { ButtonLink, buttonClass, Container, EyebrowLabel } from "./ui";

/**
 * กล่องชวนติดต่อท้ายหน้า
 *
 * แยกออกมาเป็นคอมโพเนนต์เพราะผู้ดูแลเพิ่มส่วนนี้เข้าไปในหน้าไหนก็ได้
 * จากรายการ "ลำดับและการแสดงส่วนต่าง ๆ"
 *
 * กล่องเป็นพื้นเข้มโดยตั้งต้น ถ้าผู้ดูแลตั้ง "สีการ์ด" เป็นสีอ่อน ตัวอักษรและปุ่มจะเปลี่ยนเป็นแบบพื้นอ่อนให้เอง
 *
 * @param at      ที่อยู่ของกลุ่มฟิลด์ข้อความ เช่น g:shop-page:cta
 * @param styleAt ที่อยู่ของกลุ่มฟิลด์สี เช่น g:shop-page:sections.1 (บล็อกของหน้าที่สร้างเองใช้ที่เดียวกับ at)
 * @param config  การตั้งค่าสี ตัวอักษร และการจัดวางของส่วนนี้
 */
export function CtaBand({
  site,
  eyebrow,
  title,
  body,
  at,
  styleAt,
  config,
  editing = false,
}: {
  site: SiteSettings;
  eyebrow: Localized;
  title: Localized;
  body: Localized;
  at?: string;
  styleAt?: string;
  config?: SectionConfig;
  /** ในโหมดแก้ไขต้องแสดงกล่องเสมอ ไม่งั้นหัวเรื่องที่ยังว่างอยู่จะไม่มีที่ให้คลิกกรอก */
  editing?: boolean;
}) {
  if (!t(title) && !editing) return null;

  const skin = config ? sectionSkin(config) : null;
  // โทนของกล่อง ไม่ใช่ของพื้นส่วน — กล่องนี้เข้มเสมอเว้นแต่ตั้งสีการ์ดเป็นสีอ่อน
  const tone = skin ? skin.cardTone("light") : "light";
  const ink = INK[tone];
  const secondary = tone === "light" ? "onDark" : "secondary";

  return (
    <section className={`pb-4 pt-8 ${skin?.className ?? "relative"}`} style={skin?.style}>
      {config ? <EdStyle at={styleAt} label="กล่องชวนติดต่อ" config={config} /> : null}
      <Container size="wide">
        <div
          className={`box relative overflow-hidden rounded-2xl px-6 py-12 text-center sm:px-12 sm:py-16 ${
            tone === "light" ? "border border-white/10 bg-ink-800" : "border border-rice-300 bg-rice-50"
          }`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-leaf-500/25 blur-[100px]"
          />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
            {t(eyebrow) || editing ? (
              <EyebrowLabel tone={tone === "light" ? "light" : "ember"}>
                {at ? (
                  <Ed at={`${at}.eyebrow`} tone={tone} placeholder="ข้อความนำ">
                    {t(eyebrow)}
                  </Ed>
                ) : (
                  t(eyebrow)
                )}
              </EyebrowLabel>
            ) : null}

            <h2 className={`font-serif text-2xl leading-snug font-semibold sm:text-3xl ${ink.title}`}>
              {at ? (
                <Ed at={`${at}.title`} tone={tone} placeholder="หัวเรื่องกล่องชวนติดต่อ">
                  {t(title)}
                </Ed>
              ) : (
                t(title)
              )}
            </h2>

            {t(body) || editing ? (
              <p className={`text-md leading-relaxed ${tone === "light" ? "text-ink-200" : "text-river-500"}`}>
                {at ? (
                  <Ed at={`${at}.body`} multiline tone={tone} placeholder="เนื้อหา">
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
              <a href={telUrl(site)} className={buttonClass(secondary)}>
                <PhoneIcon />
                โทร {site.phoneDisplay}
              </a>
              <ButtonLink href="/contact" variant={secondary}>
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

import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/content/types";
import { atGlobal } from "@/lib/cms/inline";
import { t } from "@/lib/i18n";
import { InlineEditable } from "./inline-editable";
import { InlineImageEdit } from "./inline-image";

const at = atGlobal("site-settings");

/**
 * เครื่องหมายสำรอง — ใบโพธิ์ สื่อถึงต้นโพธิ์ใหญ่ที่เป็นที่มาของชื่อชุมชน
 * ใช้เมื่อยังไม่ได้อัปโหลดโลโก้จริงในหน้า "ข้อมูลชุมชน"
 *
 * viewBox ตัดพอดีตัวใบ (ไม่มีพื้นวงกลม) จึงวางสูงเท่าโลโก้จริงได้โดยไม่ดูเล็ก
 */
export function LogoMark({ className = "", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <svg viewBox="11 8.5 18 23" className={className} aria-hidden>
      {/* ใบโพธิ์: ฐานใบกว้าง ปลายใบเรียวยาวเป็นติ่ง */}
      <path
        d="M20 9.5c5.4 2.2 8 5.6 8 9.3 0 3.9-3.3 6.8-7.1 7.2l1.6 4.5h-4.9l1.6-4.5c-3.8-.4-7.1-3.3-7.1-7.2 0-3.7 2.6-7.1 8-9.3z"
        className={tone === "light" ? "fill-leaf-400" : "fill-leaf-500"}
      />
      {/* เส้นกลางใบใช้สีพื้นหลัง ให้ดูเป็นร่องบนใบ */}
      <path
        d="M20 12v13"
        stroke={tone === "light" ? "var(--color-ink-800)" : "var(--color-rice-50)"}
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** ความสูงของโลโก้บนจอกว้าง (px) — ความกว้างคิดจากสัดส่วนจริงของรูป */
const LOGO_HEIGHT = 40;

/**
 * รับข้อมูลชุมชนเป็น prop เพราะใช้ทั้งใน header (client) และ footer (server)
 *
 * ใช้ InlineEditable ตรง ๆ แทน <Ed> เพราะคอมโพเนนต์นี้ถูกเรนเดอร์ในฝั่งไคลเอนต์ด้วย
 * ผู้เรียกจึงต้องเป็นคนบอกว่าตอนนี้อยู่ในโหมดแก้ไขหรือไม่
 */
export function SiteLogo({
  site,
  tone = "light",
  editing = false,
  hideTaglineOnLg = false,
}: {
  site: SiteSettings;
  tone?: "light" | "dark";
  editing?: boolean;
  /** ซ่อนบรรทัดรองช่วงจอ lg–xl ที่เมนูหลักใช้พื้นที่แถบบนเกือบหมด (ใช้กับ header) */
  hideTaglineOnLg?: boolean;
}) {
  const title = tone === "light" ? "text-rice-100" : "text-ink-800";
  const subtitle = tone === "light" ? "text-ink-300" : "text-river-500";

  return (
    <Link href="/" className="flex items-center gap-3" aria-label={`${t(site.communityShortName)} — หน้าแรก`}>
      <span className="relative shrink-0 rounded-md">
        {site.logo ? (
          // ใช้รูปต้นฉบับ ไม่ใช้รูปย่อจัตุรัส ซึ่งตัดโลโก้แนวนอนจนขาด
          <Image
            src={site.logo.url}
            alt={t(site.logo.alt)}
            width={Math.round((LOGO_HEIGHT * site.logo.width) / site.logo.height)}
            height={LOGO_HEIGHT}
            className="block h-9 w-auto max-w-28 object-contain sm:h-10 sm:max-w-40"
          />
        ) : (
          <LogoMark tone={tone} className="block h-9 w-auto sm:h-10" />
        )}
        {editing ? (
          <InlineImageEdit
            at={at("logo")}
            label="โลโก้"
            current={site.logo?.id}
            removable
            compact
            hint="แสดงตามสัดส่วนจริง สูงเท่าชื่อชุมชน · แถบเมนูเป็นพื้นเข้ม ใช้ PNG พื้นโปร่งใสจะดูดีที่สุด — ถ้านำออกจะใช้ใบโพธิ์"
          />
        ) : null}
      </span>
      <span className="flex flex-col leading-tight">
        <span className={`whitespace-nowrap font-serif text-base font-semibold sm:text-lg ${title}`}>
          {editing ? (
            <InlineEditable at={at("communityShortName")} tone={tone}>
              {t(site.communityShortName)}
            </InlineEditable>
          ) : (
            t(site.communityShortName)
          )}
        </span>
        {/*
          โลโก้จริงมักกว้างกว่าใบโพธิ์ บนจอมือถือบรรทัดรองจะดันปุ่มเมนูหลุดขอบจอ
          จึงซ่อนไว้จนถึงจอ sm เมื่อมีโลโก้ (ชื่อชุมชนยังแสดงอยู่)
        */}
        <span
          className={`hidden whitespace-nowrap text-2xs tracking-wide ${site.logo ? "sm:block" : "xs:block"} ${
            hideTaglineOnLg ? "lg:hidden xl:block" : ""
          } ${subtitle}`}
        >
          {editing ? (
            <InlineEditable at={at("tagline")} tone={tone}>
              {t(site.tagline)}
            </InlineEditable>
          ) : (
            t(site.tagline)
          )}
        </span>
      </span>
    </Link>
  );
}

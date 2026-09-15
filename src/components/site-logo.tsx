import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/content/types";
import { t } from "@/lib/i18n";

/**
 * เครื่องหมายสำรอง — ใบโพธิ์ในวงกลม สื่อถึงต้นโพธิ์ใหญ่ที่เป็นที่มาของชื่อชุมชน
 * ใช้เมื่อยังไม่ได้อัปโหลดโลโก้จริงในหน้า "ข้อมูลชุมชน"
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <circle cx="20" cy="20" r="19" className="fill-leaf-500" />
      {/* ใบโพธิ์: ฐานใบกว้าง ปลายใบเรียวยาวเป็นติ่ง */}
      <path
        d="M20 9.5c5.4 2.2 8 5.6 8 9.3 0 3.9-3.3 6.8-7.1 7.2l1.6 4.5h-4.9l1.6-4.5c-3.8-.4-7.1-3.3-7.1-7.2 0-3.7 2.6-7.1 8-9.3z"
        fill="white"
      />
      <path
        d="M20 12v13"
        stroke="var(--color-leaf-500)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** รับข้อมูลชุมชนเป็น prop เพราะใช้ทั้งใน header (client) และ footer (server) */
export function SiteLogo({
  site,
  tone = "light",
}: {
  site: SiteSettings;
  tone?: "light" | "dark";
}) {
  const title = tone === "light" ? "text-rice-100" : "text-ink-800";
  const subtitle = tone === "light" ? "text-ink-300" : "text-river-500";

  return (
    <Link href="/" className="flex items-center gap-3" aria-label={`${t(site.communityShortName)} — หน้าแรก`}>
      {site.logo ? (
        <Image
          src={site.logo.url}
          alt={t(site.logo.alt)}
          width={site.logo.width}
          height={site.logo.height}
          className="h-9 w-9 shrink-0 rounded-full object-cover sm:h-10 sm:w-10"
        />
      ) : (
        <LogoMark className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
      )}
      <span className="flex flex-col leading-tight">
        <span className={`whitespace-nowrap font-serif text-base font-semibold sm:text-lg ${title}`}>
          {t(site.communityShortName)}
        </span>
        <span className={`hidden whitespace-nowrap text-2xs tracking-wide xs:block ${subtitle}`}>
          {t(site.tagline)}
        </span>
      </span>
    </Link>
  );
}

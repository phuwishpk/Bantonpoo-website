import Link from "next/link";
import { site } from "@/content/site";
import { t } from "@/lib/i18n";

/**
 * โลโก้ชั่วคราวของชุมชน — เครื่องหมายทั่งตีเหล็กกับเปลวไฟ
 * เมื่อชุมชนมีโลโก้จริงแล้ว ให้แทนที่ <svg> ด้วย next/image
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <circle cx="20" cy="20" r="19" className="fill-ember-500" />
      <path
        d="M20 8c.8 3.4 3.8 4.8 3.8 8.4a3.8 3.8 0 11-7.6 0c0-1.3.4-2.2.9-2.9"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M11 24h18l-2.4 3.4a2 2 0 01-1.6.8H15a2 2 0 01-1.6-.8z" fill="white" />
      <rect x="17.5" y="28.6" width="5" height="3.4" rx="1" fill="white" />
    </svg>
  );
}

export function SiteLogo({ tone = "light" }: { tone?: "light" | "dark" }) {
  const title = tone === "light" ? "text-rice-100" : "text-steel-800";
  const subtitle = tone === "light" ? "text-steel-300" : "text-forged-500";

  return (
    <Link href="/" className="flex items-center gap-3" aria-label={`${t(site.communityShortName)} — หน้าแรก`}>
      <LogoMark className="h-9 w-9 shrink-0 sm:h-10 sm:w-10" />
      <span className="flex flex-col leading-tight">
        <span className={`whitespace-nowrap font-serif text-base font-semibold sm:text-lg ${title}`}>
          {t(site.communityShortName)}
        </span>
        <span className={`hidden whitespace-nowrap text-[0.6875rem] tracking-wide xs:block ${subtitle}`}>
          มีดอรัญญิก · อยุธยา
        </span>
      </span>
    </Link>
  );
}

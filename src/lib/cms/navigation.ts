import { cache } from "react";
import type { Localized } from "@/content/types";
import { ALL_LOCALES, getCms } from "./client";
import { loc } from "./map";

export type NavLink = {
  label: Localized;
  href: string;
  /** เปิดแท็บใหม่และใส่ rel="noopener" ให้ */
  external: boolean;
  children?: NavLink[];
};

export type NavData = {
  mainMenu: NavLink[];
  headerCta: { enabled: boolean; label: Localized; action: "line" | "phone" | "contact" };
  mobileMenu: {
    title: Localized;
    contactHeading: Localized;
    lineButtonPrefix: Localized;
    phoneButtonPrefix: Localized;
  };
  footerColumns: { heading: Localized; links: NavLink[] }[];
};

type RawLink = {
  label?: unknown;
  linkType?: string;
  page?: string | null;
  url?: string | null;
  children?: RawLink[] | null;
};

function mapLink(raw: RawLink): NavLink {
  const external = raw.linkType === "external";
  return {
    label: loc(raw.label as never),
    // ลิงก์ภายในเลือกจากรายการหน้าที่มีอยู่จริง จึงไม่มีทางพิมพ์ผิด
    href: external ? (raw.url ?? "#") : (raw.page ?? "/"),
    external,
    ...(raw.children?.length ? { children: raw.children.map(mapLink) } : {}),
  };
}

export const getNavigation = cache(async (): Promise<NavData> => {
  const cms = await getCms();
  const doc = (await cms.findGlobal({
    slug: "navigation",
    locale: ALL_LOCALES,
    depth: 0,
  })) as unknown as Record<string, unknown>;

  const cta = (doc.headerCta ?? {}) as { enabled?: boolean; label?: unknown; action?: string };
  const mobile = (doc.mobileMenu ?? {}) as Record<string, unknown>;

  return {
    mainMenu: ((doc.mainMenu as RawLink[] | undefined) ?? []).map(mapLink),
    headerCta: {
      enabled: cta.enabled !== false,
      label: loc(cta.label as never),
      action: (cta.action as NavData["headerCta"]["action"]) ?? "line",
    },
    mobileMenu: {
      title: loc(mobile.title as never),
      contactHeading: loc(mobile.contactHeading as never),
      lineButtonPrefix: loc(mobile.lineButtonPrefix as never),
      phoneButtonPrefix: loc(mobile.phoneButtonPrefix as never),
    },
    footerColumns: (
      (doc.footerColumns as { heading?: unknown; links?: RawLink[] }[] | undefined) ?? []
    ).map((column) => ({
      heading: loc(column.heading as never),
      links: (column.links ?? []).map(mapLink),
    })),
  };
});

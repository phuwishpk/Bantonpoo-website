"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavData } from "@/lib/cms/navigation";
import { atGlobal } from "@/lib/cms/inline";
import { t } from "@/lib/i18n";
import { telUrl } from "@/lib/line";
import { isActivePath } from "@/lib/nav";
import { CloseIcon, LineIcon, MenuIcon, PhoneIcon } from "./icons";
import { InlineEditable } from "./inline-editable";
import { useSite } from "./site-context";
import { SiteLogo } from "./site-logo";
import { buttonClass, Container } from "./ui";

const at = atGlobal("navigation");

/**
 * @param editing เปิดโหมดแก้ไขบนหน้าเว็บหรือไม่ — ตัดสินจากฝั่งเซิร์ฟเวอร์ใน layout
 *                เพื่อไม่ให้ที่อยู่ของฟิลด์ติดไปกับข้อมูลที่ส่งให้ผู้เข้าชมทั่วไป
 */
export function SiteHeader({ nav, editing = false }: { nav: NavData; editing?: boolean }) {
  const site = useSite();
  const pathname = usePathname();

  /** ปลายทางของปุ่ม CTA มุมขวาบน ตามที่เลือกไว้ในหลังบ้าน */
  const ctaHref =
    nav.headerCta.action === "phone"
      ? telUrl(site)
      : nav.headerCta.action === "contact"
        ? "/contact"
        : site.lineUrl;
  const ctaExternal = nav.headerCta.action === "line";
  const [open, setOpen] = useState(false);

  // ล็อกการเลื่อนพื้นหลังขณะเปิด drawer และรองรับปุ่ม Esc
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-800/95 backdrop-blur supports-[backdrop-filter]:bg-ink-800/85">
        <Container size="wide">
          <div className="flex h-[4.5rem] items-center justify-between gap-4">
          <SiteLogo site={site} editing={editing} hideTaglineOnLg />

          <nav aria-label="เมนูหลัก" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.mainMenu.map((item, itemIndex) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <li key={item.href}>
                    {/* ห้ามตัดบรรทัด — จอ 1024px พื้นที่พอดี ๆ ชื่อเมนูจะแตกเป็นสองบรรทัด */}
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className={`relative whitespace-nowrap rounded-md px-2.5 py-2 text-md transition-colors duration-200 xl:px-3 ${
                        active ? "text-white" : "text-ink-200 hover:text-white"
                      }`}
                    >
                      {editing ? (
                        <InlineEditable at={at(`mainMenu.${itemIndex}.label`)} tone="light">
                          {t(item.label)}
                        </InlineEditable>
                      ) : (
                        t(item.label)
                      )}
                      {active ? (
                        <span
                          aria-hidden
                          className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-leaf-500"
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {nav.headerCta.enabled ? (
              <div className="hidden sm:block">
                <a
                  href={ctaHref}
                  {...(ctaExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={buttonClass("primary", "px-4 py-2.5")}
                >
                  <LineIcon className="h-[18px] w-[18px]" />
                  {editing ? (
                    <InlineEditable at={at("headerCta.label")} tone="light">
                      {t(nav.headerCta.label)}
                    </InlineEditable>
                  ) : (
                    t(nav.headerCta.label)
                  )}
                </a>
              </div>
            ) : null}

            <a
              href={telUrl(site)}
              className="rounded-lg p-2.5 text-rice-100 transition-colors hover:bg-white/10 lg:hidden"
              aria-label={`โทรหาชุมชน ${site.phoneDisplay}`}
            >
              <PhoneIcon />
            </a>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-lg p-2.5 text-rice-100 transition-colors hover:bg-white/10 lg:hidden"
              aria-label="เปิดเมนู"
              aria-expanded={open}
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        </Container>
      </header>

      {/*
        Drawer ต้องอยู่ "นอก" <header>
        เพราะ backdrop-blur สร้าง containing block ใหม่ ทำให้ position: fixed
        ที่อยู่ข้างในไปยึดกับกรอบของ header แทนกรอบหน้าจอ เมนูจึงสูงแค่แถบบน
      */}
      {/*
        Drawer บนมือถือ
        ตอนปิดต้อง invisible ด้วย ไม่ใช่แค่เลื่อนออกนอกจอ — ไม่งั้นเงาของแผงล้นเข้ามาเป็นแถบมืดที่ขอบขวา
        และลิงก์ข้างในยังกด Tab เข้าไปได้ (visibility เปลี่ยนหลังเลื่อนปิดเสร็จ ภาพเคลื่อนไหวจึงไม่ขาด)
      */}
      <div
        className={`fixed inset-0 z-50 transition-[visibility] duration-300 lg:hidden ${
          open ? "visible" : "pointer-events-none invisible"
        }`}
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="ปิดเมนู"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-ink-950/70 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="เมนูนำทาง"
          className={`absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col bg-ink-800 shadow-lift-lg transition-transform duration-300 ease-craft ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
          style={{
            paddingTop: "env(safe-area-inset-top, 0px)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <span className="font-serif text-base font-semibold text-rice-100">
              {editing ? (
                <InlineEditable at={at("mobileMenu.title")} tone="light">
                  {t(nav.mobileMenu.title) || "เมนู"}
                </InlineEditable>
              ) : (
                t(nav.mobileMenu.title) || "เมนู"
              )}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-rice-100 transition-colors hover:bg-white/10"
              aria-label="ปิดเมนู"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>

          <nav aria-label="เมนูบนมือถือ" className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="flex flex-col gap-1">
              {nav.mainMenu.map((item, itemIndex) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      // ปิด drawer ทันทีที่กดลิงก์ ไม่งั้นเมนูจะค้างทับหน้าใหม่
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between rounded-lg px-4 py-3 text-base transition-colors ${
                        active ? "bg-white/10 font-semibold text-white" : "text-ink-200 hover:bg-white/5"
                      }`}
                    >
                      {editing ? (
                        <InlineEditable at={at(`mainMenu.${itemIndex}.label`)} tone="light">
                          {t(item.label)}
                        </InlineEditable>
                      ) : (
                        t(item.label)
                      )}
                      {active ? <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-leaf-500" /> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-white/10 p-4">
            <p className="mb-3 text-xs text-ink-300">
              {editing ? (
                <InlineEditable at={at("mobileMenu.contactHeading")} tone="light">
                  {t(nav.mobileMenu.contactHeading)}
                </InlineEditable>
              ) : (
                t(nav.mobileMenu.contactHeading)
              )}
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={site.lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("primary", "w-full", { wrap: true })}
              >
                <LineIcon className="h-[18px] w-[18px]" />
                {editing ? (
                  <InlineEditable at={at("mobileMenu.lineButtonPrefix")} tone="light">
                    {t(nav.mobileMenu.lineButtonPrefix)}
                  </InlineEditable>
                ) : (
                  t(nav.mobileMenu.lineButtonPrefix)
                )}{" "}
                {site.lineId}
              </a>
              <a href={telUrl(site)} onClick={() => setOpen(false)} className={buttonClass("onDark", "w-full", { wrap: true })}>
                <PhoneIcon className="h-[18px] w-[18px]" />
                {/* ครอบเป็นก้อนเดียว ไม่งั้นเบอร์กลายเป็นอีกชิ้นใน flex และห่างจากคำนำด้วย gap แทนช่องว่าง */}
                <span>
                  {editing ? (
                    <InlineEditable at={at("mobileMenu.phoneButtonPrefix")} tone="light">
                      {t(nav.mobileMenu.phoneButtonPrefix)}
                    </InlineEditable>
                  ) : (
                    t(nav.mobileMenu.phoneButtonPrefix)
                  )}{" "}
                  <span className="whitespace-nowrap">{site.phoneDisplay}</span>
                </span>
              </a>
            </div>
            <p className="mt-3 text-center text-xs text-ink-400">
              {editing ? (
                <InlineEditable at={`g:site-settings:openingHoursShort`} tone="light">
                  {t(site.openingHoursShort)}
                </InlineEditable>
              ) : (
                t(site.openingHoursShort)
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

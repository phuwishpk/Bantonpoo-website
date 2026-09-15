import type { CSSProperties, ReactNode } from "react";
import { type Typography, typographySkin } from "@/lib/cms/page-content";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";
import { Ed } from "./editable";
import { Container, EyebrowLabel } from "./ui";

/**
 * แถบหัวหน้าเพจด้านใน — พื้นเข้มพร้อมเส้นทางนำทาง ใช้เหมือนกันทุกหน้า
 *
 * @param at         ที่อยู่ของกลุ่มฟิลด์แบนเนอร์ เช่น g:about-page:hero
 *                   ส่งมาเพื่อให้คลิกแก้ข้อความบนหน้าเว็บได้
 * @param typography ตัวอักษรและการจัดวางที่ผู้ดูแลเลือกไว้สำหรับแบนเนอร์นี้
 */
export function PageHero({
  eyebrow,
  title,
  description,
  crumbs,
  at,
  typography,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs: Crumb[];
  at?: string;
  typography?: Typography;
  children?: ReactNode;
}) {
  const skin = typography ? typographySkin(typography) : { className: "", style: {} };

  return (
    <section
      className={`relative overflow-hidden bg-ink-800 ${skin.className}`}
      style={Object.keys(skin.style).length ? (skin.style as CSSProperties) : undefined}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-leaf-500/15 blur-[100px]"
      />
      <Container size="wide">
        <div className="relative flex flex-col gap-5 py-10 sm:py-14">
          <Breadcrumbs items={crumbs} tone="light" />
          <div className="flex max-w-3xl flex-col gap-4">
            {eyebrow ? (
              <EyebrowLabel tone="light">
                {at ? (
                  <Ed at={`${at}.eyebrow`} tone="light">
                    {eyebrow}
                  </Ed>
                ) : (
                  eyebrow
                )}
              </EyebrowLabel>
            ) : null}
            <h1 className="font-serif text-display-sm leading-snug font-bold text-rice-100 sm:text-4xl">
              {at ? (
                <Ed at={`${at}.title`} tone="light">
                  {title}
                </Ed>
              ) : (
                title
              )}
            </h1>
            {description ? (
              <p className="text-base leading-relaxed text-ink-200">
                {at ? (
                  <Ed at={`${at}.description`} multiline tone="light">
                    {description}
                  </Ed>
                ) : (
                  description
                )}
              </p>
            ) : null}
          </div>
          {children}
        </div>
      </Container>
    </section>
  );
}

import type { ReactNode } from "react";
import { type SectionConfig, heroConfig, sectionSkin } from "@/lib/cms/page-content";
import { INK } from "@/lib/tone";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";
import { Ed, EdStyle } from "./editable";
import { Container, EyebrowLabel } from "./ui";

/**
 * แถบหัวหน้าเพจด้านใน — พื้นเข้มเป็นค่าเริ่มต้น พร้อมเส้นทางนำทาง ใช้เหมือนกันทุกหน้า
 *
 * @param at     ที่อยู่ของกลุ่มฟิลด์แบนเนอร์ เช่น g:about-page:hero
 *               ส่งมาเพื่อให้คลิกแก้ข้อความและเปลี่ยนสีบนหน้าเว็บได้
 * @param config สี ตัวอักษร และการจัดวางที่ผู้ดูแลเลือกไว้ (อ่านด้วย heroConfig)
 */
export function PageHero({
  eyebrow,
  title,
  description,
  crumbs,
  at,
  config = heroConfig({}),
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs: Crumb[];
  at?: string;
  config?: SectionConfig;
  children?: ReactNode;
}) {
  const skin = sectionSkin(config);
  const tone = skin.tone;
  const ink = INK[tone];

  return (
    <section className={`overflow-hidden ${skin.className}`} style={skin.style}>
      <EdStyle
        at={at}
        label="แถบหัวหน้าเพจ"
        config={config}
        cards={false}
        fallbackBackground="dark"
        placement="inside"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-leaf-500/15 blur-[100px]"
      />
      <Container size="wide">
        <div className="relative flex flex-col gap-5 py-10 sm:py-14">
          <Breadcrumbs items={crumbs} tone={tone} />
          <div className="flex max-w-3xl flex-col gap-4">
            {eyebrow ? (
              <EyebrowLabel tone={tone === "light" ? "light" : "ember"}>
                {at ? (
                  <Ed at={`${at}.eyebrow`} tone={tone}>
                    {eyebrow}
                  </Ed>
                ) : (
                  eyebrow
                )}
              </EyebrowLabel>
            ) : null}
            <h1 className={`font-serif text-display-sm leading-snug font-bold sm:text-4xl ${ink.title}`}>
              {at ? (
                <Ed at={`${at}.title`} tone={tone}>
                  {title}
                </Ed>
              ) : (
                title
              )}
            </h1>
            {description ? (
              <p className={`text-base leading-relaxed ${tone === "light" ? "text-ink-200" : "text-river-500"}`}>
                {at ? (
                  <Ed at={`${at}.description`} multiline tone={tone}>
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

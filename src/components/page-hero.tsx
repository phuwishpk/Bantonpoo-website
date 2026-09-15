import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";
import { Container, EyebrowLabel } from "./ui";

/** แถบหัวหน้าเพจด้านใน — พื้นเข้มพร้อมเส้นทางนำทาง ใช้เหมือนกันทุกหน้า */
export function PageHero({
  eyebrow,
  title,
  description,
  crumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  crumbs: Crumb[];
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-steel-800">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-ember-500/15 blur-[100px]"
      />
      <Container size="wide">
        <div className="relative flex flex-col gap-5 py-10 sm:py-14">
          <Breadcrumbs items={crumbs} tone="light" />
          <div className="flex max-w-3xl flex-col gap-4">
            {eyebrow ? <EyebrowLabel tone="light">{eyebrow}</EyebrowLabel> : null}
            <h1 className="font-serif text-[1.75rem] leading-snug font-bold text-rice-100 sm:text-4xl">{title}</h1>
            {description ? (
              <p className="text-base leading-relaxed text-steel-200">{description}</p>
            ) : null}
          </div>
          {children}
        </div>
      </Container>
    </section>
  );
}

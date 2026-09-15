import { ButtonLink, Container } from "@/components/ui";
import { loc } from "@/lib/cms/map";
import { rowsOf } from "@/lib/cms/page-content";
import { getPageGlobal } from "@/lib/cms/queries";
import { t } from "@/lib/i18n";

export default async function NotFound() {
  const page = await getPageGlobal("not-found-page");
  const buttons = rowsOf(page, "buttons", (row) => ({
    label: loc(row.label as never),
    href: String(row.href ?? "/"),
  }));

  return (
    <Container size="narrow">
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
        <span aria-hidden className="font-serif text-6xl font-bold text-leaf-500">
          404
        </span>
        <h1 className="font-serif text-2xl font-semibold text-ink-800">
          {t(loc(page.title as never))}
        </h1>
        <p className="max-w-md text-md leading-relaxed text-river-500">
          {t(loc(page.description as never))}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {buttons.map((button, index) => (
            <ButtonLink
              key={button.href}
              href={button.href}
              variant={index === 0 ? "primary" : "secondary"}
            >
              {t(button.label)}
            </ButtonLink>
          ))}
        </div>
      </div>
    </Container>
  );
}

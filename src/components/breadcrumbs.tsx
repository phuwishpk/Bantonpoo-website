import Link from "next/link";

export type Crumb = { name: string; path: string };

/** เส้นทางนำทาง เช่น หน้าแรก › เรื่องเล่าชุมชน › ภูมิปัญญาช่างตีมีด */
export function Breadcrumbs({ items, tone = "dark" }: { items: Crumb[]; tone?: "dark" | "light" }) {
  const link = tone === "dark" ? "text-forged-500 hover:text-ember-600" : "text-steel-300 hover:text-ember-300";
  const current = tone === "dark" ? "text-steel-700" : "text-rice-100";
  const separator = tone === "dark" ? "text-rice-400" : "text-steel-500";

  return (
    <nav aria-label="เส้นทางนำทาง">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-2">
              {isLast ? (
                <span className={`font-medium ${current}`} aria-current="page">
                  {item.name}
                </span>
              ) : (
                <>
                  <Link href={item.path} className={`transition-colors ${link}`}>
                    {item.name}
                  </Link>
                  <span aria-hidden className={separator}>
                    ›
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

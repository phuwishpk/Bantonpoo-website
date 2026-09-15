import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/** ความกว้างมาตรฐานของเนื้อหา พร้อมกันขอบซ้ายขวาอย่างน้อย 20px บนมือถือ */
export function Container({
  children,
  className = "",
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
}) {
  const width = {
    narrow: "max-w-3xl",
    default: "max-w-6xl",
    wide: "max-w-7xl",
  }[size];
  return <div className={`mx-auto w-full ${width} px-5 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

/** ป้ายหมวดเล็ก ๆ สีไฟ ใช้นำหน้าหัวข้อ section */
export function EyebrowLabel({ children, tone = "ember" }: { children: ReactNode; tone?: "ember" | "light" }) {
  const color = tone === "ember" ? "text-ember-600" : "text-ember-300";
  return (
    <p className={`text-xs font-semibold tracking-label ${color}`}>
      <span className="mr-2 inline-block h-1.5 w-1.5 rotate-45 bg-current align-middle" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  tone = "dark",
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "dark" | "light";
  align?: "left" | "center";
}) {
  const titleColor = tone === "dark" ? "text-steel-800" : "text-rice-100";
  const descColor = tone === "dark" ? "text-forged-500" : "text-steel-200";
  const alignment = align === "center" ? "text-center items-center" : "";

  return (
    <div
      className={`flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between ${
        align === "center" ? "sm:flex-col sm:items-center" : ""
      }`}
    >
      <div className={`flex max-w-2xl flex-col gap-3 ${alignment}`}>
        {eyebrow ? <EyebrowLabel tone={tone === "dark" ? "ember" : "light"}>{eyebrow}</EyebrowLabel> : null}
        <h2 className={`font-serif text-2xl leading-snug font-semibold sm:text-3xl ${titleColor}`}>{title}</h2>
        {description ? <p className={`text-[0.9375rem] ${descColor}`}>{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "onDark";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-5 py-3 text-[0.9375rem] font-semibold transition duration-200 ease-craft disabled:cursor-not-allowed disabled:opacity-50";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-ember-500 text-white shadow-lift hover:bg-ember-600 active:translate-y-px",
  secondary:
    "border border-steel-300 bg-rice-50 text-steel-800 hover:border-steel-800 hover:bg-white active:translate-y-px",
  ghost: "text-steel-700 hover:bg-rice-200",
  onDark: "border border-white/25 bg-white/5 text-rice-100 hover:border-white/50 hover:bg-white/10",
};

export function buttonClass(variant: ButtonVariant = "primary", extra = ""): string {
  return `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${extra}`;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return <Link {...props} className={buttonClass(variant, className)} />;
}

/** ลิงก์ "ดูทั้งหมด →" ที่มีลูกศรขยับตอน hover */
export function ArrowLink({
  href,
  children,
  tone = "dark",
}: {
  href: string;
  children: ReactNode;
  tone?: "dark" | "light";
}) {
  const color = tone === "dark" ? "text-ember-600 hover:text-ember-700" : "text-ember-300 hover:text-ember-200";
  return (
    <Link href={href} className={`group inline-flex items-center gap-1.5 text-sm font-semibold ${color}`}>
      {children}
      <span aria-hidden className="transition-transform duration-200 ease-craft group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}

/** ป้ายการันตี เช่น "เหล็กแหนบแท้ 100%" */
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "ember" | "dark" }) {
  const styles = {
    neutral: "border-rice-400 bg-rice-50 text-steel-600",
    ember: "border-ember-200 bg-ember-50 text-ember-700",
    dark: "border-white/20 bg-white/10 text-rice-100",
  }[tone];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles}`}>
      {children}
    </span>
  );
}

/** เส้นคั่นบาง ๆ ที่มีจุดสีไฟตรงกลาง ใช้คั่น section ให้ไม่แข็งเกินไป */
export function OrnamentDivider({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const line = tone === "dark" ? "bg-rice-300" : "bg-white/15";
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <span className={`h-px flex-1 ${line}`} />
      <span className="h-1.5 w-1.5 rotate-45 bg-ember-500" />
      <span className={`h-px flex-1 ${line}`} />
    </div>
  );
}

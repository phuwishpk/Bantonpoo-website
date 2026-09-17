import Link from "next/link";
import type { ComponentProps, CSSProperties, ReactNode } from "react";

/**
 * ความกว้างมาตรฐานของเนื้อหา พร้อมกันขอบซ้ายขวาอย่างน้อย 20px บนมือถือ
 *
 * ความกว้างมาจาก --section-measure ถ้ามีการตั้งค่า "ความกว้างของเนื้อหา" ไว้ที่ส่วนนั้น
 * ไม่งั้นตกกลับเป็น --measure-default ของขนาดที่เรียกใช้ (ดูคลาส .measure ใน globals.css)
 */
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
    narrow: "48rem",
    default: "72rem",
    wide: "80rem",
  }[size];
  return (
    <div
      className={`measure mx-auto w-full px-5 sm:px-6 lg:px-8 ${className}`}
      style={{ "--measure-default": width } as CSSProperties}
    >
      {children}
    </div>
  );
}

/** ป้ายหมวดเล็ก ๆ สีไฟ ใช้นำหน้าหัวข้อ section */
export function EyebrowLabel({ children, tone = "ember" }: { children: ReactNode; tone?: "ember" | "light" }) {
  const color = tone === "ember" ? "text-leaf-600" : "text-leaf-300";
  return (
    <p className={`text-xs font-semibold tracking-label ${color}`}>
      <span className="mr-2 inline-block h-1.5 w-1.5 rotate-45 bg-current align-middle" />
      {children}
    </p>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "onDark";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-md font-semibold transition duration-200 ease-craft disabled:cursor-not-allowed disabled:opacity-50";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-leaf-500 text-white shadow-lift hover:bg-leaf-600 active:translate-y-px",
  secondary:
    "border border-ink-300 bg-rice-50 text-ink-800 hover:border-ink-800 hover:bg-white active:translate-y-px",
  ghost: "text-ink-700 hover:bg-rice-200",
  onDark: "border border-white/25 bg-white/5 text-rice-100 hover:border-white/50 hover:bg-white/10",
};

/**
 * @param wrap ให้ข้อความขึ้นบรรทัดใหม่ได้ — ใช้กับปุ่มเต็มความกว้างที่ข้อความยาว
 *             ปกติห้ามตัดบรรทัดเพื่อให้ปุ่มที่วางเรียงกันไม่หดจนข้อความแตก
 *             แต่ปุ่มเต็มความกว้างบนจอ 320–375px ข้อความยาวจะดันทั้งคอลัมน์จนหน้าเลื่อนข้างได้
 */
export function buttonClass(variant: ButtonVariant = "primary", extra = "", { wrap = false } = {}): string {
  return `${BUTTON_BASE} ${wrap ? "text-center" : "whitespace-nowrap"} ${BUTTON_VARIANTS[variant]} ${extra}`;
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
  const color = tone === "dark" ? "text-leaf-600 hover:text-leaf-700" : "text-leaf-300 hover:text-leaf-200";
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
    neutral: "border-rice-400 bg-rice-50 text-ink-600",
    ember: "border-leaf-200 bg-leaf-50 text-leaf-700",
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
      <span className="h-1.5 w-1.5 rotate-45 bg-leaf-500" />
      <span className={`h-px flex-1 ${line}`} />
    </div>
  );
}

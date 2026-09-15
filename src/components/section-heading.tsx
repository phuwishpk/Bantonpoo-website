import type { ReactNode } from "react";
import { Ed } from "./editable";
import { EyebrowLabel } from "./ui";

/**
 * หัวข้อของ section หนึ่ง ๆ — ข้อความนำ + หัวเรื่อง + คำโปรย
 *
 * แยกออกมาจาก ui.tsx เพราะต้องเรียก <Ed> ซึ่งอ่านสถานะโหมดแก้ไขจากฝั่งเซิร์ฟเวอร์
 * ส่วน ui.tsx ยังต้องใช้ได้ในคอมโพเนนต์ฝั่งไคลเอนต์ด้วย
 *
 * @param at ที่อยู่ของกลุ่มฟิลด์ เช่น g:home-page:featuredSection
 *           ส่งมาเมื่อต้องการให้คลิกแก้บนหน้าเว็บได้ · เว้นไว้ถ้าข้อความนั้นอยู่ในโค้ด
 * @param atEyebrow / atTitle / atDescription
 *           ระบุที่อยู่รายช่องเอง สำหรับกรณีที่สามข้อความไม่ได้อยู่ในกลุ่มเดียวกัน
 *           เช่นหัวข้อของหน้าสินค้าที่ดึงมาจาก "ข้อความบนปุ่มและป้ายกำกับ"
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  tone = "dark",
  align = "left",
  at,
  atEyebrow,
  atTitle,
  atDescription,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "dark" | "light";
  align?: "left" | "center";
  at?: string;
  atEyebrow?: string;
  atTitle?: string;
  atDescription?: string;
}) {
  const titleColor = tone === "dark" ? "text-ink-800" : "text-rice-100";
  const descColor = tone === "dark" ? "text-river-500" : "text-ink-200";
  const alignment = align === "center" ? "text-center items-center" : "";
  const edTone = tone === "dark" ? "dark" : "light";
  const paths = {
    eyebrow: atEyebrow ?? (at ? `${at}.eyebrow` : undefined),
    title: atTitle ?? (at ? `${at}.title` : undefined),
    description: atDescription ?? (at ? `${at}.description` : undefined),
  };

  return (
    <div
      className={`flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between ${
        align === "center" ? "sm:flex-col sm:items-center" : ""
      }`}
    >
      <div className={`flex max-w-2xl flex-col gap-3 ${alignment}`}>
        {eyebrow ? (
          <EyebrowLabel tone={tone === "dark" ? "ember" : "light"}>
            {paths.eyebrow ? (
              <Ed at={paths.eyebrow} tone={edTone}>
                {eyebrow}
              </Ed>
            ) : (
              eyebrow
            )}
          </EyebrowLabel>
        ) : null}

        <h2 className={`font-serif text-2xl leading-snug font-semibold sm:text-3xl ${titleColor}`}>
          {paths.title ? (
            <Ed at={paths.title} tone={edTone}>
              {title}
            </Ed>
          ) : (
            title
          )}
        </h2>

        {description ? (
          <p className={`text-md ${descColor}`}>
            {paths.description ? (
              <Ed at={paths.description} multiline tone={edTone}>
                {description}
              </Ed>
            ) : (
              description
            )}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

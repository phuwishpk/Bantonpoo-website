import { accentVars, lightSurfaceVars } from "@/lib/color";
import type { PageStyle as PageStyleValue } from "@/lib/cms/page-content";

const declarations = (vars: Record<string, string>) =>
  Object.entries(vars)
    .map(([name, value]) => `${name}:${value}`)
    .join(";");

/**
 * สีของทั้งหน้า (กลุ่มฟิลด์ "สีของทั้งหน้า" ของแต่ละหน้า)
 *
 * ฉีดเป็น <style> ท้ายสไตล์ของธีม จึงเขียนทับสีเน้นของธีมได้เฉพาะหน้านี้
 * ค่าทุกค่าผ่านการตรวจรูปแบบ #rrggbb ตอนอ่านแล้ว (readPageStyle) จึงแทรกลง CSS ได้ตรง ๆ
 *
 * @param lightBackgroundOnly ใช้สีพื้นเฉพาะเมื่อเป็นสีอ่อน — หน้ารายละเอียดสินค้า/บทความ
 *                            ยืมสีจากหน้ารวม แต่เนื้อหาถูกออกแบบมาสำหรับพื้นอ่อนเท่านั้น
 */
export function PageStyle({
  style,
  lightBackgroundOnly = false,
}: {
  style: PageStyleValue;
  lightBackgroundOnly?: boolean;
}) {
  const rules: string[] = [];
  if (style.accentColor) rules.push(`:root{${declarations(accentVars(style.accentColor))}}`);

  const background =
    style.backgroundColor && !(lightBackgroundOnly && style.dark) ? style.backgroundColor : undefined;
  if (background) {
    rules.push(`body{background-color:${background}}`);
    // การ์ดและเส้นแบ่งอมสีพื้นเล็กน้อย ให้เข้ากับพื้นที่เปลี่ยนไป (เฉพาะพื้นอ่อน)
    if (!style.dark) rules.push(`#main{${declarations(lightSurfaceVars(background))}}`);
  }

  if (rules.length === 0) return null;
  return <style id="page-style" dangerouslySetInnerHTML={{ __html: rules.join("\n") }} />;
}

/** ค่าสีปัจจุบันของทั้งหน้า สำหรับแผงเปลี่ยนสีในโหมดแก้ไข */
export function pageStyleTarget(at: string, style: PageStyleValue) {
  return {
    at,
    label: "ทั้งหน้านี้",
    kind: "page" as const,
    current: {
      accentColor: style.accentColor,
      backgroundColor: style.backgroundColor,
      cardColor: style.cardColor,
    },
  };
}

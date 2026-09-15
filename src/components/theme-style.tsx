import { buildThemeCss, type ThemeSettings } from "@/lib/theme";

/**
 * ฉีดตัวแปร CSS ของธีมลงในหน้า
 *
 * วางไว้หลังไฟล์สไตล์หลัก เพื่อให้ค่าที่ผู้ดูแลตั้งไว้เขียนทับค่าเริ่มต้นได้
 * เนื้อหาถูกสร้างจากค่าใน CMS ที่ผ่านการกรองแล้ว (ดู sanitiseCustomCss)
 */
export function ThemeStyle({ theme }: { theme: ThemeSettings }) {
  return (
    <style
      id="theme-tokens"
      dangerouslySetInnerHTML={{ __html: buildThemeCss(theme) }}
    />
  );
}

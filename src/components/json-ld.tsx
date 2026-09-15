/**
 * ฝัง JSON-LD ลงในหน้า
 *
 * ค่าที่ส่งเข้ามาเป็นข้อมูลของเราเอง (จาก src/content) ไม่ใช่ข้อมูลจากผู้ใช้
 * จึงปลอดภัยที่จะ stringify ลง script tag โดยตรง
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

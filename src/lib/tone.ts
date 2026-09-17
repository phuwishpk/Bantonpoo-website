/**
 * โทนของตัวอักษร — ใช้ความหมายเดียวกับ prop `tone` ของ <Ed> และ <SectionHeading>
 *
 *   "dark"  ตัวอักษรสีเข้ม สำหรับวางบนพื้นสีอ่อน (ค่าเริ่มต้นของเว็บ)
 *   "light" ตัวอักษรสีอ่อน สำหรับวางบนพื้นสีเข้ม
 *
 * ทุกส่วนและทุกการ์ดที่เปลี่ยนสีพื้นได้ต้องเลือกคลาสจากตารางนี้ แทนการเขียนสีตายตัว
 * ไม่งั้นพอผู้ดูแลเปลี่ยนพื้นเป็นสีเข้ม ข้อความในส่วนนั้นจะอ่านไม่ออก
 *
 * ต้องเขียนคลาสเต็มไว้ในตาราง ห้ามประกอบสตริง เพราะ Tailwind อ่านคลาสจากซอร์สตอน build
 */
export type Tone = "dark" | "light";

export const toneOf = (onDark: boolean): Tone => (onDark ? "light" : "dark");

export const INK = {
  dark: {
    /** หัวเรื่อง */
    title: "text-ink-800",
    /** เนื้อหา */
    body: "text-river-500",
    /** ข้อความรอง เช่น วันที่ เวลาอ่าน */
    muted: "text-river-400",
    /** ป้ายหัวข้อเล็ก / ข้อความที่ต้องการน้ำหนัก */
    label: "text-ink-700",
    /** ตัวเลขหรือข้อความสีเน้น */
    accent: "text-leaf-600",
    /** เส้นแบ่ง */
    line: "border-rice-300",
    /** พื้นช่องกรอกและปุ่มรอง */
    field: "border-rice-300 bg-rice-50 text-ink-800 placeholder:text-river-400 focus:border-ink-800",
    /** ปุ่มเล็กแบบมีกรอบ */
    control: "border-rice-300 bg-rice-50 text-ink-700 hover:border-ink-400",
    /** พื้นเมื่อชี้เมาส์ */
    hover: "hover:bg-rice-200",
    /** การ์ด */
    card: "border-rice-300 bg-rice-50",
    /** กล่องว่าง (ไม่พบผลลัพธ์) */
    empty: "border-rice-400 bg-rice-50",
  },
  light: {
    title: "text-rice-100",
    body: "text-ink-300",
    muted: "text-ink-400",
    label: "text-ink-200",
    accent: "text-leaf-300",
    line: "border-white/10",
    field: "border-white/15 bg-white/5 text-rice-100 placeholder:text-ink-400 focus:border-white/50",
    control: "border-white/15 bg-white/5 text-rice-100 hover:border-white/40",
    hover: "hover:bg-white/10",
    card: "border-white/10 bg-white/[0.04]",
    empty: "border-white/20 bg-white/[0.04]",
  },
} as const;

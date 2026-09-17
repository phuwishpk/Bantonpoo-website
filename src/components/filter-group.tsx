"use client";

import { INK, type Tone } from "@/lib/tone";

/** กลุ่มตัวเลือกแบบเลือกได้หลายข้อ ใช้ซ้ำในทุกตัวกรองของหน้าสินค้า */
export function FilterGroup<T extends string>({
  legend,
  options,
  selected,
  onToggle,
  tone = "dark",
}: {
  legend: string;
  options: { value: T; label: string; count: number }[];
  selected: T[];
  onToggle: (value: T) => void;
  /** โทนตัวอักษรตามพื้นที่วางอยู่ */
  tone?: Tone;
}) {
  const ink = INK[tone];
  return (
    // เส้นคั่นอยู่ที่ div ชั้นนอก ไม่ใช่ fieldset เพราะเมื่อ fieldset มีเส้นขอบ
    // เบราว์เซอร์จะดัน legend เข้าไปในเส้นขอบ ทำให้ระยะห่างของแต่ละกลุ่มไม่เท่ากัน
    <div className={`border-t pt-5 first:border-t-0 first:pt-0 ${ink.line}`}>
      <fieldset>
        <legend className={`mb-3 text-xs font-semibold tracking-label ${ink.label}`}>{legend}</legend>
        <ul className="flex flex-col gap-1">
          {options.map((option) => {
            const checked = selected.includes(option.value);
            // ตัวเลือกที่ไม่เหลือสินค้าให้กรองแล้วจะกดไม่ได้ ยกเว้นตัวที่เลือกอยู่ (ไม่งั้นจะยกเลิกไม่ได้)
            const disabled = option.count === 0 && !checked;
            return (
              <li key={option.value}>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors ${
                    disabled ? "cursor-not-allowed opacity-40" : ink.hover
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => onToggle(option.value)}
                    className="h-4 w-4 shrink-0 accent-leaf-500"
                  />
                  <span className={`flex-1 ${checked ? `font-semibold ${ink.title}` : ink.label}`}>
                    {option.label}
                  </span>
                  <span className={`text-xs tabular-nums ${ink.muted}`}>{option.count}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </div>
  );
}

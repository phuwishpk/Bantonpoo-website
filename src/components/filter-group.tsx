"use client";

/** กลุ่มตัวเลือกแบบเลือกได้หลายข้อ ใช้ซ้ำในทุกตัวกรองของหน้าสินค้า */
export function FilterGroup<T extends string>({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: { value: T; label: string; count: number }[];
  selected: T[];
  onToggle: (value: T) => void;
}) {
  return (
    // เส้นคั่นอยู่ที่ div ชั้นนอก ไม่ใช่ fieldset เพราะเมื่อ fieldset มีเส้นขอบ
    // เบราว์เซอร์จะดัน legend เข้าไปในเส้นขอบ ทำให้ระยะห่างของแต่ละกลุ่มไม่เท่ากัน
    <div className="border-t border-rice-300 pt-5 first:border-t-0 first:pt-0">
      <fieldset>
        <legend className="mb-3 text-xs font-semibold tracking-label text-ink-700">{legend}</legend>
        <ul className="flex flex-col gap-1">
          {options.map((option) => {
            const checked = selected.includes(option.value);
            // ตัวเลือกที่ไม่เหลือสินค้าให้กรองแล้วจะกดไม่ได้ ยกเว้นตัวที่เลือกอยู่ (ไม่งั้นจะยกเลิกไม่ได้)
            const disabled = option.count === 0 && !checked;
            return (
              <li key={option.value}>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors ${
                    disabled ? "cursor-not-allowed opacity-40" : "hover:bg-rice-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => onToggle(option.value)}
                    className="h-4 w-4 shrink-0 accent-leaf-500"
                  />
                  <span className={`flex-1 ${checked ? "font-semibold text-ink-800" : "text-ink-700"}`}>
                    {option.label}
                  </span>
                  <span className="text-xs tabular-nums text-river-400">{option.count}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </div>
  );
}

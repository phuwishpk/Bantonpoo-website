"use client";

import { FieldDescription, FieldError, FieldLabel, useField } from "@payloadcms/ui";
import type { TextFieldClientComponent } from "payload";
import React, { useId } from "react";
import {
  ACCENT_SWATCHES,
  DARK_SWATCHES,
  isDarkColor,
  isHexColor,
  LIGHT_SWATCHES,
  type Swatch,
} from "@/lib/color";

/**
 * ช่องเลือกสีในหลังบ้าน
 *
 * เก็บค่าเป็นรหัส #rrggbb เหมือนช่องข้อความเดิม (ฐานข้อมูลไม่เปลี่ยน) แต่แสดงเป็น
 * จานสีแนะนำ + ตัวเลือกสีของเบราว์เซอร์ + ช่องรหัสสีสำหรับคนที่มีรหัสอยู่แล้ว
 * ปุ่ม "ใช้ค่าเริ่มต้น" ล้างค่าออก ให้กลับไปใช้สีของธีมหรือของทั้งหน้า
 *
 * ชุดสีที่แสดงกำหนดจาก admin.custom.palette ของฟิลด์ (ดู colorField ใน src/fields)
 */
export const ColorField: TextFieldClientComponent = ({ field, path, readOnly, validate }) => {
  const { value, setValue, showError, errorMessage } = useField<string>({
    potentiallyStalePath: path,
    validate: validate as never,
  });
  const inputId = useId();
  const current = typeof value === "string" ? value : "";
  const palette = (field.admin?.custom as { palette?: string } | undefined)?.palette;
  const groups: { title: string; swatches: Swatch[] }[] =
    palette === "accent"
      ? [{ title: "สีแนะนำ", swatches: ACCENT_SWATCHES }]
      : [
          { title: "สีอ่อน", swatches: LIGHT_SWATCHES },
          { title: "สีเข้ม", swatches: DARK_SWATCHES },
        ];

  const choose = (next: string) => {
    if (readOnly) return;
    setValue(next ? next.toLowerCase() : null);
  };

  return (
    <div className="field-type text" style={{ marginBottom: "var(--spacing-field)" }}>
      <FieldLabel htmlFor={inputId} label={field.label} path={path} required={field.required} />
      <FieldError message={errorMessage} path={path} showError={showError} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
        {groups.map((group) => (
          <div key={group.title}>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 6 }}>{group.title}</div>
            <div role="radiogroup" aria-label={group.title} style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {group.swatches.map((swatch) => {
                const selected = current.toLowerCase() === swatch.value;
                return (
                  <button
                    key={swatch.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    title={`${swatch.label} ${swatch.value}`}
                    disabled={readOnly}
                    onClick={() => choose(swatch.value)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      cursor: readOnly ? "default" : "pointer",
                      background: swatch.value,
                      border: "1px solid rgb(128 128 128 / 0.35)",
                      outline: selected ? "2px solid var(--theme-success-500, #2e7d52)" : "none",
                      outlineOffset: 2,
                      color: isDarkColor(swatch.value) ? "#fff" : "#1e232a",
                      fontSize: 14,
                      lineHeight: 1,
                    }}
                  >
                    {selected ? "✓" : ""}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 10 }}>
        <label
          title="เลือกสีอื่น"
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid var(--theme-elevation-150)",
            cursor: readOnly ? "default" : "pointer",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              border: "1px solid rgb(128 128 128 / 0.35)",
              background: isHexColor(current)
                ? current
                : "conic-gradient(#e11d48, #f59e0b, #22c55e, #0ea5e9, #8b5cf6, #e11d48)",
            }}
          />
          <span style={{ fontSize: 13 }}>สีอื่น…</span>
          <input
            type="color"
            value={isHexColor(current) ? current : "#2e7d52"}
            disabled={readOnly}
            onChange={(event) => choose(event.target.value)}
            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "inherit" }}
          />
        </label>

        <input
          id={inputId}
          type="text"
          inputMode="text"
          placeholder="#rrggbb"
          value={current}
          disabled={readOnly}
          maxLength={7}
          onChange={(event) => {
            const text = event.target.value.trim();
            setValue(text ? (text.startsWith("#") ? text : `#${text}`) : null);
          }}
          style={{
            width: 110,
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid var(--theme-elevation-150)",
            background: "var(--theme-input-bg)",
            color: "var(--theme-text)",
            fontFamily: "monospace",
          }}
        />

        <button
          type="button"
          disabled={readOnly || !current}
          onClick={() => choose("")}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid var(--theme-elevation-150)",
            background: "transparent",
            color: "var(--theme-text)",
            cursor: readOnly || !current ? "default" : "pointer",
            opacity: current ? 1 : 0.5,
          }}
        >
          ใช้ค่าเริ่มต้น
        </button>
      </div>

      <FieldDescription description={field.admin?.description} path={path} />
    </div>
  );
};

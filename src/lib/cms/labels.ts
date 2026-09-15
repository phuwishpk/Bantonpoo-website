import { cache } from "react";
import { DEFAULT_LABELS, type Labels } from "@/lib/labels";
import { ALL_LOCALES, getCms } from "./client";
import { isDraftMode } from "./draft";
import { loc } from "./map";

/**
 * อ่านป้ายกำกับจาก Global "ข้อความบนปุ่มและป้ายกำกับ"
 *
 * ค่าตั้งต้นและชนิดข้อมูลอยู่ที่ src/lib/labels.ts — ไฟล์นี้ทำหน้าที่เดียวคือ
 * ดึงค่าจากฐานข้อมูลมาทับค่าตั้งต้น
 */

type Doc = Record<string, unknown>;

/**
 * รวมค่าจาก CMS เข้ากับค่าตั้งต้น
 *
 * ใช้ค่าจาก CMS ก็ต่อเมื่อเป็นข้อความที่ไม่ว่างจริง ๆ — ช่องที่ถูกลบข้อความออก
 * จะตกกลับไปใช้คำตั้งต้น แทนที่จะทำให้ป้ายกำกับหายไปทั้งป้าย
 */
function merge(doc: Doc): Labels {
  const result = {} as Record<string, Record<string, string>>;

  for (const [groupName, defaults] of Object.entries(DEFAULT_LABELS)) {
    const saved = (doc[groupName] ?? {}) as Doc;
    const group: Record<string, string> = {};
    for (const [key, fallback] of Object.entries(defaults)) {
      const value = loc(saved[key] as never).th?.trim();
      group[key] = value || fallback;
    }
    result[groupName] = group;
  }

  return result as Labels;
}

export const getLabels = cache(async (): Promise<Labels> => {
  const [cms, draft] = await Promise.all([getCms(), isDraftMode()]);
  try {
    const doc = (await cms.findGlobal({
      draft,
      slug: "ui-labels",
      locale: ALL_LOCALES,
      depth: 0,
    })) as unknown as Doc;
    return merge(doc);
  } catch {
    // อ่าน global ไม่ได้ (เช่นตารางยังไม่ถูกสร้าง) — ใช้คำตั้งต้นไปก่อน
    return merge({});
  }
});

/**
 * ตรวจทางเปลี่ยนเส้นทางตั้งแต่ต้นจนจบ
 *
 * สร้างรายการทดสอบ → ยิงคำขอจริง → ตรวจรหัสตอบกลับและปลายทาง → ลบทิ้ง
 * รันด้วย: npm run check:redirects  (ต้องมี npm run dev ทำงานอยู่)
 */
import { getPayload } from "payload";
import config from "../src/payload.config";

const BASE = process.env.CHECK_BASE_URL ?? "http://localhost:3100";

let pass = 0;
let fail = 0;

function check(name: string, ok: boolean, extra = "") {
  if (ok) {
    pass++;
    console.log(`  ok   ${name}`);
  } else {
    fail++;
    console.log(`  FAIL ${name} ${extra}`);
  }
}

async function head(path: string) {
  const res = await fetch(BASE + path, { redirect: "manual" });
  return { status: res.status, location: res.headers.get("location") };
}

async function main() {
  const payload = await getPayload({ config });
  const made: (string | number)[] = [];
  const add = async (data: Record<string, unknown>) => {
    const doc = await payload.create({ collection: "redirects", data: data as never });
    made.push(doc.id);
    return doc;
  };
  try {
    await add({ from: "/shop/old-balm", to: "/shop/herbal-liquid-balm", permanent: true });
    await add({ from: "/stories/old-story", to: "/stories/herbal-wisdom", permanent: false });
    await add({ from: "/shop/disabled-one", to: "/shop", enabled: false });

    let r = await head("/shop/old-balm");
    check("ย้ายถาวร → 308", r.status === 308, `ได้ ${r.status}`);
    check("ปลายทางถูกต้อง", (r.location ?? "").endsWith("/shop/herbal-liquid-balm"), String(r.location));

    r = await head("/stories/old-story");
    check("ย้ายชั่วคราว → 307", r.status === 307, `ได้ ${r.status}`);

    r = await head("/shop/disabled-one");
    check("ปิดใช้งานแล้วยังคง 404", r.status === 404, `ได้ ${r.status}`);

    r = await head("/shop/never-existed");
    check("ไม่มีทางเปลี่ยนเส้นทาง → 404", r.status === 404, `ได้ ${r.status}`);

    r = await head("/shop/herbal-liquid-balm");
    check("หน้าที่มีอยู่จริงยังเปิดได้", r.status === 200, `ได้ ${r.status}`);

    // ตัดสแลชท้ายให้เทียบตรงกัน
    r = await head("/shop/old-balm/");
    check("ลิงก์เดิมที่มี / ท้ายก็ยังพาไปได้", r.status === 308, `ได้ ${r.status}`);

    // กันวนไม่รู้จบ
    let looped = false;
    try { await add({ from: "/loop-me", to: "/loop-me" }); } catch { looped = true; }
    check("ปฏิเสธปลายทางที่ชี้กลับหาตัวเอง", looped);

    let badFrom = false;
    try { await add({ from: "https://evil.example", to: "/" }); } catch { badFrom = true; }
    check("ปฏิเสธลิงก์เดิมที่ไม่ใช่เส้นทางในเว็บ", badFrom);

    let badTo = false;
    try { await add({ from: "/x1", to: "http://insecure.example" }); } catch { badTo = true; }
    check("ปฏิเสธปลายทาง http:// ที่ไม่เข้ารหัส", badTo);
  } finally {
    for (const id of made) await payload.delete({ collection: "redirects", id }).catch(() => {});
    console.log("ลบข้อมูลทดสอบแล้ว");
  }
  console.log(`\nผ่าน ${pass} · ไม่ผ่าน ${fail}`);
  process.exit(fail === 0 ? 0 : 1);
}
void main();

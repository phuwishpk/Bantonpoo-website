import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

/** ปิดโหมดดูตัวอย่าง กลับไปดูเว็บฉบับที่เผยแพร่แล้ว */
export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get("path") || "/";
  const draft = await draftMode();
  draft.disable();
  redirect(path.startsWith("/") && !path.startsWith("//") ? path : "/");
}

import Image from "next/image";
import type { ContentBlock } from "@/content/types";
import { t } from "@/lib/i18n";
import { Ed, EdImage } from "./editable";

/**
 * เรนเดอร์เนื้อหาบทความจากบล็อก
 *
 * โครงนี้ตรงกับ Rich Text (Lexical) ของ Payload — ตอนย้ายไป CMS จริง
 * ให้แปลง node ของ Lexical มาเป็น ContentBlock แล้วใช้คอมโพเนนต์นี้ต่อได้เลย
 *
 * @param at ที่อยู่ของฟิลด์เนื้อหา เช่น c:articles:3:content
 *           ส่งมาเพื่อให้คลิกแก้ข้อความบนหน้าเว็บได้ · การเพิ่ม/ลบ/สลับบล็อก
 *           ยังต้องทำในหลังบ้าน เพราะบล็อกใหม่ต้องเลือกชนิดและกรอกฟิลด์ให้ครบ
 */
export function RichText({ blocks, at }: { blocks: ContentBlock[]; at?: string }) {
  return (
    <div className="prose-craft">
      {blocks.map((block, index) => (
        // ใช้ลำดับจริงในหลังบ้าน บล็อกที่อ่านไม่ได้ถูกตัดทิ้งไปแล้ว ตำแหน่งในอาร์เรย์จึงอาจเลื่อน
        <Block key={index} block={block} at={at ? `${at}.${block.sourceIndex ?? index}` : undefined} />
      ))}
    </div>
  );
}

function Block({ block, at }: { block: ContentBlock; at?: string }) {
  switch (block.type) {
    case "heading": {
      const text = t(block.text);
      if (at) {
        return <Ed as={block.level === 2 ? "h2" : "h3"} at={`${at}.text`}>{text}</Ed>;
      }
      return block.level === 2 ? <h2>{text}</h2> : <h3>{text}</h3>;
    }

    case "paragraph":
      return at ? (
        <Ed as="p" at={`${at}.text`} multiline>
          {t(block.text)}
        </Ed>
      ) : (
        <p>{t(block.text)}</p>
      );

    case "list": {
      const items = t(block.items);
      const children = items.map((item, index) =>
        at ? (
          <Ed key={index} as="li" at={`${at}.items.${index}.value`} multiline>
            {item}
          </Ed>
        ) : (
          <li key={index}>{item}</li>
        )
      );
      return block.style === "number" ? <ol>{children}</ol> : <ul>{children}</ul>;
    }

    case "image":
      return (
        <figure className="!mt-10">
          <div className="relative overflow-hidden rounded-xl bg-ink-800">
            <Image
              src={block.media.url}
              alt={t(block.media.alt)}
              width={block.media.width}
              height={block.media.height}
              sizes="(max-width: 768px) 100vw, 46rem"
              className="h-auto w-full"
            />
            {at ? <EdImage at={`${at}.media`} label="ภาพประกอบ" current={block.media.id} /> : null}
          </div>
          {block.media.caption ? (
            <figcaption className="mt-3 text-sm leading-relaxed text-river-500">
              {t(block.media.caption)}
            </figcaption>
          ) : null}
        </figure>
      );

    case "quote":
      return (
        <figure className="!mt-10">
          <blockquote>
            {at ? (
              <Ed at={`${at}.text`} multiline>
                {t(block.text)}
              </Ed>
            ) : (
              t(block.text)
            )}
          </blockquote>
          {block.attribution ? (
            <figcaption className="mt-3 pl-6 text-sm text-river-500">
              —{" "}
              {at ? <Ed at={`${at}.attribution`}>{t(block.attribution)}</Ed> : t(block.attribution)}
            </figcaption>
          ) : null}
        </figure>
      );

    case "youtube":
      return (
        <figure className="!mt-10">
          <div className="aspect-video overflow-hidden rounded-xl bg-ink-900">
            <iframe
              // youtube-nocookie ไม่ตั้งคุกกี้ติดตามจนกว่าผู้ใช้จะกดเล่น
              src={`https://www.youtube-nocookie.com/embed/${block.videoId}`}
              title={t(block.title)}
              loading="lazy"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-0"
            />
          </div>
          <figcaption className="mt-3 text-sm text-river-500">
            {at ? <Ed at={`${at}.title`}>{t(block.title)}</Ed> : t(block.title)}
          </figcaption>
        </figure>
      );
  }
}

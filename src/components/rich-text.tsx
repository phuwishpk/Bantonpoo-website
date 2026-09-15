import Image from "next/image";
import type { ContentBlock } from "@/content/types";
import { t } from "@/lib/i18n";

/**
 * เรนเดอร์เนื้อหาบทความจากบล็อก
 *
 * โครงนี้ตรงกับ Rich Text (Lexical) ของ Payload — ตอนย้ายไป CMS จริง
 * ให้แปลง node ของ Lexical มาเป็น ContentBlock แล้วใช้คอมโพเนนต์นี้ต่อได้เลย
 */
export function RichText({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="prose-craft">
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading": {
      const text = t(block.text);
      return block.level === 2 ? <h2>{text}</h2> : <h3>{text}</h3>;
    }

    case "paragraph":
      return <p>{t(block.text)}</p>;

    case "list": {
      const items = t(block.items);
      const children = items.map((item, index) => <li key={index}>{item}</li>);
      return block.style === "number" ? <ol>{children}</ol> : <ul>{children}</ul>;
    }

    case "image":
      return (
        <figure className="!mt-10">
          <div className="overflow-hidden rounded-xl bg-ink-800">
            <Image
              src={block.media.url}
              alt={t(block.media.alt)}
              width={block.media.width}
              height={block.media.height}
              sizes="(max-width: 768px) 100vw, 46rem"
              className="h-auto w-full"
            />
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
          <blockquote>{t(block.text)}</blockquote>
          {block.attribution ? (
            <figcaption className="mt-3 pl-6 text-sm text-river-500">— {t(block.attribution)}</figcaption>
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
          <figcaption className="mt-3 text-sm text-river-500">{t(block.title)}</figcaption>
        </figure>
      );
  }
}

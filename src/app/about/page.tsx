import Image from "next/image";
import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { ArrowLink, ButtonLink, Container, OrnamentDivider, SectionHeading } from "@/components/ui";
import { craftsmen } from "@/content/craftsmen";
import { img } from "@/content/media";
import { site } from "@/content/site";
import { t } from "@/lib/i18n";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "เกี่ยวกับชุมชน",
  description:
    "ประวัติความเป็นมาของชุมชนบ้านต้นโพธิ์ ต้นกำเนิดมีดอรัญญิก ขั้นตอนการทำมีดแบบดั้งเดิม และทำเนียบครูช่างประจำซุ้ม",
  path: "/about",
  image: "/placeholder/about-heritage.svg",
});

const CRUMBS = [
  { name: "หน้าแรก", path: "/" },
  { name: "เกี่ยวกับชุมชน", path: "/about" },
];

/** ห้าขั้นตอนการทำมีดแบบดั้งเดิม */
const PROCESS = [
  {
    step: "01",
    title: "ตัดเหล็ก",
    body: "คัดเหล็กแหนบที่เนื้อดี ตรวจดูรอยร้าวและสนิมลึก แล้วตัดเป็นท่อนตามขนาดของมีดที่จะทำ",
  },
  {
    step: "02",
    title: "เผาไฟ",
    body: "เผาในเตาถ่านไม้จนเหล็กเปลี่ยนเป็นสีส้มสว่างสม่ำเสมอทั้งชิ้น ช่างใช้สีของเหล็กบอกอุณหภูมิแทนเครื่องวัด",
  },
  {
    step: "03",
    title: "ตีขึ้นรูป",
    body: "ตีซ้ำหลายร้อยครั้งบนทั่ง สลับกับการกลับเข้าเตา จนได้ทรงใบ ความหนา และแนวสันตามที่ต้องการ",
  },
  {
    step: "04",
    title: "ชุบแข็ง",
    body: "จุ่มลงน้ำมันหรือน้ำในจังหวะที่สีและเสียงบอกว่าได้ที่ แล้วอบคลายเครียดเพื่อลดโอกาสที่ใบมีดจะร้าว",
  },
  {
    step: "05",
    title: "เข้าด้ามและลับคม",
    body: "เหลาด้ามไม้ให้เข้ากับอุ้งมือ ประกอบเข้ากับใบ ขัดผิว แล้วลับคมขั้นสุดท้ายด้วยหินลับน้ำ",
  },
];

export default function AboutPage() {
  const heritageImage = img("about-heritage", "ภาพประวัติศาสตร์ของชุมชนช่างตีเหล็กบ้านต้นโพธิ์");
  const communityImage = img("about-community", "ภาพรวมของชุมชนบ้านต้นโพธิ์");

  return (
    <>
      <PageHero
        eyebrow="เกี่ยวกับชุมชน"
        title="บ้านต้นโพธิ์ — หมู่บ้านที่เตาไฟไม่เคยดับ"
        description={t(site.aboutSummary)}
        crumbs={CRUMBS}
      />

      {/* ---------------- ประวัติความเป็นมา ---------------- */}
      <section className="py-16 sm:py-20">
        <Container size="wide">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div className="relative overflow-hidden rounded-2xl bg-steel-800 lg:sticky lg:top-24">
              <Image
                src={heritageImage.url}
                alt={t(heritageImage.alt)}
                width={heritageImage.width}
                height={heritageImage.height}
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-6">
              <SectionHeading
                eyebrow="ประวัติความเป็นมาและรากเหง้าชุมชน"
                title="จากช่างเหล็กชาวเวียงจันทน์ สู่ต้นกำเนิดมีดอรัญญิก"
              />
              <div className="prose-craft">
                <p>
                  เรื่องเล่าที่สืบต่อกันมาในชุมชนระบุว่า บรรพบุรุษของช่างที่นี่เป็นกลุ่มช่างเหล็กจากเวียงจันทน์
                  ที่อพยพเข้ามาตั้งถิ่นฐานในสมัยต้นรัตนโกสินทร์ พวกเขาไม่ได้นำทรัพย์สินติดตัวมามากนัก
                  แต่นำสิ่งที่มีค่ากว่านั้นมาด้วย คือความรู้เรื่องการถลุงและตีเหล็ก
                </p>
                <p>
                  พื้นที่ริมแม่น้ำป่าสักในอำเภอนครหลวงเหมาะกับการตั้งเตาอย่างยิ่ง เพราะมีครบทั้งน้ำสำหรับชุบแข็ง
                  ไม้เนื้อแข็งสำหรับเผาถ่านและทำด้าม และเส้นทางเรือที่ส่งสินค้าออกไปขายได้ถึงกรุงเทพฯ
                </p>
                <h2>ชื่อที่คนทั้งประเทศเรียก</h2>
                <p>
                  ในความเป็นจริง แหล่งตีมีดไม่ได้อยู่ที่ตำบลอรัญญิกเพียงแห่งเดียว หากกระจายอยู่ในหลายหมู่บ้าน
                  ของอำเภอนครหลวง ซึ่งบ้านต้นโพธิ์ ตำบลท่าช้าง เป็นหนึ่งในนั้น ชื่อ “มีดอรัญญิก” ติดปากขึ้นมา
                  เพราะตำบลอรัญญิกเคยเป็นจุดรวบรวมและซื้อขายสินค้าของพ่อค้าจากต่างถิ่น
                </p>
                <h2>สิ่งที่ยังไม่เปลี่ยน</h2>
                <p>
                  ทุกวันนี้จำนวนซุ้มตีมีดในชุมชนเหลือไม่มากเท่าเมื่อก่อน เพราะมีดจากโรงงานเข้ามาแข่งด้วยราคา
                  แต่ซุ้มที่ยังอยู่เลือกเดินทางที่ต่างออกไป คือไม่แข่งที่ราคา แต่แข่งที่คุณภาพของคม
                  ความประณีตของงานเก็บรายละเอียด และเรื่องราวเบื้องหลังมีดแต่ละเล่ม
                </p>
              </div>
              <div>
                <ArrowLink href="/stories/from-vientiane-to-ayutthaya">
                  อ่านบทความเต็มเรื่องรากเหง้าชุมชน
                </ArrowLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------- ขั้นตอนการทำมีด ---------------- */}
      <section className="bg-steel-800 py-16 sm:py-20">
        <Container size="wide">
          <SectionHeading
            eyebrow="ขั้นตอนการทำมีดแบบดั้งเดิม"
            title="ห้าขั้นตอนที่มีดทุกเล่มต้องผ่าน"
            description="ตั้งแต่เหล็กท่อนหนึ่งจนกลายเป็นมีดที่พร้อมใช้งาน ทุกขั้นตอนทำด้วยมือในชุมชน"
            tone="light"
          />
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PROCESS.map((item) => (
              <li
                key={item.step}
                className="flex flex-col gap-3 rounded-card border border-white/10 bg-white/[0.03] p-5 transition duration-300 ease-craft hover:border-ember-500/50 hover:bg-white/[0.06]"
              >
                <span className="font-serif text-2xl font-bold text-ember-400">{item.step}</span>
                <h3 className="font-serif text-base font-semibold text-rice-100">{item.title}</h3>
                <p className="text-sm leading-relaxed text-steel-300">{item.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ---------------- ทำเนียบครูช่าง ---------------- */}
      <section className="py-16 sm:py-20">
        <Container size="wide">
          <SectionHeading
            eyebrow="ช่างฝีมือและปราชญ์ชาวบ้าน"
            title="ทำเนียบครูช่างประจำซุ้ม"
            description="มีดทุกเล่มจากชุมชนระบุชื่อช่างผู้ตีเสมอ เพราะงานหัตถกรรมคือฝีมือของคน ไม่ใช่ของเครื่องจักร"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {craftsmen.map((craftsman) => (
              <article
                key={craftsman.slug}
                className="flex flex-col overflow-hidden rounded-card border border-rice-300 bg-rice-50 transition duration-300 ease-craft hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="relative aspect-square overflow-hidden bg-rice-300">
                  <Image
                    src={craftsman.photo.url}
                    alt={t(craftsman.photo.alt)}
                    width={craftsman.photo.width}
                    height={craftsman.photo.height}
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-3 left-3 rounded-full bg-steel-800/90 px-2.5 py-1 text-[0.6875rem] font-semibold text-rice-100">
                    ตีเหล็กมาแล้ว {craftsman.yearsOfCraft} ปี
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2.5 p-5">
                  <h3 className="font-serif text-base font-semibold text-steel-800">{t(craftsman.name)}</h3>
                  <p className="text-xs font-medium text-ember-600">{t(craftsman.title)}</p>
                  <p className="text-sm leading-relaxed text-forged-500">{t(craftsman.bio)}</p>
                  <p className="mt-auto border-t border-rice-300 pt-3 text-xs text-forged-400">
                    ถนัด: {t(craftsman.specialty)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------------- ปิดท้าย ---------------- */}
      <section className="pb-4">
        <Container size="wide">
          <OrnamentDivider />
          <div className="mt-12 grid items-center gap-8 overflow-hidden rounded-2xl border border-rice-300 bg-rice-50 lg:grid-cols-2">
            <div className="relative aspect-video lg:aspect-auto lg:h-full">
              <Image
                src={communityImage.url}
                alt={t(communityImage.alt)}
                width={communityImage.width}
                height={communityImage.height}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-5 p-8 sm:p-10">
              <h2 className="font-serif text-2xl leading-snug font-semibold text-steel-800">
                มาเห็นด้วยตาตัวเองดีกว่า
              </h2>
              <p className="text-[0.9375rem] leading-relaxed text-forged-500">
                ชุมชนเปิดให้เข้าชมซุ้มตีมีดได้ทุกวัน และมีฐานเรียนรู้ที่ให้ลองตีมีดด้วยตัวเอง
                หากมาเป็นหมู่คณะ กรุณานัดหมายล่วงหน้าเพื่อให้ช่างเตรียมเตาไว้รอ
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/tourism">ดูกิจกรรมและการเดินทาง</ButtonLink>
                <ButtonLink href="/shop" variant="secondary">
                  เลือกชมสินค้าชุมชน
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <JsonLd data={breadcrumbJsonLd(CRUMBS)} />
    </>
  );
}

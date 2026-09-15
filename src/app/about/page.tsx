import Image from "next/image";
import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { ArrowLink, ButtonLink, Container, OrnamentDivider, SectionHeading } from "@/components/ui";
import { artisans } from "@/content/artisans";
import { img } from "@/content/media";
import { site } from "@/content/site";
import { t } from "@/lib/i18n";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "เกี่ยวกับชุมชน",
  description:
    "ประวัติความเป็นมาของชุมชนไทยเชื้อสายมอญบ้านต้นโพธิ์ ตำบลบางขะแยง อำเภอเมืองปทุมธานี ทุนชุมชน และทำเนียบปราชญ์ชุมชน",
  path: "/about",
  image: "/placeholder/about-heritage.svg",
});

const CRUMBS = [
  { name: "หน้าแรก", path: "/" },
  { name: "เกี่ยวกับชุมชน", path: "/about" },
];

/**
 * ทุนชุมชน — รายการนี้อ้างอิงตรงจากวิกิชุมชน ศูนย์มานุษยวิทยาสิรินธร
 * ไม่ได้เพิ่มเติมเอง เพื่อให้ตรวจย้อนกลับไปยังแหล่งข้อมูลได้
 */
const COMMUNITY_ASSETS = [
  {
    step: "01",
    title: "ชุมชนชาวมอญ",
    body: "กลุ่มชาติพันธุ์ไทยเชื้อสายมอญที่ตั้งถิ่นฐานริมฝั่งเจ้าพระยามาหลายร้อยปี ยังใช้ภาษามอญผสมภาษาไทยในชุมชน",
  },
  {
    step: "02",
    title: "วัดเจตวงศ์",
    body: "โบราณสถานอายุหลายร้อยปี ขึ้นทะเบียนโดยกรมศิลปากร พ.ศ. 2530 และบูรณะพร้อมอนุรักษ์จิตรกรรมฝาผนังใน พ.ศ. 2551",
  },
  {
    step: "03",
    title: "ศูนย์การเรียนรู้เศรษฐกิจพอเพียง",
    body: "ศูนย์การเรียนรู้และขับเคลื่อนปรัชญาเศรษฐกิจพอเพียงบ้านต้นโพธิ์ เป็นจุดรับคณะศึกษาดูงานของชุมชน",
  },
  {
    step: "04",
    title: "จุดชมทัศนียภาพริมเจ้าพระยา",
    body: "จุดนั่งพักริมน้ำที่เห็นเรือสัญจรและภาพรวมการตั้งถิ่นฐานแบบเกาะริมฝั่งได้ชัดที่สุด",
  },
  {
    step: "05",
    title: "แม่น้ำเจ้าพระยา",
    body: "ทิศตะวันออกของชุมชนติดแม่น้ำเจ้าพระยาโดยตรง เป็นทั้งเส้นทางสัญจรดั้งเดิมและหัวใจของวิถีชีวิตริมน้ำ",
  },
  {
    step: "06",
    title: "ยาหม่องน้ำสมุนไพรบ้านต้นโพธิ์",
    body: "ผลิตภัณฑ์เรือธงของวิสาหกิจชุมชนสมุนไพรบ้านต้นโพธิ์ และเป็นภูมิปัญญาที่ทำให้ชื่อชุมชนเป็นที่รู้จัก",
  },
];

/** ตัวเลขของชุมชน จากรายงานสัมมาชีพชุมชนและวิกิชุมชน */
const COMMUNITY_FACTS = [
  { value: "5,870", label: "ประชากรรวม (ชาย 2,766 · หญิง 3,104)" },
  { value: "2,777", label: "ครัวเรือน" },
  { value: "45 ไร่", label: "พื้นที่เกษตร (นา 15 ไร่ · สวน 30 ไร่)" },
  { value: "หมู่ที่ 1", label: "ตำบลบางขะแยง อำเภอเมืองปทุมธานี" },
];

export default function AboutPage() {
  const heritageImage = img("about-heritage", "ภาพประวัติศาสตร์ชุมชนมอญบ้านต้นโพธิ์ริมแม่น้ำเจ้าพระยา");
  const communityImage = img("about-community", "ภาพรวมชุมชนบ้านต้นโพธิ์ริมแม่น้ำเจ้าพระยา");

  return (
    <>
      <PageHero
        eyebrow="เกี่ยวกับชุมชน"
        title="บ้านต้นโพธิ์ — ชุมชนมอญที่ตั้งถิ่นฐานริมเจ้าพระยามาหลายร้อยปี"
        description={t(site.aboutSummary)}
        crumbs={CRUMBS}
      />

      {/* ---------------- ประวัติความเป็นมา ---------------- */}
      <section className="py-16 sm:py-20">
        <Container size="wide">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div className="relative overflow-hidden rounded-2xl bg-ink-800 lg:sticky lg:top-24">
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
                title="จากเมืองเมาะตะมะ สู่ริมฝั่งแม่น้ำเจ้าพระยา"
              />
              <div className="prose-craft">
                <p>
                  บ้านต้นโพธิ์ หมู่ที่ 1 ตำบลบางขะแยง อำเภอเมืองปทุมธานี เป็นชุมชนกลุ่มชาติพันธุ์ไทยเชื้อสายมอญ
                  อาศัยอยู่บริเวณริมฝั่งแม่น้ำเจ้าพระยา ต้นทางของชุมชนมาจากการอพยพย้ายถิ่นฐานของชาวมอญเมืองเมาะตะมะ
                  ที่เดินทางเข้ามาเพื่อหลีกหนีจากภาวะสงคราม และตั้งถิ่นฐานอยู่บริเวณนี้สืบมา
                </p>
                <h2>ที่มาของชื่อชุมชน</h2>
                <p>
                  ในอดีตบริเวณนี้มีการสัญจรทางน้ำผ่านไปมา และมีต้นโพธิ์ขนาดใหญ่ที่อยู่มาก่อน
                  ผู้คนจึงยึดเอาต้นโพธิ์นี้เป็นสัญลักษณ์บ่งบอกตำแหน่งพื้นที่ และใช้เป็นชื่อเรียกชุมชนบริเวณนี้สืบมาจนถึงปัจจุบัน
                </p>
                <h2>ชุมชนเมืองที่ยังมีวัฒนธรรมเป็นแกน</h2>
                <p>
                  ปัจจุบันบ้านต้นโพธิ์จัดเป็นชุมชนเมือง/ชานเมือง อยู่ในเขตเทศบาลตำบลบางขะแยง
                  ใกล้พื้นที่เศรษฐกิจและโรงงานอุตสาหกรรม อาชีพของคนในชุมชนจึงหลากหลาย
                  ทั้งรับจ้างทั่วไป พนักงานโรงงาน ลูกจ้าง ค้าขาย และธุรกิจส่วนตัว มีเพียงส่วนน้อยที่ทำเกษตรกรรม
                </p>
                <p>
                  แม้วิถีประจำวันของคนวัยทำงานจะคล้ายชุมชนเมืองทั่วไป แต่กลุ่มผู้สูงอายุยังคงรักษาวัฒนธรรมท้องถิ่นไว้ได้
                  โดยมีวัดเจตวงศ์เป็นศูนย์กลาง และมีกลุ่มวิสาหกิจชุมชนสมุนไพรบ้านต้นโพธิ์เป็นกลุ่มอาชีพที่ช่วยสร้างรายได้เสริม
                </p>
              </div>

              <dl className="grid grid-cols-2 gap-4 border-t border-rice-300 pt-6">
                {COMMUNITY_FACTS.map((fact) => (
                  <div key={fact.label}>
                    <dt className="font-serif text-xl font-bold text-leaf-600">{fact.value}</dt>
                    <dd className="mt-1 text-xs leading-relaxed text-river-500">{fact.label}</dd>
                  </div>
                ))}
              </dl>

              <div>
                <ArrowLink href="/stories/mon-heritage">อ่านบทความเต็มเรื่องรากเหง้าชุมชน</ArrowLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------- ทุนชุมชน ---------------- */}
      <section className="bg-ink-800 py-16 sm:py-20">
        <Container size="wide">
          <SectionHeading
            eyebrow="ทุนชุมชน"
            title="หกสิ่งที่เป็นต้นทุนของบ้านต้นโพธิ์"
            description="รายการนี้อ้างอิงตรงจากวิกิชุมชน ศูนย์มานุษยวิทยาสิรินธร ทั้งด้านผู้คน สถานที่ และผลิตภัณฑ์"
            tone="light"
          />
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COMMUNITY_ASSETS.map((item) => (
              <li
                key={item.step}
                className="flex flex-col gap-3 rounded-card border border-white/10 bg-white/[0.03] p-5 transition duration-300 ease-craft hover:border-leaf-500/50 hover:bg-white/[0.06]"
              >
                <span className="font-serif text-2xl font-bold text-leaf-400">{item.step}</span>
                <h3 className="font-serif text-base font-semibold text-rice-100">{item.title}</h3>
                <p className="text-sm leading-relaxed text-ink-300">{item.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ---------------- ทำเนียบครูช่าง ---------------- */}
      <section className="py-16 sm:py-20">
        <Container size="wide">
          <SectionHeading
            eyebrow="ปราชญ์ชาวบ้านและผู้นำกลุ่มอาชีพ"
            title="ทำเนียบปราชญ์ชุมชน"
            description="ผู้ที่ขับเคลื่อนภูมิปัญญาสมุนไพรและกลุ่มวิสาหกิจชุมชนของบ้านต้นโพธิ์"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:max-w-3xl">
            {artisans.map((artisan) => (
              <article
                key={artisan.slug}
                className="flex flex-col overflow-hidden rounded-card border border-rice-300 bg-rice-50 transition duration-300 ease-craft hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="relative aspect-square overflow-hidden bg-rice-300">
                  <Image
                    src={artisan.photo.url}
                    alt={t(artisan.photo.alt)}
                    width={artisan.photo.width}
                    height={artisan.photo.height}
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2.5 p-5">
                  <h3 className="font-serif text-base font-semibold text-ink-800">{t(artisan.name)}</h3>
                  <p className="text-xs font-medium text-leaf-600">{t(artisan.title)}</p>
                  <p className="text-sm leading-relaxed text-river-500">{t(artisan.bio)}</p>
                  <div className="mt-auto flex flex-col gap-1 border-t border-rice-300 pt-3">
                    <p className="text-xs text-river-400">บทบาท: {t(artisan.specialty)}</p>
                    {artisan.source ? (
                      <p className="text-[0.6875rem] text-river-400">ที่มาข้อมูล: {t(artisan.source)}</p>
                    ) : null}
                  </div>
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
              <h2 className="font-serif text-2xl leading-snug font-semibold text-ink-800">
                มาเห็นด้วยตาตัวเองดีกว่า
              </h2>
              <p className="text-[0.9375rem] leading-relaxed text-river-500">
                ชุมชนเปิดรับผู้มาเยือนและคณะศึกษาดูงาน มีทั้งฐานเรียนรู้สมุนไพรที่ลงมือทำเองได้
                และเส้นทางเดินชมวัดเจตวงศ์กับจุดชมวิวริมน้ำ กรุณานัดหมายล่วงหน้าเพื่อให้ชุมชนจัดผู้นำชม
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

      {/* แหล่งอ้างอิง — ระบุให้ชัดว่าข้อมูลประวัติและตัวเลขมาจากไหน */}
      <section className="pt-16">
        <Container size="wide">
          <div className="rounded-card border border-rice-300 bg-rice-50 p-6">
            <h2 className="mb-3 text-xs font-semibold tracking-label text-river-500">แหล่งอ้างอิง</h2>
            <ul className="flex flex-col gap-2 text-sm leading-relaxed text-river-500">
              <li>
                วิกิชุมชน ศูนย์มานุษยวิทยาสิรินธร (องค์การมหาชน). ข้อมูลชุมชนบ้านต้นโพธิ์.
                เรียบเรียงโดย กฤษฎา อุ่นลาวรรณ, 4 มกราคม 2567.
              </li>
              <li>เทศบาลตำบลบางขะแยง. (2564). แผนพัฒนาท้องถิ่น (พ.ศ. 2566–2570).</li>
              <li>
                สำนักงานพัฒนาชุมชนอำเภอเมืองปทุมธานี. (2561). รายงานสารสนเทศสัมมาชีพชุมชนระดับหมู่บ้าน
                บ้านต้นโพธิ์ หมู่ 1 ตำบลบางขะแยง.
              </li>
              <li>
                กันตชา ศรีอยุธย์. (2564). การศึกษากระบวนการการมีส่วนร่วมของชุมชนท่องเที่ยวโอทอปนวัตวิถี
                บ้านต้นโพธิ์ จังหวัดปทุมธานี เพื่อการท่องเที่ยวอย่างยั่งยืน. บัณฑิตวิทยาลัย มหาวิทยาลัยศรีนครินทรวิโรฒ.
              </li>
            </ul>
          </div>
        </Container>
      </section>

      <JsonLd data={breadcrumbJsonLd(CRUMBS)} />
    </>
  );
}

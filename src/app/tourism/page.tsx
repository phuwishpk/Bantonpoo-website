import Image from "next/image";
import type { Metadata } from "next";
import { ClockIcon, LineIcon, MapPinIcon, PhoneIcon, UsersIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { WorkshopBookingButton } from "@/components/line-order-button";
import { directionsUrl, MapEmbed } from "@/components/map-embed";
import { PageHero } from "@/components/page-hero";
import { buttonClass, Container, OrnamentDivider, SectionHeading } from "@/components/ui";
import { site } from "@/content/site";
import { places, workshops } from "@/content/workshops";
import { formatPrice } from "@/lib/format";
import { t } from "@/lib/i18n";
import { telUrl } from "@/lib/line";
import { breadcrumbJsonLd, buildMetadata, workshopJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "การท่องเที่ยวและกิจกรรม",
  description:
    "ฐานเรียนรู้การตีมีด เวิร์กช็อปงานหนังและงานไม้ กิจกรรมวิถีเกษตร พร้อมแผนที่จุดเช็กอินและโฮมสเตย์ในชุมชนบ้านต้นโพธิ์",
  path: "/tourism",
  image: "/placeholder/workshop-forge.svg",
});

const CRUMBS = [
  { name: "หน้าแรก", path: "/" },
  { name: "ท่องเที่ยวและกิจกรรม", path: "/tourism" },
];

const PLACE_KIND_LABELS = {
  "workshop-site": "ฐานเรียนรู้",
  homestay: "ที่พัก",
  landmark: "จุดเช็กอิน",
  shop: "ร้านค้า",
} as const;

const TRAVEL_OPTIONS = [
  {
    title: "รถยนต์ส่วนตัว",
    body: "จากกรุงเทพฯ ใช้ถนนสายเอเชีย (ทางหลวง 32) มุ่งหน้าอยุธยา แล้วเลี้ยวเข้าอำเภอนครหลวง รวมระยะทางประมาณ 90 กิโลเมตร ใช้เวลาราว 1 ชั่วโมง 30 นาที มีที่จอดรถในชุมชน",
  },
  {
    title: "รถโดยสารประจำทาง",
    body: "ขึ้นรถทัวร์หรือรถตู้สายกรุงเทพฯ–อยุธยา ลงที่ตัวเมืองอยุธยา แล้วต่อรถสองแถวหรือรถรับจ้างเข้าอำเภอนครหลวงอีกประมาณ 20 นาที",
  },
  {
    title: "รถไฟ",
    body: "ลงสถานีอยุธยา แล้วต่อรถรับจ้างเข้าชุมชนประมาณ 25 นาที เหมาะกับผู้ที่เดินทางมาแบบไม่เร่งรีบและอยากแวะเที่ยวตัวเมืองด้วย",
  },
];

export default function TourismPage() {
  return (
    <>
      <PageHero
        eyebrow="การท่องเที่ยวและกิจกรรม"
        title="มาถึงบ้านต้นโพธิ์แล้วได้ลงมือทำจริง"
        description="ชุมชนเปิดเตาให้ผู้มาเยือนได้ทดลองตีมีดด้วยตัวเอง พร้อมฐานเรียนรู้งานหนัง งานไม้ และวิถีเกษตร จองล่วงหน้าผ่าน LINE ได้ทุกกิจกรรม"
        crumbs={CRUMBS}
      >
        <div className="flex flex-wrap gap-3 pt-2">
          <a href={site.lineUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("primary")}>
            <LineIcon />
            จองกิจกรรมผ่าน LINE
          </a>
          <a href={telUrl} className={buttonClass("onDark")}>
            <PhoneIcon />
            โทรนัดหมาย {site.phoneDisplay}
          </a>
        </div>
      </PageHero>

      {/* ---------------- เวิร์กช็อป ---------------- */}
      <section className="py-14 sm:py-20">
        <Container size="wide">
          <SectionHeading
            eyebrow="กิจกรรมสาธิตและเวิร์กช็อป"
            title="ฐานเรียนรู้ที่เปิดให้เข้าร่วม"
            description="ทุกฐานมีครูช่างประจำดูแลตลอดกิจกรรม รับจำนวนจำกัดต่อรอบเพื่อให้ดูแลได้ทั่วถึงและปลอดภัย"
          />

          <div className="mt-10 flex flex-col gap-8">
            {workshops.map((workshop, index) => (
              <article
                key={workshop.slug}
                className="grid overflow-hidden rounded-2xl border border-rice-300 bg-rice-50 lg:grid-cols-[1fr_1.2fr]"
              >
                <div className={`relative aspect-3/2 lg:aspect-auto ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                  <Image
                    src={workshop.image.url}
                    alt={t(workshop.image.alt)}
                    width={workshop.image.width}
                    height={workshop.image.height}
                    priority={index === 0}
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-col gap-5 p-6 sm:p-8">
                  <div className="flex flex-col gap-3">
                    <h3 className="font-serif text-xl leading-snug font-semibold text-steel-800 sm:text-2xl">
                      {t(workshop.title)}
                    </h3>
                    <p className="text-[0.9375rem] leading-relaxed text-forged-500">{t(workshop.summary)}</p>
                  </div>

                  <dl className="grid grid-cols-2 gap-4 border-y border-rice-300 py-4 sm:grid-cols-3">
                    <div className="flex flex-col gap-1">
                      <dt className="flex items-center gap-1.5 text-xs text-forged-500">
                        <ClockIcon className="h-4 w-4" />
                        ระยะเวลา
                      </dt>
                      <dd className="text-sm font-semibold text-steel-800">{t(workshop.duration)}</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="flex items-center gap-1.5 text-xs text-forged-500">
                        <UsersIcon className="h-4 w-4" />
                        จำนวนผู้เข้าร่วม
                      </dt>
                      <dd className="text-sm font-semibold text-steel-800">
                        {workshop.minParticipants}–{workshop.maxParticipants} คน / รอบ
                      </dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="text-xs text-forged-500">ค่าบริการ</dt>
                      <dd className="font-serif text-lg font-bold text-ember-600">
                        {workshop.pricePerPerson === null
                          ? "สอบถามราคา"
                          : `${formatPrice(workshop.pricePerPerson)} / คน`}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex flex-col gap-2 text-sm leading-relaxed text-steel-700">
                    {t(workshop.description).map((paragraph, paragraphIndex) => (
                      <p key={paragraphIndex}>{paragraph}</p>
                    ))}
                  </div>

                  {workshop.takeaway ? (
                    <p className="rounded-lg bg-ember-50 px-4 py-3 text-sm text-ember-700">
                      <span className="font-semibold">ได้กลับบ้าน:</span> {t(workshop.takeaway)}
                    </p>
                  ) : null}

                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-semibold tracking-label text-steel-700">เงื่อนไขการจอง</h4>
                    <ul className="flex flex-col gap-1.5">
                      {t(workshop.bookingNotes).map((note, noteIndex) => (
                        <li key={noteIndex} className="flex gap-2.5 text-sm leading-relaxed text-forged-500">
                          <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-ember-500" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-1">
                    <WorkshopBookingButton workshop={workshop} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------------- จุดเช็กอินและโฮมสเตย์ ---------------- */}
      <section className="bg-steel-800 py-14 sm:py-20">
        <Container size="wide">
          <SectionHeading
            eyebrow="แผนที่จุดเช็กอินและโฮมสเตย์"
            title="จุดแวะในชุมชน"
            description="เดินชมได้ภายในวันเดียว หรือจะพักค้างคืนที่โฮมสเตย์ของคนในชุมชนก็ได้"
            tone="light"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {places.map((place) => (
              <article
                key={place.slug}
                className="flex flex-col overflow-hidden rounded-card border border-white/10 bg-white/[0.03] transition duration-300 ease-craft hover:border-ember-500/50"
              >
                <div className="relative aspect-3/2">
                  <Image
                    src={place.image.url}
                    alt={t(place.image.alt)}
                    width={place.image.width}
                    height={place.image.height}
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-steel-950/80 px-2.5 py-1 text-[0.6875rem] font-semibold text-ember-300">
                    {PLACE_KIND_LABELS[place.kind]}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2.5 p-5">
                  <h3 className="font-serif text-base font-semibold text-rice-100">{t(place.name)}</h3>
                  <p className="text-sm leading-relaxed text-steel-300">{t(place.description)}</p>
                  {place.openingHours ? (
                    <p className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-steel-400">
                      <ClockIcon className="h-3.5 w-3.5" />
                      {t(place.openingHours)}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------------- การเดินทาง ---------------- */}
      <section className="py-14 sm:py-20">
        <Container size="wide">
          <SectionHeading
            eyebrow="แผนที่และการเดินทาง"
            title="มาถึงบ้านต้นโพธิ์ได้อย่างไร"
            description={t(site.address)}
          />

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
            <div className="overflow-hidden rounded-2xl border border-rice-300">
              <div className="aspect-4/3">
                <MapEmbed />
              </div>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-rice-50 py-3.5 text-sm font-semibold text-steel-800 transition-colors hover:bg-rice-200"
              >
                <MapPinIcon className="h-[18px] w-[18px]" />
                เปิดนำทางด้วย Google Maps
              </a>
            </div>

            <div className="flex flex-col gap-4">
              {TRAVEL_OPTIONS.map((option) => (
                <div key={option.title} className="rounded-card border border-rice-300 bg-rice-50 p-5">
                  <h3 className="mb-2 font-serif text-base font-semibold text-steel-800">{option.title}</h3>
                  <p className="text-sm leading-relaxed text-forged-500">{option.body}</p>
                </div>
              ))}

              <div className="rounded-card border border-ember-200 bg-ember-50 p-5">
                <h3 className="mb-2 font-serif text-base font-semibold text-ember-800">ก่อนออกเดินทาง</h3>
                <p className="text-sm leading-relaxed text-ember-700">
                  {t(site.openingHours)} หากมาเป็นหมู่คณะหรือต้องการเข้าร่วมฐานเรียนรู้
                  กรุณาทักมาทาง LINE {site.lineId} เพื่อนัดหมายล่วงหน้า ช่างจะได้เตรียมเตาและอุปกรณ์ไว้รอ
                </p>
              </div>
            </div>
          </div>

          <div className="mt-14">
            <OrnamentDivider />
          </div>
        </Container>
      </section>

      <JsonLd data={[...workshops.map(workshopJsonLd), breadcrumbJsonLd(CRUMBS)]} />
    </>
  );
}

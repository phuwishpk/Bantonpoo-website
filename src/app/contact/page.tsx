import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { ClockIcon, FacebookIcon, LineIcon, MailIcon, MapPinIcon, PhoneIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { directionsUrl, MapEmbed } from "@/components/map-embed";
import { PageHero } from "@/components/page-hero";
import { Container, SectionHeading } from "@/components/ui";
import { site } from "@/content/site";
import { t } from "@/lib/i18n";
import { telUrl } from "@/lib/line";
import { breadcrumbJsonLd, buildMetadata, localBusinessJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "ติดต่อเรา",
  description:
    "ติดต่อวิสาหกิจชุมชนบ้านต้นโพธิ์ ตำบลท่าช้าง อำเภอนครหลวง จังหวัดพระนครศรีอยุธยา ทั้งทางโทรศัพท์ LINE Official Account และ Facebook",
  path: "/contact",
});

const CRUMBS = [
  { name: "หน้าแรก", path: "/" },
  { name: "ติดต่อเรา", path: "/contact" },
];

export default function ContactPage() {
  const channels = [
    {
      icon: LineIcon,
      label: "LINE Official Account",
      value: site.lineId,
      href: site.lineUrl,
      note: "ช่องทางที่ตอบเร็วที่สุด เหมาะกับการสอบถามสินค้าและจองกิจกรรม",
      external: true,
      highlight: true,
    },
    {
      icon: PhoneIcon,
      label: "โทรศัพท์ผู้ประสานงาน",
      value: site.phoneDisplay,
      href: telUrl,
      note: "รับสายในเวลาทำการ หากไม่สะดวกรับสายเพราะอยู่หน้าเตา กรุณาฝากข้อความไว้",
      external: false,
      highlight: false,
    },
    {
      icon: FacebookIcon,
      label: "Facebook Fanpage",
      value: "วิสาหกิจชุมชนบ้านต้นโพธิ์",
      href: site.facebookUrl,
      note: "ติดตามภาพงานใหม่ ๆ จากเตา และประกาศกิจกรรมประจำปี",
      external: true,
      highlight: false,
    },
    {
      icon: MailIcon,
      label: "อีเมล",
      value: site.email,
      href: `mailto:${site.email}`,
      note: "เหมาะกับงานขายส่ง งานสั่งทำจำนวนมาก และการติดต่อเชิงธุรกิจ",
      external: false,
      highlight: false,
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="ติดต่อเรา"
        title="คุยกับชุมชนโดยตรง"
        description="ไม่ว่าจะสั่งซื้อมีด ขอใบเสนอราคาสำหรับงานสั่งทำ หรือนัดหมายพาคณะเข้าชมชุมชน ทักมาได้ทุกช่องทาง"
        crumbs={CRUMBS}
      />

      {/* ---------------- ช่องทางติดต่อ ---------------- */}
      <section className="py-14 sm:py-16">
        <Container size="wide">
          <div className="grid gap-4 sm:grid-cols-2">
            {channels.map((channel) => {
              const Icon = channel.icon;
              return (
                <a
                  key={channel.label}
                  href={channel.href}
                  {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`group flex gap-4 rounded-card border p-5 transition duration-300 ease-craft hover:-translate-y-0.5 hover:shadow-lift ${
                    channel.highlight
                      ? "border-ember-200 bg-ember-50"
                      : "border-rice-300 bg-rice-50 hover:border-steel-400"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                      channel.highlight ? "bg-ember-500 text-white" : "bg-steel-800 text-rice-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold tracking-label text-forged-500">{channel.label}</p>
                    <p className="font-serif text-lg font-semibold text-steel-800">{channel.value}</p>
                    <p className="mt-1 text-sm leading-relaxed text-forged-500">{channel.note}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ---------------- ฟอร์ม + ข้อมูลที่ตั้ง ---------------- */}
      <section className="pb-16 sm:pb-20">
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            <div className="flex flex-col gap-7">
              <SectionHeading
                eyebrow="ฟอร์มสอบถาม"
                title="ส่งข้อความถึงผู้ประสานงานชุมชน"
                description="กรอกข้อมูลไว้ แล้วทีมงานจะติดต่อกลับภายในเวลาทำการ"
              />
              <ContactForm />
            </div>

            <div className="flex flex-col gap-5">
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

              <div className="flex flex-col gap-4 rounded-card border border-rice-300 bg-rice-50 p-5">
                <div className="flex gap-3">
                  <MapPinIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-ember-600" />
                  <div>
                    <p className="text-xs font-semibold tracking-label text-forged-500">ที่ตั้ง</p>
                    <p className="mt-1 text-sm leading-relaxed text-steel-800">{t(site.address)}</p>
                    <p className="mt-1 text-xs text-forged-400">
                      พิกัด {site.mapLatitude}, {site.mapLongitude}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 border-t border-rice-300 pt-4">
                  <ClockIcon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-ember-600" />
                  <div>
                    <p className="text-xs font-semibold tracking-label text-forged-500">เวลาทำการ</p>
                    <p className="mt-1 text-sm leading-relaxed text-steel-800">{t(site.openingHours)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <JsonLd data={[localBusinessJsonLd(), breadcrumbJsonLd(CRUMBS)]} />
    </>
  );
}

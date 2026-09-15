import Image from "next/image";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { FlameIcon, HammerIcon, LineIcon, MapPinIcon, PhoneIcon, UsersIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { ArrowLink, ButtonLink, buttonClass, Container, EyebrowLabel, SectionHeading } from "@/components/ui";
import { getArticle, getLatestArticles } from "@/content/articles";
import { img } from "@/content/media";
import { getFeaturedProducts } from "@/content/products";
import { site } from "@/content/site";
import { workshops } from "@/content/workshops";
import { formatPrice } from "@/lib/format";
import { t } from "@/lib/i18n";
import { telUrl } from "@/lib/line";

const HIGHLIGHTS = [
  {
    icon: HammerIcon,
    title: "มรดกช่างตีเหล็ก",
    body: "ประวัติศาสตร์ที่สืบทอดจากช่างเวียงจันทน์สู่แผ่นดินกรุงเก่า ผ่านมือช่างมาแล้วกว่าเจ็ดชั่วอายุคน",
  },
  {
    icon: FlameIcon,
    title: "หัตถกรรมตีมือทุกเล่ม",
    body: "ขึ้นรูปด้วยค้อนบนทั่ง เผาด้วยถ่านไม้ ชุบแข็งด้วยสูตรโบราณ ได้คมที่ทนและลับง่าย",
  },
  {
    icon: UsersIcon,
    title: "ท่องเที่ยวสัมผัสวิถี",
    body: "เปิดเตาโบราณให้ทดลองตีมีดด้วยตัวเอง พร้อมเรียนรู้วิถีเกษตรและอาหารพื้นบ้านของชุมชน",
  },
];

export default function HomePage() {
  const featuredProducts = getFeaturedProducts(4);
  const latestArticles = getLatestArticles(3);
  const spotlight = getArticle("secret-of-the-edge");
  const heroImage = img("hero-forge", "ช่างกำลังตีมีดในเตาไฟ ประกายไฟกระจายรอบทั่ง");

  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden bg-steel-800">
        {/* แสงไฟจากเตา — ไล่สีนุ่ม ๆ ให้พื้นหลังไม่แบน */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-1/4 h-[36rem] w-[36rem] rounded-full bg-ember-500/20 blur-[120px]"
        />
        <Container size="wide">
          <div className="grid items-center gap-10 py-14 lg:min-h-[85vh] lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
            <div className="flex flex-col gap-7">
              <EyebrowLabel tone="light">ตำบลท่าช้าง · อำเภอนครหลวง · พระนครศรีอยุธยา</EyebrowLabel>

              {/*
                ภาษาไทยไม่มีช่องว่างระหว่างคำ เบราว์เซอร์จึงเดาจุดตัดบรรทัดเอง
                และตัดคำเฉพาะอย่าง "อรัญญิก" ผิดตำแหน่งได้ จึงกำหนดบรรทัดเองด้วย block
              */}
              <h1 className="font-serif text-[1.75rem] leading-[1.4] font-bold text-rice-100 sm:text-[2.25rem] lg:text-[2.75rem] lg:leading-[1.35]">
                <span className="block">มรดกช่างตีเหล็กแห่งอยุธยา</span>
                <span className="mt-2 block text-ember-400">สืบสานตำนานมีดอรัญญิก</span>
                <span className="block text-ember-400">กว่า 200 ปี</span>
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-steel-200 sm:text-lg">
                {t(site.heroSubtitle)}
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/shop" variant="primary" className="sm:w-auto">
                  เลือกชมสินค้าชุมชน
                </ButtonLink>
                <ButtonLink href="/stories" variant="onDark" className="sm:w-auto">
                  อ่านเรื่องเล่าชุมชน
                </ButtonLink>
              </div>

              <dl className="mt-2 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
                {[
                  { value: "200+", label: "ปีของภูมิปัญญา" },
                  { value: "7", label: "ชั่วอายุคนที่สืบทอด" },
                  { value: "100%", label: "ตีด้วยมือทุกเล่ม" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-serif text-2xl font-semibold text-ember-400">{stat.value}</dt>
                    <dd className="mt-1 text-xs leading-relaxed text-steel-300">{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="relative aspect-4/5 overflow-hidden rounded-2xl border border-white/10 shadow-lift-lg">
                <Image
                  src={heroImage.url}
                  alt={t(heroImage.alt)}
                  width={heroImage.width}
                  height={heroImage.height}
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="h-full w-full object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-steel-950/80 to-transparent"
                />
                <figcaption className="absolute inset-x-0 bottom-0 p-5 text-sm text-rice-100">
                  ซุ้มตีมีดบ้านต้นโพธิ์ · เตาถ่านที่ยังไม่เคยดับ
                </figcaption>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------- KEY HIGHLIGHTS ---------------- */}
      <section className="py-16 sm:py-20">
        <Container size="wide">
          <div className="grid gap-5 md:grid-cols-3">
            {HIGHLIGHTS.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="flex flex-col gap-4 rounded-card border border-rice-300 bg-rice-50 p-6 transition duration-300 ease-craft hover:border-ember-200 hover:shadow-lift"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-ember-50 text-ember-600">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="font-serif text-lg font-semibold text-steel-800">{title}</h3>
                <p className="text-sm leading-relaxed text-forged-500">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------------- FEATURED PRODUCTS ---------------- */}
      <section className="py-4 sm:py-8">
        <Container size="wide">
          <SectionHeading
            eyebrow="สินค้าคัดสรร"
            title="มีดและงานหัตถกรรมยอดนิยม"
            description="ทุกเล่มตีด้วยมือในชุมชน ระบุชื่อช่างผู้ตีและชนิดเหล็กอย่างชัดเจน"
            action={<ArrowLink href="/shop">ดูสินค้าทั้งหมด</ArrowLink>}
          />
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product.slug} product={product} showQuickOrder />
            ))}
          </div>
        </Container>
      </section>

      {/* ---------------- STORY SPOTLIGHT ---------------- */}
      {spotlight ? (
        <section className="py-16 sm:py-20">
          <Container size="wide">
            <div className="overflow-hidden rounded-2xl bg-steel-800">
              <div className="grid lg:grid-cols-2">
                <div className="relative min-h-64 lg:min-h-full">
                  <Image
                    src={spotlight.coverImage.url}
                    alt={t(spotlight.coverImage.alt)}
                    width={spotlight.coverImage.width}
                    height={spotlight.coverImage.height}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center gap-5 p-8 sm:p-12">
                  <EyebrowLabel tone="light">เรื่องเล่าจากเตาไฟ</EyebrowLabel>
                  <h2 className="font-serif text-2xl leading-snug font-semibold text-rice-100 sm:text-3xl">
                    {t(spotlight.title)}
                  </h2>
                  <p className="text-[0.9375rem] leading-relaxed text-steel-200">{t(spotlight.excerpt)}</p>
                  <blockquote className="border-l-2 border-ember-500 pl-4 font-serif text-base leading-relaxed text-rice-100">
                    “มีดที่ดีไม่ได้เกิดจากการตีแรง แต่เกิดจากการตีถูกจังหวะ”
                    <footer className="mt-2 text-xs font-sans text-steel-300">
                      — ครูช่างสมชาย ตีเหล็กทอง
                    </footer>
                  </blockquote>
                  <div>
                    <ArrowLink href={`/stories/${spotlight.slug}`} tone="light">
                      อ่านบทความฉบับเต็ม
                    </ArrowLink>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {/* ---------------- EXPERIENCE HIGHLIGHTS ---------------- */}
      <section className="py-4 sm:py-8">
        <Container size="wide">
          <SectionHeading
            eyebrow="กิจกรรมและจุดสัมผัสชุมชน"
            title="มาถึงที่แล้วได้ลงมือทำจริง"
            description="ชุมชนเปิดเตาให้ผู้มาเยือนได้ลองตีมีดด้วยตัวเอง พร้อมฐานเรียนรู้อื่น ๆ ที่จองล่วงหน้าได้"
            action={<ArrowLink href="/tourism">ดูกิจกรรมทั้งหมด</ArrowLink>}
          />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {workshops.map((workshop) => (
              <article
                key={workshop.slug}
                className="group relative flex flex-col overflow-hidden rounded-card border border-rice-300 bg-rice-50 transition duration-300 ease-craft hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="relative aspect-3/2 overflow-hidden bg-steel-800">
                  <Image
                    src={workshop.image.url}
                    alt={t(workshop.image.alt)}
                    width={workshop.image.width}
                    height={workshop.image.height}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="h-full w-full object-cover transition duration-500 ease-craft group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className="font-serif text-lg leading-snug font-semibold text-steel-800">
                    <Link href="/tourism" className="after:absolute after:inset-0 after:content-['']">
                      {t(workshop.title)}
                    </Link>
                  </h3>
                  <p className="text-sm leading-relaxed text-forged-500">{t(workshop.summary)}</p>
                  <p className="mt-auto pt-2 text-sm font-semibold text-ember-600">
                    {workshop.pricePerPerson === null
                      ? "สอบถามค่าบริการ"
                      : `${formatPrice(workshop.pricePerPerson)} / คน`}
                    <span className="ml-2 font-normal text-forged-400">· {t(workshop.duration)}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------------- LATEST BLOGS ---------------- */}
      <section className="py-16 sm:py-20">
        <Container size="wide">
          <SectionHeading
            eyebrow="เรื่องเล่าและข่าวกิจกรรม"
            title="อ่านล่าสุดจากชุมชน"
            action={<ArrowLink href="/stories">ดูบทความทั้งหมด</ArrowLink>}
          />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {latestArticles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </Container>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="pb-4">
        <Container size="wide">
          <div className="relative overflow-hidden rounded-2xl bg-steel-800 px-6 py-12 text-center sm:px-12 sm:py-16">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember-500/25 blur-[100px]"
            />
            <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
              <EyebrowLabel tone="light">สั่งซื้อ · สอบถาม · นัดหมายเข้าชม</EyebrowLabel>
              <h2 className="font-serif text-2xl leading-snug font-semibold text-rice-100 sm:text-3xl">
                คุยกับช่างโดยตรง ไม่ผ่านคนกลาง
              </h2>
              <p className="text-[0.9375rem] leading-relaxed text-steel-200">
                ทักมาทาง LINE เพื่อสอบถามสินค้า ขอใบเสนอราคาสำหรับงานสั่งทำ หรือนัดหมายเข้าชมชุมชนเป็นหมู่คณะ
                ทีมงานตอบกลับทุกวันในเวลาทำการ
              </p>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <a
                  href={site.lineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass("primary")}
                >
                  <LineIcon />
                  แอดไลน์ {site.lineId}
                </a>
                <a href={telUrl} className={buttonClass("onDark")}>
                  <PhoneIcon />
                  โทร {site.phoneDisplay}
                </a>
                <ButtonLink href="/contact" variant="onDark">
                  <MapPinIcon />
                  ดูแผนที่และการเดินทาง
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

/**
 * ย้ายข้อมูลจาก src/content/*.ts เข้า CMS
 *
 *   npx payload run scripts/seed.ts
 *
 * รันซ้ำได้ — จะล้างข้อมูลเนื้อหาเดิมทิ้งก่อนเสมอ (ไม่แตะบัญชีผู้ใช้)
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPayload } from "payload";
import config from "@payload-config";
import { articles as seedArticles } from "./seed-data/articles";
import { artisans as seedArtisans } from "./seed-data/artisans";
import { articleCategories, productCategories } from "./seed-data/categories";
import { PLACEHOLDERS } from "./seed-data/placeholders";
import { products as seedProducts } from "./seed-data/products";
import { site } from "./seed-data/site";
import { places as seedPlaces, workshops as seedWorkshops } from "./seed-data/workshops";
import type { Localized, Media as MediaShape } from "./seed-data/types";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** ข้อความไทยจากค่า Localized */
const th = <T,>(value: Localized<T>): T => value.th;

/** อาร์เรย์ข้อความ → รูปแบบแถวที่ Payload ต้องการ */
const rows = (items: string[]) => items.map((value) => ({ value }));

async function main() {
  const payload = await getPayload({ config });

  console.log("▸ ล้างข้อมูลเนื้อหาเดิม");
  for (const collection of [
    "products",
    "articles",
    "workshops",
    "places",
    "artisans",
    "categories",
    "media",
  ] as const) {
    await payload.delete({ collection, where: { id: { exists: true } } });
  }

  // ---------- รูปภาพ ----------
  console.log("▸ อัปโหลดรูปภาพ");
  const mediaByName = new Map<string, number>();
  for (const [name, meta] of Object.entries(PLACEHOLDERS)) {
    const created = await payload.create({
      collection: "media",
      filePath: path.join(rootDir, "public", meta.url.replace(/^\//, "")),
      data: {
        alt: meta.label,
        credit: "ภาพตัวอย่างสำหรับ prototype — รอแทนที่ด้วยรูปถ่ายจริงของชุมชน",
        usageRights: "own",
      },
    });
    mediaByName.set(name, created.id as number);
  }
  console.log(`  อัปโหลด ${mediaByName.size} รูป`);

  /** หา id ของรูปจาก url ที่อยู่ในข้อมูลเดิม */
  const mediaId = (media: MediaShape) => {
    const name = media.url.replace("/placeholder/", "").replace(".svg", "");
    const id = mediaByName.get(name);
    if (!id) throw new Error(`ไม่พบรูป ${name}`);
    return id;
  };

  // ---------- หมวดหมู่ ----------
  console.log("▸ หมวดหมู่");
  const categoryBySlug = new Map<string, number>();
  for (const [index, category] of [...productCategories, ...articleCategories].entries()) {
    const created = await payload.create({
      collection: "categories",
      data: {
        title: th(category.title),
        slug: category.slug,
        type: category.type,
        description: category.description ? th(category.description) : undefined,
        order: index,
      },
    });
    categoryBySlug.set(`${category.type}:${category.slug}`, created.id as number);
  }

  // ---------- ปราชญ์ชุมชน ----------
  console.log("▸ ปราชญ์ชุมชน");
  const artisanBySlug = new Map<string, number>();
  for (const [index, artisan] of seedArtisans.entries()) {
    const created = await payload.create({
      collection: "artisans",
      data: {
        name: th(artisan.name),
        slug: artisan.slug,
        title: th(artisan.title),
        specialty: th(artisan.specialty),
        bio: th(artisan.bio),
        photo: mediaId(artisan.photo),
        source: artisan.source ? th(artisan.source) : undefined,
        // ข้อมูลชุดนี้มาจากแหล่งสาธารณะและถูกยืนยันสิทธิ์แล้วตามที่แจ้ง
        consentBio: true,
        consentPhoto: true,
        order: index,
      },
    });
    artisanBySlug.set(artisan.slug, created.id as number);
  }

  // ---------- สินค้า ----------
  console.log("▸ สินค้า");
  for (const [index, product] of seedProducts.entries()) {
    await payload.create({
      collection: "products",
      data: {
        _status: "published",
        name: th(product.name),
        slug: product.slug,
        sku: product.sku,
        excerpt: th(product.excerpt),
        category: categoryBySlug.get(`product:${product.categorySlug}`)!,
        artisan: artisanBySlug.get(product.artisanSlug)!,
        gallery: product.gallery.map((image) => ({ image: mediaId(image) })),
        story: rows(th(product.story)),
        badges: rows(th(product.badges)),
        price: product.price ?? undefined,
        availability: product.status,
        leadTime: product.leadTime ? th(product.leadTime) : undefined,
        featured: product.featured,
        order: index,
        form: product.form,
        netContent: th(product.netContent),
        mainHerbs: rows(th(product.mainHerbs)),
        usage: rows(th(product.usage)),
        shelfLife: product.shelfLife ? th(product.shelfLife) : undefined,
        careInstructions: rows(th(product.careInstructions)),
        externalUseOnly: product.externalUseOnly,
        registrationType: "none",
      },
    });
  }

  // ---------- บทความ ----------
  console.log("▸ บทความ");
  for (const article of seedArticles) {
    await payload.create({
      collection: "articles",
      data: {
        _status: "published",
        title: th(article.title),
        slug: article.slug,
        excerpt: th(article.excerpt),
        coverImage: mediaId(article.coverImage),
        category: categoryBySlug.get(`article:${article.categorySlug}`)!,
        author: th(article.author),
        artisan: article.artisanSlug ? artisanBySlug.get(article.artisanSlug) : undefined,
        publishedAt: new Date(`${article.publishedAt}T00:00:00+07:00`).toISOString(),
        featured: article.featured,
        content: article.content.map((block) => {
          switch (block.type) {
            case "heading":
              return { blockType: "heading" as const, text: th(block.text), level: String(block.level) as "2" | "3" };
            case "paragraph":
              return { blockType: "paragraph" as const, text: th(block.text) };
            case "list":
              return { blockType: "list" as const, style: block.style, items: rows(th(block.items)) };
            case "image":
              return { blockType: "image" as const, media: mediaId(block.media) };
            case "quote":
              return {
                blockType: "quote" as const,
                text: th(block.text),
                attribution: block.attribution ? th(block.attribution) : undefined,
              };
            case "youtube":
              return { blockType: "youtube" as const, videoId: block.videoId, title: th(block.title) };
          }
        }),
      },
    });
  }

  // ---------- ฐานเรียนรู้และจุดเช็กอิน ----------
  console.log("▸ ฐานเรียนรู้และจุดเช็กอิน");
  for (const [index, workshop] of seedWorkshops.entries()) {
    await payload.create({
      collection: "workshops",
      data: {
        title: th(workshop.title),
        slug: workshop.slug,
        summary: th(workshop.summary),
        image: mediaId(workshop.image),
        description: rows(th(workshop.description)),
        duration: th(workshop.duration),
        pricePerPerson: workshop.pricePerPerson ?? undefined,
        minParticipants: workshop.minParticipants,
        maxParticipants: workshop.maxParticipants,
        bookingNotes: rows(th(workshop.bookingNotes)),
        takeaway: workshop.takeaway ? th(workshop.takeaway) : undefined,
        order: index,
      },
    });
  }
  for (const [index, place] of seedPlaces.entries()) {
    await payload.create({
      collection: "places",
      data: {
        name: th(place.name),
        slug: place.slug,
        kind: place.kind,
        description: th(place.description),
        openingHours: place.openingHours ? th(place.openingHours) : undefined,
        image: mediaId(place.image),
        order: index,
      },
    });
  }

  // ---------- ข้อมูลชุมชน ----------
  console.log("▸ ข้อมูลชุมชนและเมนู");
  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      _status: "published",
      communityName: th(site.communityName),
      communityShortName: th(site.communityShortName),
      tagline: th(site.tagline),
      aboutSummary: th(site.aboutSummary),
      phone: site.phone,
      phoneDisplay: site.phoneDisplay,
      lineId: site.lineId,
      lineUrl: site.lineUrl,
      facebookUrl: site.facebookUrl,
      email: site.email,
      address: th(site.address),
      addressLocality: site.addressLocality,
      addressRegion: site.addressRegion,
      postalCode: site.postalCode,
      mapLatitude: site.mapLatitude,
      mapLongitude: site.mapLongitude,
      openingHours: th(site.openingHours),
      openingHoursShort: th(site.openingHoursShort),
    },
  });

  await payload.updateGlobal({
    slug: "navigation",
    data: {
      _status: "published",
      mainMenu: [
        { label: "หน้าแรก", linkType: "page", page: "/" },
        { label: "เกี่ยวกับชุมชน", linkType: "page", page: "/about" },
        { label: "เรื่องเล่า", linkType: "page", page: "/stories" },
        { label: "สินค้าชุมชน", linkType: "page", page: "/shop" },
        { label: "ท่องเที่ยว", linkType: "page", page: "/tourism" },
        { label: "ติดต่อเรา", linkType: "page", page: "/contact" },
      ],
      headerCta: { enabled: true, label: "สั่งซื้อ / สอบถาม", action: "line" },
      mobileMenu: {
        title: "เมนู",
        contactHeading: "ติดต่อชุมชนโดยตรง",
        lineButtonPrefix: "แอดไลน์",
        phoneButtonPrefix: "โทร",
      },
      footerColumns: [
        {
          heading: "เมนู",
          links: [
            { label: "หน้าแรก", linkType: "page", page: "/" },
            { label: "เกี่ยวกับชุมชน", linkType: "page", page: "/about" },
            { label: "เรื่องเล่า", linkType: "page", page: "/stories" },
            { label: "สินค้าชุมชน", linkType: "page", page: "/shop" },
            { label: "ท่องเที่ยว", linkType: "page", page: "/tourism" },
            { label: "ติดต่อเรา", linkType: "page", page: "/contact" },
          ],
        },
      ],
    },
  });


  // ---------- เนื้อหาประจำหน้า ----------
  console.log("▸ เนื้อหาประจำหน้า");
  const img = (name: keyof typeof PLACEHOLDERS) => mediaByName.get(name)!;

  await payload.updateGlobal({
    slug: "home-page",
    data: {
      _status: "published",
      hero: {
        eyebrow: "หมู่ที่ 1 ตำบลบางขะแยง · อำเภอเมืองปทุมธานี",
        titleLines: [
          { text: "ชุมชนมอญริมเจ้าพระยา", accent: false },
          { text: "กับภูมิปัญญาสมุนไพร", accent: true },
          { text: "บ้านต้นโพธิ์", accent: true },
        ],
        subtitle:
          "ชุมชนไทยเชื้อสายมอญที่ตั้งถิ่นฐานริมแม่น้ำเจ้าพระยามาหลายร้อยปี วันนี้ส่งต่อภูมิปัญญาสมุนไพรผ่านยาหม่องน้ำ ลูกประคบ และผลิตภัณฑ์ที่ทำด้วยมือโดยคนในชุมชน",
        primaryButton: { label: "เลือกชมสินค้าชุมชน", href: "/shop" },
        secondaryButton: { label: "อ่านเรื่องเล่าชุมชน", href: "/stories" },
        image: img("hero-herbal"),
        imageCaption: "วิสาหกิจชุมชนสมุนไพรบ้านต้นโพธิ์ · แปรรูปด้วยมือในชุมชน",
        stats: [
          { value: "5,870", label: "ประชากรในชุมชน" },
          { value: "2,777", label: "ครัวเรือน" },
          { value: "45 ไร่", label: "พื้นที่เกษตรของชุมชน" },
        ],
      },
      sections: [
        { type: "highlights", enabled: true, background: "page", columns: "auto" },
        { type: "featured-products", enabled: true, background: "page", columns: "auto" },
        { type: "spotlight", enabled: true },
        { type: "workshops", enabled: true, background: "page", columns: "auto" },
        { type: "latest-articles", enabled: true, background: "page", columns: "auto" },
        { type: "cta", enabled: true },
      ],
      highlights: [
        {
          icon: "temple",
          title: "ชุมชนมอญริมเจ้าพระยา",
          body: "ลูกหลานชาวมอญเมืองเมาะตะมะที่ตั้งถิ่นฐานริมแม่น้ำเจ้าพระยามาหลายร้อยปี มีวัดเจตวงศ์เป็นศูนย์กลาง",
        },
        {
          icon: "leaf",
          title: "ภูมิปัญญาสมุนไพร",
          body: "วิสาหกิจชุมชนสมุนไพรบ้านต้นโพธิ์แปรรูปสมุนไพรไทยเป็นยาหม่องน้ำ ลูกประคบ และผลิตภัณฑ์อื่นด้วยมือ",
        },
        {
          icon: "users",
          title: "ท่องเที่ยวเชิงวัฒนธรรม",
          body: "เปิดฐานเรียนรู้ให้ลงมือทำยาหม่องและลูกประคบเอง พร้อมเดินชมโบราณสถานและจุดชมวิวริมน้ำ",
        },
      ],
      featuredSection: {
        eyebrow: "สินค้าคัดสรร",
        title: "ผลิตภัณฑ์สมุนไพรยอดนิยม",
        description: "ทุกชิ้นแปรรูปด้วยมือในชุมชน ระบุปริมาณสุทธิและสมุนไพรหลักในตำรับอย่างชัดเจน",
      },
      experienceSection: {
        eyebrow: "กิจกรรมและจุดสัมผัสชุมชน",
        title: "มาถึงที่แล้วได้ลงมือทำจริง",
        description:
          "ชุมชนเปิดฐานเรียนรู้ให้ผู้มาเยือนลงมือทำยาหม่องและลูกประคบเอง พร้อมเส้นทางเดินชมโบราณสถานริมน้ำ",
      },
      storiesSection: {
        eyebrow: "เรื่องเล่าและข่าวกิจกรรม",
        title: "อ่านล่าสุดจากชุมชน",
      },
      spotlight: {
        eyebrow: "เรื่องเล่าจากชุมชน",
        article: (await payload.find({
          collection: "articles",
          where: { slug: { equals: "herbal-wisdom" } },
          limit: 1,
        })).docs[0]?.id,
        quote: "“ภูมิปัญญาการใช้สมุนไพรไทย” ถูกระบุเป็นหนึ่งในจุดเด่นของชุมชนบ้านต้นโพธิ์",
        attribution: "วิกิชุมชน ศูนย์มานุษยวิทยาสิรินธร",
      },
      cta: {
        eyebrow: "สั่งซื้อ · สอบถาม · นัดหมายเข้าชม",
        title: "คุยกับกลุ่มวิสาหกิจชุมชนโดยตรง",
        body: "ทักมาทาง LINE เพื่อสอบถามผลิตภัณฑ์ ขอใบเสนอราคาชุดของฝาก หรือนัดหมายพาคณะเข้าศึกษาดูงาน ทีมงานตอบกลับในเวลาทำการ",
      },
    },
  });

  await payload.updateGlobal({
    slug: "about-page",
    data: {
      _status: "published",
      hero: {
        eyebrow: "เกี่ยวกับชุมชน",
        title: "บ้านต้นโพธิ์ — ชุมชนมอญที่ตั้งถิ่นฐานริมเจ้าพระยามาหลายร้อยปี",
        description: th(site.aboutSummary),
      },
      sections: [
        { type: "history", enabled: true },
        { type: "assets", enabled: true, background: "dark", columns: "auto", textTone: "auto" },
        { type: "artisans", enabled: true, background: "page", columns: "auto" },
        { type: "closing", enabled: true },
        { type: "references", enabled: true },
      ],
      historySection: {
        eyebrow: "ประวัติความเป็นมาและรากเหง้าชุมชน",
        title: "จากเมืองเมาะตะมะ สู่ริมฝั่งแม่น้ำเจ้าพระยา",
      },
      historyImage: img("about-heritage"),
      historyContent: [
        {
          blockType: "paragraph" as const,
          text: "บ้านต้นโพธิ์ หมู่ที่ 1 ตำบลบางขะแยง อำเภอเมืองปทุมธานี เป็นชุมชนกลุ่มชาติพันธุ์ไทยเชื้อสายมอญ อาศัยอยู่บริเวณริมฝั่งแม่น้ำเจ้าพระยา ต้นทางของชุมชนมาจากการอพยพย้ายถิ่นฐานของชาวมอญเมืองเมาะตะมะ ที่เดินทางเข้ามาเพื่อหลีกหนีจากภาวะสงคราม และตั้งถิ่นฐานอยู่บริเวณนี้สืบมา",
        },
        { blockType: "heading" as const, text: "ที่มาของชื่อชุมชน" },
        {
          blockType: "paragraph" as const,
          text: "ในอดีตบริเวณนี้มีการสัญจรทางน้ำผ่านไปมา และมีต้นโพธิ์ขนาดใหญ่ที่อยู่มาก่อน ผู้คนจึงยึดเอาต้นโพธิ์นี้เป็นสัญลักษณ์บ่งบอกตำแหน่งพื้นที่ และใช้เป็นชื่อเรียกชุมชนบริเวณนี้สืบมาจนถึงปัจจุบัน",
        },
        { blockType: "heading" as const, text: "ชุมชนเมืองที่ยังมีวัฒนธรรมเป็นแกน" },
        {
          blockType: "paragraph" as const,
          text: "ปัจจุบันบ้านต้นโพธิ์จัดเป็นชุมชนเมือง/ชานเมือง อยู่ในเขตเทศบาลตำบลบางขะแยง ใกล้พื้นที่เศรษฐกิจและโรงงานอุตสาหกรรม อาชีพของคนในชุมชนจึงหลากหลาย ทั้งรับจ้างทั่วไป พนักงานโรงงาน ลูกจ้าง ค้าขาย และธุรกิจส่วนตัว มีเพียงส่วนน้อยที่ทำเกษตรกรรม",
        },
        {
          blockType: "paragraph" as const,
          text: "แม้วิถีประจำวันของคนวัยทำงานจะคล้ายชุมชนเมืองทั่วไป แต่กลุ่มผู้สูงอายุยังคงรักษาวัฒนธรรมท้องถิ่นไว้ได้ โดยมีวัดเจตวงศ์เป็นศูนย์กลาง และมีกลุ่มวิสาหกิจชุมชนสมุนไพรบ้านต้นโพธิ์เป็นกลุ่มอาชีพที่ช่วยสร้างรายได้เสริม",
        },
      ],
      facts: [
        { value: "5,870", label: "ประชากรรวม (ชาย 2,766 · หญิง 3,104)" },
        { value: "2,777", label: "ครัวเรือน" },
        { value: "45 ไร่", label: "พื้นที่เกษตร (นา 15 ไร่ · สวน 30 ไร่)" },
        { value: "หมู่ที่ 1", label: "ตำบลบางขะแยง อำเภอเมืองปทุมธานี" },
      ],
      historyLink: { label: "อ่านบทความเต็มเรื่องรากเหง้าชุมชน", href: "/stories/mon-heritage" },
      assetsSection: {
        eyebrow: "ทุนชุมชน",
        title: "หกสิ่งที่เป็นต้นทุนของบ้านต้นโพธิ์",
        description:
          "รายการนี้อ้างอิงตรงจากวิกิชุมชน ศูนย์มานุษยวิทยาสิรินธร ทั้งด้านผู้คน สถานที่ และผลิตภัณฑ์",
      },
      assets: [
        {
          title: "ชุมชนชาวมอญ",
          body: "กลุ่มชาติพันธุ์ไทยเชื้อสายมอญที่ตั้งถิ่นฐานริมฝั่งเจ้าพระยามาหลายร้อยปี ยังใช้ภาษามอญผสมภาษาไทยในชุมชน",
        },
        {
          title: "วัดเจตวงศ์",
          body: "โบราณสถานอายุหลายร้อยปี ขึ้นทะเบียนโดยกรมศิลปากร พ.ศ. 2530 และบูรณะพร้อมอนุรักษ์จิตรกรรมฝาผนังใน พ.ศ. 2551",
        },
        {
          title: "ศูนย์การเรียนรู้เศรษฐกิจพอเพียง",
          body: "ศูนย์การเรียนรู้และขับเคลื่อนปรัชญาเศรษฐกิจพอเพียงบ้านต้นโพธิ์ เป็นจุดรับคณะศึกษาดูงานของชุมชน",
        },
        {
          title: "จุดชมทัศนียภาพริมเจ้าพระยา",
          body: "จุดนั่งพักริมน้ำที่เห็นเรือสัญจรและภาพรวมการตั้งถิ่นฐานแบบเกาะริมฝั่งได้ชัดที่สุด",
        },
        {
          title: "แม่น้ำเจ้าพระยา",
          body: "ทิศตะวันออกของชุมชนติดแม่น้ำเจ้าพระยาโดยตรง เป็นทั้งเส้นทางสัญจรดั้งเดิมและหัวใจของวิถีชีวิตริมน้ำ",
        },
        {
          title: "ยาหม่องน้ำสมุนไพรบ้านต้นโพธิ์",
          body: "ผลิตภัณฑ์เรือธงของวิสาหกิจชุมชนสมุนไพรบ้านต้นโพธิ์ และเป็นภูมิปัญญาที่ทำให้ชื่อชุมชนเป็นที่รู้จัก",
        },
      ],
      artisansSection: {
        eyebrow: "ปราชญ์ชาวบ้านและผู้นำกลุ่มอาชีพ",
        title: "ทำเนียบปราชญ์ชุมชน",
        description: "ผู้ที่ขับเคลื่อนภูมิปัญญาสมุนไพรและกลุ่มวิสาหกิจชุมชนของบ้านต้นโพธิ์",
      },
      closing: {
        title: "มาเห็นด้วยตาตัวเองดีกว่า",
        body: "ชุมชนเปิดรับผู้มาเยือนและคณะศึกษาดูงาน มีทั้งฐานเรียนรู้สมุนไพรที่ลงมือทำเองได้ และเส้นทางเดินชมวัดเจตวงศ์กับจุดชมวิวริมน้ำ กรุณานัดหมายล่วงหน้าเพื่อให้ชุมชนจัดผู้นำชม",
        image: img("about-community"),
        primaryButton: { label: "ดูกิจกรรมและการเดินทาง", href: "/tourism" },
        secondaryButton: { label: "เลือกชมสินค้าชุมชน", href: "/shop" },
      },
      references: rows([
        "วิกิชุมชน ศูนย์มานุษยวิทยาสิรินธร (องค์การมหาชน). ข้อมูลชุมชนบ้านต้นโพธิ์. เรียบเรียงโดย กฤษฎา อุ่นลาวรรณ, 4 มกราคม 2567.",
        "เทศบาลตำบลบางขะแยง. (2564). แผนพัฒนาท้องถิ่น (พ.ศ. 2566–2570).",
        "สำนักงานพัฒนาชุมชนอำเภอเมืองปทุมธานี. (2561). รายงานสารสนเทศสัมมาชีพชุมชนระดับหมู่บ้าน บ้านต้นโพธิ์ หมู่ 1 ตำบลบางขะแยง.",
        "กันตชา ศรีอยุธย์. (2564). การศึกษากระบวนการการมีส่วนร่วมของชุมชนท่องเที่ยวโอทอปนวัตวิถีบ้านต้นโพธิ์ จังหวัดปทุมธานี เพื่อการท่องเที่ยวอย่างยั่งยืน. บัณฑิตวิทยาลัย มหาวิทยาลัยศรีนครินทรวิโรฒ.",
      ]),
    },
  });

  await payload.updateGlobal({
    slug: "shop-page",
    data: {
      _status: "published",
      hero: {
        eyebrow: "สินค้าชุมชน",
        title: "ผลิตภัณฑ์สมุนไพรจากบ้านต้นโพธิ์",
        description:
          "ทุกชิ้นระบุรูปแบบ ปริมาณสุทธิ และสมุนไพรหลักในตำรับ สั่งซื้อได้โดยตรงกับกลุ่มวิสาหกิจชุมชนผ่าน LINE หรือโทรศัพท์",
      },
      sections: [
        { type: "catalogue", enabled: true },
        { type: "cta", enabled: true },
      ],
      cta: {
        eyebrow: "สั่งซื้อ · สอบถาม",
        title: "สนใจสินค้าชิ้นไหน ทักมาถามได้เลย",
        body: "กลุ่มวิสาหกิจชุมชนตอบกลับในเวลาทำการ สอบถามค่าจัดส่งหรือขอใบเสนอราคาจำนวนมากได้",
      },
      emptyState: {
        title: "ไม่พบสินค้าที่ตรงกับเงื่อนไข",
        body: "ลองลดตัวกรองลง หรือทักมาสอบถามกลุ่มวิสาหกิจชุมชนโดยตรงได้เลย",
      },
    },
  });

  await payload.updateGlobal({
    slug: "stories-page",
    data: {
      _status: "published",
      hero: {
        eyebrow: "เรื่องเล่าและข่าวกิจกรรม",
        title: "เรื่องเล่าจากชุมชนมอญริมเจ้าพระยา",
        description:
          "รวมประวัติความเป็นมา เรื่องราวของวัดเจตวงศ์ ภูมิปัญญาสมุนไพร และข่าวกิจกรรมที่ชุมชนเปิดให้เข้าร่วม",
      },
      sections: [
        { type: "list", enabled: true },
        { type: "cta", enabled: true },
      ],
      cta: {
        eyebrow: "อยากรู้จักชุมชนมากขึ้น",
        title: "มาเยือนบ้านต้นโพธิ์ด้วยตัวเอง",
        body: "ติดต่อนัดหมายเข้าชมชุมชน เข้าร่วมฐานเรียนรู้ หรือสอบถามข้อมูลเพิ่มเติมได้ทุกช่องทาง",
      },
      emptyState: {
        title: "ไม่พบบทความที่ตรงกับคำค้น",
        body: "ลองใช้คำที่สั้นลง หรือเลือกดูจากหมวดหมู่ทั้งหมด",
      },
    },
  });

  await payload.updateGlobal({
    slug: "tourism-page",
    data: {
      _status: "published",
      hero: {
        eyebrow: "การท่องเที่ยวและกิจกรรม",
        title: "มาถึงบ้านต้นโพธิ์แล้วได้ลงมือทำจริง",
        description:
          "ชุมชนเปิดฐานเรียนรู้ให้ผู้มาเยือนลงมือทำยาหม่องน้ำและลูกประคบสมุนไพรด้วยตัวเอง พร้อมเส้นทางเดินชมวัดเจตวงศ์และจุดชมวิวริมเจ้าพระยา",
      },
      sections: [
        { type: "workshops", enabled: true, background: "page" },
        { type: "places", enabled: true, background: "dark", columns: "auto" },
        { type: "travel", enabled: true, background: "page" },
        { type: "cta", enabled: false },
      ],
      cta: {
        eyebrow: "นัดหมายล่วงหน้า",
        title: "พาคณะมาศึกษาดูงาน",
        body: "แจ้งจำนวนคนและวันที่ต้องการล่วงหน้า ชุมชนจะจัดผู้นำชมและเตรียมฐานเรียนรู้ไว้รอ",
      },
      workshopsSection: {
        eyebrow: "กิจกรรมสาธิตและเวิร์กช็อป",
        title: "ฐานเรียนรู้ที่เปิดให้เข้าร่วม",
        description: "ทุกฐานมีสมาชิกกลุ่มวิสาหกิจชุมชนดูแลตลอดกิจกรรม รับจำนวนจำกัดต่อรอบเพื่อให้ดูแลได้ทั่วถึง",
      },
      placesSection: {
        eyebrow: "แผนที่จุดเช็กอินในชุมชน",
        title: "จุดแวะในชุมชน",
        description:
          "ทั้งสี่แห่งนี้ระบุเป็นทุนชุมชนในวิกิชุมชน ศูนย์มานุษยวิทยาสิรินธร เดินชมได้ภายในครึ่งวัน",
      },
      travelSection: {
        eyebrow: "แผนที่และการเดินทาง",
        title: "มาถึงบ้านต้นโพธิ์ได้อย่างไร",
      },
      travelOptions: [
        {
          title: "รถยนต์ส่วนตัว",
          body: "เส้นทางคมนาคมสายหลักของพื้นที่คือถนนกรุงเทพ-ปทุมธานี จากกรุงเทพฯ ใช้เวลาประมาณ 40–60 นาทีขึ้นกับการจราจร ชุมชนอยู่ในเขตเทศบาลตำบลบางขะแยง ริมฝั่งแม่น้ำเจ้าพระยา",
        },
        {
          title: "เส้นทางสัญจรภายใน",
          body: "ถนนปทุมธานี-นนทบุรี (สายใน) เป็นเส้นทางสัญจรระหว่างชุมชน เหมาะสำหรับผู้ที่มาจากฝั่งนนทบุรีหรือต้องการเลี่ยงถนนสายหลัก",
        },
        {
          title: "รถโดยสารประจำทาง",
          body: "ขึ้นรถโดยสารหรือรถตู้สายกรุงเทพฯ–ปทุมธานี ลงที่ตัวเมืองปทุมธานี แล้วต่อรถรับจ้างเข้าตำบลบางขะแยง กรุณาสอบถามจุดลงที่ใกล้ที่สุดกับชุมชนก่อนเดินทาง",
        },
      ],
      notice: {
        title: "ก่อนออกเดินทาง",
        body: "หากมาเป็นหมู่คณะหรือต้องการเข้าร่วมฐานเรียนรู้ กรุณาโทรหรือทักไลน์เพื่อนัดหมายล่วงหน้า กลุ่มวิสาหกิจชุมชนจะได้เตรียมวัตถุดิบและผู้นำชมไว้รอ",
      },
    },
  });

  await payload.updateGlobal({
    slug: "contact-page",
    data: {
      _status: "published",
      hero: {
        eyebrow: "ติดต่อเรา",
        title: "คุยกับชุมชนโดยตรง",
        description:
          "ไม่ว่าจะสั่งซื้อผลิตภัณฑ์สมุนไพร ขอใบเสนอราคาชุดของฝาก หรือนัดหมายพาคณะเข้าศึกษาดูงาน ทักมาได้ทุกช่องทาง",
      },
      sections: [
        { type: "channels", enabled: true, background: "page", columns: "auto" },
        { type: "form", enabled: true },
      ],
      channels: [
        {
          channel: "line",
          label: "LINE Official Account",
          note: "ช่องทางที่ตอบเร็วที่สุด เหมาะกับการสอบถามสินค้าและจองกิจกรรม",
          highlight: true,
        },
        {
          channel: "phone",
          label: "โทรศัพท์ผู้ประสานงาน",
          note: "เบอร์กลุ่มวิสาหกิจชุมชนสมุนไพรบ้านต้นโพธิ์ รับสายในเวลาทำการ",
        },
        {
          channel: "facebook",
          label: "Facebook Fanpage",
          note: "ติดตามผลิตภัณฑ์ใหม่ ๆ และประกาศกิจกรรมของชุมชน",
        },
        {
          channel: "email",
          label: "อีเมล",
          note: "เหมาะกับงานขายส่ง ของชำร่วยจำนวนมาก และการติดต่อเชิงธุรกิจ",
        },
      ],
      formSection: {
        eyebrow: "ฟอร์มสอบถาม",
        title: "ส่งข้อความถึงผู้ประสานงานชุมชน",
        description: "กรอกข้อมูลไว้ แล้วทีมงานจะติดต่อกลับภายในเวลาทำการ",
      },
      formTopics: rows([
        "สั่งซื้อสินค้า",
        "สั่งทำชุดของฝาก/ของชำร่วย",
        "จองกิจกรรม/เข้าศึกษาดูงาน",
        "ขายส่ง/ตัวแทนจำหน่าย",
        "อื่น ๆ",
      ]),
      formSuccess: {
        title: "ได้รับข้อความแล้ว",
        body: "ผู้ประสานงานชุมชนจะติดต่อกลับภายในเวลาทำการ หากต้องการคำตอบเร็วกว่านี้ ทักมาทาง LINE หรือโทรหาได้เลย",
      },
    },
  });

  await payload.updateGlobal({
    slug: "not-found-page",
    data: {
      title: "ไม่พบหน้าที่คุณกำลังหา",
      description:
        "หน้านี้อาจถูกย้ายหรือลบไปแล้ว ลองกลับไปที่หน้าแรก หรือเลือกดูสินค้าและเรื่องเล่าของชุมชนจากเมนูด้านล่าง",
      buttons: [
        { label: "กลับหน้าแรก", href: "/" },
        { label: "ดูสินค้าชุมชน", href: "/shop" },
        { label: "อ่านเรื่องเล่า", href: "/stories" },
      ],
    },
  });

  await payload.updateGlobal({
    slug: "theme",
    data: {
      _status: "published",
      palette: "leaf",
      surface: "rice",
      fontPair: "plex-noto",
      baseFontSize: "16",
      radius: "medium",
      density: "normal",
    },
  });

  await payload.updateGlobal({
    slug: "seo-settings",
    data: {
      keywords: rows([
        "บ้านต้นโพธิ์",
        "ยาหม่องน้ำสมุนไพรบ้านต้นโพธิ์",
        "วิสาหกิจชุมชนสมุนไพร",
        "ชุมชนมอญ",
        "วัดเจตวงศ์",
        "บางขะแยง",
        "ปทุมธานี",
        "ท่องเที่ยวชุมชน",
        "สมุนไพรไทย",
        "ลูกประคบสมุนไพร",
      ]),
    },
  });

  console.log("✓ ย้ายข้อมูลเสร็จแล้ว");
  process.exit(0);
}

main().catch((error) => {
  console.error("✗ ย้ายข้อมูลไม่สำเร็จ:", error);
  process.exit(1);
});

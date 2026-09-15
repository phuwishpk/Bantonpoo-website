import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container size="narrow">
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
        <span aria-hidden className="font-serif text-6xl font-bold text-leaf-500">
          404
        </span>
        <h1 className="font-serif text-2xl font-semibold text-ink-800">ไม่พบหน้าที่คุณกำลังหา</h1>
        <p className="max-w-md text-[0.9375rem] leading-relaxed text-river-500">
          หน้านี้อาจถูกย้ายหรือลบไปแล้ว ลองกลับไปที่หน้าแรก
          หรือเลือกดูสินค้าและเรื่องเล่าของชุมชนจากเมนูด้านล่าง
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/">กลับหน้าแรก</ButtonLink>
          <ButtonLink href="/shop" variant="secondary">
            ดูสินค้าชุมชน
          </ButtonLink>
          <ButtonLink href="/stories" variant="secondary">
            อ่านเรื่องเล่า
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}

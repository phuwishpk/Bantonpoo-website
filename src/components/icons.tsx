import type { SVGProps } from "react";

/**
 * ไอคอนทั้งหมดเป็น inline SVG — ไม่พึ่งไลบรารีภายนอก
 * ทำให้หน้าเว็บโหลดเร็วและไม่มี request เพิ่ม
 */
type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={20}
      height={20}
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export const MenuIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

export const CloseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);

export const PhoneIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 006.5 6.5L17 13l4 1.5v3a2 2 0 01-2.2 2A16.5 16.5 0 013.1 5.2 2 2 0 015 3z" />
  </Icon>
);

export const SearchIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </Icon>
);

export const FilterIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 6h18M7 12h10M10 18h4" />
  </Icon>
);

export const ChevronLeftIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M14.5 5L8 12l6.5 7" />
  </Icon>
);

export const ChevronRightIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M9.5 5L16 12l-6.5 7" />
  </Icon>
);

export const CopyIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 012-2h9" />
  </Icon>
);

export const CheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
);

export const MapPinIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </Icon>
);

export const ClockIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </Icon>
);

export const UsersIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="9" cy="8.5" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0113 0" />
    <path d="M16 5.2a3.5 3.5 0 010 6.6M17.5 20a6.5 6.5 0 00-2.2-4.9" />
  </Icon>
);

export const LeafIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M20 4c0 8-4.5 12.5-11 12.5A4.5 4.5 0 014.5 12C4.5 7 9 4 20 4z" />
    <path d="M4 20c2.5-5 6-8 12-10" />
  </Icon>
);

/** เจดีย์/วัด — ใช้สื่อถึงวัดเจตวงศ์และรากเหง้าชุมชนมอญ */
export const TempleIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 2.5l2.2 4.2h-4.4z" />
    <path d="M12 6.7l3.4 4.6H8.6z" />
    <path d="M12 11.3l4.6 5.2H7.4z" />
    <path d="M4.5 20.5h15" />
    <path d="M6.5 16.5v4M17.5 16.5v4" />
  </Icon>
);

/** ครกและสาก — สื่อถึงการบดและแปรรูปสมุนไพร */
export const MortarIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4.5 9.5h15a7.5 7.5 0 01-7.5 7.5 7.5 7.5 0 01-7.5-7.5z" />
    <path d="M12 17v4M9 21h6" />
    <path d="M15.5 9.5L18 3.5" />
  </Icon>
);

/** มุมมองตาราง */
export const GridIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
  </Icon>
);

/** มุมมองสไลด์ — การ์ดใหญ่ตรงกลางและมีการ์ดถัดไปโผล่ข้าง ๆ */
export const SlidesIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="7.5" y="4.5" width="9" height="15" rx="1.5" />
    <path d="M4 7.5v9M20 7.5v9" />
  </Icon>
);

export const PauseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M9.5 5v14M14.5 5v14" />
  </Icon>
);

export const PlayIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M7.5 5l11 7-11 7z" />
  </Icon>
);

export const MailIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.5 6.5l8.5 6 8.5-6" />
  </Icon>
);

/** โลโก้ LINE — ใช้ path ทึบ จึงตั้ง fill เป็น currentColor และปิด stroke */
export const LineIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20} aria-hidden {...props}>
    <path d="M12 3C6.9 3 2.8 6.4 2.8 10.6c0 3.8 3.2 7 7.6 7.6.3.1.7.2.8.5.1.3.1.6 0 .9l-.1.8c0 .2-.2.9.8.5s5.4-3.2 7.3-5.4c1.4-1.5 2-3 2-4.9C21.2 6.4 17.1 3 12 3zM8.3 13.1H6.5c-.3 0-.5-.2-.5-.5V9.1c0-.3.2-.5.5-.5s.5.2.5.5v3h1.3c.3 0 .5.2.5.5s-.2.5-.5.5zm2-.5c0 .3-.2.5-.5.5s-.5-.2-.5-.5V9.1c0-.3.2-.5.5-.5s.5.2.5.5v3.5zm4.2 0c0 .2-.1.4-.3.5h-.2c-.2 0-.3-.1-.4-.2l-1.8-2.4v2.1c0 .3-.2.5-.5.5s-.5-.2-.5-.5V9.1c0-.2.1-.4.3-.5h.2c.2 0 .3.1.4.2l1.8 2.4V9.1c0-.3.2-.5.5-.5s.5.2.5.5v3.5zm2.8-2.3c.3 0 .5.2.5.5s-.2.5-.5.5h-1.3v.8h1.3c.3 0 .5.2.5.5s-.2.5-.5.5h-1.8c-.3 0-.5-.2-.5-.5V9.1c0-.3.2-.5.5-.5h1.8c.3 0 .5.2.5.5s-.2.5-.5.5h-1.3v.8h1.3z" />
  </svg>
);

export const FacebookIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={20} height={20} aria-hidden {...props}>
    <path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0022 12z" />
  </svg>
);

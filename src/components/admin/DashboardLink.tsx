"use client";

import { Link, useConfig } from "@payloadcms/ui";
import { usePathname } from "next/navigation";
import { formatAdminURL } from "payload/shared";
import React from "react";

/**
 * ลิงก์กลับแดชบอร์ด บนสุดของเมนูด้านข้าง
 *
 * Payload ไม่มีลิงก์นี้ในเมนู ทางกลับมีแค่โลโก้เล็กบนแถบด้านบน ซึ่งผู้ดูแลหาไม่เจอ
 * ใช้คลาสเดียวกับลิงก์ในเมนูของ Payload หน้าตาและแถบบอกหน้าปัจจุบันจึงเข้าชุดกัน
 */
export function DashboardLink() {
  const pathname = usePathname();
  const {
    config: {
      routes: { admin: adminRoute },
    },
  } = useConfig();
  const href = formatAdminURL({ adminRoute, path: "" }) || "/";
  const active = pathname === href || pathname === `${href}/`;

  const label = (
    <>
      {active ? <div className="nav__link-indicator" /> : null}
      <span className="nav__link-label">แดชบอร์ด (หน้าแรกหลังบ้าน)</span>
    </>
  );

  return (
    <div style={{ marginBottom: "0.75rem" }}>
      {active ? (
        <div className="nav__link" id="nav-dashboard">
          {label}
        </div>
      ) : (
        <Link className="nav__link" href={href} id="nav-dashboard" prefetch={false}>
          {label}
        </Link>
      )}
    </div>
  );
}

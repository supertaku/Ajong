"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Settings, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/app/app-provider";
import { ThemeSwitch } from "@/components/theme-switch";

const links = [
  { href: "/guide", key: "nav.guide" as const },
  { href: "/properties", key: "nav.search" as const },
  { href: "/learn", key: "nav.learn" as const },
  { href: "/sell", key: "nav.sell" as const },
];

export function SiteHeader() {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand" aria-label="Kubo home">
            <Image src="/images/kubo-mascot.png" alt="" width={42} height={42} className="brand-mascot" priority unoptimized />
            <span>Kubo</span>
          </Link>
          <nav className="desktop-nav" aria-label="Primary navigation">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={pathname === link.href ? "active" : ""}>{t(link.key)}</Link>
            ))}
          </nav>
          <div className="header-actions">
            <ThemeSwitch />
            <Link
              href="/settings"
              className={`settings-button ${pathname === "/settings" ? "active" : ""}`}
              aria-label={t("nav.settings")}
              aria-current={pathname === "/settings" ? "page" : undefined}
              title={t("nav.settings")}
            >
              <Settings size={22} aria-hidden="true" />
            </Link>
            <button type="button" className="menu-button" aria-label={t("nav.menu")} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
          </div>
        </div>
        {open && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>{t(link.key)}</Link>)}
          </nav>
        )}
      </header>
  );
}

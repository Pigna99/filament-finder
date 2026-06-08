"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const NAV = [
  { href: "/catalogo", label: "Catalogo" },
  { href: "/catalogo?tipo=PLA", label: "PLA" },
  { href: "/catalogo?tipo=PETG", label: "PETG" },
  { href: "/catalogo?tipo=TPU", label: "TPU" },
  { href: "/guide", label: "Guide" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    const base = href.split("?")[0];
    if (base === "/catalogo" && href === "/catalogo") return pathname === "/catalogo";
    return pathname === base || pathname.startsWith(base + "/");
  };

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        borderColor: "var(--line)",
        backgroundColor: "color-mix(in oklab, var(--surface-0) 82%, transparent)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold text-lg shrink-0"
          style={{ color: "var(--ink-1)", fontFamily: "var(--font-display)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={34} height={32} className="object-contain" />
          <span>
            Filament<span style={{ color: "var(--accent)" }}>Finder</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className="px-3 py-2 rounded-lg transition-colors"
              style={{
                color: isActive(item.href) ? "var(--ink-1)" : "var(--ink-3)",
                backgroundColor: isActive(item.href) ? "var(--surface-2)" : "transparent",
              }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/offerte"
            className="ml-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
          >
            <Icon name="tag" size={15} />
            Offerte
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="sm:hidden grid place-items-center w-10 h-10 rounded-lg transition-colors"
          style={{ color: "var(--ink-2)" }}
          aria-label={open ? "Chiudi menu" : "Apri menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          <Icon name={open ? "x" : "menu"} size={22} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <nav
          id="mobile-nav"
          className="sm:hidden border-t px-4 py-3 flex flex-col gap-1 text-sm"
          style={{ borderColor: "var(--line)", backgroundColor: "var(--surface-0)" }}
        >
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(item.href) ? "page" : undefined}
              className="px-3 py-2.5 rounded-lg transition-colors"
              style={{
                color: isActive(item.href) ? "var(--ink-1)" : "var(--ink-3)",
                backgroundColor: isActive(item.href) ? "var(--surface-2)" : "transparent",
              }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/offerte"
            onClick={() => setOpen(false)}
            className="mt-1 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg font-medium"
            style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
          >
            <Icon name="tag" size={15} />
            Offerte &amp; coupon
          </Link>
        </nav>
      )}
    </header>
  );
}

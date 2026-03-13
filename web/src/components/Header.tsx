"use client";
import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Filament Finder" width={36} height={34} className="object-contain" />
          <span>Filament Finder</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm text-zinc-400">
          <Link href="/catalogo" className="hover:text-zinc-100 transition-colors">Catalogo</Link>
          <Link href="/catalogo?tipo=PLA" className="hover:text-zinc-100 transition-colors">PLA</Link>
          <Link href="/catalogo?tipo=PETG" className="hover:text-zinc-100 transition-colors">PETG</Link>
          <Link href="/catalogo?tipo=TPU" className="hover:text-zinc-100 transition-colors">TPU</Link>
          <Link href="/guide" className="hover:text-zinc-100 transition-colors">Guide</Link>
          <Link href="/offerte" className="hover:text-zinc-100 transition-colors text-emerald-400 hover:text-emerald-300">Offerte</Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="sm:hidden p-2 text-zinc-400 hover:text-zinc-100 transition-colors"
          aria-label="Menu"
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-3 flex flex-col gap-3 text-sm text-zinc-400">
          <Link href="/catalogo" onClick={() => setOpen(false)} className="hover:text-zinc-100 transition-colors">Catalogo</Link>
          <Link href="/catalogo?tipo=PLA" onClick={() => setOpen(false)} className="hover:text-zinc-100 transition-colors">PLA</Link>
          <Link href="/catalogo?tipo=PETG" onClick={() => setOpen(false)} className="hover:text-zinc-100 transition-colors">PETG</Link>
          <Link href="/catalogo?tipo=TPU" onClick={() => setOpen(false)} className="hover:text-zinc-100 transition-colors">TPU</Link>
          <Link href="/guide" onClick={() => setOpen(false)} className="hover:text-zinc-100 transition-colors">Guide</Link>
          <Link href="/offerte" onClick={() => setOpen(false)} className="hover:text-zinc-100 transition-colors text-emerald-400">Offerte</Link>
        </div>
      )}
    </header>
  );
}

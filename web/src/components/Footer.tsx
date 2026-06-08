import Link from "next/link";

const LINKS: { label: string; href: string }[][] = [
  [
    { label: "Catalogo", href: "/catalogo" },
    { label: "Offerte & coupon", href: "/offerte" },
    { label: "Guide ai materiali", href: "/guide" },
  ],
  [
    { label: "PLA", href: "/catalogo?tipo=PLA" },
    { label: "PETG", href: "/catalogo?tipo=PETG" },
    { label: "TPU", href: "/catalogo?tipo=TPU" },
    { label: "ABS", href: "/catalogo?tipo=ABS" },
  ],
];

export default function Footer() {
  return (
    <footer
      className="mt-24 border-t"
      style={{ borderColor: "var(--line)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div
              className="flex items-center gap-2.5 font-semibold text-lg mb-3"
              style={{ color: "var(--ink-1)", fontFamily: "var(--font-display)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="" width={30} height={28} className="object-contain" />
              <span>
                Filament<span style={{ color: "var(--accent)" }}>Finder</span>
              </span>
            </div>
            <p className="text-sm max-w-sm leading-relaxed" style={{ color: "var(--ink-3)" }}>
              Confronta i prezzi dei filamenti per stampa 3D tra i principali shop
              italiani. Storico prezzi, filtri avanzati e schede tecniche.
            </p>
          </div>

          <nav className="flex flex-col gap-2.5 text-sm">
            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--ink-4)" }}>
              Naviga
            </p>
            {LINKS[0].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors w-fit"
                style={{ color: "var(--ink-3)" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <nav className="flex flex-col gap-2.5 text-sm">
            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: "var(--ink-4)" }}>
              Materiali
            </p>
            {LINKS[1].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors w-fit"
                style={{ color: "var(--ink-3)" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div
          className="mt-10 pt-6 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
          style={{ borderColor: "var(--line)", color: "var(--ink-4)" }}
        >
          <p>© {new Date().getFullYear()} Filament Finder · filamenti.offerteai.it</p>
          <p>
            I prezzi potrebbero non essere aggiornati in tempo reale. Verifica sempre
            sul sito del venditore.
          </p>
        </div>
      </div>
    </footer>
  );
}

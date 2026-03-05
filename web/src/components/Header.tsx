import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-zinc-100">
          <Image src="/logo.png" alt="Filament Finder" width={32} height={30} className="object-contain" />
          <span>Filament Finder</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-zinc-400">
          <Link href="/catalogo" className="hover:text-zinc-100 transition-colors">
            Catalogo
          </Link>
          <Link
            href="/catalogo?tipo=PLA"
            className="hover:text-zinc-100 transition-colors"
          >
            PLA
          </Link>
          <Link
            href="/catalogo?tipo=PETG"
            className="hover:text-zinc-100 transition-colors"
          >
            PETG
          </Link>
          <Link
            href="/catalogo?tipo=TPU"
            className="hover:text-zinc-100 transition-colors"
          >
            TPU
          </Link>
        </nav>
      </div>
    </header>
  );
}

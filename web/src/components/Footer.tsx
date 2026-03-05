export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 mt-16 py-8 text-center text-sm text-zinc-500">
      <p>
        © {new Date().getFullYear()} Filament Finder ·{" "}
        <span className="text-zinc-600">filamenti.offerteai.it</span>
      </p>
      <p className="mt-1 text-xs text-zinc-600">
        I prezzi potrebbero non essere aggiornati in tempo reale. Verifica sempre sul sito del venditore.
      </p>
    </footer>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{ backgroundColor: "var(--surface-0)" }}
    >
      <div className="text-6xl mb-4" style={{ color: "var(--accent)" }} aria-hidden>⬡</div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--ink-1)" }}>Pagina non trovata</h1>
      <p className="mb-6" style={{ color: "var(--ink-3)" }}>Il filamento che cerchi non esiste (ancora).</p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl font-semibold transition-transform hover:-translate-y-0.5"
        style={{ backgroundColor: "var(--accent)", color: "var(--accent-ink)" }}
      >
        Torna alla home
      </Link>
    </div>
  );
}

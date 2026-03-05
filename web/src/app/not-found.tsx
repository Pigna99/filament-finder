import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl mb-4">⬡</div>
      <h1 className="text-2xl font-bold text-zinc-100 mb-2">Pagina non trovata</h1>
      <p className="text-zinc-500 mb-6">Il filamento che cerchi non esiste (ancora).</p>
      <Link href="/" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl transition-colors">
        Torna alla home
      </Link>
    </div>
  );
}

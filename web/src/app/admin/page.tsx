"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import BrandTab from "./components/BrandTab";
import TipiTab from "./components/TipiTab";
import VariantiTab from "./components/VariantiTab";
import FilamentiTab from "./components/FilamentiTab";
import ShopTab from "./components/ShopTab";
import PrezziTab from "./components/PrezziTab";
import TagsTab from "./components/TagsTab";
import DatabaseTab from "./components/DatabaseTab";

const TABS = [
  { key: "brand",     label: "Brand" },
  { key: "tipi",      label: "Tipi" },
  { key: "varianti",  label: "Varianti" },
  { key: "filamenti", label: "Filamenti" },
  { key: "shop",      label: "Shop & Link" },
  { key: "prezzi",    label: "Prezzi" },
  { key: "tags",      label: "Tag" },
  { key: "database",  label: "Database" },
] as const;

type TabKey = typeof TABS[number]["key"];

function AdminDashboard() {
  const params = useSearchParams();
  const secret = params.get("secret") ?? "";
  const [tab, setTab] = useState<TabKey>("brand");

  if (!secret) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">Parametro <code className="text-emerald-400">?secret=</code> mancante.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 text-xl">⬡</span>
          <span className="font-bold text-zinc-100">Filament Finder</span>
          <span className="text-zinc-600 text-sm">Admin</span>
        </div>
        <a href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">← Sito pubblico</a>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-48 min-h-screen border-r border-zinc-800 bg-zinc-900 p-4 shrink-0">
          <ul className="space-y-1">
            {TABS.map(t => (
              <li key={t.key}>
                <button
                  onClick={() => setTab(t.key)}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                    tab === t.key
                      ? "bg-emerald-600 text-white"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                  }`}
                >
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contenuto */}
        <main className="flex-1 p-8 max-w-6xl">
          {tab === "brand"     && <BrandTab     secret={secret} />}
          {tab === "tipi"      && <TipiTab      secret={secret} />}
          {tab === "varianti"  && <VariantiTab  secret={secret} />}
          {tab === "filamenti" && <FilamentiTab secret={secret} />}
          {tab === "shop"      && <ShopTab      secret={secret} />}
          {tab === "prezzi"    && <PrezziTab    secret={secret} />}
          {tab === "tags"      && <TagsTab      secret={secret} />}
          {tab === "database"  && <DatabaseTab  secret={secret} />}
        </main>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Caricamento...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}

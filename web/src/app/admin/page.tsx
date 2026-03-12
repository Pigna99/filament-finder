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
import StampantiTab from "./components/StampantiTab";
import DatabaseTab from "./components/DatabaseTab";

const TABS = [
  { key: "brand",      label: "Brand",       icon: "🏷️" },
  { key: "tipi",       label: "Tipi",        icon: "🧱" },
  { key: "varianti",   label: "Varianti",    icon: "✨" },
  { key: "filamenti",  label: "Filamenti",   icon: "🧵" },
  { key: "shop",       label: "Shop & Link", icon: "🛒" },
  { key: "prezzi",     label: "Prezzi",      icon: "💶" },
  { key: "tags",       label: "Tag",         icon: "🔖" },
  { key: "stampanti",  label: "Stampanti",   icon: "🖨️" },
  { key: "database",   label: "Database",    icon: "🗄️" },
] as const;

type TabKey = typeof TABS[number]["key"];

function AdminDashboard() {
  const params = useSearchParams();
  const secret = params.get("secret") ?? "";
  const [tab, setTab] = useState<TabKey>("brand");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!secret) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">Parametro <code className="text-emerald-400">?secret=</code> mancante.</p>
      </div>
    );
  }

  const currentTab = TABS.find(t => t.key === tab)!;

  function selectTab(key: TabKey) {
    setTab(key);
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          {/* Hamburger — visibile solo su mobile */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="sm:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
            aria-label="Menu"
          >
            <span className={`block h-0.5 w-5 bg-zinc-400 transition-transform duration-200 ${sidebarOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block h-0.5 w-5 bg-zinc-400 transition-opacity duration-200 ${sidebarOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-zinc-400 transition-transform duration-200 ${sidebarOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
          <span className="text-emerald-400 text-xl hidden sm:inline">⬡</span>
          <span className="font-bold text-zinc-100">Filament Finder</span>
          <span className="text-zinc-600 text-sm hidden sm:inline">Admin</span>
          {/* Breadcrumb tab corrente su mobile */}
          <span className="sm:hidden text-zinc-600 text-sm">/ {currentTab.icon} {currentTab.label}</span>
        </div>
        <a href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">← Sito</a>
      </header>

      <div className="flex relative">
        {/* Overlay mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-30 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — fixed su mobile (drawer), sticky su desktop */}
        <nav className={`
          fixed sm:sticky top-0 sm:top-0 left-0 z-40
          w-56 sm:w-48 h-full sm:min-h-screen
          border-r border-zinc-800 bg-zinc-900
          p-4 shrink-0
          transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
          sm:pt-4
          pt-16
        `}>
          <p className="text-xs text-zinc-600 uppercase tracking-wider mb-3 px-1 sm:block hidden">Sezioni</p>
          <ul className="space-y-1">
            {TABS.map(t => (
              <li key={t.key}>
                <button
                  onClick={() => selectTab(t.key)}
                  className={`w-full text-left text-sm px-3 py-2.5 sm:py-2 rounded-lg transition-colors flex items-center gap-2.5 ${
                    tab === t.key
                      ? "bg-emerald-600 text-white"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                  }`}
                >
                  <span className="text-base leading-none">{t.icon}</span>
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contenuto */}
        <main className="flex-1 p-4 sm:p-8 min-w-0 max-w-6xl">
          {tab === "brand"     && <BrandTab     secret={secret} />}
          {tab === "tipi"      && <TipiTab      secret={secret} />}
          {tab === "varianti"  && <VariantiTab  secret={secret} />}
          {tab === "filamenti" && <FilamentiTab secret={secret} />}
          {tab === "shop"      && <ShopTab      secret={secret} />}
          {tab === "prezzi"    && <PrezziTab    secret={secret} />}
          {tab === "tags"       && <TagsTab       secret={secret} />}
          {tab === "stampanti"  && <StampantiTab  secret={secret} />}
          {tab === "database"   && <DatabaseTab   secret={secret} />}
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

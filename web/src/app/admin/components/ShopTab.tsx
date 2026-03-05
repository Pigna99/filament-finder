"use client";

import { useEffect, useState } from "react";

interface Shop { id: number; nome: string; url: string | null; paese: string | null; tipo: string | null; attivo: boolean }
interface Link { id: number; id_filament: number; id_shop: number; brand_nome: string; tipo_nome: string; variante_nome: string; colore: string | null; peso_g: number; shop_nome: string; link: string; affiliazione: boolean; attivo: boolean }
interface Filamento { id: number; brand_nome: string; tipo_nome: string; variante_nome: string; colore: string | null; peso_g: number }
interface Props { secret: string }

export default function ShopTab({ secret }: Props) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [filamenti, setFilamenti] = useState<Filamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"shop" | "links">("shop");
  const [msg, setMsg] = useState("");
  const [shopForm, setShopForm] = useState({ nome: "", url: "", paese: "", tipo: "reseller", codice_sconto: "" });
  const [linkForm, setLinkForm] = useState({ id_filament: "", id_shop: "", link: "", affiliazione: false, codice_sconto: "" });

  async function load() {
    setLoading(true);
    const [sr, lr, fr] = await Promise.all([
      fetch(`/api/admin/shop?secret=${secret}`).then(r => r.json()),
      fetch(`/api/admin/shop?secret=${secret}&mode=links`).then(r => r.json()),
      fetch(`/api/admin/filamenti?secret=${secret}`).then(r => r.json()),
    ]);
    setShops(sr); setLinks(lr); setFilamenti(fr);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);
  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(""), 3000); }

  async function saveShop() {
    await fetch(`/api/admin/shop?secret=${secret}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...shopForm, codice_sconto: shopForm.codice_sconto || null }),
    });
    setShopForm({ nome: "", url: "", paese: "", tipo: "reseller", codice_sconto: "" });
    flash("Shop creato"); load();
  }

  async function saveLink() {
    await fetch(`/api/admin/shop?secret=${secret}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "link", id_filament: Number(linkForm.id_filament), id_shop: Number(linkForm.id_shop), link: linkForm.link, affiliazione: linkForm.affiliazione, codice_sconto: linkForm.codice_sconto || null }),
    });
    setLinkForm({ id_filament: "", id_shop: "", link: "", affiliazione: false, codice_sconto: "" });
    flash("Link creato"); load();
  }

  async function delShop(id: number) {
    if (!confirm("Eliminare il negozio?")) return;
    await fetch(`/api/admin/shop?secret=${secret}&id=${id}`, { method: "DELETE" });
    flash("Shop eliminato"); load();
  }

  async function delLink(id: number) {
    if (!confirm("Eliminare il link?")) return;
    await fetch(`/api/admin/shop?secret=${secret}&id=${id}&mode=link`, { method: "DELETE" });
    flash("Link eliminato"); load();
  }

  async function toggleLink(l: Link) {
    await fetch(`/api/admin/shop?secret=${secret}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: l.id, mode: "link", attivo: !l.attivo }),
    });
    load();
  }

  const inp = "bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-emerald-500 w-full";

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-100 mb-4">Shop & Link acquisto</h2>
      {msg && <p className="text-emerald-400 text-sm mb-3">{msg}</p>}

      <div className="flex gap-2 mb-6">
        {(["shop", "links"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`text-sm px-4 py-1.5 rounded-lg transition-colors ${tab === t ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-zinc-100"}`}>
            {t === "shop" ? "Negozi" : "Link acquisto"}
          </button>
        ))}
      </div>

      {tab === "shop" && (
        <>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Nuovo negozio</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              <input placeholder="Nome *" value={shopForm.nome} onChange={e => setShopForm(f => ({ ...f, nome: e.target.value }))} className={inp} />
              <input placeholder="URL homepage" value={shopForm.url} onChange={e => setShopForm(f => ({ ...f, url: e.target.value }))} className={inp} />
              <input placeholder="Paese (IT, DE...)" maxLength={2} value={shopForm.paese} onChange={e => setShopForm(f => ({ ...f, paese: e.target.value.toUpperCase() }))} className={inp} />
              <select value={shopForm.tipo} onChange={e => setShopForm(f => ({ ...f, tipo: e.target.value }))} className={inp}>
                <option value="marketplace">Marketplace</option>
                <option value="diretto">Diretto (brand)</option>
                <option value="reseller">Reseller</option>
              </select>
              <input placeholder="Coupon affiliato globale" value={shopForm.codice_sconto} onChange={e => setShopForm(f => ({ ...f, codice_sconto: e.target.value }))} className={inp} />
            </div>
            <button onClick={saveShop} disabled={!shopForm.nome} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm px-4 py-1.5 rounded">Crea</button>
          </div>

          {loading ? <p className="text-zinc-500 text-sm">Caricamento...</p> : (
            <div className="space-y-2">
              {shops.map(s => (
                <div key={s.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-100 text-sm font-medium">{s.nome}</span>
                    {s.paese && <span className="text-xs bg-zinc-800 text-zinc-400 px-1.5 rounded">{s.paese}</span>}
                    {s.tipo && <span className="text-xs text-zinc-500">{s.tipo}</span>}
                  </div>
                  <button onClick={() => delShop(s.id)} className="text-red-500 hover:text-red-400 text-xs">Elimina</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "links" && (
        <>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Aggiungi link acquisto</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              <select value={linkForm.id_filament} onChange={e => setLinkForm(f => ({ ...f, id_filament: e.target.value }))} className={inp}>
                <option value="">Filamento *</option>
                {filamenti.map(f => <option key={f.id} value={f.id}>{f.brand_nome} · {f.tipo_nome} {f.variante_nome} {f.colore ?? ""} {f.peso_g}g</option>)}
              </select>
              <select value={linkForm.id_shop} onChange={e => setLinkForm(f => ({ ...f, id_shop: e.target.value }))} className={inp}>
                <option value="">Shop *</option>
                {shops.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
              <input placeholder="URL prodotto *" value={linkForm.link} onChange={e => setLinkForm(f => ({ ...f, link: e.target.value }))} className={inp} />
              <input placeholder="Coupon specifico prodotto" value={linkForm.codice_sconto} onChange={e => setLinkForm(f => ({ ...f, codice_sconto: e.target.value }))} className={inp} />
              <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                <input type="checkbox" checked={linkForm.affiliazione} onChange={e => setLinkForm(f => ({ ...f, affiliazione: e.target.checked }))} className="accent-emerald-500" />
                Link affiliato
              </label>
            </div>
            <button onClick={saveLink} disabled={!linkForm.id_filament || !linkForm.id_shop || !linkForm.link} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm px-4 py-1.5 rounded">Aggiungi</button>
          </div>

          {loading ? <p className="text-zinc-500 text-sm">Caricamento...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-500 text-left border-b border-zinc-800">
                    <th className="pb-2 pr-4">Filamento</th>
                    <th className="pb-2 pr-4">Shop</th>
                    <th className="pb-2 pr-4">Link</th>
                    <th className="pb-2 pr-4">Stato</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {links.map(l => (
                    <tr key={l.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-2 pr-4 text-zinc-100 text-xs">{l.brand_nome} · {l.tipo_nome} {l.variante_nome} {l.colore ?? ""} {l.peso_g}g</td>
                      <td className="py-2 pr-4 text-zinc-400 text-xs">{l.shop_nome}</td>
                      <td className="py-2 pr-4 text-xs"><a href={l.link} target="_blank" className="text-emerald-400 hover:underline truncate block max-w-[200px]">{l.link}</a></td>
                      <td className="py-2 pr-4">
                        <button onClick={() => toggleLink(l)} className={`text-xs px-2 py-0.5 rounded-full ${l.attivo ? "bg-emerald-900/50 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>
                          {l.attivo ? "attivo" : "inattivo"}
                        </button>
                      </td>
                      <td className="py-2 text-right">
                        <button onClick={() => delLink(l.id)} className="text-red-500 hover:text-red-400 text-xs">Elimina</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

interface FilLink { id: number; id_shop: number; shop_nome: string; link: string; attivo: boolean; prezzo: number | null; prezzo_scontato: number | null; disponibile: boolean | null; rilevato_at: string | null }
interface Filamento { id: number; brand_nome: string; tipo_nome: string; variante_nome: string; colore: string | null; peso_g: number }
interface Props { secret: string }

export default function PrezziTab({ secret }: Props) {
  const [filamenti, setFilamenti] = useState<Filamento[]>([]);
  const [selFilId, setSelFilId] = useState("");
  const [links, setLinks] = useState<FilLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ id_filament_shop: "", prezzo: "", prezzo_spedizione: "0", sconto_percentuale: "", prezzo_scontato: "", disponibile: true });

  useEffect(() => {
    fetch(`/api/admin/filamenti?secret=${secret}`).then(r => r.json()).then(setFilamenti);
  }, []);

  async function loadLinks(id: string) {
    setSelFilId(id); setLinks([]); setLoading(true);
    const r = await fetch(`/api/admin/prezzi?secret=${secret}&id_filament=${id}`);
    setLinks(await r.json()); setLoading(false);
  }

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(""), 3000); }

  async function save() {
    const body = {
      id_filament_shop: Number(form.id_filament_shop),
      prezzo: Number(form.prezzo),
      prezzo_spedizione: Number(form.prezzo_spedizione || 0),
      sconto_percentuale: form.sconto_percentuale ? Number(form.sconto_percentuale) : null,
      prezzo_scontato: form.prezzo_scontato ? Number(form.prezzo_scontato) : null,
      disponibile: form.disponibile,
    };
    await fetch(`/api/admin/prezzi?secret=${secret}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    setForm({ id_filament_shop: "", prezzo: "", prezzo_spedizione: "0", sconto_percentuale: "", prezzo_scontato: "", disponibile: true });
    flash("Prezzo inserito");
    loadLinks(selFilId);
  }

  const inp = "bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-emerald-500 w-full";

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-100 mb-4">Inserimento manuale prezzi</h2>
      {msg && <p className="text-emerald-400 text-sm mb-3">{msg}</p>}

      <div className="mb-6">
        <label className="block text-xs text-zinc-500 mb-1">Seleziona filamento</label>
        <select value={selFilId} onChange={e => loadLinks(e.target.value)} className={inp}>
          <option value="">— scegli un filamento —</option>
          {filamenti.map(f => (
            <option key={f.id} value={f.id}>
              {f.brand_nome} · {f.tipo_nome} {f.variante_nome} {f.colore ?? ""} {f.peso_g}g
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-zinc-500 text-sm">Caricamento link...</p>}

      {links.length > 0 && (
        <>
          {/* Form inserimento */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Inserisci rilevamento prezzo</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              <select value={form.id_filament_shop} onChange={e => setForm(f => ({ ...f, id_filament_shop: e.target.value }))} className={inp}>
                <option value="">Shop *</option>
                {links.map(l => <option key={l.id} value={l.id}>{l.shop_nome}</option>)}
              </select>
              <input placeholder="Prezzo € *" type="number" step="0.01" value={form.prezzo} onChange={e => setForm(f => ({ ...f, prezzo: e.target.value }))} className={inp} />
              <input placeholder="Spedizione €" type="number" step="0.01" value={form.prezzo_spedizione} onChange={e => setForm(f => ({ ...f, prezzo_spedizione: e.target.value }))} className={inp} />
              <input placeholder="Sconto %" type="number" step="0.1" value={form.sconto_percentuale} onChange={e => setForm(f => ({ ...f, sconto_percentuale: e.target.value }))} className={inp} />
              <input placeholder="Prezzo scontato €" type="number" step="0.01" value={form.prezzo_scontato} onChange={e => setForm(f => ({ ...f, prezzo_scontato: e.target.value }))} className={inp} />
              <label className="flex items-center gap-2 text-sm text-zinc-400">
                <input type="checkbox" checked={form.disponibile} onChange={e => setForm(f => ({ ...f, disponibile: e.target.checked }))} className="accent-emerald-500" />
                Disponibile
              </label>
            </div>
            <button onClick={save} disabled={!form.id_filament_shop || !form.prezzo} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm px-4 py-1.5 rounded">Inserisci</button>
          </div>

          {/* Tabella link esistenti */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-left border-b border-zinc-800">
                  <th className="pb-2 pr-4">Shop</th>
                  <th className="pb-2 pr-4">Ultimo prezzo</th>
                  <th className="pb-2 pr-4">Scontato</th>
                  <th className="pb-2 pr-4">Rilevato</th>
                  <th className="pb-2 pr-4">Disp.</th>
                </tr>
              </thead>
              <tbody>
                {links.map(l => (
                  <tr key={l.id} className="border-b border-zinc-800/50">
                    <td className="py-2 pr-4 text-zinc-100">{l.shop_nome}</td>
                    <td className="py-2 pr-4 text-zinc-100">{l.prezzo ? `€ ${Number(l.prezzo).toFixed(2)}` : "—"}</td>
                    <td className="py-2 pr-4 text-emerald-400">{l.prezzo_scontato ? `€ ${Number(l.prezzo_scontato).toFixed(2)}` : "—"}</td>
                    <td className="py-2 pr-4 text-zinc-500 text-xs">{l.rilevato_at ? new Date(l.rilevato_at).toLocaleString("it-IT") : "—"}</td>
                    <td className="py-2 pr-4">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${l.disponibile ? "bg-emerald-900/50 text-emerald-400" : "bg-red-900/50 text-red-400"}`}>
                        {l.disponibile == null ? "?" : l.disponibile ? "sì" : "no"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selFilId && !loading && links.length === 0 && (
        <p className="text-zinc-500 text-sm mt-4">Nessun link di acquisto configurato per questo filamento. Aggiungili prima nel tab Shop.</p>
      )}
    </div>
  );
}

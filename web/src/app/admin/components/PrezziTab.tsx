"use client";

import { useEffect, useState } from "react";
import { Field, inp, sel } from "./Field";

interface FilLink {
  id: number; id_shop: number; shop_nome: string; link: string;
  attivo: boolean; prezzo: number | null; prezzo_scontato: number | null;
  disponibile: boolean | null; rilevato_at: string | null;
}
interface Filamento { id: number; brand_nome: string; tipo_nome: string; variante_nome: string; colore: string | null; peso_g: number }
interface Props { secret: string }

const emptyForm = { id_filament_shop: "", prezzo: "", prezzo_spedizione: "0", sconto_percentuale: "", prezzo_scontato: "", disponibile: true };
type Form = typeof emptyForm;

export default function PrezziTab({ secret }: Props) {
  const [filamenti, setFilamenti] = useState<Filamento[]>([]);
  const [selFilId, setSelFilId] = useState("");
  const [links, setLinks] = useState<FilLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState<Form>(emptyForm);

  useEffect(() => {
    fetch(`/api/admin/filamenti?secret=${secret}`).then(r => r.json()).then(setFilamenti);
  }, []);

  async function loadLinks(id: string) {
    setSelFilId(id);
    setLinks([]);
    setForm(emptyForm);
    if (!id) return;
    setLoading(true);
    const r = await fetch(`/api/admin/prezzi?secret=${secret}&id_filament=${id}`);
    setLinks(await r.json());
    setLoading(false);
  }

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(""), 3000); }

  async function save() {
    if (!form.id_filament_shop || !form.prezzo) return;
    setSaving(true);
    await fetch(`/api/admin/prezzi?secret=${secret}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_filament_shop: Number(form.id_filament_shop),
        prezzo: Number(form.prezzo),
        prezzo_spedizione: Number(form.prezzo_spedizione || 0),
        sconto_percentuale: form.sconto_percentuale ? Number(form.sconto_percentuale) : null,
        prezzo_scontato: form.prezzo_scontato ? Number(form.prezzo_scontato) : null,
        disponibile: form.disponibile,
      }),
    });
    setForm(emptyForm);
    flash("Prezzo inserito");
    setSaving(false);
    loadLinks(selFilId);
  }

  const selFilamento = filamenti.find(f => String(f.id) === selFilId);

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-100 mb-1">Inserimento manuale prezzi</h2>
      <p className="text-xs text-zinc-500 mb-5">
        Registra manualmente un rilevamento di prezzo per un filamento. Lo scraper aggiorna automaticamente, usa questo per correzioni manuali.
      </p>

      {msg && <p className="text-emerald-400 text-sm mb-4">{msg}</p>}

      {/* Selezione filamento */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
        <Field label="Seleziona filamento" tooltip="Scegli il filamento per cui vuoi inserire il prezzo. Verranno mostrati i link shop disponibili.">
          <select value={selFilId} onChange={e => loadLinks(e.target.value)} className={sel}>
            <option value="">— scegli un filamento —</option>
            {filamenti.map(f => (
              <option key={f.id} value={f.id}>
                {f.brand_nome} · {f.tipo_nome} {f.variante_nome} {f.colore ?? ""} {f.peso_g}g
              </option>
            ))}
          </select>
        </Field>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-zinc-500 text-sm mb-4">
          <div className="w-4 h-4 border-2 border-zinc-600 border-t-emerald-500 rounded-full animate-spin" />
          Caricamento link...
        </div>
      )}

      {selFilId && !loading && links.length === 0 && (
        <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-4 text-sm text-amber-400 mb-6">
          Nessun link di acquisto configurato per questo filamento. Aggiungili prima nel tab <strong>Shop &gt; Link acquisto</strong>.
        </div>
      )}

      {links.length > 0 && (
        <>
          {/* Form inserimento prezzo */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-zinc-200 mb-1">Inserisci rilevamento prezzo</h3>
            {selFilamento && (
              <p className="text-xs text-zinc-500 mb-4">
                {selFilamento.brand_nome} · {selFilamento.tipo_nome} {selFilamento.variante_nome} {selFilamento.colore ?? ""} {selFilamento.peso_g}g
              </p>
            )}
            <div className="space-y-4">
              <Field label="Negozio (link)" tooltip="Seleziona il link shop per cui stai inserendo il prezzo. Ogni voce corrisponde a un link specifico nel negozio." required>
                <select value={form.id_filament_shop} onChange={e => setForm(f => ({ ...f, id_filament_shop: e.target.value }))} className={sel}>
                  <option value="">Seleziona negozio...</option>
                  {links.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.shop_nome}{l.attivo ? "" : " (inattivo)"}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="Prezzo €" tooltip="Prezzo di listino senza sconti, IVA inclusa" required>
                  <input type="number" step="0.01" min="0" value={form.prezzo}
                    onChange={e => setForm(f => ({ ...f, prezzo: e.target.value }))} className={inp} placeholder="19.99" />
                </Field>
                <Field label="Spedizione €" tooltip="Costo di spedizione aggiuntivo. Inserisci 0 se gratuita.">
                  <input type="number" step="0.01" min="0" value={form.prezzo_spedizione}
                    onChange={e => setForm(f => ({ ...f, prezzo_spedizione: e.target.value }))} className={inp} placeholder="0.00" />
                </Field>
                <Field label="Sconto %" tooltip="Percentuale di sconto applicata (es. 15 per 15%). Lascia vuoto se non c'è promozione.">
                  <input type="number" step="0.1" min="0" max="100" value={form.sconto_percentuale}
                    onChange={e => setForm(f => ({ ...f, sconto_percentuale: e.target.value }))} className={inp} placeholder="15" />
                </Field>
                <Field label="Prezzo scontato €" tooltip="Prezzo finale dopo lo sconto. Se inserito, sovrascrive il calcolo automatico da percentuale.">
                  <input type="number" step="0.01" min="0" value={form.prezzo_scontato}
                    onChange={e => setForm(f => ({ ...f, prezzo_scontato: e.target.value }))} className={inp} placeholder="16.99" />
                </Field>
                <Field label="Disponibile" tooltip="Se il prodotto è attualmente disponibile per l'acquisto nel negozio.">
                  <div className="flex items-center gap-2 h-9">
                    <input type="checkbox" checked={form.disponibile}
                      onChange={e => setForm(f => ({ ...f, disponibile: e.target.checked }))}
                      className="accent-emerald-500 w-4 h-4 cursor-pointer" />
                    <span className="text-sm text-zinc-400">In stock</span>
                  </div>
                </Field>
              </div>
            </div>
            <div className="mt-4">
              <button onClick={save} disabled={!form.id_filament_shop || !form.prezzo || saving}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm px-5 py-2 rounded-lg font-medium transition-colors">
                {saving ? "Salvo..." : "Inserisci rilevamento"}
              </button>
            </div>
          </div>

          {/* Tabella storico prezzi per i link */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-3">Ultimo prezzo rilevato per shop</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-500 text-left border-b border-zinc-800 text-xs uppercase tracking-wider">
                    <th className="pb-3 pr-4">Shop</th>
                    <th className="pb-3 pr-4">Prezzo</th>
                    <th className="pb-3 pr-4 hidden sm:table-cell">Scontato</th>
                    <th className="pb-3 pr-4 hidden sm:table-cell">Rilevato</th>
                    <th className="pb-3 pr-4">Disp.</th>
                    <th className="pb-3">Stato link</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map(l => (
                    <tr key={l.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                      <td className="py-2.5 pr-4 text-zinc-100 font-medium">{l.shop_nome}</td>
                      <td className="py-2.5 pr-4 text-zinc-100">
                        {l.prezzo ? `€ ${Number(l.prezzo).toFixed(2)}` : <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="py-2.5 pr-4 text-emerald-400 hidden sm:table-cell">
                        {l.prezzo_scontato ? `€ ${Number(l.prezzo_scontato).toFixed(2)}` : <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-500 text-xs hidden sm:table-cell">
                        {l.rilevato_at ? new Date(l.rilevato_at).toLocaleString("it-IT") : <span className="text-zinc-600">mai</span>}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${l.disponibile == null ? "bg-zinc-800 text-zinc-500" : l.disponibile ? "bg-emerald-900/50 text-emerald-400" : "bg-red-900/50 text-red-400"}`}>
                          {l.disponibile == null ? "?" : l.disponibile ? "sì" : "no"}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${l.attivo ? "bg-zinc-800 text-zinc-400" : "bg-red-900/20 text-red-500"}`}>
                          {l.attivo ? "attivo" : "inattivo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

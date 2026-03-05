"use client";

import { useEffect, useState } from "react";

interface Filamento {
  id: number; id_variant: number; id_brand: number;
  brand_nome: string; tipo_nome: string; variante_nome: string;
  sku: string | null; peso_g: number; diametro_mm: number;
  colore: string | null; colore_hex: string | null; colore_famiglia: string | null;
  link_immagine: string | null; link_brand: string | null;
  humidity_sensitive: boolean; attivo: boolean;
}
interface Brand { id: number; nome: string }
interface Variante { id: number; nome: string; tipo_nome: string }
interface Props { secret: string }

const FAMIGLIE = ["bianco", "nero", "grigio", "rosso", "blu", "verde", "giallo", "arancio", "viola", "trasparente", "multicolor"];
const empty = { id_variant: "", id_brand: "", sku: "", peso_g: "1000", diametro_mm: "1.75", colore: "", colore_hex: "#ffffff", colore_famiglia: "", link_immagine: "", link_brand: "", humidity_sensitive: false };

export default function FilamentiTab({ secret }: Props) {
  const [filamenti, setFilamenti] = useState<Filamento[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [varianti, setVarianti] = useState<Variante[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [filterBrand, setFilterBrand] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const [fr, br, vr] = await Promise.all([
      fetch(`/api/admin/filamenti?secret=${secret}`).then(r => r.json()),
      fetch(`/api/admin/brand?secret=${secret}`).then(r => r.json()),
      fetch(`/api/admin/varianti?secret=${secret}`).then(r => r.json()),
    ]);
    setFilamenti(fr); setBrands(br); setVarianti(vr);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);
  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(""), 3000); }

  async function save() {
    const body = {
      ...(editId ? { id: editId } : {}),
      id_variant: Number(form.id_variant),
      id_brand: Number(form.id_brand),
      sku: form.sku || null,
      peso_g: Number(form.peso_g),
      diametro_mm: Number(form.diametro_mm),
      colore: form.colore || null,
      colore_hex: form.colore_hex || null,
      colore_famiglia: form.colore_famiglia || null,
      link_immagine: form.link_immagine || null,
      link_brand: form.link_brand || null,
      humidity_sensitive: form.humidity_sensitive,
    };
    await fetch(`/api/admin/filamenti?secret=${secret}`, {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setForm(empty); setEditId(null);
    flash(editId ? "Filamento aggiornato" : "Filamento creato");
    load();
  }

  async function del(id: number) {
    if (!confirm("Eliminare il filamento?")) return;
    await fetch(`/api/admin/filamenti?secret=${secret}&id=${id}`, { method: "DELETE" });
    flash("Filamento eliminato"); load();
  }

  function startEdit(f: Filamento) {
    setEditId(f.id);
    setForm({
      id_variant: String(f.id_variant), id_brand: String(f.id_brand),
      sku: f.sku ?? "", peso_g: String(f.peso_g), diametro_mm: String(f.diametro_mm),
      colore: f.colore ?? "", colore_hex: f.colore_hex ?? "#ffffff", colore_famiglia: f.colore_famiglia ?? "",
      link_immagine: f.link_immagine ?? "", link_brand: f.link_brand ?? "",
      humidity_sensitive: f.humidity_sensitive,
    });
  }

  const inp = "bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-emerald-500 w-full";
  const shown = filterBrand ? filamenti.filter(f => f.brand_nome === filterBrand) : filamenti;

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-100 mb-4">Filamenti</h2>
      {msg && <p className="text-emerald-400 text-sm mb-3">{msg}</p>}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">{editId ? "Modifica filamento" : "Nuovo filamento"}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <select value={form.id_brand} onChange={e => setForm(f => ({ ...f, id_brand: e.target.value }))} className={inp}>
            <option value="">Brand *</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
          </select>
          <select value={form.id_variant} onChange={e => setForm(f => ({ ...f, id_variant: e.target.value }))} className={inp}>
            <option value="">Variante *</option>
            {varianti.map(v => <option key={v.id} value={v.id}>{v.tipo_nome} — {v.nome}</option>)}
          </select>
          <input placeholder="SKU" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className={inp} />
          <select value={form.peso_g} onChange={e => setForm(f => ({ ...f, peso_g: e.target.value }))} className={inp}>
            {[250, 500, 750, 1000, 2000, 3000].map(g => <option key={g} value={g}>{g}g</option>)}
          </select>
          <select value={form.diametro_mm} onChange={e => setForm(f => ({ ...f, diametro_mm: e.target.value }))} className={inp}>
            <option value="1.75">1.75 mm</option>
            <option value="2.85">2.85 mm</option>
          </select>
          <input placeholder="Nome colore" value={form.colore} onChange={e => setForm(f => ({ ...f, colore: e.target.value }))} className={inp} />
          <div className="flex gap-2">
            <input type="color" value={form.colore_hex} onChange={e => setForm(f => ({ ...f, colore_hex: e.target.value }))} className="h-9 w-12 rounded border border-zinc-700 bg-zinc-800 cursor-pointer p-0.5" />
            <input placeholder="#hex" value={form.colore_hex} onChange={e => setForm(f => ({ ...f, colore_hex: e.target.value }))} className={`${inp} font-mono`} />
          </div>
          <select value={form.colore_famiglia} onChange={e => setForm(f => ({ ...f, colore_famiglia: e.target.value }))} className={inp}>
            <option value="">Famiglia colore</option>
            {FAMIGLIE.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input placeholder="URL immagine" value={form.link_immagine} onChange={e => setForm(f => ({ ...f, link_immagine: e.target.value }))} className={`${inp} col-span-2`} />
          <input placeholder="URL pagina brand" value={form.link_brand} onChange={e => setForm(f => ({ ...f, link_brand: e.target.value }))} className={`${inp} col-span-2`} />
          <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
            <input type="checkbox" checked={form.humidity_sensitive} onChange={e => setForm(f => ({ ...f, humidity_sensitive: e.target.checked }))} className="accent-emerald-500" />
            Humidity sensitive
          </label>
        </div>
        <div className="flex gap-2">
          <button onClick={save} disabled={!form.id_variant || !form.id_brand} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm px-4 py-1.5 rounded">
            {editId ? "Aggiorna" : "Crea"}
          </button>
          {editId && <button onClick={() => { setEditId(null); setForm(empty); }} className="text-zinc-400 text-sm px-3 py-1.5">Annulla</button>}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded px-3 py-1.5">
          <option value="">Tutti i brand</option>
          {brands.map(b => <option key={b.id} value={b.nome}>{b.nome}</option>)}
        </select>
        <span className="text-sm text-zinc-500">{shown.length} filamenti</span>
      </div>

      {loading ? <p className="text-zinc-500 text-sm">Caricamento...</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-left border-b border-zinc-800">
                <th className="pb-2 pr-4">Brand / Tipo / Variante</th>
                <th className="pb-2 pr-4">Colore</th>
                <th className="pb-2 pr-4">Peso</th>
                <th className="pb-2 pr-4">⌀</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {shown.map(f => (
                <tr key={f.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="py-2 pr-4">
                    <span className="text-zinc-100">{f.brand_nome}</span>
                    <span className="text-zinc-500"> · {f.tipo_nome} {f.variante_nome}</span>
                  </td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-1.5">
                      {f.colore_hex && <span className="w-3 h-3 rounded-full border border-zinc-700" style={{ backgroundColor: f.colore_hex }} />}
                      <span className="text-zinc-400 text-xs">{f.colore ?? "—"}</span>
                    </div>
                  </td>
                  <td className="py-2 pr-4 text-zinc-400">{f.peso_g}g</td>
                  <td className="py-2 pr-4 text-zinc-400">{f.diametro_mm}mm</td>
                  <td className="py-2 text-right space-x-2">
                    <button onClick={() => startEdit(f)} className="text-zinc-400 hover:text-zinc-100 text-xs">Modifica</button>
                    <button onClick={() => del(f.id)} className="text-red-500 hover:text-red-400 text-xs">Elimina</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

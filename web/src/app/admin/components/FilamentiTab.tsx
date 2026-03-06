"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import { Field, inp, sel } from "./Field";

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
const emptyForm = {
  id_variant: "", id_brand: "", sku: "", peso_g: "1000", diametro_mm: "1.75",
  colore: "", colore_hex: "#ffffff", colore_famiglia: "",
  link_immagine: "", link_brand: "", humidity_sensitive: false,
};
type Form = typeof emptyForm;

function FilamentoFields({ form, setForm, brands, varianti }: {
  form: Form; setForm: React.Dispatch<React.SetStateAction<Form>>;
  brands: Brand[]; varianti: Variante[];
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Brand" tooltip="Il produttore del filamento (es. Bambu Lab, eSUN, Polymaker)" required>
          <select value={form.id_brand} onChange={e => setForm(f => ({ ...f, id_brand: e.target.value }))} className={sel}>
            <option value="">Seleziona brand...</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.nome}</option>)}
          </select>
        </Field>
        <Field label="Variante materiale" tooltip="Il tipo+variante del filamento (es. PLA Matte, PETG CF). Aggiungile nel tab Varianti." required>
          <select value={form.id_variant} onChange={e => setForm(f => ({ ...f, id_variant: e.target.value }))} className={sel}>
            <option value="">Seleziona variante...</option>
            {varianti.map(v => <option key={v.id} value={v.id}>{v.tipo_nome} — {v.nome}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Field label="SKU / codice prodotto" tooltip="Codice identificativo del produttore, utile per il tracciamento">
          <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className={inp} placeholder="es. BL-PLA-MATTE-BLK-1KG" />
        </Field>
        <Field label="Peso bobina" tooltip="Peso netto del filamento in grammi (esclusa la bobina)">
          <select value={form.peso_g} onChange={e => setForm(f => ({ ...f, peso_g: e.target.value }))} className={sel}>
            {[250, 500, 750, 1000, 2000, 3000].map(g => <option key={g} value={g}>{g}g</option>)}
          </select>
        </Field>
        <Field label="Diametro" tooltip="Diametro del filamento in millimetri. 1.75mm è lo standard FDM, 2.85mm per alcune stampanti Ultimaker/Lulzbot">
          <select value={form.diametro_mm} onChange={e => setForm(f => ({ ...f, diametro_mm: e.target.value }))} className={sel}>
            <option value="1.75">1.75 mm</option>
            <option value="2.85">2.85 mm</option>
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Nome colore" tooltip="Nome commerciale del colore (es. Bambu Green, Flame Red, Pure White)">
          <input value={form.colore} onChange={e => setForm(f => ({ ...f, colore: e.target.value }))} className={inp} placeholder="es. Jade Green" />
        </Field>
        <Field label="Colore HEX" tooltip="Codice esadecimale del colore per la preview visiva nell'interfaccia">
          <div className="flex gap-2">
            <input type="color" value={form.colore_hex}
              onChange={e => setForm(f => ({ ...f, colore_hex: e.target.value }))}
              className="h-9 w-12 rounded-lg border border-zinc-700 bg-zinc-800 cursor-pointer p-0.5 shrink-0" />
            <input value={form.colore_hex} onChange={e => setForm(f => ({ ...f, colore_hex: e.target.value }))} className={`${inp} font-mono`} placeholder="#ffffff" />
          </div>
        </Field>
        <Field label="Famiglia colore" tooltip="Categoria cromatica usata per i filtri di ricerca sul sito">
          <select value={form.colore_famiglia} onChange={e => setForm(f => ({ ...f, colore_famiglia: e.target.value }))} className={sel}>
            <option value="">Nessuna</option>
            {FAMIGLIE.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="URL immagine" tooltip="Link diretto all'immagine del prodotto (JPG/PNG/WebP), mostrata nella card e nella pagina dettaglio">
          <input value={form.link_immagine} onChange={e => setForm(f => ({ ...f, link_immagine: e.target.value }))} className={inp} placeholder="https://..." />
        </Field>
        <Field label="URL pagina brand" tooltip="Link alla pagina ufficiale del prodotto sul sito del brand (non lo shop)">
          <input value={form.link_brand} onChange={e => setForm(f => ({ ...f, link_brand: e.target.value }))} className={inp} placeholder="https://bambulab.com/..." />
        </Field>
      </div>
      <Field label="Humidity sensitive" tooltip="Se attivo, mostra un avviso sull'importanza dell'essiccatura nella pagina prodotto">
        <div className="flex items-center gap-2 h-9">
          <input type="checkbox" checked={form.humidity_sensitive}
            onChange={e => setForm(f => ({ ...f, humidity_sensitive: e.target.checked }))}
            className="accent-emerald-500 w-4 h-4 cursor-pointer" />
          <span className="text-sm text-zinc-400">Questo filamento è sensibile all&apos;umidità</span>
        </div>
      </Field>
    </div>
  );
}

export default function FilamentiTab({ secret }: Props) {
  const [filamenti, setFilamenti] = useState<Filamento[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [varianti, setVarianti] = useState<Variante[]>([]);
  const [loading, setLoading] = useState(true);
  const [newForm, setNewForm] = useState<Form>(emptyForm);
  const [editItem, setEditItem] = useState<Filamento | null>(null);
  const [editForm, setEditForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
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

  function buildBody(form: Form, id?: number) {
    return {
      ...(id ? { id } : {}),
      id_variant: Number(form.id_variant), id_brand: Number(form.id_brand),
      sku: form.sku || null, peso_g: Number(form.peso_g), diametro_mm: Number(form.diametro_mm),
      colore: form.colore || null, colore_hex: form.colore_hex || null,
      colore_famiglia: form.colore_famiglia || null,
      link_immagine: form.link_immagine || null, link_brand: form.link_brand || null,
      humidity_sensitive: form.humidity_sensitive,
    };
  }

  async function create() {
    if (!newForm.id_variant || !newForm.id_brand) return;
    setSaving(true);
    await fetch(`/api/admin/filamenti?secret=${secret}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildBody(newForm)),
    });
    setNewForm(emptyForm);
    flash("Filamento creato");
    setSaving(false);
    load();
  }

  async function saveEdit() {
    if (!editItem) return;
    setSaving(true);
    await fetch(`/api/admin/filamenti?secret=${secret}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildBody(editForm, editItem.id)),
    });
    setEditItem(null);
    flash("Filamento aggiornato");
    setSaving(false);
    load();
  }

  async function del(id: number) {
    if (!confirm("Eliminare il filamento? Verranno eliminati anche i link shop e i prezzi associati.")) return;
    await fetch(`/api/admin/filamenti?secret=${secret}&id=${id}`, { method: "DELETE" });
    flash("Filamento eliminato");
    load();
  }

  function openEdit(f: Filamento) {
    setEditForm({
      id_variant: String(f.id_variant), id_brand: String(f.id_brand),
      sku: f.sku ?? "", peso_g: String(f.peso_g), diametro_mm: String(f.diametro_mm),
      colore: f.colore ?? "", colore_hex: f.colore_hex ?? "#ffffff",
      colore_famiglia: f.colore_famiglia ?? "",
      link_immagine: f.link_immagine ?? "", link_brand: f.link_brand ?? "",
      humidity_sensitive: f.humidity_sensitive,
    });
    setEditItem(f);
  }

  const shown = filterBrand ? filamenti.filter(f => f.brand_nome === filterBrand) : filamenti;

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-100 mb-1">Filamenti</h2>
      <p className="text-xs text-zinc-500 mb-5">Prodotti specifici: combinazione di brand + variante + colore + peso. Ogni filamento può avere più link shop.</p>

      {msg && <p className="text-emerald-400 text-sm mb-4">{msg}</p>}

      {/* Form nuovo */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Nuovo filamento</h3>
        <FilamentoFields form={newForm} setForm={setNewForm} brands={brands} varianti={varianti} />
        <div className="mt-4">
          <button onClick={create} disabled={!newForm.id_variant || !newForm.id_brand || saving}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm px-5 py-2 rounded-lg font-medium transition-colors">
            Crea filamento
          </button>
        </div>
      </div>

      {/* Filtro */}
      <div className="mb-4 flex items-center gap-3">
        <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500">
          <option value="">Tutti i brand</option>
          {brands.map(b => <option key={b.id} value={b.nome}>{b.nome}</option>)}
        </select>
        <span className="text-sm text-zinc-500">{shown.length} filamenti</span>
      </div>

      {loading ? <p className="text-zinc-500 text-sm">Caricamento...</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-left border-b border-zinc-800 text-xs uppercase tracking-wider">
                <th className="pb-3 pr-4">Brand / Tipo / Variante</th>
                <th className="pb-3 pr-4">Colore</th>
                <th className="pb-3 pr-4 hidden sm:table-cell">Peso</th>
                <th className="pb-3 pr-4 hidden sm:table-cell">Diam.</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {shown.map(f => (
                <tr key={f.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                  <td className="py-2.5 pr-4">
                    <span className="text-zinc-100 font-medium">{f.brand_nome}</span>
                    <span className="text-zinc-500"> · {f.tipo_nome} {f.variante_nome}</span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-1.5">
                      {f.colore_hex && <span className="w-3 h-3 rounded-full border border-zinc-700 shrink-0" style={{ backgroundColor: f.colore_hex }} />}
                      <span className="text-zinc-400 text-xs">{f.colore ?? "—"}</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4 text-zinc-400 hidden sm:table-cell">{f.peso_g}g</td>
                  <td className="py-2.5 pr-4 text-zinc-400 hidden sm:table-cell">{f.diametro_mm}mm</td>
                  <td className="py-2.5 text-right space-x-3">
                    <button onClick={() => openEdit(f)} className="text-zinc-400 hover:text-zinc-100 text-xs transition-colors">Modifica</button>
                    <button onClick={() => del(f.id)} className="text-red-500 hover:text-red-400 text-xs transition-colors">Elimina</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length === 0 && <p className="text-zinc-600 text-sm py-4 text-center">Nessun filamento trovato.</p>}
        </div>
      )}

      {/* Modale edit */}
      {editItem && (
        <Modal
          title={`Modifica — ${editItem.brand_nome} ${editItem.tipo_nome} ${editItem.variante_nome} ${editItem.colore ?? ""}`}
          onClose={() => setEditItem(null)} onSave={saveEdit} saving={saving} size="lg">
          <FilamentoFields form={editForm} setForm={setEditForm} brands={brands} varianti={varianti} />
        </Modal>
      )}
    </div>
  );
}

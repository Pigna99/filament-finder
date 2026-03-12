"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import { Field, inp, sel } from "./Field";

interface Printer {
  id: number;
  nome: string;
  brand: string | null;
  diametro_mm: number;
  ha_enclosure: boolean;
  max_temp_hotend: number | null;
  max_temp_piatto: number | null;
  attivo: boolean;
}

interface Variante { id: number; tipo_nome: string; nome: string }
interface Compat {
  id_variant: number; id_printer: number;
  nome: string; brand: string | null; diametro_mm: number;
  compatibile: boolean; note: string | null;
}

interface Props { secret: string }

const empty = { nome: "", brand: "", diametro_mm: "1.75", ha_enclosure: false, max_temp_hotend: "", max_temp_piatto: "", attivo: true };
type Form = typeof empty;

export default function StampantiTab({ secret }: Props) {
  const [printers, setPrinters]     = useState<Printer[]>([]);
  const [varianti, setVarianti]     = useState<Variante[]>([]);
  const [loading, setLoading]       = useState(true);
  const [newForm, setNewForm]       = useState<Form>(empty);
  const [editItem, setEditItem]     = useState<Printer | null>(null);
  const [editForm, setEditForm]     = useState<Form>(empty);
  const [saving, setSaving]         = useState(false);
  // Compatibilità
  const [selVariant, setSelVariant] = useState("");
  const [compats, setCompats]       = useState<Compat[]>([]);
  const [compatLoading, setCompatLoading] = useState(false);

  const api = (path: string) => `/api/admin/${path}?secret=${secret}`;

  const load = async () => {
    setLoading(true);
    const [p, v] = await Promise.all([
      fetch(api("stampanti")).then(r => r.json()),
      fetch(api("varianti")).then(r => r.json()),
    ]);
    setPrinters(Array.isArray(p) ? p : []);
    setVarianti(Array.isArray(v) ? v : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCompat = async (id_variant: string) => {
    if (!id_variant) { setCompats([]); return; }
    setCompatLoading(true);
    const data = await fetch(api(`compatibilita`) + `&id_variant=${id_variant}`).then(r => r.json());
    setCompats(Array.isArray(data) ? data : []);
    setCompatLoading(false);
  };

  const handleAdd = async () => {
    setSaving(true);
    await fetch(api("stampanti"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newForm, diametro_mm: Number(newForm.diametro_mm), max_temp_hotend: newForm.max_temp_hotend ? Number(newForm.max_temp_hotend) : null, max_temp_piatto: newForm.max_temp_piatto ? Number(newForm.max_temp_piatto) : null }),
    });
    setNewForm(empty);
    await load();
    setSaving(false);
  };

  const handleEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    await fetch(api("stampanti"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editItem.id, ...editForm, diametro_mm: Number(editForm.diametro_mm), max_temp_hotend: editForm.max_temp_hotend ? Number(editForm.max_temp_hotend) : null, max_temp_piatto: editForm.max_temp_piatto ? Number(editForm.max_temp_piatto) : null }),
    });
    setEditItem(null);
    await load();
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Eliminare questa stampante?")) return;
    await fetch(api(`stampanti`) + `&id=${id}`, { method: "DELETE" });
    await load();
  };

  const toggleCompat = async (id_printer: number, currentCompat: Compat | undefined) => {
    if (currentCompat) {
      await fetch(api(`compatibilita`) + `&id_variant=${selVariant}&id_printer=${id_printer}`, { method: "DELETE" });
    } else {
      await fetch(api("compatibilita"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_variant: Number(selVariant), id_printer, compatibile: true }),
      });
    }
    await loadCompat(selVariant);
  };

  const PrinterFields = ({ form, setForm }: { form: Form; setForm: React.Dispatch<React.SetStateAction<Form>> }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nome" required>
          <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} className={inp} placeholder="es. X1 Carbon" />
        </Field>
        <Field label="Brand">
          <input value={form.brand ?? ""} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className={inp} placeholder="es. Bambu Lab" />
        </Field>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Field label="Diametro mm" required>
          <select value={form.diametro_mm} onChange={e => setForm(f => ({ ...f, diametro_mm: e.target.value }))} className={sel}>
            <option value="1.75">1.75</option>
            <option value="2.85">2.85</option>
          </select>
        </Field>
        <Field label="Max hotend °C">
          <input type="number" value={form.max_temp_hotend} onChange={e => setForm(f => ({ ...f, max_temp_hotend: e.target.value }))} className={inp} placeholder="300" />
        </Field>
        <Field label="Max piatto °C">
          <input type="number" value={form.max_temp_piatto} onChange={e => setForm(f => ({ ...f, max_temp_piatto: e.target.value }))} className={inp} placeholder="110" />
        </Field>
        <Field label="Enclosure">
          <select value={form.ha_enclosure ? "1" : "0"} onChange={e => setForm(f => ({ ...f, ha_enclosure: e.target.value === "1" }))} className={sel}>
            <option value="0">No</option>
            <option value="1">Sì</option>
          </select>
        </Field>
      </div>
      <Field label="Attivo">
        <select value={form.attivo ? "1" : "0"} onChange={e => setForm(f => ({ ...f, attivo: e.target.value === "1" }))} className={sel}>
          <option value="1">Sì</option>
          <option value="0">No</option>
        </select>
      </Field>
    </div>
  );

  if (loading) return <p className="text-zinc-500 text-sm">Caricamento…</p>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-1">Stampanti</h2>
        <p className="text-sm text-zinc-500 mb-4">Gestisci i profili stampante e la compatibilità con le varianti filamento.</p>
      </div>

      {/* Lista stampanti */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left">
                <th className="px-4 py-3 text-zinc-400 font-medium">Nome</th>
                <th className="px-4 py-3 text-zinc-400 font-medium">Brand</th>
                <th className="px-4 py-3 text-zinc-400 font-medium">⌀</th>
                <th className="px-4 py-3 text-zinc-400 font-medium">Hotend</th>
                <th className="px-4 py-3 text-zinc-400 font-medium">Enclosure</th>
                <th className="px-4 py-3 text-zinc-400 font-medium">Stato</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {printers.map((p) => (
                <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-4 py-3 text-zinc-100 font-medium">{p.nome}</td>
                  <td className="px-4 py-3 text-zinc-400">{p.brand ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-400">{p.diametro_mm}mm</td>
                  <td className="px-4 py-3 text-zinc-400">{p.max_temp_hotend ? `${p.max_temp_hotend}°C` : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.ha_enclosure ? "bg-blue-900/40 text-blue-300" : "text-zinc-600"}`}>
                      {p.ha_enclosure ? "Sì" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.attivo ? "bg-emerald-900/40 text-emerald-400" : "bg-zinc-800 text-zinc-600"}`}>
                      {p.attivo ? "Attiva" : "Inattiva"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => { setEditItem(p); setEditForm({ nome: p.nome, brand: p.brand ?? "", diametro_mm: String(p.diametro_mm), ha_enclosure: p.ha_enclosure, max_temp_hotend: p.max_temp_hotend ? String(p.max_temp_hotend) : "", max_temp_piatto: p.max_temp_piatto ? String(p.max_temp_piatto) : "", attivo: p.attivo }); }}
                      className="text-xs text-zinc-400 hover:text-zinc-100 px-2 py-1 rounded hover:bg-zinc-700 transition-colors"
                    >Modifica</button>
                    <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded hover:bg-zinc-700 transition-colors">Elimina</button>
                  </td>
                </tr>
              ))}
              {printers.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-600 text-sm">Nessuna stampante</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aggiungi stampante */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">Aggiungi stampante</h3>
        <PrinterFields form={newForm} setForm={setNewForm} />
        <button
          onClick={handleAdd}
          disabled={saving || !newForm.nome}
          className="mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {saving ? "Salvataggio…" : "Aggiungi stampante"}
        </button>
      </div>

      {/* Gestione compatibilità */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">Compatibilità variante ↔ stampanti</h3>
        <div className="mb-4">
          <select
            value={selVariant}
            onChange={e => { setSelVariant(e.target.value); loadCompat(e.target.value); }}
            className={`${sel} w-full sm:w-80`}
          >
            <option value="">Seleziona variante…</option>
            {varianti.map(v => (
              <option key={v.id} value={v.id}>{v.tipo_nome} — {v.nome}</option>
            ))}
          </select>
        </div>
        {selVariant && (
          compatLoading ? <p className="text-zinc-500 text-sm">Caricamento…</p> : (
            <div className="flex flex-wrap gap-2">
              {printers.filter(p => p.attivo).map(p => {
                const compat = compats.find(c => c.id_printer === p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleCompat(p.id, compat)}
                    className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg border transition-all ${
                      compat
                        ? "bg-emerald-950/50 border-emerald-700 text-emerald-300"
                        : "bg-zinc-800/50 border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${compat ? "bg-emerald-400" : "bg-zinc-600"}`} />
                    {p.brand ? `${p.brand} ` : ""}{p.nome}
                    <span className="text-zinc-600">⌀{p.diametro_mm}</span>
                  </button>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Modal modifica */}
      {editItem && (
        <Modal title={`Modifica: ${editItem.nome}`} onClose={() => setEditItem(null)} onSave={handleEdit} saving={saving}>
          <PrinterFields form={editForm} setForm={setEditForm} />
        </Modal>
      )}
    </div>
  );
}

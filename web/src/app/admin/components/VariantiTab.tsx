"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import { Field, inp, sel } from "./Field";

interface Tipo { id: number; nome: string }
interface Variante {
  id: number; id_type: number; tipo_nome: string; nome: string;
  descrizione: string | null; difficolta_stampa: number | null;
  temp_stampa_min: number | null; temp_stampa_max: number | null;
}
interface Props { secret: string }

const emptyForm = { id_type: "", nome: "", descrizione: "", difficolta_stampa: "", temp_stampa_min: "", temp_stampa_max: "" };
type Form = typeof emptyForm;

function VarianteFields({ form, setForm, tipi }: { form: Form; setForm: React.Dispatch<React.SetStateAction<Form>>; tipi: Tipo[] }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Tipo di filamento" tooltip="Il tipo base a cui appartiene questa variante, es. PLA → PLA Matte" required>
          <select value={form.id_type} onChange={e => setForm(f => ({ ...f, id_type: e.target.value }))} className={sel}>
            <option value="">Seleziona tipo...</option>
            {tipi.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </Field>
        <Field label="Nome variante" tooltip="Specificità del materiale: Matte, Silk, CF (Carbon Fiber), HF, Pro..." required>
          <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} className={inp} placeholder="es. Matte" />
        </Field>
      </div>
      <Field label="Descrizione" tooltip="Spiega le caratteristiche specifiche di questa variante rispetto al tipo base">
        <textarea value={form.descrizione} onChange={e => setForm(f => ({ ...f, descrizione: e.target.value }))} className={`${inp} resize-none`} rows={2} placeholder="Finitura opaca, maggiore adesione al letto..." />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Difficoltà (override)" tooltip="Sovrascrive la difficoltà del tipo base se questa variante è più complessa">
          <select value={form.difficolta_stampa} onChange={e => setForm(f => ({ ...f, difficolta_stampa: e.target.value }))} className={sel}>
            <option value="">Eredita dal tipo</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} / 5</option>)}
          </select>
        </Field>
        <Field label="Temp. stampa min °C (override)" tooltip="Sovrascrive la temperatura min del tipo base">
          <input type="number" value={form.temp_stampa_min} onChange={e => setForm(f => ({ ...f, temp_stampa_min: e.target.value }))} className={inp} placeholder="es. 200" />
        </Field>
        <Field label="Temp. stampa max °C (override)" tooltip="Sovrascrive la temperatura max del tipo base">
          <input type="number" value={form.temp_stampa_max} onChange={e => setForm(f => ({ ...f, temp_stampa_max: e.target.value }))} className={inp} placeholder="es. 230" />
        </Field>
      </div>
    </div>
  );
}

export default function VariantiTab({ secret }: Props) {
  const [varianti, setVarianti] = useState<Variante[]>([]);
  const [tipi, setTipi] = useState<Tipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newForm, setNewForm] = useState<Form>(emptyForm);
  const [editItem, setEditItem] = useState<Variante | null>(null);
  const [editForm, setEditForm] = useState<Form>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterTipo, setFilterTipo] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const [vr, tr] = await Promise.all([
      fetch(`/api/admin/varianti?secret=${secret}`).then(r => r.json()),
      fetch(`/api/admin/tipi?secret=${secret}`).then(r => r.json()),
    ]);
    setVarianti(vr);
    setTipi(tr);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);
  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(""), 3000); }

  function buildBody(form: Form, id?: number) {
    return {
      ...(id ? { id } : {}),
      id_type: Number(form.id_type),
      nome: form.nome,
      descrizione: form.descrizione || null,
      difficolta_stampa: form.difficolta_stampa ? Number(form.difficolta_stampa) : null,
      temp_stampa_min: form.temp_stampa_min ? Number(form.temp_stampa_min) : null,
      temp_stampa_max: form.temp_stampa_max ? Number(form.temp_stampa_max) : null,
    };
  }

  async function create() {
    if (!newForm.id_type || !newForm.nome) return;
    setSaving(true);
    await fetch(`/api/admin/varianti?secret=${secret}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildBody(newForm)),
    });
    setNewForm(emptyForm);
    flash("Variante creata");
    setSaving(false);
    load();
  }

  async function saveEdit() {
    if (!editItem) return;
    setSaving(true);
    await fetch(`/api/admin/varianti?secret=${secret}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildBody(editForm, editItem.id)),
    });
    setEditItem(null);
    flash("Variante aggiornata");
    setSaving(false);
    load();
  }

  async function del(id: number) {
    if (!confirm("Eliminare la variante?")) return;
    await fetch(`/api/admin/varianti?secret=${secret}&id=${id}`, { method: "DELETE" });
    flash("Variante eliminata");
    load();
  }

  function openEdit(v: Variante) {
    setEditForm({
      id_type: String(v.id_type), nome: v.nome, descrizione: v.descrizione ?? "",
      difficolta_stampa: String(v.difficolta_stampa ?? ""),
      temp_stampa_min: String(v.temp_stampa_min ?? ""),
      temp_stampa_max: String(v.temp_stampa_max ?? ""),
    });
    setEditItem(v);
  }

  const filtered = filterTipo ? varianti.filter(v => v.tipo_nome === filterTipo) : varianti;
  const grouped = filtered.reduce<Record<string, Variante[]>>((acc, v) => {
    (acc[v.tipo_nome] = acc[v.tipo_nome] || []).push(v);
    return acc;
  }, {});

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-100 mb-1">Varianti</h2>
      <p className="text-xs text-zinc-500 mb-5">Sotto-tipi di materiale: PLA Matte, PETG CF, ABS+... Ogni filamento ha una variante.</p>

      {msg && <p className="text-emerald-400 text-sm mb-4">{msg}</p>}

      {/* Form nuovo */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Nuova variante</h3>
        <VarianteFields form={newForm} setForm={setNewForm} tipi={tipi} />
        <div className="mt-4">
          <button onClick={create} disabled={!newForm.id_type || !newForm.nome || saving}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm px-5 py-2 rounded-lg font-medium transition-colors">
            Crea variante
          </button>
        </div>
      </div>

      {/* Filtro */}
      <div className="mb-5">
        <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500">
          <option value="">Tutti i tipi</option>
          {tipi.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
        </select>
      </div>

      {loading ? <p className="text-zinc-500 text-sm">Caricamento...</p> : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([tipo, vs]) => (
            <div key={tipo}>
              <h4 className="text-xs font-mono text-emerald-400 mb-2 uppercase tracking-wider">{tipo}</h4>
              <div className="space-y-1">
                {vs.map(v => (
                  <div key={v.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm text-zinc-100 font-medium">{v.nome}</span>
                      {v.temp_stampa_min && <span className="text-xs text-zinc-500">{v.temp_stampa_min}–{v.temp_stampa_max}°C</span>}
                      {v.difficolta_stampa && <span className="text-xs text-zinc-600">diff. {v.difficolta_stampa}/5</span>}
                      {v.descrizione && <span className="text-xs text-zinc-600 hidden sm:inline">{v.descrizione.slice(0, 60)}{v.descrizione.length > 60 ? "..." : ""}</span>}
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <button onClick={() => openEdit(v)} className="text-zinc-400 hover:text-zinc-100 text-xs transition-colors">Modifica</button>
                      <button onClick={() => del(v.id)} className="text-red-500 hover:text-red-400 text-xs transition-colors">Elimina</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(grouped).length === 0 && <p className="text-zinc-600 text-sm py-4 text-center">Nessuna variante trovata.</p>}
        </div>
      )}

      {/* Modale edit */}
      {editItem && (
        <Modal title={`Modifica — ${editItem.tipo_nome} ${editItem.nome}`} onClose={() => setEditItem(null)} onSave={saveEdit} saving={saving} size="lg">
          <VarianteFields form={editForm} setForm={setEditForm} tipi={tipi} />
        </Modal>
      )}
    </div>
  );
}

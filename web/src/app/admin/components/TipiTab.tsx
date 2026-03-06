"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import { Field, inp, sel } from "./Field";

interface Tipo {
  id: number;
  nome: string;
  descrizione: string | null;
  flessibile: boolean;
  igroscopico: boolean;
  difficolta_stampa: number | null;
  temp_stampa_min: number | null;
  temp_stampa_max: number | null;
  temp_piatto_min: number | null;
  temp_piatto_max: number | null;
  richiede_enclosure: boolean;
  food_safe: boolean;
}

interface Props { secret: string }

const emptyForm = {
  nome: "", descrizione: "",
  flessibile: false, igroscopico: false, difficolta_stampa: "",
  temp_stampa_min: "", temp_stampa_max: "",
  temp_piatto_min: "", temp_piatto_max: "",
  richiede_enclosure: false, food_safe: false,
};

type Form = typeof emptyForm;

function TipoFields({ form, setForm }: { form: Form; setForm: React.Dispatch<React.SetStateAction<Form>> }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nome tipo" tooltip="Sigla del materiale: PLA, PETG, ABS, TPU, ASA, PA, PC..." required>
          <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} className={inp} placeholder="es. PLA" />
        </Field>
        <Field label="Difficoltà di stampa" tooltip="Scala da 1 (facile) a 5 (molto difficile). PLA=1, ABS=3, PA=5">
          <select value={form.difficolta_stampa} onChange={e => setForm(f => ({ ...f, difficolta_stampa: e.target.value }))} className={sel}>
            <option value="">Non specificata</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} / 5</option>)}
          </select>
        </Field>
      </div>
      <Field label="Descrizione" tooltip="Breve descrizione del materiale, caratteristiche principali e casi d'uso">
        <textarea value={form.descrizione} onChange={e => setForm(f => ({ ...f, descrizione: e.target.value }))} className={`${inp} resize-none`} rows={2} placeholder="Materiale facile da stampare, ottimo per principianti..." />
      </Field>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Field label="Temp. stampa min °C" tooltip="Temperatura minima consigliata per il nozzle">
          <input type="number" value={form.temp_stampa_min} onChange={e => setForm(f => ({ ...f, temp_stampa_min: e.target.value }))} className={inp} placeholder="190" />
        </Field>
        <Field label="Temp. stampa max °C" tooltip="Temperatura massima consigliata per il nozzle">
          <input type="number" value={form.temp_stampa_max} onChange={e => setForm(f => ({ ...f, temp_stampa_max: e.target.value }))} className={inp} placeholder="220" />
        </Field>
        <Field label="Temp. piatto min °C" tooltip="Temperatura minima del piano di stampa (bed). 0 se non necessario">
          <input type="number" value={form.temp_piatto_min} onChange={e => setForm(f => ({ ...f, temp_piatto_min: e.target.value }))} className={inp} placeholder="0" />
        </Field>
        <Field label="Temp. piatto max °C" tooltip="Temperatura massima del piano di stampa">
          <input type="number" value={form.temp_piatto_max} onChange={e => setForm(f => ({ ...f, temp_piatto_max: e.target.value }))} className={inp} placeholder="60" />
        </Field>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          ["flessibile", "Flessibile", "Il materiale è elastico/gommoso (es. TPU, TPE)"],
          ["igroscopico", "Igroscopico", "Assorbe umidità dall'aria — richiede essiccatura (es. Nylon, PA, PC)"],
          ["richiede_enclosure", "Richiede enclosure", "Necessita di camera chiusa per evitare deformazioni (es. ABS, ASA)"],
          ["food_safe", "Food safe", "Il materiale è certificato per contatto con alimenti (es. PLA food grade)"],
        ] as const).map(([key, label, tooltip]) => (
          <Field key={key} label={label} tooltip={tooltip}>
            <div className="flex items-center h-9">
              <input type="checkbox"
                checked={!!(form as Record<string, unknown>)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                className="accent-emerald-500 w-4 h-4 cursor-pointer" />
            </div>
          </Field>
        ))}
      </div>
    </div>
  );
}

export default function TipiTab({ secret }: Props) {
  const [tipi, setTipi] = useState<Tipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newForm, setNewForm] = useState<Form>(emptyForm);
  const [editItem, setEditItem] = useState<Tipo | null>(null);
  const [editForm, setEditForm] = useState<Form>(emptyForm);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const r = await fetch(`/api/admin/tipi?secret=${secret}`);
    setTipi(await r.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);
  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(""), 3000); }
  function numOrNull(v: string) { return v === "" ? null : Number(v); }

  function buildBody(form: Form, id?: number) {
    return {
      ...(id ? { id } : {}),
      nome: form.nome,
      descrizione: form.descrizione || null,
      flessibile: form.flessibile,
      igroscopico: form.igroscopico,
      difficolta_stampa: numOrNull(form.difficolta_stampa as string),
      temp_stampa_min: numOrNull(form.temp_stampa_min as string),
      temp_stampa_max: numOrNull(form.temp_stampa_max as string),
      temp_piatto_min: numOrNull(form.temp_piatto_min as string),
      temp_piatto_max: numOrNull(form.temp_piatto_max as string),
      richiede_enclosure: form.richiede_enclosure,
      food_safe: form.food_safe,
    };
  }

  async function create() {
    if (!newForm.nome) return;
    setSaving(true);
    await fetch(`/api/admin/tipi?secret=${secret}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildBody(newForm)),
    });
    setNewForm(emptyForm);
    flash("Tipo creato");
    setSaving(false);
    load();
  }

  async function saveEdit() {
    if (!editItem) return;
    setSaving(true);
    await fetch(`/api/admin/tipi?secret=${secret}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(buildBody(editForm, editItem.id)),
    });
    setEditItem(null);
    flash("Tipo aggiornato");
    setSaving(false);
    load();
  }

  async function del(id: number) {
    if (!confirm("Eliminare il tipo? Verranno eliminate anche le varianti associate.")) return;
    await fetch(`/api/admin/tipi?secret=${secret}&id=${id}`, { method: "DELETE" });
    flash("Tipo eliminato");
    load();
  }

  function openEdit(t: Tipo) {
    setEditForm({
      nome: t.nome, descrizione: t.descrizione ?? "",
      flessibile: t.flessibile, igroscopico: t.igroscopico,
      difficolta_stampa: String(t.difficolta_stampa ?? ""),
      temp_stampa_min: String(t.temp_stampa_min ?? ""),
      temp_stampa_max: String(t.temp_stampa_max ?? ""),
      temp_piatto_min: String(t.temp_piatto_min ?? ""),
      temp_piatto_max: String(t.temp_piatto_max ?? ""),
      richiede_enclosure: t.richiede_enclosure,
      food_safe: t.food_safe,
    });
    setEditItem(t);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-100 mb-1">Tipi di filamento</h2>
      <p className="text-xs text-zinc-500 mb-5">Categorie materiali: PLA, PETG, ABS, ecc. Ogni variante appartiene a un tipo.</p>

      {msg && <p className="text-emerald-400 text-sm mb-4">{msg}</p>}

      {/* Form nuovo */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Nuovo tipo</h3>
        <TipoFields form={newForm} setForm={setNewForm} />
        <div className="mt-4">
          <button onClick={create} disabled={!newForm.nome || saving}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm px-5 py-2 rounded-lg font-medium transition-colors">
            Crea tipo
          </button>
        </div>
      </div>

      {/* Lista */}
      {loading ? <p className="text-zinc-500 text-sm">Caricamento...</p> : (
        <div className="space-y-2">
          {tipi.map(t => (
            <div key={t.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-800/30 transition-colors"
                onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-emerald-400 font-bold">{t.nome}</span>
                  {t.temp_stampa_min && <span className="text-xs text-zinc-500">{t.temp_stampa_min}–{t.temp_stampa_max}°C</span>}
                  {t.difficolta_stampa && <span className="text-xs text-zinc-500">diff. {t.difficolta_stampa}/5</span>}
                  {t.flessibile && <span className="text-xs bg-blue-900/50 text-blue-400 px-1.5 py-0.5 rounded">flessibile</span>}
                  {t.igroscopico && <span className="text-xs bg-amber-900/50 text-amber-400 px-1.5 py-0.5 rounded">igroscopico</span>}
                  {t.richiede_enclosure && <span className="text-xs bg-red-900/50 text-red-400 px-1.5 py-0.5 rounded">enclosure</span>}
                  {t.food_safe && <span className="text-xs bg-green-900/50 text-green-400 px-1.5 py-0.5 rounded">food safe</span>}
                </div>
                <div className="flex gap-3 shrink-0">
                  <button onClick={e => { e.stopPropagation(); openEdit(t); }} className="text-zinc-400 hover:text-zinc-100 text-xs transition-colors">Modifica</button>
                  <button onClick={e => { e.stopPropagation(); del(t.id); }} className="text-red-500 hover:text-red-400 text-xs transition-colors">Elimina</button>
                </div>
              </div>
              {expanded === t.id && t.descrizione && (
                <div className="px-4 pb-3 text-xs text-zinc-500 border-t border-zinc-800 pt-2">{t.descrizione}</div>
              )}
            </div>
          ))}
          {tipi.length === 0 && <p className="text-zinc-600 text-sm py-4 text-center">Nessun tipo. Creane uno sopra.</p>}
        </div>
      )}

      {/* Modale edit */}
      {editItem && (
        <Modal title={`Modifica — ${editItem.nome}`} onClose={() => setEditItem(null)} onSave={saveEdit} saving={saving} size="lg">
          <TipoFields form={editForm} setForm={setEditForm} />
        </Modal>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

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

const empty = {
  nome: "", descrizione: "",
  flessibile: false, igroscopico: false, difficolta_stampa: "",
  temp_stampa_min: "", temp_stampa_max: "",
  temp_piatto_min: "", temp_piatto_max: "",
  richiede_enclosure: false, food_safe: false,
};

export default function TipiTab({ secret }: Props) {
  const [tipi, setTipi] = useState<Tipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
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

  async function save() {
    const body = {
      ...(editId ? { id: editId } : {}),
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
    await fetch(`/api/admin/tipi?secret=${secret}`, {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setForm(empty);
    setEditId(null);
    flash(editId ? "Tipo aggiornato" : "Tipo creato");
    load();
  }

  async function del(id: number) {
    if (!confirm("Eliminare il tipo?")) return;
    await fetch(`/api/admin/tipi?secret=${secret}&id=${id}`, { method: "DELETE" });
    flash("Tipo eliminato");
    load();
  }

  function startEdit(t: Tipo) {
    setEditId(t.id);
    setForm({
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
  }

  const inp = "bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-emerald-500 w-full";

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-100 mb-4">Tipi di filamento</h2>
      {msg && <p className="text-emerald-400 text-sm mb-3">{msg}</p>}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">
          {editId ? "Modifica tipo" : "Nuovo tipo"}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <input placeholder="Nome * (PLA, PETG...)" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} className={`${inp} col-span-2`} />
          <input placeholder="Temp stampa min °C" type="number" value={form.temp_stampa_min} onChange={e => setForm(f => ({ ...f, temp_stampa_min: e.target.value }))} className={inp} />
          <input placeholder="Temp stampa max °C" type="number" value={form.temp_stampa_max} onChange={e => setForm(f => ({ ...f, temp_stampa_max: e.target.value }))} className={inp} />
          <input placeholder="Temp piatto min °C" type="number" value={form.temp_piatto_min} onChange={e => setForm(f => ({ ...f, temp_piatto_min: e.target.value }))} className={inp} />
          <input placeholder="Temp piatto max °C" type="number" value={form.temp_piatto_max} onChange={e => setForm(f => ({ ...f, temp_piatto_max: e.target.value }))} className={inp} />
          <select value={form.difficolta_stampa} onChange={e => setForm(f => ({ ...f, difficolta_stampa: e.target.value }))} className={inp}>
            <option value="">Difficoltà...</option>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} / 5</option>)}
          </select>
          <div className="flex flex-col justify-center gap-1">
            {[
              ["flessibile", "Flessibile"],
              ["igroscopico", "Igroscopico"],
              ["richiede_enclosure", "Enclosure"],
              ["food_safe", "Food safe"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                <input type="checkbox" checked={!!(form as Record<string, unknown>)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} className="accent-emerald-500" />
                {label}
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={save} disabled={!form.nome} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm px-4 py-1.5 rounded transition-colors">
            {editId ? "Aggiorna" : "Crea"}
          </button>
          {editId && <button onClick={() => { setEditId(null); setForm(empty); }} className="text-zinc-400 hover:text-zinc-200 text-sm px-3 py-1.5">Annulla</button>}
        </div>
      </div>

      {loading ? <p className="text-zinc-500 text-sm">Caricamento...</p> : (
        <div className="space-y-2">
          {tipi.map(t => (
            <div key={t.id} className="bg-zinc-900 border border-zinc-800 rounded-lg">
              <div className="flex items-center justify-between p-3 cursor-pointer" onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-emerald-400 font-bold">{t.nome}</span>
                  <span className="text-xs text-zinc-500">{t.temp_stampa_min}–{t.temp_stampa_max}°C</span>
                  {t.flessibile && <span className="text-xs bg-blue-900/50 text-blue-400 px-1.5 rounded">flessibile</span>}
                  {t.igroscopico && <span className="text-xs bg-amber-900/50 text-amber-400 px-1.5 rounded">igroscopico</span>}
                  {t.richiede_enclosure && <span className="text-xs bg-red-900/50 text-red-400 px-1.5 rounded">enclosure</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={e => { e.stopPropagation(); startEdit(t); }} className="text-zinc-400 hover:text-zinc-100 text-xs">Modifica</button>
                  <button onClick={e => { e.stopPropagation(); del(t.id); }} className="text-red-500 hover:text-red-400 text-xs">Elimina</button>
                </div>
              </div>
              {expanded === t.id && t.descrizione && (
                <div className="px-3 pb-3 text-xs text-zinc-500 border-t border-zinc-800 pt-2">
                  {t.descrizione}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

interface Tipo { id: number; nome: string }
interface Variante {
  id: number; id_type: number; tipo_nome: string; nome: string;
  descrizione: string | null; difficolta_stampa: number | null;
  temp_stampa_min: number | null; temp_stampa_max: number | null;
}
interface Props { secret: string }

export default function VariantiTab({ secret }: Props) {
  const [varianti, setVarianti] = useState<Variante[]>([]);
  const [tipi, setTipi] = useState<Tipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ id_type: "", nome: "", descrizione: "", difficolta_stampa: "", temp_stampa_min: "", temp_stampa_max: "" });
  const [msg, setMsg] = useState("");
  const [filterTipo, setFilterTipo] = useState("");

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

  async function save() {
    const body = {
      ...(editId ? { id: editId } : {}),
      id_type: Number(form.id_type),
      nome: form.nome,
      descrizione: form.descrizione || null,
      difficolta_stampa: form.difficolta_stampa ? Number(form.difficolta_stampa) : null,
      temp_stampa_min: form.temp_stampa_min ? Number(form.temp_stampa_min) : null,
      temp_stampa_max: form.temp_stampa_max ? Number(form.temp_stampa_max) : null,
    };
    await fetch(`/api/admin/varianti?secret=${secret}`, {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setForm({ id_type: "", nome: "", descrizione: "", difficolta_stampa: "", temp_stampa_min: "", temp_stampa_max: "" });
    setEditId(null);
    flash(editId ? "Variante aggiornata" : "Variante creata");
    load();
  }

  async function del(id: number) {
    if (!confirm("Eliminare la variante?")) return;
    await fetch(`/api/admin/varianti?secret=${secret}&id=${id}`, { method: "DELETE" });
    flash("Variante eliminata");
    load();
  }

  const inp = "bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-emerald-500 w-full";
  const filtered = filterTipo ? varianti.filter(v => v.tipo_nome === filterTipo) : varianti;
  const grouped = filtered.reduce<Record<string, Variante[]>>((acc, v) => {
    (acc[v.tipo_nome] = acc[v.tipo_nome] || []).push(v);
    return acc;
  }, {});

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-100 mb-4">Varianti</h2>
      {msg && <p className="text-emerald-400 text-sm mb-3">{msg}</p>}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">{editId ? "Modifica variante" : "Nuova variante"}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          <select value={form.id_type} onChange={e => setForm(f => ({ ...f, id_type: e.target.value }))} className={inp}>
            <option value="">Tipo *</option>
            {tipi.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
          <input placeholder="Nome variante *" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} className={inp} />
          <select value={form.difficolta_stampa} onChange={e => setForm(f => ({ ...f, difficolta_stampa: e.target.value }))} className={inp}>
            <option value="">Difficoltà (override)</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} / 5</option>)}
          </select>
          <input placeholder="Temp stampa min °C (override)" type="number" value={form.temp_stampa_min} onChange={e => setForm(f => ({ ...f, temp_stampa_min: e.target.value }))} className={inp} />
          <input placeholder="Temp stampa max °C (override)" type="number" value={form.temp_stampa_max} onChange={e => setForm(f => ({ ...f, temp_stampa_max: e.target.value }))} className={inp} />
          <input placeholder="Descrizione" value={form.descrizione} onChange={e => setForm(f => ({ ...f, descrizione: e.target.value }))} className={inp} />
        </div>
        <div className="flex gap-2">
          <button onClick={save} disabled={!form.id_type || !form.nome} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm px-4 py-1.5 rounded">
            {editId ? "Aggiorna" : "Crea"}
          </button>
          {editId && <button onClick={() => setEditId(null)} className="text-zinc-400 text-sm px-3 py-1.5">Annulla</button>}
        </div>
      </div>

      <div className="mb-4">
        <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} className="bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded px-3 py-1.5 focus:outline-none">
          <option value="">Tutti i tipi</option>
          {tipi.map(t => <option key={t.id} value={t.nome}>{t.nome}</option>)}
        </select>
      </div>

      {loading ? <p className="text-zinc-500 text-sm">Caricamento...</p> : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([tipo, vs]) => (
            <div key={tipo}>
              <h4 className="text-xs font-mono text-emerald-400 mb-2 uppercase tracking-wider">{tipo}</h4>
              <div className="space-y-1">
                {vs.map(v => (
                  <div key={v.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-zinc-100">{v.nome}</span>
                      {v.temp_stampa_min && <span className="text-xs text-zinc-500">{v.temp_stampa_min}–{v.temp_stampa_max}°C</span>}
                      {v.descrizione && <span className="text-xs text-zinc-600 hidden sm:inline">{v.descrizione.slice(0, 60)}...</span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditId(v.id); setForm({ id_type: String(v.id_type), nome: v.nome, descrizione: v.descrizione ?? "", difficolta_stampa: String(v.difficolta_stampa ?? ""), temp_stampa_min: String(v.temp_stampa_min ?? ""), temp_stampa_max: String(v.temp_stampa_max ?? "") }); }} className="text-zinc-400 hover:text-zinc-100 text-xs">Modifica</button>
                      <button onClick={() => del(v.id)} className="text-red-500 hover:text-red-400 text-xs">Elimina</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

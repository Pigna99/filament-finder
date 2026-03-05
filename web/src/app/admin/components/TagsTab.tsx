"use client";
import { useEffect, useState } from "react";

interface Tag { id: number; nome: string; descrizione: string | null; }
interface Props { secret: string; }

export default function TagsTab({ secret }: Props) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ nome: "", descrizione: "" });
  const [saving, setSaving] = useState(false);

  const base = `/api/admin/tags?secret=${secret}`;

  async function load() {
    setLoading(true);
    const res = await fetch(base);
    if (res.ok) setTags(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startNew() { setEditId(0); setForm({ nome: "", descrizione: "" }); }
  function startEdit(t: Tag) { setEditId(t.id); setForm({ nome: t.nome, descrizione: t.descrizione ?? "" }); }
  function cancel() { setEditId(null); setForm({ nome: "", descrizione: "" }); }

  async function save() {
    setSaving(true);
    if (editId === 0) {
      await fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    } else {
      await fetch(base, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editId, ...form }) });
    }
    setSaving(false);
    cancel();
    load();
  }

  async function remove(id: number) {
    if (!confirm("Eliminare questo tag?")) return;
    await fetch(`${base}&id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-zinc-100">Tag filamenti</h2>
        <button onClick={startNew} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          + Nuovo tag
        </button>
      </div>

      {/* Form inline */}
      {editId !== null && (
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5 mb-6 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-300">{editId === 0 ? "Nuovo tag" : "Modifica tag"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Nome *</label>
              <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Descrizione</label>
              <input value={form.descrizione} onChange={e => setForm(p => ({ ...p, descrizione: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={save} disabled={saving || !form.nome}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              {saving ? "Salvo..." : "Salva"}
            </button>
            <button onClick={cancel} className="text-zinc-400 hover:text-zinc-200 px-4 py-2 text-sm transition-colors">
              Annulla
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-zinc-500 text-sm">Caricamento...</div>
      ) : tags.length === 0 ? (
        <div className="text-zinc-500 text-sm">Nessun tag trovato.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tags.map(t => (
            <div key={t.id} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-emerald-400">{t.nome}</div>
                {t.descrizione && <div className="text-xs text-zinc-500 mt-1">{t.descrizione}</div>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(t)} className="text-zinc-400 hover:text-zinc-100 text-xs transition-colors">
                  Modifica
                </button>
                <button onClick={() => remove(t.id)} className="text-red-400 hover:text-red-300 text-xs transition-colors">
                  Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

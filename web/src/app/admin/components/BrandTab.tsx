"use client";

import { useEffect, useState } from "react";

interface Brand {
  id: number;
  nome: string;
  url: string | null;
  logo: string | null;
  attivo: boolean;
}

interface Props { secret: string }

export default function BrandTab({ secret }: Props) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nome: "", url: "", logo: "" });
  const [editId, setEditId] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const r = await fetch(`/api/admin/brand?secret=${secret}`);
    setBrands(await r.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(""), 3000); }

  async function save() {
    const method = editId ? "PATCH" : "POST";
    const body = editId ? { id: editId, ...form } : form;
    await fetch(`/api/admin/brand?secret=${secret}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setForm({ nome: "", url: "", logo: "" });
    setEditId(null);
    flash(editId ? "Brand aggiornato" : "Brand creato");
    load();
  }

  async function del(id: number) {
    if (!confirm("Eliminare il brand?")) return;
    await fetch(`/api/admin/brand?secret=${secret}&id=${id}`, { method: "DELETE" });
    flash("Brand eliminato");
    load();
  }

  function startEdit(b: Brand) {
    setEditId(b.id);
    setForm({ nome: b.nome, url: b.url ?? "", logo: b.logo ?? "" });
  }

  const inp = "bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-emerald-500 w-full";

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-100 mb-4">Brand</h2>

      {msg && <p className="text-emerald-400 text-sm mb-3">{msg}</p>}

      {/* Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">
          {editId ? "Modifica brand" : "Nuovo brand"}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <input placeholder="Nome *" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} className={inp} />
          <input placeholder="URL sito" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} className={inp} />
          <input placeholder="URL logo" value={form.logo} onChange={e => setForm(f => ({ ...f, logo: e.target.value }))} className={inp} />
        </div>
        <div className="flex gap-2">
          <button onClick={save} disabled={!form.nome} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm px-4 py-1.5 rounded transition-colors">
            {editId ? "Aggiorna" : "Crea"}
          </button>
          {editId && (
            <button onClick={() => { setEditId(null); setForm({ nome: "", url: "", logo: "" }); }} className="text-zinc-400 hover:text-zinc-200 text-sm px-3 py-1.5">
              Annulla
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-zinc-500 text-sm">Caricamento...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-left border-b border-zinc-800">
                <th className="pb-2 pr-4">Nome</th>
                <th className="pb-2 pr-4">URL</th>
                <th className="pb-2 pr-4">Stato</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {brands.map(b => (
                <tr key={b.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="py-2 pr-4 text-zinc-100">{b.nome}</td>
                  <td className="py-2 pr-4 text-zinc-500 truncate max-w-[200px]">{b.url ?? "—"}</td>
                  <td className="py-2 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${b.attivo ? "bg-emerald-900/50 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>
                      {b.attivo ? "attivo" : "inattivo"}
                    </span>
                  </td>
                  <td className="py-2 text-right space-x-2">
                    <button onClick={() => startEdit(b)} className="text-zinc-400 hover:text-zinc-100 text-xs">Modifica</button>
                    <button onClick={() => del(b.id)} className="text-red-500 hover:text-red-400 text-xs">Elimina</button>
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

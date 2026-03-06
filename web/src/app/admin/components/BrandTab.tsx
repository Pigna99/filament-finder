"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import { Field, inp } from "./Field";

interface Brand {
  id: number;
  nome: string;
  url: string | null;
  logo: string | null;
  attivo: boolean;
}

interface Props { secret: string }

const emptyForm = { nome: "", url: "", logo: "" };

function BrandFields({ form, setForm }: { form: typeof emptyForm; setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Field label="Nome brand" tooltip="Nome del produttore, es. Bambu Lab, eSUN, Polymaker" required>
        <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} className={inp} placeholder="es. Bambu Lab" />
      </Field>
      <Field label="URL sito ufficiale" tooltip="Homepage del brand, usata per il link nella pagina filamento">
        <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} className={inp} placeholder="https://bambulab.com" />
      </Field>
      <Field label="URL logo" tooltip="Link diretto all'immagine del logo (PNG/SVG), mostrata nella card brand">
        <input value={form.logo} onChange={e => setForm(f => ({ ...f, logo: e.target.value }))} className={inp} placeholder="https://..." />
      </Field>
    </div>
  );
}

export default function BrandTab({ secret }: Props) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [newForm, setNewForm] = useState(emptyForm);
  const [editItem, setEditItem] = useState<Brand | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    const r = await fetch(`/api/admin/brand?secret=${secret}`);
    setBrands(await r.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);
  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(""), 3000); }

  async function create() {
    if (!newForm.nome) return;
    setSaving(true);
    await fetch(`/api/admin/brand?secret=${secret}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newForm),
    });
    setNewForm(emptyForm);
    flash("Brand creato");
    setSaving(false);
    load();
  }

  async function saveEdit() {
    if (!editItem) return;
    setSaving(true);
    await fetch(`/api/admin/brand?secret=${secret}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editItem.id, ...editForm }),
    });
    setEditItem(null);
    flash("Brand aggiornato");
    setSaving(false);
    load();
  }

  async function del(id: number) {
    if (!confirm("Eliminare il brand? Verranno eliminati anche tutti i filamenti associati.")) return;
    await fetch(`/api/admin/brand?secret=${secret}&id=${id}`, { method: "DELETE" });
    flash("Brand eliminato");
    load();
  }

  function openEdit(b: Brand) {
    setEditForm({ nome: b.nome, url: b.url ?? "", logo: b.logo ?? "" });
    setEditItem(b);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-100 mb-1">Brand</h2>
      <p className="text-xs text-zinc-500 mb-5">Produttori di filamenti. Ogni filamento appartiene a un brand.</p>

      {msg && <p className="text-emerald-400 text-sm mb-4">{msg}</p>}

      {/* Form nuovo */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">Nuovo brand</h3>
        <BrandFields form={newForm} setForm={setNewForm} />
        <div className="mt-4">
          <button onClick={create} disabled={!newForm.nome || saving}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm px-5 py-2 rounded-lg font-medium transition-colors">
            Crea brand
          </button>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <p className="text-zinc-500 text-sm">Caricamento...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-left border-b border-zinc-800 text-xs uppercase tracking-wider">
                <th className="pb-3 pr-4">Nome</th>
                <th className="pb-3 pr-4 hidden sm:table-cell">URL sito</th>
                <th className="pb-3 pr-4">Stato</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {brands.map(b => (
                <tr key={b.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                  <td className="py-2.5 pr-4 text-zinc-100 font-medium">{b.nome}</td>
                  <td className="py-2.5 pr-4 text-zinc-500 text-xs truncate max-w-[200px] hidden sm:table-cell">
                    {b.url ? <a href={b.url} target="_blank" className="hover:text-emerald-400 transition-colors">{b.url}</a> : "—"}
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${b.attivo ? "bg-emerald-900/50 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>
                      {b.attivo ? "attivo" : "inattivo"}
                    </span>
                  </td>
                  <td className="py-2.5 text-right space-x-3">
                    <button onClick={() => openEdit(b)} className="text-zinc-400 hover:text-zinc-100 text-xs transition-colors">Modifica</button>
                    <button onClick={() => del(b.id)} className="text-red-500 hover:text-red-400 text-xs transition-colors">Elimina</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {brands.length === 0 && <p className="text-zinc-600 text-sm py-4 text-center">Nessun brand. Creane uno sopra.</p>}
        </div>
      )}

      {/* Modale edit */}
      {editItem && (
        <Modal title={`Modifica — ${editItem.nome}`} onClose={() => setEditItem(null)} onSave={saveEdit} saving={saving}>
          <BrandFields form={editForm} setForm={setEditForm} />
        </Modal>
      )}
    </div>
  );
}

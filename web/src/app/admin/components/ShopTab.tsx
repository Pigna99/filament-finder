"use client";

import { useEffect, useState } from "react";
import Modal from "./Modal";
import { Field, inp, sel } from "./Field";
import SearchableSelect from "./SearchableSelect";

interface Shop { id: number; nome: string; url: string | null; paese: string | null; tipo: string | null; attivo: boolean }
interface ShopLink { id: number; id_filament: number; id_shop: number; brand_nome: string; tipo_nome: string; variante_nome: string; colore: string | null; peso_g: number; shop_nome: string; link: string; affiliazione: boolean; attivo: boolean }
interface Filamento { id: number; brand_nome: string; tipo_nome: string; variante_nome: string; colore: string | null; peso_g: number }
interface Props { secret: string }

const emptyShopForm = { nome: "", url: "", paese: "", tipo: "reseller", codice_sconto: "" };
const emptyLinkForm = { id_filament: "", id_shop: "", link: "", affiliazione: false, codice_sconto: "" };
type ShopForm = typeof emptyShopForm;
type LinkForm = typeof emptyLinkForm;

function ShopFields({ form, setForm }: { form: ShopForm; setForm: React.Dispatch<React.SetStateAction<ShopForm>> }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nome negozio" tooltip="Nome del rivenditore (es. 3DJake, Amazon, Elegoo Store)" required>
          <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} className={inp} placeholder="es. 3DJake" />
        </Field>
        <Field label="URL homepage" tooltip="Indirizzo del sito del negozio, usato per il link nella lista shop">
          <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} className={inp} placeholder="https://www.3djake.it" />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Paese" tooltip="Codice paese ISO 2 lettere del negozio (es. IT, DE, FR, US). Usato per mostrare la bandiera.">
          <input value={form.paese} maxLength={2} onChange={e => setForm(f => ({ ...f, paese: e.target.value.toUpperCase() }))} className={inp} placeholder="IT" />
        </Field>
        <Field label="Tipo negozio" tooltip="Marketplace = piattaforma multi-brand (Amazon). Diretto = brand che vende in proprio. Reseller = rivenditore specializzato.">
          <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} className={sel}>
            <option value="marketplace">Marketplace</option>
            <option value="diretto">Diretto (brand)</option>
            <option value="reseller">Reseller</option>
          </select>
        </Field>
        <Field label="Coupon affiliato globale" tooltip="Codice sconto valido su tutto il sito, mostrato agli utenti come bonus. Specifico per prodotto nel link acquisto.">
          <input value={form.codice_sconto} onChange={e => setForm(f => ({ ...f, codice_sconto: e.target.value }))} className={inp} placeholder="es. FILAMENTFINDER10" />
        </Field>
      </div>
    </div>
  );
}

function LinkFields({ form, setForm, filamenti, shops }: {
  form: LinkForm; setForm: React.Dispatch<React.SetStateAction<LinkForm>>;
  filamenti: Filamento[]; shops: Shop[];
}) {
  const filOptions = filamenti.map(f => ({
    value: String(f.id),
    label: `${f.brand_nome} · ${f.tipo_nome} ${f.variante_nome}${f.colore ? ` ${f.colore}` : ""} ${f.peso_g}g`,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Filamento" tooltip="Il filamento specifico per cui stai aggiungendo questo link acquisto" required>
          <SearchableSelect
            options={filOptions}
            value={form.id_filament}
            onChange={v => setForm(f => ({ ...f, id_filament: v }))}
            placeholder="Cerca filamento..."
          />
        </Field>
        <Field label="Negozio" tooltip="Il negozio da cui è acquistabile il filamento" required>
          <select value={form.id_shop} onChange={e => setForm(f => ({ ...f, id_shop: e.target.value }))} className={sel}>
            <option value="">Seleziona negozio...</option>
            {shops.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </Field>
      </div>
      <Field label="URL prodotto" tooltip="Link diretto alla pagina del prodotto nel negozio selezionato" required>
        <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} className={inp} placeholder="https://www.3djake.it/bambu-lab/pla-matte-1kg" />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Coupon specifico prodotto" tooltip="Codice sconto valido solo per questo prodotto specifico (sovrascrive il coupon globale del negozio)">
          <input value={form.codice_sconto} onChange={e => setForm(f => ({ ...f, codice_sconto: e.target.value }))} className={inp} placeholder="es. PLAMATTE15" />
        </Field>
        <Field label="Link affiliato" tooltip="Se attivo, questo link genera una commissione quando l'utente acquista. Assicurati di rispettare le normative FTC/AGCM sull'affiliate marketing.">
          <div className="flex items-center gap-2 h-9">
            <input type="checkbox" checked={form.affiliazione}
              onChange={e => setForm(f => ({ ...f, affiliazione: e.target.checked }))}
              className="accent-emerald-500 w-4 h-4 cursor-pointer" />
            <span className="text-sm text-zinc-400">Link con tag affiliato</span>
          </div>
        </Field>
      </div>
    </div>
  );
}

export default function ShopTab({ secret }: Props) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [links, setLinks] = useState<ShopLink[]>([]);
  const [filamenti, setFilamenti] = useState<Filamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"shop" | "links">("shop");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  // Form nuovi
  const [newShopForm, setNewShopForm] = useState<ShopForm>(emptyShopForm);
  const [newLinkForm, setNewLinkForm] = useState<LinkForm>(emptyLinkForm);

  // Modali edit
  const [editShop, setEditShop] = useState<Shop | null>(null);
  const [editShopForm, setEditShopForm] = useState<ShopForm>(emptyShopForm);

  async function load() {
    setLoading(true);
    const [sr, lr, fr] = await Promise.all([
      fetch(`/api/admin/shop?secret=${secret}`).then(r => r.json()),
      fetch(`/api/admin/shop?secret=${secret}&mode=links`).then(r => r.json()),
      fetch(`/api/admin/filamenti?secret=${secret}`).then(r => r.json()),
    ]);
    setShops(sr); setLinks(lr); setFilamenti(fr);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);
  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(""), 3000); }

  async function createShop() {
    if (!newShopForm.nome) return;
    setSaving(true);
    await fetch(`/api/admin/shop?secret=${secret}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newShopForm, codice_sconto: newShopForm.codice_sconto || null }),
    });
    setNewShopForm(emptyShopForm);
    flash("Negozio creato");
    setSaving(false);
    load();
  }

  async function saveEditShop() {
    if (!editShop) return;
    setSaving(true);
    await fetch(`/api/admin/shop?secret=${secret}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editShop.id, ...editShopForm, codice_sconto: editShopForm.codice_sconto || null }),
    });
    setEditShop(null);
    flash("Negozio aggiornato");
    setSaving(false);
    load();
  }

  async function createLink() {
    if (!newLinkForm.id_filament || !newLinkForm.id_shop || !newLinkForm.link) return;
    setSaving(true);
    await fetch(`/api/admin/shop?secret=${secret}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode: "link",
        id_filament: Number(newLinkForm.id_filament),
        id_shop: Number(newLinkForm.id_shop),
        link: newLinkForm.link,
        affiliazione: newLinkForm.affiliazione,
        codice_sconto: newLinkForm.codice_sconto || null,
      }),
    });
    setNewLinkForm(emptyLinkForm);
    flash("Link creato");
    setSaving(false);
    load();
  }

  async function delShop(id: number) {
    if (!confirm("Eliminare il negozio? Verranno eliminati anche tutti i link associati.")) return;
    await fetch(`/api/admin/shop?secret=${secret}&id=${id}`, { method: "DELETE" });
    flash("Negozio eliminato");
    load();
  }

  async function delLink(id: number) {
    if (!confirm("Eliminare il link acquisto?")) return;
    await fetch(`/api/admin/shop?secret=${secret}&id=${id}&mode=link`, { method: "DELETE" });
    flash("Link eliminato");
    load();
  }

  async function toggleLink(l: ShopLink) {
    await fetch(`/api/admin/shop?secret=${secret}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: l.id, mode: "link", attivo: !l.attivo }),
    });
    load();
  }

  function openEditShop(s: Shop) {
    setEditShopForm({ nome: s.nome, url: s.url ?? "", paese: s.paese ?? "", tipo: s.tipo ?? "reseller", codice_sconto: "" });
    setEditShop(s);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-100 mb-1">Shop & Link acquisto</h2>
      <p className="text-xs text-zinc-500 mb-5">Gestisci i negozi online e i link di acquisto per ogni filamento.</p>

      {msg && <p className="text-emerald-400 text-sm mb-4">{msg}</p>}

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6">
        {(["shop", "links"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-sm px-4 py-2 rounded-lg transition-colors ${tab === t ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-zinc-100"}`}>
            {t === "shop" ? `Negozi (${shops.length})` : `Link acquisto (${links.length})`}
          </button>
        ))}
      </div>

      {/* === TAB NEGOZI === */}
      {tab === "shop" && (
        <>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4">Nuovo negozio</h3>
            <ShopFields form={newShopForm} setForm={setNewShopForm} />
            <div className="mt-4">
              <button onClick={createShop} disabled={!newShopForm.nome || saving}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm px-5 py-2 rounded-lg font-medium transition-colors">
                Crea negozio
              </button>
            </div>
          </div>

          {loading ? <p className="text-zinc-500 text-sm">Caricamento...</p> : (
            <div className="space-y-2">
              {shops.map(s => (
                <div key={s.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-zinc-100 text-sm font-medium">{s.nome}</span>
                    {s.paese && <span className="text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">{s.paese}</span>}
                    {s.tipo && <span className="text-xs text-zinc-500">{s.tipo}</span>}
                    {s.url && <a href={s.url} target="_blank" className="text-xs text-emerald-500 hover:underline hidden sm:inline">{s.url}</a>}
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button onClick={() => openEditShop(s)} className="text-zinc-400 hover:text-zinc-100 text-xs transition-colors">Modifica</button>
                    <button onClick={() => delShop(s.id)} className="text-red-500 hover:text-red-400 text-xs transition-colors">Elimina</button>
                  </div>
                </div>
              ))}
              {shops.length === 0 && <p className="text-zinc-600 text-sm py-4 text-center">Nessun negozio. Creane uno sopra.</p>}
            </div>
          )}
        </>
      )}

      {/* === TAB LINK === */}
      {tab === "links" && (
        <>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4">Aggiungi link acquisto</h3>
            <LinkFields form={newLinkForm} setForm={setNewLinkForm} filamenti={filamenti} shops={shops} />
            <div className="mt-4">
              <button onClick={createLink} disabled={!newLinkForm.id_filament || !newLinkForm.id_shop || !newLinkForm.link || saving}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm px-5 py-2 rounded-lg font-medium transition-colors">
                Aggiungi link
              </button>
            </div>
          </div>

          {loading ? <p className="text-zinc-500 text-sm">Caricamento...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-500 text-left border-b border-zinc-800 text-xs uppercase tracking-wider">
                    <th className="pb-3 pr-4">Filamento</th>
                    <th className="pb-3 pr-4 hidden sm:table-cell">Shop</th>
                    <th className="pb-3 pr-4 hidden md:table-cell">Link</th>
                    <th className="pb-3 pr-4">Stato</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {links.map(l => (
                    <tr key={l.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                      <td className="py-2.5 pr-4 text-zinc-100 text-xs">
                        <div>{l.brand_nome} · {l.tipo_nome} {l.variante_nome}</div>
                        <div className="text-zinc-500 sm:hidden">{l.shop_nome}</div>
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-400 text-xs hidden sm:table-cell">{l.shop_nome}</td>
                      <td className="py-2.5 pr-4 text-xs hidden md:table-cell">
                        <a href={l.link} target="_blank" className="text-emerald-400 hover:underline truncate block max-w-[200px]">{l.link}</a>
                      </td>
                      <td className="py-2.5 pr-4">
                        <button onClick={() => toggleLink(l)}
                          className={`text-xs px-2 py-0.5 rounded-full transition-colors ${l.attivo ? "bg-emerald-900/50 text-emerald-400 hover:bg-emerald-900" : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"}`}>
                          {l.attivo ? "attivo" : "inattivo"}
                        </button>
                      </td>
                      <td className="py-2.5 text-right">
                        <button onClick={() => delLink(l.id)} className="text-red-500 hover:text-red-400 text-xs transition-colors">Elimina</button>
                      </td>
                    </tr>
                  ))}
                  {links.length === 0 && (
                    <tr><td colSpan={5} className="text-zinc-600 text-sm py-4 text-center">Nessun link. Aggiungine uno sopra.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Modale edit negozio */}
      {editShop && (
        <Modal title={`Modifica — ${editShop.nome}`} onClose={() => setEditShop(null)} onSave={saveEditShop} saving={saving} size="lg">
          <ShopFields form={editShopForm} setForm={setEditShopForm} />
        </Modal>
      )}
    </div>
  );
}

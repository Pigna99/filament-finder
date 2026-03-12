import Link from "next/link";
import { FilamentoRow } from "@/lib/filamenti";
import { slugifyFilamento } from "@/lib/slugify";
import ConfróntoButton from "./ConfróntoButton";

interface Props {
  f: FilamentoRow;
}

const DIFFICOLTA_LABEL = ["", "Molto facile", "Facile", "Medio", "Difficile", "Avanzato"];
const DIFFICOLTA_COLOR = ["", "text-emerald-500", "text-emerald-400", "text-amber-400", "text-orange-400", "text-red-400"];

const TYPE_BADGE: Record<string, string> = {
  "PLA":     "bg-emerald-950/90 text-emerald-400 border border-emerald-800/50",
  "PLA-CF":  "bg-teal-950/90 text-teal-300 border border-teal-700/50",
  "PETG":    "bg-blue-950/90 text-blue-400 border border-blue-800/50",
  "PETG-CF": "bg-blue-950/90 text-blue-300 border border-blue-700/50",
  "ABS":     "bg-orange-950/90 text-orange-400 border border-orange-800/50",
  "ASA":     "bg-amber-950/90 text-amber-400 border border-amber-800/50",
  "TPU":     "bg-purple-950/90 text-purple-400 border border-purple-800/50",
  "NYLON":   "bg-cyan-950/90 text-cyan-400 border border-cyan-800/50",
  "PA-CF":   "bg-cyan-950/90 text-cyan-300 border border-cyan-700/50",
  "PC":      "bg-red-950/90 text-red-400 border border-red-800/50",
  "HIPS":    "bg-zinc-900/90 text-zinc-300 border border-zinc-700/50",
  "PVA":     "bg-pink-950/90 text-pink-400 border border-pink-800/50",
};

export default function FilamentoCard({ f }: Props) {
  const slug = slugifyFilamento(f.brand, f.tipo, f.variante, f.colore, f.peso_g);
  const prezzoKg = f.prezzo_per_kg_min
    ? `€ ${Number(f.prezzo_per_kg_min).toFixed(2)}/kg`
    : null;
  const prezzoMin = f.prezzo_min ? `da € ${Number(f.prezzo_min).toFixed(2)}` : null;

  return (
    <div className="relative">
    <Link
      href={`/filamento/${slug}`}
      className="group block bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/5"
    >
      {/* Immagine o placeholder colore */}
      <div className="h-36 bg-zinc-800 flex items-center justify-center relative overflow-hidden">
        {f.link_immagine ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={f.link_immagine}
            alt={`${f.brand} ${f.tipo} ${f.variante} ${f.colore ?? ""}`}
            className="w-full h-full object-contain p-3"
            loading="lazy"
          />
        ) : (
          /* Swatch colore stilizzato come bobina */
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-20 h-20 rounded-full border-4 border-zinc-900 shadow-lg ring-2 ring-zinc-700"
              style={{ backgroundColor: f.colore_hex ?? "#3f3f46" }}
            >
              <div className="w-full h-full rounded-full flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-zinc-900/80" />
              </div>
            </div>
            {f.colore && (
              <span className="text-xs text-zinc-500">{f.colore}</span>
            )}
          </div>
        )}
        {/* Badge tipo */}
        <span className={`absolute top-2 left-2 text-xs font-mono px-2 py-0.5 rounded-full ${TYPE_BADGE[f.tipo] ?? "bg-zinc-950/80 text-zinc-400 border border-zinc-700/50"}`}>
          {f.tipo}
        </span>
        {/* Badge refill */}
        {f.is_refill && (
          <span className="absolute top-2 right-2 text-xs bg-amber-900/80 text-amber-300 border border-amber-700/50 px-1.5 py-0.5 rounded-full">
            Refill
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Brand + variante */}
        <p className="text-xs text-zinc-500 mb-1">{f.brand}</p>
        <h3 className="text-sm font-semibold text-zinc-100 leading-snug group-hover:text-emerald-400 transition-colors">
          {f.variante} {f.colore ?? ""}
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          {f.peso_g}g · ⌀{f.diametro_mm}mm
        </p>

        {/* Prezzo */}
        <div className="mt-3 flex items-end justify-between">
          <div>
            {prezzoMin && (
              <p className="text-zinc-100 font-bold text-sm">{prezzoMin}</p>
            )}
            {prezzoKg && (
              <p className="text-emerald-400 text-xs font-medium">{prezzoKg}</p>
            )}
            {!prezzoKg && !prezzoMin && (
              <p className="text-zinc-600 text-xs">Nessun prezzo</p>
            )}
          </div>
          {/* Shop count + Difficoltà stampa */}
          <div className="flex flex-col items-end gap-1">
            {f.difficolta_stampa && (
              <span
                className={`text-xs font-medium ${DIFFICOLTA_COLOR[f.difficolta_stampa]}`}
                title="Difficoltà di stampa"
              >
                {DIFFICOLTA_LABEL[f.difficolta_stampa]}
              </span>
            )}
            {Number(f.num_shop) > 0 && (
              <span className="text-xs text-zinc-600" title="Disponibile in questi shop">
                {Number(f.num_shop)} shop
              </span>
            )}
          </div>
        </div>{/* end flex justify-between */}

        {/* Swatch colore inline (solo se c'è immagine prodotto) */}
        {f.link_immagine && f.colore_hex && (
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full border border-zinc-700 inline-block"
              style={{ backgroundColor: f.colore_hex }}
            />
            <span className="text-xs text-zinc-600">{f.colore}</span>
          </div>
        )}
      </div>
    </Link>
    <ConfróntoButton id={f.id} />
    </div>
  );
}

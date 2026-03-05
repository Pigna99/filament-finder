import Link from "next/link";
import { FilamentoRow } from "@/lib/filamenti";
import { slugifyFilamento } from "@/lib/slugify";

interface Props {
  f: FilamentoRow;
}

const DIFFICOLTA = ["", "★☆☆☆☆", "★★☆☆☆", "★★★☆☆", "★★★★☆", "★★★★★"];

export default function FilamentoCard({ f }: Props) {
  const slug = slugifyFilamento(f.brand, f.tipo, f.variante, f.colore, f.peso_g);
  const prezzoKg = f.prezzo_per_kg_min
    ? `€ ${Number(f.prezzo_per_kg_min).toFixed(2)}/kg`
    : null;
  const prezzoMin = f.prezzo_min ? `da € ${Number(f.prezzo_min).toFixed(2)}` : null;

  return (
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
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full border-2 border-zinc-700"
            style={{ backgroundColor: f.colore_hex ?? "#3f3f46" }}
          />
        )}
        {/* Badge tipo */}
        <span className="absolute top-2 left-2 bg-zinc-950/80 text-emerald-400 text-xs font-mono px-2 py-0.5 rounded-full">
          {f.tipo}
        </span>
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
            {prezzoKg && (
              <p className="text-emerald-400 font-bold text-sm">{prezzoKg}</p>
            )}
            {prezzoMin && (
              <p className="text-zinc-400 text-xs">{prezzoMin}</p>
            )}
            {!prezzoKg && !prezzoMin && (
              <p className="text-zinc-600 text-xs">Nessun prezzo</p>
            )}
          </div>
          {/* Difficoltà stampa */}
          {f.difficolta_stampa && (
            <span className="text-xs text-zinc-600" title="Difficoltà stampa">
              {DIFFICOLTA[f.difficolta_stampa]}
            </span>
          )}
        </div>

        {/* Swatch colore */}
        {f.colore_hex && (
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
  );
}

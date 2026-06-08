import Link from "next/link";
import { FilamentoRow } from "@/lib/filamenti";
import { slugifyFilamento } from "@/lib/slugify";
import { tipoBadgeStyle, difficoltaColor, DIFFICOLTA_LABEL } from "@/lib/tipo-style";
import ConfróntoButton from "./ConfróntoButton";

interface Props {
  f: FilamentoRow;
}

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
        className="group block h-full rounded-2xl overflow-hidden border transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5"
        style={{
          backgroundColor: "var(--surface-1)",
          borderColor: "var(--line)",
        }}
      >
        {/* Immagine o placeholder colore */}
        <div
          className="h-36 flex items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: "var(--surface-2)" }}
        >
          {f.link_immagine ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={f.link_immagine}
              alt={`${f.brand} ${f.tipo} ${f.variante} ${f.colore ?? ""}`}
              className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span
                className="w-20 h-20 rounded-full grid place-items-center shadow-lg"
                style={{
                  backgroundColor: f.colore_hex ?? "var(--surface-3)",
                  boxShadow: "inset 0 0 0 4px var(--surface-1), 0 0 0 1.5px var(--line-strong)",
                }}
              >
                <span className="w-6 h-6 rounded-full" style={{ backgroundColor: "var(--surface-1)" }} />
              </span>
              {f.colore && (
                <span className="text-xs" style={{ color: "var(--ink-4)" }}>{f.colore}</span>
              )}
            </div>
          )}
          <span
            className="absolute top-2 left-2 text-xs font-mono px-2 py-0.5 rounded-full border"
            style={tipoBadgeStyle(f.tipo)}
          >
            {f.tipo}
          </span>
          {f.is_refill && (
            <span
              className="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-full border"
              style={{
                color: "oklch(0.82 0.12 75)",
                backgroundColor: "oklch(0.28 0.05 75 / 0.8)",
                borderColor: "oklch(0.45 0.08 75 / 0.5)",
              }}
            >
              Refill
            </span>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs mb-1" style={{ color: "var(--ink-4)" }}>{f.brand}</p>
          <h3
            className="text-sm font-semibold leading-snug transition-colors group-hover:[color:var(--accent)]"
            style={{ color: "var(--ink-1)" }}
          >
            {f.variante} {f.colore ?? ""}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--ink-4)" }}>
            {f.peso_g}g · ⌀{f.diametro_mm}mm
          </p>

          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              {prezzoMin && (
                <p className="font-bold text-sm" style={{ color: "var(--ink-1)" }}>{prezzoMin}</p>
              )}
              {prezzoKg && (
                <p className="text-xs font-medium" style={{ color: "var(--good)" }}>{prezzoKg}</p>
              )}
              {!prezzoKg && !prezzoMin && (
                <p className="text-xs" style={{ color: "var(--ink-4)" }}>Nessun prezzo</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              {f.difficolta_stampa && (
                <span
                  className="text-xs font-medium"
                  style={{ color: difficoltaColor(f.difficolta_stampa) }}
                  title="Difficoltà di stampa"
                >
                  {DIFFICOLTA_LABEL[f.difficolta_stampa]}
                </span>
              )}
              {Number(f.num_shop) > 0 && (
                <span className="text-xs" style={{ color: "var(--ink-4)" }} title="Disponibile in questi shop">
                  {Number(f.num_shop)} shop
                </span>
              )}
            </div>
          </div>

          {f.link_immagine && f.colore_hex && (
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full border inline-block"
                style={{ backgroundColor: f.colore_hex, borderColor: "var(--line-strong)" }}
              />
              <span className="text-xs" style={{ color: "var(--ink-4)" }}>{f.colore}</span>
            </div>
          )}
        </div>
      </Link>
      <ConfróntoButton id={f.id} />
    </div>
  );
}

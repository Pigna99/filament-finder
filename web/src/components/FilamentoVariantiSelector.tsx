"use client";

import { useRouter } from "next/navigation";
import { VarianteModello } from "@/lib/filamenti";

interface Props {
  varianti: VarianteModello[];
  currentId: number;
  currentColore: string | null;
  currentPeso: number;
  currentIsRefill: boolean;
}

export default function FilamentoVariantiSelector({
  varianti,
  currentId,
  currentColore,
  currentPeso,
  currentIsRefill,
}: Props) {
  const router = useRouter();

  // Raggruppamento per colore (ordine fisso alfabetico, stabilito dal server)
  const colorMap = new Map<string, VarianteModello[]>();
  for (const v of varianti) {
    const key = v.colore ?? "__null__";
    if (!colorMap.has(key)) colorMap.set(key, []);
    colorMap.get(key)!.push(v);
  }
  const colorKeys = [...colorMap.keys()]; // ordine già stabile (dall'ORDER BY colore ASC)

  // Varianti del colore corrente
  const currentColorKey = currentColore ?? "__null__";
  const currentColorVariants = colorMap.get(currentColorKey) ?? [];

  // Pesi disponibili per il colore corrente
  const pesi = [...new Set(currentColorVariants.map((v) => v.peso_g))].sort((a, b) => a - b);

  // Verifica se esiste sia versione standard che refill per colore+peso corrente
  const forCurrentCombination = currentColorVariants.filter((v) => v.peso_g === currentPeso);
  const hasRefill = forCurrentCombination.some((v) => v.is_refill);
  const hasStandard = forCurrentCombination.some((v) => !v.is_refill);
  const showRefillToggle = hasRefill && hasStandard;

  // Se c'è solo un colore, un peso e nessun toggle refill → niente da mostrare
  if (colorKeys.length <= 1 && pesi.length <= 1 && !showRefillToggle) return null;

  function navigateToColor(colorKey: string) {
    const variants = colorMap.get(colorKey) ?? [];
    // Priorità: stesso peso + stessa refill, poi stesso peso, poi qualsiasi
    const target =
      variants.find((v) => v.peso_g === currentPeso && v.is_refill === currentIsRefill) ??
      variants.find((v) => v.peso_g === currentPeso) ??
      variants[0];
    if (target) router.push(`/filamento/${target.slug}`);
  }

  function navigateToPeso(peso: number) {
    const variants = currentColorVariants.filter((v) => v.peso_g === peso);
    const target =
      variants.find((v) => v.is_refill === currentIsRefill) ?? variants[0];
    if (target) router.push(`/filamento/${target.slug}`);
  }

  function navigateToRefill(isRefill: boolean) {
    const target = currentColorVariants.find(
      (v) => v.peso_g === currentPeso && v.is_refill === isRefill
    );
    if (target) router.push(`/filamento/${target.slug}`);
  }

  return (
    <div className="space-y-3 mb-4">
      {/* Selettore colore */}
      {colorKeys.length > 1 && (
        <div>
          <p className="text-xs text-zinc-600 mb-2">Colore</p>
          <div className="flex flex-wrap gap-2">
            {colorKeys.map((key) => {
              const sample = colorMap.get(key)![0];
              const isCurrent = key === currentColorKey && varianti.find(v => v.id === currentId)?.colore === currentColore;
              const isCurrentColor = key === currentColorKey;
              return (
                <button
                  key={key}
                  onClick={() => !isCurrentColor && navigateToColor(key)}
                  title={sample.colore ?? ""}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    isCurrentColor
                      ? "border-emerald-400 shadow-[0_0_0_2px_rgba(52,211,153,0.25)] cursor-default scale-110"
                      : "border-zinc-700 hover:border-zinc-400 hover:scale-105 cursor-pointer"
                  }`}
                  style={{ backgroundColor: sample.colore_hex ?? "#3f3f46" }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Selettore peso */}
      {pesi.length > 1 && (
        <div>
          <p className="text-xs text-zinc-600 mb-2">Peso</p>
          <div className="flex flex-wrap gap-2">
            {pesi.map((w) => {
              const label = w >= 1000 ? `${w / 1000} kg` : `${w} g`;
              const isCurrent = w === currentPeso;
              return (
                <button
                  key={w}
                  onClick={() => !isCurrent && navigateToPeso(w)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    isCurrent
                      ? "bg-emerald-900/50 border-emerald-700 text-emerald-400 cursor-default"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 cursor-pointer"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Refill toggle */}
      {showRefillToggle && (
        <div>
          <p className="text-xs text-zinc-600 mb-2">Versione</p>
          <div className="flex gap-2">
            <button
              onClick={() => currentIsRefill && navigateToRefill(false)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                !currentIsRefill
                  ? "bg-zinc-700 border-zinc-500 text-zinc-200 cursor-default"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 cursor-pointer"
              }`}
            >
              Con bobina
            </button>
            <button
              onClick={() => !currentIsRefill && navigateToRefill(true)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                currentIsRefill
                  ? "bg-amber-900/60 border-amber-700 text-amber-300 cursor-default"
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 cursor-pointer"
              }`}
            >
              Refill
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

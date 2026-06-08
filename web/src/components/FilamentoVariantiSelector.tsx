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
          <p className="text-xs mb-2" style={{ color: "var(--ink-4)" }}>Colore</p>
          <div className="flex flex-wrap gap-2">
            {colorKeys.map((key) => {
              const sample = colorMap.get(key)![0];
              const isCurrentColor = key === currentColorKey;
              return (
                <button
                  key={key}
                  onClick={() => !isCurrentColor && navigateToColor(key)}
                  title={sample.colore ?? ""}
                  aria-label={`Colore ${sample.colore ?? ""}`}
                  aria-pressed={isCurrentColor}
                  className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-105"
                  style={{
                    backgroundColor: sample.colore_hex ?? "var(--surface-3)",
                    borderColor: isCurrentColor ? "var(--accent)" : "var(--line-strong)",
                    transform: isCurrentColor ? "scale(1.12)" : undefined,
                    boxShadow: isCurrentColor ? "0 0 0 2px var(--accent-quiet)" : undefined,
                    cursor: isCurrentColor ? "default" : "pointer",
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Selettore peso */}
      {pesi.length > 1 && (
        <div>
          <p className="text-xs mb-2" style={{ color: "var(--ink-4)" }}>Peso</p>
          <div className="flex flex-wrap gap-2">
            {pesi.map((w) => {
              const label = w >= 1000 ? `${w / 1000} kg` : `${w} g`;
              const isCurrent = w === currentPeso;
              return (
                <button
                  key={w}
                  onClick={() => !isCurrent && navigateToPeso(w)}
                  aria-pressed={isCurrent}
                  className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
                  style={isCurrent
                    ? { backgroundColor: "var(--accent-quiet)", borderColor: "var(--accent-line)", color: "var(--accent)", cursor: "default" }
                    : { backgroundColor: "var(--surface-2)", borderColor: "var(--line-strong)", color: "var(--ink-3)" }}
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
          <p className="text-xs mb-2" style={{ color: "var(--ink-4)" }}>Versione</p>
          <div className="flex gap-2">
            <button
              onClick={() => currentIsRefill && navigateToRefill(false)}
              aria-pressed={!currentIsRefill}
              className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
              style={!currentIsRefill
                ? { backgroundColor: "var(--surface-3)", borderColor: "var(--line-strong)", color: "var(--ink-1)", cursor: "default" }
                : { backgroundColor: "var(--surface-2)", borderColor: "var(--line-strong)", color: "var(--ink-3)" }}
            >
              Con bobina
            </button>
            <button
              onClick={() => !currentIsRefill && navigateToRefill(true)}
              aria-pressed={currentIsRefill}
              className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
              style={currentIsRefill
                ? { backgroundColor: "oklch(0.34 0.07 75)", borderColor: "oklch(0.5 0.09 75)", color: "oklch(0.88 0.07 75)", cursor: "default" }
                : { backgroundColor: "var(--surface-2)", borderColor: "var(--line-strong)", color: "var(--ink-3)" }}
            >
              Refill
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

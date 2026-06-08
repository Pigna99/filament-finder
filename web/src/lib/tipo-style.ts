/**
 * Material-type visual language, single source of truth.
 *
 * Each filament family gets one hue. Badges/pills derive their colours from
 * that hue via OKLCH inline styles, so we get a coherent palette (no scattered
 * Tailwind colour classes duplicated across files) and any unknown type falls
 * back to a neutral graphite chip.
 */

import type { CSSProperties } from "react";

/** Hue (OKLCH) per material family. */
const TIPO_HUE: Record<string, number> = {
  PLA: 150,
  "PLA-CF": 168,
  PETG: 240,
  "PETG-CF": 248,
  ABS: 40,
  ASA: 75,
  TPU: 300,
  NYLON: 200,
  "PA-CF": 196,
  PC: 25,
  HIPS: 264,
  PVA: 340,
};

const NEUTRAL_HUE = 264;

export function tipoHue(tipo: string): number {
  return TIPO_HUE[tipo] ?? NEUTRAL_HUE;
}

/** Filled-ish chip used as a "tipo" badge over imagery and on cards. */
export function tipoBadgeStyle(tipo: string): CSSProperties {
  const h = tipoHue(tipo);
  const known = tipo in TIPO_HUE;
  return {
    color: `oklch(0.82 ${known ? 0.13 : 0.01} ${h})`,
    backgroundColor: `oklch(0.26 ${known ? 0.06 : 0.008} ${h} / 0.85)`,
    borderColor: `oklch(0.45 ${known ? 0.1 : 0.01} ${h} / 0.5)`,
  };
}

/** Quieter outline pill used in filter rows; `active` fills it in. */
export function tipoPillStyle(tipo: string, active: boolean): CSSProperties {
  const h = tipoHue(tipo);
  const known = tipo in TIPO_HUE;
  return {
    color: `oklch(0.82 ${known ? 0.13 : 0.01} ${h})`,
    borderColor: active
      ? `oklch(0.58 ${known ? 0.13 : 0.01} ${h})`
      : `oklch(0.45 ${known ? 0.09 : 0.01} ${h} / 0.55)`,
    backgroundColor: active
      ? `oklch(0.30 ${known ? 0.07 : 0.008} ${h} / 0.6)`
      : "transparent",
  };
}

/** Difficoltà di stampa — 1 (molto facile) … 5 (molto difficile). */
export const DIFFICOLTA_LABEL = [
  "",
  "Molto facile",
  "Facile",
  "Medio",
  "Difficile",
  "Molto difficile",
] as const;

const DIFFICOLTA_HUE = [0, 150, 150, 75, 40, 25];

export function difficoltaColor(level: number): string {
  const h = DIFFICOLTA_HUE[level] ?? NEUTRAL_HUE;
  return `oklch(0.78 0.15 ${h})`;
}

// Utility client-only per la lista confronto (localStorage)
const KEY = "ff_compare";
const MAX = 4;
const EV  = "compare-updated";

export function getCompareIds(): number[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); }
  catch { return []; }
}

export function setCompareIds(ids: number[]) {
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(EV));
}

export function toggleCompare(id: number) {
  const ids = getCompareIds();
  const next = ids.includes(id)
    ? ids.filter((x) => x !== id)
    : [...ids, id].slice(-MAX);
  setCompareIds(next);
}

export function isInCompare(id: number) {
  return getCompareIds().includes(id);
}

export function onCompareChange(cb: () => void) {
  window.addEventListener(EV, cb);
  return () => window.removeEventListener(EV, cb);
}

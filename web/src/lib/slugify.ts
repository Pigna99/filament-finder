export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function slugifyFilamento(
  brand: string,
  tipo: string,
  variante: string,
  colore: string | null,
  peso: number
): string {
  const parts = [brand, tipo, variante, colore || "", `${peso}g`].filter(Boolean);
  return parts.map(slugify).join("-");
}

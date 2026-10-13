export const CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir", "Meknès", "Oujda", "Kénitra",
  "Tétouan", "Salé", "Témara", "Mohammedia", "El Jadida", "Béni Mellal", "Nador", "Taza",
  "Settat", "Khouribga", "Safi", "Essaouira", "Larache", "Ksar el-Kébir", "Khémisset",
  "Berrechid", "Errachidia", "Ouarzazate", "Laâyoune", "Dakhla", "Al Hoceïma", "Autre ville"
];

// Moroccan mobile/landline: 06/07/05 + 8 digits, with optional +212 / 00212
export function normalizePhone(raw: string): string | null {
  const d = raw.replace(/[\s.\-()]/g, "");
  const m = d.match(/^(?:\+212|00212|0)([5-7]\d{8})$/);
  return m ? "0" + m[1] : null;
}

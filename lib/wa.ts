/** Builds a wa.me link from a Moroccan number (06…, +212…, 00212…). Returns "" if no number set. */
export function waLink(raw: string, text = ""): string {
  const d = (raw || "").replace(/[^\d+]/g, "");
  if (!d) return "";
  let n = d.replace(/^\+/, "");
  if (n.startsWith("00")) n = n.slice(2);
  if (n.startsWith("0")) n = "212" + n.slice(1);
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

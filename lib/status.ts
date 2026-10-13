export const STATUSES = ["new", "confirmed", "shipped", "delivered", "returned", "cancelled"] as const;

export const STATUS_LABEL: Record<string, string> = {
  new: "Nouvelle",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  delivered: "Livrée",
  returned: "Retournée",
  cancelled: "Annulée"
};

export const STATUS_COLOR: Record<string, string> = {
  new: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  returned: "bg-rose-100 text-rose-800",
  cancelled: "bg-zinc-200 text-zinc-700"
};

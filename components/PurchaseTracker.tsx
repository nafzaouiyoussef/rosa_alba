"use client";

import { useEffect } from "react";
import { trackPurchase } from "@/lib/track";

export default function PurchaseTracker({
  orderNumber,
  total,
  items
}: {
  orderNumber: string;
  total: number;
  items: { id: string; name: string; price: number; qty: number }[];
}) {
  useEffect(() => {
    trackPurchase(orderNumber, items, total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);
  return null;
}

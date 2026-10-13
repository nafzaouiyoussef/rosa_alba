"use client";

import { useEffect } from "react";

const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "ttclid", "gclid", "ScCid"];

/** Stores ad attribution params on first landing so the order can carry them. */
export default function UtmCapture() {
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const found: Record<string, string> = {};
      KEYS.forEach((k) => {
        const v = p.get(k);
        if (v) found[k] = v.slice(0, 200);
      });
      if (Object.keys(found).length) {
        const prev = JSON.parse(localStorage.getItem("ra_utm") || "{}");
        localStorage.setItem("ra_utm", JSON.stringify({ ...prev, ...found, landing: window.location.pathname }));
      }
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}

export function readUtm(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem("ra_utm") || "{}");
  } catch {
    return {};
  }
}

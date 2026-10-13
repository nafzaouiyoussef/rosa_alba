"use client";

/**
 * Thin wrapper over Meta Pixel, TikTok Pixel and GA4.
 * Every call is safe if a pixel is not installed.
 */
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    ttq?: { track: (...args: any[]) => void; page: () => void };
    gtag?: (...args: any[]) => void;
  }
}

const CURRENCY = "MAD";

type Item = { id: string; name: string; price: number; qty: number };

function safe(fn: () => void) {
  try {
    fn();
  } catch {
    /* tracking must never break the store */
  }
}

export function trackViewContent(item: { id: string; name: string; price: number }) {
  safe(() => {
    window.fbq?.("track", "ViewContent", {
      content_ids: [item.id],
      content_name: item.name,
      content_type: "product",
      value: item.price,
      currency: CURRENCY
    });
    window.ttq?.track("ViewContent", {
      content_id: item.id,
      content_name: item.name,
      content_type: "product",
      value: item.price,
      currency: CURRENCY
    });
    window.gtag?.("event", "view_item", {
      currency: CURRENCY,
      value: item.price,
      items: [{ item_id: item.id, item_name: item.name, price: item.price }]
    });
  });
}

export function trackAddToCart(item: Item) {
  const value = item.price * item.qty;
  safe(() => {
    window.fbq?.("track", "AddToCart", {
      content_ids: [item.id],
      content_name: item.name,
      content_type: "product",
      value,
      currency: CURRENCY
    });
    window.ttq?.track("AddToCart", {
      content_id: item.id,
      content_name: item.name,
      content_type: "product",
      quantity: item.qty,
      value,
      currency: CURRENCY
    });
    window.gtag?.("event", "add_to_cart", {
      currency: CURRENCY,
      value,
      items: [{ item_id: item.id, item_name: item.name, price: item.price, quantity: item.qty }]
    });
  });
}

export function trackInitiateCheckout(items: Item[], value: number) {
  safe(() => {
    window.fbq?.("track", "InitiateCheckout", {
      content_ids: items.map((i) => i.id),
      content_type: "product",
      num_items: items.reduce((s, i) => s + i.qty, 0),
      value,
      currency: CURRENCY
    });
    window.ttq?.track("InitiateCheckout", {
      contents: items.map((i) => ({ content_id: i.id, content_type: "product", quantity: i.qty, price: i.price })),
      value,
      currency: CURRENCY
    });
    window.gtag?.("event", "begin_checkout", {
      currency: CURRENCY,
      value,
      items: items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.qty }))
    });
  });
}

/** Fire once per order (guarded with sessionStorage) from the thank-you page. */
export function trackPurchase(orderNumber: string, items: Item[], value: number) {
  const key = `ra_purchase_${orderNumber}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* ignore */
  }
  safe(() => {
    window.fbq?.(
      "track",
      "Purchase",
      {
        content_ids: items.map((i) => i.id),
        content_type: "product",
        num_items: items.reduce((s, i) => s + i.qty, 0),
        value,
        currency: CURRENCY
      },
      { eventID: orderNumber }
    );
    window.ttq?.track(
      "CompletePayment",
      {
        contents: items.map((i) => ({ content_id: i.id, content_type: "product", quantity: i.qty, price: i.price })),
        value,
        currency: CURRENCY
      },
      { event_id: orderNumber }
    );
    window.gtag?.("event", "purchase", {
      transaction_id: orderNumber,
      currency: CURRENCY,
      value,
      items: items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.qty }))
    });
  });
}

export function trackContact() {
  safe(() => {
    window.fbq?.("track", "Contact");
    window.ttq?.track("Contact");
    window.gtag?.("event", "contact");
  });
}

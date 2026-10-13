export type Lang = "fr" | "ar";

export type Product = {
  id: string;
  slug: string;
  name_fr: string;
  name_ar: string;
  tagline_fr: string;
  tagline_ar: string;
  description_fr: string;
  description_ar: string;
  benefits_fr: string[];
  benefits_ar: string[];
  ingredients_fr: string;
  ingredients_ar: string;
  usage_fr: string;
  usage_ar: string;
  size: string;
  price: number;
  compare_at_price: number | null;
  disc_2: number;
  disc_3: number;
  stock: number;
  images: string[];
  category: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
};

export type Review = {
  id: string;
  product_id: string | null;
  author: string;
  city: string;
  rating: number;
  body: string;
  is_approved: boolean;
  created_at: string;
};

export type OrderItem = {
  product_id: string;
  slug: string;
  name: string;
  qty: number;
  unit_price: number;
  line_total: number;
  image?: string;
  upsell?: boolean;
};

export type OrderStatus = "new" | "confirmed" | "shipped" | "delivered" | "returned" | "cancelled";

export type Order = {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  payment_method: string;
  source: string;
  utm: Record<string, string>;
  lang: string;
  upsell_token: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
};

export type Settings = {
  store_name: string;
  whatsapp: string;
  instagram: string;
  announcement_fr: string;
  announcement_ar: string;
  meta_pixel_id: string;
  tiktok_pixel_id: string;
  ga_id: string;
  shipping_fee: number;
  delivery_days: string;
  upsell_enabled: boolean;
  upsell_discount_pct: number;
  bundle_enabled: boolean;
  bundle_discount_pct: number;
  hero_image: string;
  contact_email: string;
  business_name: string;
  business_address: string;
  business_id: string;
};

export const DEFAULT_SETTINGS: Settings = {
  store_name: "Rosa Alba",
  whatsapp: "",
  instagram: "rosaal_ba",
  announcement_fr: "Livraison GRATUITE partout au Maroc · Paiement à la livraison",
  announcement_ar: "التوصيل مجاني لجميع المدن · الدفع عند الاستلام",
  meta_pixel_id: "",
  tiktok_pixel_id: "",
  ga_id: "",
  shipping_fee: 0,
  delivery_days: "24-72h",
  upsell_enabled: true,
  upsell_discount_pct: 10,
  bundle_enabled: true,
  bundle_discount_pct: 20,
  hero_image: "",
  contact_email: "",
  business_name: "",
  business_address: "",
  business_id: ""
};

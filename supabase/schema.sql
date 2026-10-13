-- Rosa Alba store — run this whole file in Supabase > SQL Editor

create extension if not exists "pgcrypto";

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_fr text not null,
  name_ar text not null default '',
  tagline_fr text not null default '',
  tagline_ar text not null default '',
  description_fr text not null default '',
  description_ar text not null default '',
  benefits_fr text[] not null default '{}',
  benefits_ar text[] not null default '{}',
  ingredients_fr text not null default '',
  ingredients_ar text not null default '',
  usage_fr text not null default '',
  usage_ar text not null default '',
  size text not null default '',
  price numeric(10,2) not null default 0,
  compare_at_price numeric(10,2),
  disc_2 numeric(5,2) not null default 10,   -- % off when buying 2
  disc_3 numeric(5,2) not null default 15,   -- % off when buying 3+
  stock integer not null default 100,
  images text[] not null default '{}',
  category text not null default '',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  author text not null,
  city text not null default '',
  rating integer not null default 5 check (rating between 1 and 5),
  body text not null,
  is_approved boolean not null default true,
  created_at timestamptz not null default now()
);

create sequence if not exists order_number_seq start 1001;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default ('RA-' || nextval('order_number_seq')),
  status text not null default 'new'
    check (status in ('new','confirmed','shipped','delivered','returned','cancelled')),
  customer_name text not null,
  phone text not null,
  city text not null,
  address text not null default '',
  notes text not null default '',
  items jsonb not null default '[]',
  subtotal numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  payment_method text not null default 'cod',
  source text not null default '',
  utm jsonb not null default '{}',
  lang text not null default 'fr',
  upsell_token text not null default encode(gen_random_bytes(12), 'hex'),
  admin_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_created_idx on orders (created_at desc);
create index if not exists orders_phone_idx on orders (phone);
create index if not exists orders_status_idx on orders (status);

create table if not exists settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- All access goes through the server with the service-role key.
-- RLS on + no policies = the public anon key can read/write nothing.
alter table products enable row level security;
alter table reviews  enable row level security;
alter table orders   enable row level security;
alter table settings enable row level security;

-- Public bucket for product images (uploads happen server-side from /admin)
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

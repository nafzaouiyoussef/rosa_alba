import { notFound } from "next/navigation";
import { getProductById } from "@/lib/data";
import ProductForm from "@/components/admin/ProductForm";
import type { Product } from "@/lib/types";

const EMPTY: Product = {
  id: "",
  slug: "",
  name_fr: "",
  name_ar: "",
  tagline_fr: "",
  tagline_ar: "",
  description_fr: "",
  description_ar: "",
  benefits_fr: [],
  benefits_ar: [],
  ingredients_fr: "",
  ingredients_ar: "",
  usage_fr: "",
  usage_ar: "",
  size: "",
  price: 0,
  compare_at_price: null,
  disc_2: 10,
  disc_3: 15,
  stock: 50,
  images: [],
  category: "",
  is_active: true,
  is_featured: false,
  sort_order: 0
};

export default async function EditProduct({ params }: { params: { id: string } }) {
  const isNew = params.id === "new";
  const product = isNew ? EMPTY : await getProductById(params.id);
  if (!product) notFound();
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-serif text-3xl font-bold">{isNew ? "Nouveau produit" : product.name_fr}</h1>
      <ProductForm product={product} isNew={isNew} />
    </div>
  );
}

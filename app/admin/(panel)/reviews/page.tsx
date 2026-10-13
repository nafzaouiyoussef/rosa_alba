import { listAllReviews } from "@/lib/admin-data";
import { getProducts } from "@/lib/data";
import ReviewManager from "@/components/admin/ReviewManager";

export default async function AdminReviews() {
  const [reviews, products] = await Promise.all([listAllReviews(), getProducts({ all: true })]);
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-serif text-3xl font-bold">Avis clients</h1>
      <p className="mt-2 text-sm text-ink/60">
        Ajoutez uniquement de <b>vrais avis</b> (messages WhatsApp, commentaires Instagram, retours clients, avec leur accord). La boutique n&apos;affiche aucune section d&apos;avis tant qu&apos;il n&apos;y en a pas.
      </p>
      <ReviewManager
        products={products.map((p) => ({ id: p.id, name: p.name_fr }))}
        reviews={reviews.map((r) => ({ id: r.id, author: r.author, city: r.city, rating: r.rating, body: r.body, is_approved: r.is_approved, product_name: r.product_name }))}
      />
    </div>
  );
}

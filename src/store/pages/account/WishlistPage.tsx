import { useEffect, useState } from "react";
import ProductCard from "../../components/ProductCard";
import { api, type Product } from "../../lib/api";
import { t, useLang } from "../../lib/i18n";

export default function WishlistPage() {
  useLang();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ ok: boolean; items: { product: Product }[] }>("/api/wishlist")
      .then((d) => setItems(d.items.map((i) => i.product)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>{t("loading")}</div>;

  return (
    <div>
      <h1>{t("wishlist")}</h1>
      {items.length === 0 ? <p className="muted">Your wishlist is empty.</p> : null}
      <div className="grid">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

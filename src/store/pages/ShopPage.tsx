import { useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { api, type Category, type Product } from "../lib/api";
import { t, useLang } from "../lib/i18n";

export default function ShopPage() {
  useLang();
  const [params] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);

  const [q, setQ] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [type, setType] = useState(params.get("type") ?? "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [available, setAvailable] = useState(false);
  const [sort, setSort] = useState(params.get("sort") ?? "newest");

  const load = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (q) query.set("q", q);
    if (category) query.set("category", category);
    if (type) query.set("type", type);
    if (minPrice) query.set("minPrice", minPrice);
    if (maxPrice) query.set("maxPrice", maxPrice);
    if (minRating) query.set("minRating", minRating);
    if (available) query.set("available", "1");
    query.set("sort", sort);
    try {
      const d = await api<{ ok: boolean; products: Product[]; total: number }>(`/api/products?${query.toString()}`);
      setProducts(d.products);
      setTotal(d.total);
    } catch {
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [q, category, type, minPrice, maxPrice, minRating, available, sort]);

  useEffect(() => {
    api<{ ok: boolean; categories: Category[] }>("/api/storefront")
      .then((d) => setCats(d.categories))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const clear = () => {
    setQ("");
    setCategory("");
    setType("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setAvailable(false);
    setSort("newest");
  };

  const filterBody = (
    <>
      <h3>{t("filters")}</h3>
      <label>{t("search")}</label>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchPlaceholder")} />
      <label>{t("category")}</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">All</option>
        {cats.map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
      <label>{t("games")} / {t("accounts")}</label>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="">All</option>
        <option value="game">{t("games")}</option>
        <option value="account">{t("accounts")}</option>
      </select>
      <label>{t("price")}</label>
      <div className="row">
        <input type="number" min={0} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder={t("minPrice")} />
        <input type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder={t("maxPrice")} />
      </div>
      <label>{t("rating")}</label>
      <select value={minRating} onChange={(e) => setMinRating(e.target.value)}>
        <option value="">Any</option>
        <option value="4">4★ &amp; up</option>
        <option value="3">3★ &amp; up</option>
      </select>
      <label style={{ display: "flex", gap: 8, alignItems: "center", color: "#1f2937" }}>
        <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} style={{ width: "auto" }} />
        {t("availability")} — {t("inStock")}
      </label>
      <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
        <button className="btn small" onClick={() => setDrawer(false)}>
          {t("apply")}
        </button>
        <button className="btn ghost small" onClick={clear}>
          {t("clearFilters")}
        </button>
      </div>
    </>
  );

  return (
    <div className="container">
      <button className="btn filters-toggle" onClick={() => setDrawer(true)}>
        ☰ {t("filters")}
      </button>
      {drawer ? <div className="drawer-backdrop" onClick={() => setDrawer(false)} /> : null}
      <div className="shop">
        <aside className={`filters ${drawer ? "open" : ""}`}>{filterBody}</aside>
        <div className="shop-main">
          <div className="section-head" style={{ marginTop: 0 }}>
            <h2>
              {t("shop")} {total > 0 ? `(${total})` : ""}
            </h2>
            <label style={{ fontSize: 14 }}>
              {t("sortBy")}{" "}
              <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 8 }}>
                <option value="newest">{t("newest")}</option>
                <option value="price_asc">{t("priceLowHigh")}</option>
                <option value="price_desc">{t("priceHighLow")}</option>
                <option value="rating">{t("bestRated")}</option>
                <option value="popular">{t("popular")}</option>
              </select>
            </label>
          </div>
          {loading ? (
            <p>{t("loading")}</p>
          ) : products.length === 0 ? (
            <p>{t("noProducts")}</p>
          ) : (
            <div className="grid">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


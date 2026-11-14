import { Link } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { api, getSessionUser, imgUrl, pkr, type Product } from "../lib/api";
import { t, useLang } from "../lib/i18n";

interface FieldDef {
  id: number;
  label: string;
  fieldType: string;
  options: string[];
  required: boolean;
}

interface Review {
  id: number;
  rating: number;
  text: string;
  customerName: string;
  helpfulCount: number;
  createdAt: string;
}

export default function ProductPage() {
  const { id } = useParams();
  useLang();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [wishlisted, setWishlisted] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    api<{
      ok: boolean;
      product: Product;
      fieldDefs: FieldDef[];
      reviews: Review[];
      related: Product[];
    }>(`/api/products/${id}`)
      .then((d) => {
        setProduct(d.product);
        setFields(d.fieldDefs);
        setReviews(d.reviews);
        setRelated(d.related);
      })
      .catch(() => setError("Product not found."));
  }, [id]);

  useEffect(() => {
    if (!getSessionUser() || !product) return;
    api<{ ok: boolean; items: { product: Product }[] }>("/api/wishlist")
      .then((d) => setWishlisted(d.items.some((i) => i.product.id === product.id)))
      .catch(() => undefined);
  }, [product]);

  if (error) return <div className="container" style={{ padding: 40 }}>{error}</div>;
  if (!product) return <div className="container" style={{ padding: 40 }}>{t("loading")}</div>;

  const cover = product.imageUrls[0];
  const unavailable = product.stockStatus !== "available";
  const user = getSessionUser();

  const addToCart = async (goCheckout: boolean) => {
    if (!user) {
      navigate(`/auth/login?next=${goCheckout ? "/checkout" : "/cart"}`);
      return;
    }
    try {
      await api("/api/cart/add", { method: "POST", body: JSON.stringify({ productId: product.id, qty }) });
      window.dispatchEvent(new Event("mega-mart-cart"));
      navigate(goCheckout ? "/checkout" : "/cart");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not add to cart.");
    }
  };

  return (
    <div className="container">
      <div className="product-page">
        <div>
          {cover ? (
            <img className="main" src={imgUrl(cover)} alt={product.title} />
          ) : (
            <div className="main" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
              No image
            </div>
          )}
          <div className="chips">
            {product.imageUrls.slice(1).map((u, i) => (
              <img key={i} src={imgUrl(u)} alt="" width={72} height={54} style={{ objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }} />
            ))}
          </div>
        </div>
        <div>
          <span className="cat">{product.categoryName ?? product.type}</span>
          <h1 style={{ margin: "6px 0" }}>{product.title}</h1>
          <span className="stars">
            {"★".repeat(Math.round(product.ratingAvg))}
            {"☆".repeat(5 - Math.round(product.ratingAvg))} <small>({product.ratingCount} {t("reviews")})</small>
          </span>
          <div style={{ margin: "12px 0" }}>
            <span className="price" style={{ fontSize: 26 }}>{pkr(product.pricePkr)}</span>
            {product.compareAtPkr ? <span className="compare" style={{ fontSize: 16 }}>{pkr(product.compareAtPkr)}</span> : null}
          </div>
          <p>
            {unavailable ? (
              <span className="badge red">{product.stockStatus === "sold" ? t("sold") : t("outOfStock")}</span>
            ) : (
              <span className="badge green">{t("inStock")}</span>
            )}
            {product.isUnique ? <span className="badge orange" style={{ marginInlineStart: 6 }}>Unique account — sold once only</span> : null}
          </p>
          <p>{product.description}</p>
          <h3>{t("specifications")}</h3>
          <table className="spec-table">
            <tbody>
              {Object.entries(product.specs).map(([k, v]) => (
                <tr key={k}>
                  <td>{k}</td>
                  <td>{v}</td>
                </tr>
              ))}
              {Object.entries(product.customValues).map(([k, v]) => (
                <tr key={k}>
                  <td>{k}</td>
                  <td>{v}</td>
                </tr>
              ))}
              <tr>
                <td>{t("delivery")}</td>
                <td>{t("deliveryNote")}</td>
              </tr>
            </tbody>
          </table>
          {fields.length > 0 && product.type === "account" ? (
            <>
              <h3>Account details included</h3>
              <p className="muted">{fields.map((f) => f.label).join(" • ")}</p>
            </>
          ) : null}
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 16, flexWrap: "wrap" }}>
            <label>
              {t("quantity")}{" "}
              <input
                type="number"
                min={1}
                max={10}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                style={{ width: 64, padding: "9px 10px", border: "1px solid #e5e7eb", borderRadius: 8 }}
              />
            </label>
            <button className="btn ghost" onClick={() => addToCart(false)} disabled={unavailable}>
              {t("addToCart")}
            </button>
            <button className="btn" onClick={() => addToCart(true)} disabled={unavailable}>
              {t("buyNow")}
            </button>
            {user ? (
              <button
                className="btn secondary"
                onClick={async () => {
                  try {
                    const d = await api<{ ok: boolean; wishlisted: boolean }>("/api/wishlist/toggle", {
                      method: "POST",
                      body: JSON.stringify({ productId: product.id }),
                    });
                    setWishlisted(d.wishlisted);
                  } catch (e) {
                    alert(e instanceof Error ? e.message : "Could not update wishlist.");
                  }
                }}
              >
                {wishlisted ? "♥ " : "♡ "}{t("wishlist")}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <section className="section">
        <h2>{t("customerReviews")}</h2>
        {reviews.length === 0 ? <p className="muted">No reviews yet.</p> : null}
        {reviews.map((r) => (
          <div key={r.id} className="order-card">
            <span className="stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>{" "}
            <span className="badge green">{t("verifiedBuyer")}</span>
            <p style={{ margin: "8px 0" }}>{r.text}</p>
            <small className="muted">
              {r.customerName} • {new Date(r.createdAt).toLocaleDateString()} • {r.helpfulCount} {t("helpful")}
            </small>
          </div>
        ))}
        {user ? (
          <form
            className="form-card"
            style={{ marginTop: 16 }}
            onSubmit={async (e) => {
              e.preventDefault();
              setReviewMsg("");
              try {
                await api(`/api/products/${product.id}/reviews`, {
                  method: "POST",
                  body: JSON.stringify({ rating, text: reviewText }),
                });
                setReviewMsg(t("reviewPending"));
                setReviewText("");
              } catch (err) {
                setReviewMsg(err instanceof Error ? err.message : "Could not submit the review.");
              }
            }}
          >
            <h3 style={{ marginTop: 0 }}>{t("writeReview")}</h3>
            <div className="field">
              <label>{t("yourRating")}</label>
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} ★
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>{t("yourReview")}</label>
              <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
            </div>
            {reviewMsg ? <p className="success">{reviewMsg}</p> : null}
            <button className="btn" type="submit">
              {t("submitReview")}
            </button>
          </form>
        ) : (
          <p className="muted">
            <Link to="/auth/login" style={{ color: "#c2410c", fontWeight: 600 }}>
              {t("login")}
            </Link>{" "}
            to write a review.
          </p>
        )}
      </section>

      {related.length > 0 ? (
        <section className="section">
          <div className="section-head">
            <h2>Related products</h2>
          </div>
          <div className="grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { api, getSessionUser, imgUrl, pkr, type Product } from "../lib/api";
import { t } from "../lib/i18n";

function Stars({ avg, count }: { avg: number; count: number }) {
  const full = Math.round(avg);
  return (
    <span className="stars">
      {"★".repeat(full)}
      {"☆".repeat(Math.max(0, 5 - full))} <small>({count})</small>
    </span>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const cover = product.imageUrls[0];
  const off =
    product.compareAtPkr && product.compareAtPkr > product.pricePkr
      ? Math.round(((product.compareAtPkr - product.pricePkr) / product.compareAtPkr) * 100)
      : 0;

  const addToCart = async () => {
    if (!getSessionUser()) {
      navigate("/auth/login?next=/cart");
      return;
    }
    try {
      await api("/api/cart/add", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, qty: 1 }),
      });
      window.dispatchEvent(new Event("mega-mart-cart"));
      navigate("/cart");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not add to cart.");
    }
  };

  const buyNow = async () => {
    if (!getSessionUser()) {
      navigate("/auth/login?next=/checkout");
      return;
    }
    try {
      await api("/api/cart/add", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, qty: 1 }),
      });
      window.dispatchEvent(new Event("mega-mart-cart"));
      navigate("/checkout");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not start checkout.");
    }
  };

  const unavailable = product.stockStatus !== "available";

  return (
    <article className="card">
      <Link to={`/product/${product.id}`}>
        {cover ? (
          <img className="cover" src={imgUrl(cover)} alt={product.title} loading="lazy" />
        ) : (
          <div className="cover" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 13 }}>
            No image
          </div>
        )}
      </Link>
      <div className="card-body">
        <span className="cat">{product.categoryName ?? product.type}</span>
        <h3>
          <Link to={`/product/${product.id}`}>{product.title}</Link>
        </h3>
        <Stars avg={product.ratingAvg} count={product.ratingCount} />
        <div>
          <span className="price">{pkr(product.pricePkr)}</span>
          {product.compareAtPkr ? <span className="compare">{pkr(product.compareAtPkr)}</span> : null}
          {off > 0 ? <span className="off">-{off}%</span> : null}
        </div>
        <div>
          {unavailable ? (
            <span className="badge red">{product.stockStatus === "sold" ? t("sold") : t("outOfStock")}</span>
          ) : (
            <span className="badge green">{t("inStock")}</span>
          )}
          {product.isUnique ? <span className="badge orange" style={{ marginInlineStart: 6 }}>Unique account</span> : null}
        </div>
        <div className="card-actions">
          <button className="btn ghost" onClick={addToCart} disabled={unavailable}>
            {t("addToCart")}
          </button>
          <button className="btn" onClick={buyNow} disabled={unavailable}>
            {t("buyNow")}
          </button>
        </div>
      </div>
    </article>
  );
}

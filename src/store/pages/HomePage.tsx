import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { api, imgUrl, type Product, type StoreSettings } from "../lib/api";
import { t, useLang } from "../lib/i18n";

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  imageKey: string | null;
  link: string;
}

interface HomeReview {
  id: number;
  rating: number;
  text: string;
  productTitle: string;
  customerName: string;
}

interface Storefront {
  settings: StoreSettings;
  banners: Banner[];
  sections: {
    featured: Product[];
    accounts: Product[];
    latest: Product[];
    bestSelling: Product[];
    offers: Product[];
    newArrivals: Product[];
  };
  reviews: HomeReview[];
}

function Section({ title, products, href }: { title: string; products: Product[]; href: string }) {
  if (products.length === 0) return null;
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h2>{title}</h2>
          <Link to={href}>{t("viewAll")} →</Link>
        </div>
        <div className="grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  useLang();
  const [data, setData] = useState<Storefront | null>(null);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    api<Storefront & { ok: boolean }>("/api/storefront")
      .then(setData)
      .catch(() => setError("The store could not be loaded. Please check your connection and try again."));
  }, []);

  if (error) {
    return (
      <div className="container" style={{ padding: "60px 16px", textAlign: "center" }}>
        <h1>The store could not be loaded</h1>
        <p className="muted">{error}</p>
        <button className="btn" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="container" style={{ padding: "60px 16px" }}>
        {t("loading")}
      </div>
    );
  }

  const s = data.settings;
  const hero = data.banners[0];

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <h1>{hero?.title || s.siteName}</h1>
          <p>{hero?.subtitle || s.tagline}</p>
          <Link className="btn" to="/shop">
            {t("shop")} →
          </Link>
        </div>
      </section>

      {s.storeNotice ? (
        <div className="container">
          <div className="notice">{s.storeNotice}</div>
        </div>
      ) : null}

      {s.showFeatured ? <Section title={t("featuredGames")} products={data.sections.featured} href="/shop?sort=popular" /> : null}
      {s.showAccounts ? <Section title={t("popularAccounts")} products={data.sections.accounts} href="/shop?type=account" /> : null}
      {s.showLatest ? <Section title={t("latestProducts")} products={data.sections.latest} href="/shop?sort=newest" /> : null}
      {s.showBestSelling ? <Section title={t("bestSelling")} products={data.sections.bestSelling} href="/shop?sort=popular" /> : null}
      {s.showOffers ? <Section title={t("specialOffers")} products={data.sections.offers} href="/shop?sort=price_asc" /> : null}
      {s.showNewArrivals ? <Section title={t("newArrivals")} products={data.sections.newArrivals} href="/shop?sort=newest" /> : null}

      {s.showReviews && data.reviews.length > 0 ? (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2>{t("customerReviews")}</h2>
            </div>
            <div className="grid">
              {data.reviews.map((r) => (
                <div key={r.id} className="card" style={{ padding: 14 }}>
                  <span className="stars">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </span>
                  <p style={{ margin: "8px 0" }}>{r.text}</p>
                  <small className="muted">
                    {r.customerName} — {r.productTitle}
                  </small>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {s.showNewsletter ? (
        <section className="section">
          <div className="container">
            <div className="form-card" style={{ maxWidth: 640 }}>
              <h2 style={{ marginTop: 0 }}>{t("newsletter")}</h2>
              {subscribed ? (
                <p className="success">Subscribed. Thank you!</p>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await api("/api/newsletter", { method: "POST", body: JSON.stringify({ email }) });
                      setSubscribed(true);
                    } catch (err) {
                      alert(err instanceof Error ? err.message : "Could not subscribe.");
                    }
                  }}
                  style={{ display: "flex", gap: 8 }}
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("email")}
                    style={{ flex: 1, padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8 }}
                  />
                  <button className="btn" type="submit">
                    {t("subscribe")}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      ) : null}

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <h4>
              ALIZAIN <span style={{ color: "#fb923c" }}>MEGA MART</span>
            </h4>
            <p style={{ margin: 0 }}>{s.tagline}</p>
            <p style={{ margin: "8px 0 0" }}>© {new Date().getFullYear()} ALIZAIN MEGA MART. {t("allRights")}</p>
          </div>
          <div>
            <h4>{t("shop")}</h4>
            <Link to="/shop?category=Android%20Games">Android Games</Link>
            <Link to="/shop?category=iPhone%20Games">iPhone Games</Link>
            <Link to="/shop?type=account">{t("accounts")}</Link>
          </div>
          <div>
            <h4>{t("myAccount")}</h4>
            <Link to="/account">{t("myProfile")}</Link>
            <Link to="/account/orders">{t("myOrders")}</Link>
            <Link to="/account/wishlist">{t("wishlist")}</Link>
          </div>
          <div>
            <h4>{t("support")}</h4>
            {s.whatsappNumber ? (
              <a href={`https://wa.me/${s.whatsappNumber.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer">
                WhatsApp: {s.whatsappNumber}
              </a>
            ) : (
              <span className="muted">WhatsApp support number is set by the store owner — please contact store support.</span>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}

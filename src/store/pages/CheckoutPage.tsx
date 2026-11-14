import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, getSessionUser, idempotencyKey, pkr, type Order, type Product, type StoreSettings } from "../lib/api";
import { t, useLang } from "../lib/i18n";

interface CartItem {
  id: number;
  qty: number;
  product: Product;
}

export default function CheckoutPage() {
  useLang();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getSessionUser()) {
      navigate("/auth/login?next=/checkout");
      return;
    }
    Promise.all([
      api<{ ok: boolean; items: CartItem[] }>("/api/cart"),
      api<{ ok: boolean; settings: StoreSettings }>("/api/storefront"),
    ])
      .then(([c, s]) => {
        setItems(c.items);
        setSettings(s.settings);
      })
      .catch(() => setError("Could not load the checkout."))
      .finally(() => setLoading(false));
  }, [navigate]);

  const subtotal = items.reduce((s, i) => s + i.product.pricePkr * i.qty, 0);
  const total = subtotal - discount;

  const placeOrder = async () => {
    setError("");
    setPlacing(true);
    try {
      const d = await api<{ ok: boolean; order: Order }>(`/api/orders`, {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey() },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.product.id, qty: i.qty })),
          couponCode: coupon || undefined,
        }),
      });
      window.dispatchEvent(new Event("mega-mart-cart"));
      setOrder(d.order);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not place the order.");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: 40 }}>{t("loading")}</div>;

  if (order) {
    return (
      <div className="container" style={{ padding: "24px 16px 40px" }}>
        <h1>{t("orderPlaced")}</h1>
        <p className="success">Order #{order.id} — {t("total")}: {pkr(order.totalPkr)}</p>
        <div className="form-card">
          <h2 style={{ marginTop: 0 }}>{t("payWithJazzCash")}</h2>
          <p className="muted">{settings?.jazzcashNote}</p>
          <table className="spec-table">
            <tbody>
              <tr>
                <td>{t("jazzcashNumber")}</td>
                <td><strong>{settings?.jazzcashNumber || "Not set yet — please contact store support."}</strong></td>
              </tr>
              <tr>
                <td>{t("jazzcashHolder")}</td>
                <td>{settings?.jazzcashHolder || "—"}</td>
              </tr>
              <tr>
                <td>{t("amount")}</td>
                <td><strong>{pkr(order.totalPkr)}</strong></td>
              </tr>
            </tbody>
          </table>
          <p className="muted">
            After paying, submit your Transaction ID and payment screenshot from your order page. Our team verifies
            every payment by hand — an order is never marked paid automatically.
          </p>
          <Link className="btn" to={`/account/orders/${order.id}`}>
            {t("orderDetails")} →
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: 40 }}>
        <p>{t("emptyCart")}</p>
        <Link className="btn" to="/shop">{t("continueShopping")}</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "24px 16px 40px" }}>
      <h1>{t("checkout")}</h1>
      {error ? <p className="error">{error}</p> : null}
      <table className="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>{t("quantity")}</th>
            <th>{t("total")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td>{i.product.title}</td>
              <td>{i.qty}</td>
              <td>{pkr(i.product.pricePkr * i.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        <input
          value={coupon}
          onChange={(e) => setCoupon(e.target.value.toUpperCase())}
          placeholder={t("coupon")}
          style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8 }}
        />
        <button
          className="btn ghost"
          onClick={() => {
            // Coupon is validated by the backend when the order is placed.
            setCouponMsg("Coupon will be checked when you place the order.");
            setDiscount(0);
          }}
        >
          {t("apply")}
        </button>
      </div>
      {couponMsg ? <p className="muted">{couponMsg}</p> : null}
      <div style={{ marginTop: 18, fontSize: 17 }}>
        <div>{t("subtotal")}: {pkr(subtotal)}</div>
        {discount > 0 ? <div>{t("discount")}: −{pkr(discount)}</div> : null}
        <div style={{ fontWeight: 800, fontSize: 21, marginTop: 6 }}>{t("total")}: {pkr(total)}</div>
      </div>
      <button className="btn" style={{ marginTop: 18 }} onClick={placeOrder} disabled={placing}>
        {placing ? t("loading") : t("placeOrder")}
      </button>
    </div>
  );
}

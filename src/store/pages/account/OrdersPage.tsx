import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, pkr, type Order } from "../../lib/api";
import { t, useLang } from "../../lib/i18n";

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "pendingPayment",
  payment_under_review: "paymentUnderReview",
  payment_approved: "paymentApproved",
  payment_rejected: "paymentRejected",
  processing: "processing",
  delivered: "delivered",
  cancelled: "cancelled",
};

export default function OrdersPage() {
  useLang();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ ok: boolean; orders: Order[] }>("/api/orders")
      .then((d) => setOrders(d.orders))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>{t("loading")}</div>;

  return (
    <div>
      <h1>{t("myOrders")}</h1>
      {orders.length === 0 ? <p className="muted">You have no orders yet.</p> : null}
      {orders.map((o) => (
        <div key={o.id} className="order-card">
          <h3>
            <Link to={`/account/orders/${o.id}`} style={{ color: "#c2410c" }}>
              Order #{o.id}
            </Link>{" "}
            <span className="badge orange">{t(STATUS_LABEL[o.status] ?? o.status)}</span>
          </h3>
          <p className="muted">
            {new Date(o.createdAt).toLocaleString()} • {o.items.length} {t("items")} • {t("total")}: {pkr(o.totalPkr)}
          </p>
          <p style={{ margin: "6px 0 0" }}>{o.items.map((i) => i.title).join(", ")}</p>
          <Link to={`/account/orders/${o.id}`} className="btn ghost small" style={{ marginTop: 10 }}>
            {t("orderDetails")} →
          </Link>
        </div>
      ))}
    </div>
  );
}

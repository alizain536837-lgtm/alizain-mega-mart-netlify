import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, apiForm, imgUrl, pkr, type Order, type StoreSettings } from "../../lib/api";
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

export default function OrderDetailPage() {
  const { id } = useParams();
  useLang();
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [error, setError] = useState("");
  const [tid, setTid] = useState("");
  const [shot, setShot] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const [o, s] = await Promise.all([
        api<{ ok: boolean; order: Order }>(`/api/orders/${id}`),
        api<{ ok: boolean; settings: StoreSettings }>("/api/storefront"),
      ]);
      setOrder(o.order);
      setSettings(s.settings);
    } catch {
      setError("Order not found.");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (error) return <div>{error}</div>;
  if (!order) return <div>{t("loading")}</div>;

  const canPay = order.status === "pending_payment";
  const canCancel = order.status === "pending_payment" || order.status === "payment_rejected";

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setBusy(true);
    try {
      const form = new FormData();
      form.append("transactionId", tid);
      form.append("amount", String(order.totalPkr));
      if (shot) form.append("screenshot", shot);
      await apiForm(`/api/orders/${order.id}/payment`, form);
      setMsg(t("paymentSubmitted"));
      setTid("");
      setShot(null);
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Payment submission failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1>
        Order #{order.id}{" "}
        <span className="badge orange">{t(STATUS_LABEL[order.status] ?? order.status)}</span>
      </h1>
      <p className="muted">
        {new Date(order.createdAt).toLocaleString()} • {t("total")}: {pkr(order.totalPkr)}
      </p>

      <table className="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>{t("quantity")}</th>
            <th>{t("price")}</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((i) => (
            <tr key={i.id}>
              <td>{i.title}</td>
              <td>{i.qty}</td>
              <td>{pkr(i.pricePkr * i.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        {t("subtotal")}: {pkr(order.subtotalPkr)}
        {order.discountPkr > 0 ? <> • {t("discount")}: −{pkr(order.discountPkr)}</> : null}
        {order.couponCode ? <> • {t("coupon")}: {order.couponCode}</> : null}
      </p>

      {order.deliveryDetails ? (
        <div className="form-card">
          <h2 style={{ marginTop: 0 }}>{t("deliveryDetails")}</h2>
          <p style={{ whiteSpace: "pre-wrap" }}>{order.deliveryDetails}</p>
          {order.deliveredAt ? <p className="muted">Delivered: {new Date(order.deliveredAt).toLocaleString()}</p> : null}
        </div>
      ) : null}

      {order.payments.length > 0 ? (
        <div className="form-card" style={{ marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>{t("paymentHistory")}</h2>
          {order.payments.map((p) => (
            <div key={p.id} style={{ borderBottom: "1px solid #e5e7eb", padding: "8px 0" }}>
              <div>
                TID: <strong>{p.transactionId}</strong> • {pkr(p.amountPkr)} •{" "}
                <span className="badge orange">{p.status}</span>
              </div>
              {p.screenshotKey ? (
                <img src={imgUrl(p.screenshotKey)} alt="Payment screenshot" width={160} style={{ marginTop: 8, borderRadius: 8 }} />
              ) : null}
              {p.rejectionReason ? <p style={{ color: "#dc2626" }}>Reason: {p.rejectionReason}</p> : null}
            </div>
          ))}
        </div>
      ) : null}

      {canPay ? (
        <form className="form-card" style={{ marginTop: 16 }} onSubmit={submitPayment}>
          <h2 style={{ marginTop: 0 }}>{t("payWithJazzCash")}</h2>
          <p className="muted">{settings?.jazzcashNote}</p>
          <table className="spec-table">
            <tbody>
              <tr>
                <td>{t("jazzcashNumber")}</td>
                <td><strong>{settings?.jazzcashNumber || "Not set yet"}</strong></td>
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
          <div className="field">
            <label>{t("transactionId")}</label>
            <input required value={tid} onChange={(e) => setTid(e.target.value)} placeholder="e.g. 1234567890" />
          </div>
          <div className="field">
            <label>{t("paymentScreenshot")}</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setShot(e.target.files?.[0] ?? null)} />
          </div>
          {msg ? <p className="success">{msg}</p> : null}
          <button className="btn" type="submit" disabled={busy}>
            {t("submitPayment")}
          </button>
        </form>
      ) : null}

      {canCancel ? (
        <button
          className="btn ghost"
          style={{ marginTop: 16 }}
          onClick={async () => {
            if (!confirm("Cancel this order?")) return;
            await api(`/api/orders/${order.id}/cancel`, { method: "POST" });
            await load();
          }}
        >
          {t("cancel")}
        </button>
      ) : null}
    </div>
  );
}

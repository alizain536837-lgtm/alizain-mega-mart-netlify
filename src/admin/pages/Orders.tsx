import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminShell from "../components/AdminShell";
import { api, pkr } from "../lib/api";

interface AdminOrder {
  id: number;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subtotalPkr: number;
  discountPkr: number;
  totalPkr: number;
  couponCode: string | null;
  deliveryDetails: string | null;
  deliveredAt: string | null;
  createdAt: string;
  items: { id: number; title: string; pricePkr: number; qty: number }[];
  payments: { id: number; transactionId: string; amountPkr: number; status: string; rejectionReason: string | null }[];
}

const STATUSES = [
  "pending_payment",
  "payment_under_review",
  "payment_approved",
  "payment_rejected",
  "processing",
  "delivered",
  "cancelled",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const d = await api<{ ok: boolean; orders: AdminOrder[] }>(
        `/api/admin/orders?status=${status}&q=${encodeURIComponent(q)}&pageSize=100`,
      );
      setOrders(d.orders);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load orders.");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const setOrderStatus = async (id: number, s: string) => {
    try {
      await api(`/api/admin/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: s }) });
      setMsg(`Order #${id} → ${s}`);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not update the order.");
    }
  };

  return (
    <AdminShell>
      <h1>Orders Management</h1>
      {msg ? <p className="success">{msg}</p> : null}
      {err ? <p className="error">{err}</p> : null}
      <div className="row" style={{ marginBottom: 14 }}>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: "9px 11px", border: "1px solid #e5e7eb", borderRadius: 8 }}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
          ))}
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Search by order #, name or email..."
          style={{ flex: 1, minWidth: 200, padding: "9px 11px", border: "1px solid #e5e7eb", borderRadius: 8 }}
        />
        <button className="btn ghost" onClick={load}>Search</button>
      </div>

      {orders.length === 0 ? <p className="muted">No orders yet.</p> : null}
      {orders.map((o) => (
        <div key={o.id} className="card">
          <h3 style={{ margin: "0 0 4px" }}>
            Order #{o.id} <span className="badge orange">{o.status.replaceAll("_", " ")}</span>
          </h3>
          <p className="muted" style={{ margin: "0 0 8px" }}>
            {o.customerName} • {o.customerEmail} • {o.customerPhone} • {new Date(o.createdAt).toLocaleString()}
          </p>
          <table className="table">
            <tbody>
              {o.items.map((i) => (
                <tr key={i.id}>
                  <td>{i.title}</td>
                  <td>×{i.qty}</td>
                  <td>{pkr(i.pricePkr * i.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            Subtotal {pkr(o.subtotalPkr)}
            {o.discountPkr > 0 ? <> • Discount −{pkr(o.discountPkr)}</> : null}
            {o.couponCode ? <> • Coupon {o.couponCode}</> : null} • <strong>Total {pkr(o.totalPkr)}</strong>
          </p>
          {o.payments.map((p) => (
            <p key={p.id} style={{ margin: "4px 0" }}>
              Payment: TID <strong>{p.transactionId}</strong> • {pkr(p.amountPkr)} •{" "}
              <span className="badge grey">{p.status}</span>
              {p.rejectionReason ? <span style={{ color: "#dc2626" }}> — {p.rejectionReason}</span> : null}
            </p>
          ))}
          {o.deliveryDetails ? (
            <p style={{ whiteSpace: "pre-wrap", background: "#f0fdf4", borderRadius: 8, padding: 10 }}>
              <strong>Delivery details:</strong> {o.deliveryDetails}
            </p>
          ) : null}
          <div className="row">
            <label style={{ fontSize: 13 }}>Change status:</label>
            <select
              value={o.status}
              onChange={(e) => setOrderStatus(o.id, e.target.value)}
              style={{ padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 8 }}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
              ))}
            </select>
            {(o.status === "payment_approved" || o.status === "processing") ? (
              <Link className="btn small" to="/admin/delivery">Deliver →</Link>
            ) : null}
            <a
              className="btn ghost small"
              href={`https://wa.me/${o.customerPhone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp Customer
            </a>
          </div>
        </div>
      ))}
    </AdminShell>
  );
}

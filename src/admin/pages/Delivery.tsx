import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { api, pkr } from "../lib/api";

interface DeliverableOrder {
  id: number;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalPkr: number;
  createdAt: string;
  items: { id: number; title: string; pricePkr: number; qty: number }[];
}

export default function DeliveryPage() {
  const [orders, setOrders] = useState<DeliverableOrder[]>([]);
  const [details, setDetails] = useState<Record<number, string>>({});
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const d = await api<{ ok: boolean; orders: DeliverableOrder[] }>(
        "/api/admin/orders?status=payment_approved&pageSize=100",
      );
      setOrders(d.orders);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load orders.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const deliver = async (id: number) => {
    const text = (details[id] ?? "").trim();
    if (!text) {
      setErr("Please enter the delivery details first (game key, account login, download link, etc.).");
      return;
    }
    setErr("");
    try {
      await api(`/api/admin/orders/${id}/deliver`, { method: "POST", body: JSON.stringify({ deliveryDetails: text }) });
      setMsg(`Order #${id} delivered. The customer can now see the delivery details in My Orders.`);
      setDetails((d) => ({ ...d, [id]: "" }));
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not deliver the order.");
    }
  };

  return (
    <AdminShell>
      <h1>Manual Delivery</h1>
      <p className="muted">
        Only payment-approved orders appear here. Enter the delivery details (game key, account credentials, or
        download link) — only the customer who placed the order and authorized Admin/Staff can see them.
      </p>
      {msg ? <p className="success">{msg}</p> : null}
      {err ? <p className="error">{err}</p> : null}
      {orders.length === 0 ? <p className="muted">No payment-approved orders waiting for delivery.</p> : null}
      {orders.map((o) => (
        <div key={o.id} className="card">
          <h3 style={{ margin: "0 0 4px" }}>
            Order #{o.id} — {o.customerName} ({o.customerEmail})
          </h3>
          <p className="muted" style={{ margin: "0 0 8px" }}>
            {new Date(o.createdAt).toLocaleString()} • Total {pkr(o.totalPkr)} • {o.items.map((i) => i.title).join(", ")}
          </p>
          <div className="field">
            <label>Delivery details (shown only to this customer)</label>
            <textarea
              value={details[o.id] ?? ""}
              onChange={(e) => setDetails((d) => ({ ...d, [o.id]: e.target.value }))}
              placeholder={"Example:\nGame key: XXXX-XXXX-XXXX\nAccount email: ...\nPassword: ...\nInstructions: ..."}
            />
          </div>
          <div className="row">
            <button className="btn" onClick={() => deliver(o.id)}>
              Deliver Order
            </button>
            <a
              className="btn ghost"
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

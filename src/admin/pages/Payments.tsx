import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { api, imgUrl, pkr } from "../lib/api";

interface PaymentRow {
  id: number;
  orderId: number;
  orderStatus: string;
  orderTotalPkr: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  transactionId: string;
  amountPkr: number;
  screenshotKey: string | null;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
}

export default function PaymentsPage() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [status, setStatus] = useState("under_review");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const d = await api<{ ok: boolean; payments: PaymentRow[] }>(`/api/admin/payments?status=${status}`);
      setRows(d.payments);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load payments.");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const verify = async (id: number, decision: "approved" | "rejected") => {
    if (decision === "rejected" && !reason.trim()) {
      setErr("Please enter a rejection reason first.");
      return;
    }
    setErr("");
    try {
      await api(`/api/admin/payments/${id}/verify`, {
        method: "POST",
        body: JSON.stringify({ decision, reason }),
      });
      setMsg(`Payment #${id} ${decision}.`);
      setReason("");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not verify the payment.");
    }
  };

  return (
    <AdminShell>
      <h1>Payment Verification — JazzCash (Manual)</h1>
      <p className="muted">
        Every payment is verified by hand. A payment is <strong>never</strong> marked paid automatically from a
        screenshot. Check the Transaction ID and amount against your JazzCash account before approving.
      </p>
      {msg ? <p className="success">{msg}</p> : null}
      {err ? <p className="error">{err}</p> : null}
      <div className="row" style={{ marginBottom: 14 }}>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: "9px 11px", border: "1px solid #e5e7eb", borderRadius: 8 }}>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All</option>
        </select>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Rejection reason (required when rejecting)"
          style={{ flex: 1, minWidth: 220, padding: "9px 11px", border: "1px solid #e5e7eb", borderRadius: 8 }}
        />
      </div>

      {rows.length === 0 ? <p className="muted">No payments in this list.</p> : null}
      {rows.map((p) => (
        <div key={p.id} className="card">
          <h3 style={{ margin: "0 0 4px" }}>
            Order #{p.orderId} — TID <strong>{p.transactionId}</strong>{" "}
            <span className="badge orange">{p.status}</span>
          </h3>
          <p className="muted" style={{ margin: "0 0 8px" }}>
            {p.customerName} • {p.customerEmail} • {p.customerPhone} • {new Date(p.createdAt).toLocaleString()}
          </p>
          <p>
            Submitted amount: <strong>{pkr(p.amountPkr)}</strong> • Order total: <strong>{pkr(p.orderTotalPkr)}</strong>{" "}
            {p.amountPkr !== p.orderTotalPkr ? <span className="badge red">Amount mismatch!</span> : <span className="badge green">Amount matches</span>}
          </p>
          {p.screenshotKey ? (
            <img src={imgUrl(p.screenshotKey)} alt="Payment screenshot" width={320} style={{ borderRadius: 8, border: "1px solid #e5e7eb" }} />
          ) : (
            <p className="muted">No screenshot uploaded.</p>
          )}
          {p.rejectionReason ? <p style={{ color: "#dc2626" }}>Rejection reason: {p.rejectionReason}</p> : null}
          {p.status === "under_review" ? (
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn" onClick={() => verify(p.id, "approved")}>
                Approve Payment
              </button>
              <button className="btn danger" onClick={() => verify(p.id, "rejected")}>
                Reject Payment
              </button>
            </div>
          ) : null}
        </div>
      ))}
    </AdminShell>
  );
}

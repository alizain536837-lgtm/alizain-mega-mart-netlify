import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { api } from "../lib/api";

interface ReviewRow {
  id: number;
  productTitle: string;
  customerName: string;
  rating: number;
  text: string;
  status: string;
  helpfulCount: number;
  reportCount: number;
  createdAt: string;
}

export default function ReviewsPage() {
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [status, setStatus] = useState("pending");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const d = await api<{ ok: boolean; reviews: ReviewRow[] }>(`/api/admin/reviews?status=${status}`);
      setRows(d.reviews);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load reviews.");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const moderate = async (id: number, decision: "approved" | "rejected") => {
    try {
      await api(`/api/admin/reviews/${id}/moderate`, { method: "POST", body: JSON.stringify({ decision }) });
      setMsg(`Review #${id} ${decision}.`);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not moderate the review.");
    }
  };

  return (
    <AdminShell>
      <h1>Reviews Management</h1>
      <p className="muted">Only verified-purchase reviews reach this list. Approve them to publish, reject spam or abuse.</p>
      {msg ? <p className="success">{msg}</p> : null}
      {err ? <p className="error">{err}</p> : null}
      <div className="row" style={{ marginBottom: 14 }}>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: "9px 11px", border: "1px solid #e5e7eb", borderRadius: 8 }}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All</option>
        </select>
      </div>
      {rows.length === 0 ? <p className="muted">No reviews in this list.</p> : null}
      {rows.map((r) => (
        <div key={r.id} className="card">
          <p style={{ margin: "0 0 4px" }}>
            <strong>{r.productTitle}</strong> — {r.customerName} • {"★".repeat(r.rating)}
            {"☆".repeat(5 - r.rating)} • <span className="badge orange">{r.status}</span>
          </p>
          <p style={{ margin: "4px 0" }}>{r.text}</p>
          <p className="muted" style={{ margin: "4px 0 10px" }}>
            {new Date(r.createdAt).toLocaleString()} • {r.helpfulCount} helpful • {r.reportCount} reports
          </p>
          {r.status === "pending" ? (
            <div className="row">
              <button className="btn small" onClick={() => moderate(r.id, "approved")}>Approve</button>
              <button className="btn danger small" onClick={() => moderate(r.id, "rejected")}>Reject</button>
            </div>
          ) : null}
        </div>
      ))}
    </AdminShell>
  );
}

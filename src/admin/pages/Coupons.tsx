import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { api, pkr } from "../lib/api";

interface Coupon {
  id: number;
  code: string;
  kind: string;
  value: number;
  minOrderPkr: number;
  active: boolean;
  expiresAt: string | null;
}

export default function CouponsPage() {
  const [rows, setRows] = useState<Coupon[]>([]);
  const [code, setCode] = useState("");
  const [kind, setKind] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState(10);
  const [minOrder, setMinOrder] = useState(0);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const d = await api<{ ok: boolean; coupons: Coupon[] }>("/api/admin/coupons");
      setRows(d.coupons);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load coupons.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <AdminShell>
      <h1>Coupons &amp; Discounts</h1>
      {msg ? <p className="success">{msg}</p> : null}
      {err ? <p className="error">{err}</p> : null}
      <div className="card">
        <h2>Create Coupon</h2>
        <div className="row">
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CODE, e.g. MEGA10" style={{ padding: "9px 11px", border: "1px solid #e5e7eb", borderRadius: 8 }} />
          <select value={kind} onChange={(e) => setKind(e.target.value as "percent" | "fixed")} style={{ padding: "9px 11px", border: "1px solid #e5e7eb", borderRadius: 8 }}>
            <option value="percent">Percent %</option>
            <option value="fixed">Fixed Rs</option>
          </select>
          <input type="number" min={1} value={value} onChange={(e) => setValue(Number(e.target.value) || 0)} placeholder="Value" style={{ width: 110, padding: "9px 11px", border: "1px solid #e5e7eb", borderRadius: 8 }} />
          <input type="number" min={0} value={minOrder} onChange={(e) => setMinOrder(Number(e.target.value) || 0)} placeholder="Min order Rs" style={{ width: 140, padding: "9px 11px", border: "1px solid #e5e7eb", borderRadius: 8 }} />
          <button
            className="btn"
            onClick={async () => {
              setErr("");
              try {
                await api("/api/admin/coupons", { method: "POST", body: JSON.stringify({ code, kind, value, minOrderPkr: minOrder }) });
                setCode("");
                setMsg("Coupon created.");
                await load();
              } catch (e) {
                setErr(e instanceof Error ? e.message : "Could not create the coupon.");
              }
            }}
          >
            Create
          </button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Min Order</th>
              <th>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.code}</strong></td>
                <td>{c.kind}</td>
                <td>{c.kind === "percent" ? `${c.value}%` : pkr(c.value)}</td>
                <td>{pkr(c.minOrderPkr)}</td>
                <td>
                  <button
                    className="btn ghost small"
                    onClick={async () => {
                      await api(`/api/admin/coupons/${c.id}`, { method: "PATCH", body: JSON.stringify({ active: !c.active }) });
                      await load();
                    }}
                  >
                    {c.active ? "Active — click to disable" : "Disabled — click to enable"}
                  </button>
                </td>
                <td>
                  <button
                    className="btn danger small"
                    onClick={async () => {
                      if (!confirm(`Delete coupon ${c.code}?`)) return;
                      await api(`/api/admin/coupons/${c.id}`, { method: "DELETE" });
                      await load();
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 ? <p className="muted">No coupons yet.</p> : null}
    </AdminShell>
  );
}

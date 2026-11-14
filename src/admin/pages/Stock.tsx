import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { api, imgUrl, pkr } from "../lib/api";

interface StockProduct {
  id: number;
  title: string;
  type: string;
  categoryName: string;
  pricePkr: number;
  stockStatus: string;
  isUnique: boolean;
  imageUrls: string[];
  salesCount: number;
}

const STATUSES = ["available", "reserved", "sold", "out_of_stock"] as const;

export default function StockPage() {
  const [rows, setRows] = useState<StockProduct[]>([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const d = await api<{ ok: boolean; products: StockProduct[] }>("/api/admin/products?pageSize=100");
      setRows(d.products);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load stock.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const available = rows.filter((r) => r.stockStatus === "available").length;
  const reserved = rows.filter((r) => r.stockStatus === "reserved").length;
  const sold = rows.filter((r) => r.stockStatus === "sold").length;
  const out = rows.filter((r) => r.stockStatus === "out_of_stock").length;

  return (
    <AdminShell>
      <h1>Stock Management</h1>
      <p className="muted">
        Available: {available} • Reserved: {reserved} • Sold: {sold} • Out of Stock: {out}. Unique gaming accounts
        are marked Sold automatically when delivered, and can never be sold twice.
      </p>
      {msg ? <p className="success">{msg}</p> : null}
      {err ? <p className="error">{err}</p> : null}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Type</th>
              <th>Price</th>
              <th>Sold</th>
              <th>Stock Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td>
                  <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {p.imageUrls[0] ? <img src={imgUrl(p.imageUrls[0])} alt="" width={48} height={36} style={{ objectFit: "cover", borderRadius: 6 }} /> : null}
                    {p.title}
                    {p.isUnique ? <span className="badge orange">Unique</span> : null}
                  </span>
                </td>
                <td>{p.type}</td>
                <td>{pkr(p.pricePkr)}</td>
                <td>{p.salesCount}</td>
                <td>
                  <select
                    value={p.stockStatus}
                    onChange={async (e) => {
                      try {
                        await api(`/api/admin/products/${p.id}/stock`, {
                          method: "POST",
                          body: JSON.stringify({ stockStatus: e.target.value }),
                        });
                        setMsg(`"${p.title}" → ${e.target.value}`);
                        await load();
                      } catch (err2) {
                        setErr(err2 instanceof Error ? err2.message : "Could not update stock.");
                      }
                    }}
                    style={{ padding: "7px 9px", border: "1px solid #e5e7eb", borderRadius: 8 }}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

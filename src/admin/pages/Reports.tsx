import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { api, pkr } from "../lib/api";

interface Stats {
  totalSalesPkr: number;
  totalOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingPayments: number;
  pendingReviews: number;
  monthlySales: { month: string; totalPkr: number; orders: number }[];
  dailySales: { date: string; totalPkr: number; orders: number }[];
  bestSellers: { productId: number; title: string; quantity: number; revenuePkr: number }[];
}

export default function ReportsPage() {
  const [s, setS] = useState<Stats | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api<{ ok: boolean; stats: Stats }>("/api/admin/stats")
      .then((d) => setS(d.stats))
      .catch((e) => setErr(e instanceof Error ? e.message : "Could not load reports."));
  }, []);

  if (!s) return <AdminShell>{err ? <p className="error">{err}</p> : <p>Loading...</p>}</AdminShell>;

  return (
    <AdminShell>
      <h1>Sales Reports</h1>
      <p className="muted">All figures come from real orders in the database — no sample or demo data.</p>
      <div className="cards">
        <div className="stat"><strong>{pkr(s.totalSalesPkr)}</strong><span>Total Sales</span></div>
        <div className="stat"><strong>{s.deliveredOrders}</strong><span>Delivered Orders</span></div>
        <div className="stat"><strong>{s.totalOrders}</strong><span>Total Orders</span></div>
        <div className="stat"><strong>{s.totalCustomers}</strong><span>Customers</span></div>
      </div>

      <div className="card">
        <h2>Monthly Sales (last 12 months)</h2>
        <table className="table">
          <thead>
            <tr><th>Month</th><th>Orders</th><th>Sales</th></tr>
          </thead>
          <tbody>
            {s.monthlySales.map((m) => (
              <tr key={m.month}>
                <td>{m.month}</td>
                <td>{m.orders}</td>
                <td>{pkr(m.totalPkr)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {s.monthlySales.length === 0 ? <p className="muted">No sales in the last 12 months yet.</p> : null}
      </div>

      <div className="card">
        <h2>Daily Sales (last 30 days)</h2>
        <table className="table">
          <thead>
            <tr><th>Date</th><th>Orders</th><th>Sales</th></tr>
          </thead>
          <tbody>
            {s.dailySales.map((d) => (
              <tr key={d.date}>
                <td>{d.date}</td>
                <td>{d.orders}</td>
                <td>{pkr(d.totalPkr)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {s.dailySales.length === 0 ? <p className="muted">No sales in the last 30 days yet.</p> : null}
      </div>

      <div className="card">
        <h2>Best Selling Products</h2>
        <table className="table">
          <thead>
            <tr><th>Product</th><th>Units Sold</th><th>Revenue</th></tr>
          </thead>
          <tbody>
            {s.bestSellers.map((b) => (
              <tr key={b.productId}>
                <td>{b.title}</td>
                <td>{b.quantity}</td>
                <td>{pkr(b.revenuePkr)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {s.bestSellers.length === 0 ? <p className="muted">No delivered sales yet.</p> : null}
      </div>
    </AdminShell>
  );
}

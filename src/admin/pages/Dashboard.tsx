import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { api, pkr } from "../lib/api";

interface Stats {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalCustomers: number;
  totalProducts: number;
  availableAccounts: number;
  soldAccounts: number;
  pendingPayments: number;
  monthlySales: { label: string; total: number }[];
  dailySales: { label: string; total: number }[];
  bestSelling: { id: number; title: string; salesCount: number; pricePkr: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ ok: boolean; stats: Stats }>("/api/admin/stats")
      .then((d) => setStats(d.stats))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load the dashboard."));
  }, []);

  return (
    <AdminShell>
      <h1>Dashboard</h1>
      {error ? <p className="error">{error}</p> : null}
      {!stats ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat"><b>{pkr(stats.totalSales)}</b><span>Total Sales</span></div>
            <div className="stat"><b>{stats.totalOrders}</b><span>Total Orders</span></div>
            <div className="stat"><b>{stats.pendingOrders}</b><span>Pending Orders</span></div>
            <div className="stat"><b>{stats.completedOrders}</b><span>Completed Orders</span></div>
            <div className="stat"><b>{stats.totalCustomers}</b><span>Total Customers</span></div>
            <div className="stat"><b>{stats.totalProducts}</b><span>Total Products</span></div>
            <div className="stat"><b>{stats.availableAccounts}</b><span>Available Accounts</span></div>
            <div className="stat"><b>{stats.soldAccounts}</b><span>Sold Accounts</span></div>
            <div className="stat"><b>{stats.pendingPayments}</b><span>Pending Payments</span></div>
          </div>

          <div className="card">
            <h2>Monthly Sales</h2>
            {stats.monthlySales.length === 0 ? (
              <p className="muted">No delivered sales yet — figures appear here from real orders.</p>
            ) : (
              <table className="table">
                <thead><tr><th>Month</th><th>Sales</th></tr></thead>
                <tbody>
                  {stats.monthlySales.map((m) => (
                    <tr key={m.label}><td>{m.label}</td><td>{pkr(m.total)}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <h2>Daily Sales (last 14 days)</h2>
            {stats.dailySales.length === 0 ? (
              <p className="muted">No delivered sales in the last 14 days.</p>
            ) : (
              <table className="table">
                <thead><tr><th>Day</th><th>Sales</th></tr></thead>
                <tbody>
                  {stats.dailySales.map((m) => (
                    <tr key={m.label}><td>{m.label}</td><td>{pkr(m.total)}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <h2>Best Selling Products</h2>
            {stats.bestSelling.length === 0 ? (
              <p className="muted">Nothing sold yet.</p>
            ) : (
              <table className="table">
                <thead><tr><th>Product</th><th>Sold</th><th>Price</th></tr></thead>
                <tbody>
                  {stats.bestSelling.map((p) => (
                    <tr key={p.id}><td>{p.title}</td><td>{p.salesCount}</td><td>{pkr(p.pricePkr)}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="row">
            <Link className="btn" to="/admin/orders">View Orders →</Link>
            <Link className="btn secondary" to="/admin/payments">Verify Payments →</Link>
            <Link className="btn ghost" to="/admin/products">Manage Products →</Link>
          </div>
        </>
      )}
    </AdminShell>
  );
}

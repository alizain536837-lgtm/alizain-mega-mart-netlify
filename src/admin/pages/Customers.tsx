import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { api } from "../lib/api";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  status: string;
  orderCount: number;
  createdAt: string;
}

export default function CustomersPage() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const d = await api<{ ok: boolean; customers: Customer[] }>("/api/admin/customers");
      setRows(d.customers);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load customers.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <AdminShell>
      <h1>Customers Management</h1>
      {msg ? <p className="success">{msg}</p> : null}
      {err ? <p className="error">{err}</p> : null}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Verified</th>
              <th>Orders</th>
              <th>Status</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{c.emailVerified ? "Yes" : "No"}</td>
                <td>{c.orderCount}</td>
                <td>
                  <span className={`badge ${c.status === "active" ? "green" : "red"}`}>{c.status}</span>
                </td>
                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn ghost small"
                    onClick={async () => {
                      try {
                        await api(`/api/admin/customers/${c.id}/status`, {
                          method: "PATCH",
                          body: JSON.stringify({ status: c.status === "active" ? "suspended" : "active" }),
                        });
                        setMsg(`Customer ${c.name} ${c.status === "active" ? "suspended" : "reactivated"}.`);
                        await load();
                      } catch (e) {
                        setErr(e instanceof Error ? e.message : "Could not update the customer.");
                      }
                    }}
                  >
                    {c.status === "active" ? "Suspend" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 ? <p className="muted">No customers yet.</p> : null}
    </AdminShell>
  );
}

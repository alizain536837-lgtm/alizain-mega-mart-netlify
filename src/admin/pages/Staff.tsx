import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { ALL_PERMISSIONS, api, type AdminUser } from "../lib/api";

export default function StaffPage() {
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [perms, setPerms] = useState<string[]>(["view_orders"]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const d = await api<{ ok: boolean; staff: AdminUser[] }>("/api/admin/staff");
      setRows(d.staff);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load staff.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const togglePerm = (key: string) =>
    setPerms((p) => (p.includes(key) ? p.filter((x) => x !== key) : [...p, key]));

  return (
    <AdminShell>
      <h1>Staff Management</h1>
      <p className="muted">Super Admin only. Staff accounts get exactly the permissions you grant — nothing more.</p>
      {msg ? <p className="success">{msg}</p> : null}
      {err ? <p className="error">{err}</p> : null}

      <div className="card">
        <h2>Create Staff Account</h2>
        <div className="form-grid">
          <div className="field">
            <label>Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Phone Number</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="field">
            <label>Password (min 8 characters)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>Permissions</label>
          <div className="checks">
            {ALL_PERMISSIONS.map((p) => (
              <label key={p.key}>
                <input type="checkbox" checked={perms.includes(p.key)} onChange={() => togglePerm(p.key)} />
                {p.label}
              </label>
            ))}
          </div>
        </div>
        <button
          className="btn"
          onClick={async () => {
            setErr("");
            try {
              await api("/api/admin/staff", {
                method: "POST",
                body: JSON.stringify({ name, email, phone, password, permissions: perms }),
              });
              setName("");
              setEmail("");
              setPhone("");
              setPassword("");
              setMsg("Staff account created.");
              await load();
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Could not create the staff account.");
            }
          }}
        >
          Create Staff Account
        </button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Permissions</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === "super_admin" ? "orange" : "blue"}`}>{u.role}</span>
                </td>
                <td style={{ maxWidth: 320 }}>{u.role === "super_admin" ? "All permissions" : u.permissions.join(", ") || "None"}</td>
                <td>
                  {u.role === "staff" ? (
                    <button
                      className="btn danger small"
                      onClick={async () => {
                        if (!confirm(`Delete staff account ${u.email}?`)) return;
                        try {
                          await api(`/api/admin/staff/${u.id}`, { method: "DELETE" });
                          setMsg("Staff account deleted.");
                          await load();
                        } catch (e) {
                          setErr(e instanceof Error ? e.message : "Could not delete the staff account.");
                        }
                      }}
                    >
                      Delete
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

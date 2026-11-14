import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { ALL_PERMISSIONS, api, type AdminUser } from "../lib/api";

export default function PermissionsPage() {
  const [rows, setRows] = useState<AdminUser[]>([]);
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

  const toggle = async (u: AdminUser, key: string) => {
    const next = u.permissions.includes(key) ? u.permissions.filter((p) => p !== key) : [...u.permissions, key];
    try {
      await api(`/api/admin/staff/${u.id}`, { method: "PATCH", body: JSON.stringify({ permissions: next }) });
      setMsg(`Permissions updated for ${u.name}.`);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not update permissions.");
    }
  };

  return (
    <AdminShell>
      <h1>Admin Permissions</h1>
      <p className="muted">
        Super Admin only. The Super Admin has every permission and cannot be changed here. Staff permissions are
        toggled live.
      </p>
      {msg ? <p className="success">{msg}</p> : null}
      {err ? <p className="error">{err}</p> : null}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Staff</th>
              {ALL_PERMISSIONS.map((p) => (
                <th key={p.key} style={{ fontSize: 11 }}>{p.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td>
                  <strong>{u.name}</strong>
                  <div className="muted" style={{ fontSize: 12 }}>{u.email}</div>
                </td>
                {u.role === "super_admin" ? (
                  <td colSpan={ALL_PERMISSIONS.length} style={{ textAlign: "center" }}>
                    <span className="badge orange">Super Admin — all permissions</span>
                  </td>
                ) : (
                  ALL_PERMISSIONS.map((p) => (
                    <td key={p.key} style={{ textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={u.permissions.includes(p.key)}
                        onChange={() => toggle(u, p.key)}
                      />
                    </td>
                  ))
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

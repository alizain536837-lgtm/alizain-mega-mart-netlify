import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { api } from "../lib/api";

interface LogRow {
  id: number;
  actorType: string;
  actorName: string | null;
  action: string;
  details: string | null;
  createdAt: string;
}

export default function LogsPage() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    api<{ ok: boolean; logs: LogRow[] }>("/api/admin/logs")
      .then((d) => setRows(d.logs))
      .catch((e) => setErr(e instanceof Error ? e.message : "Could not load logs."));
  }, []);

  return (
    <AdminShell>
      <h1>Security &amp; Activity Logs</h1>
      <p className="muted">Every admin action and login is recorded here for accountability.</p>
      {err ? <p className="error">{err}</p> : null}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id}>
                <td>{new Date(l.createdAt).toLocaleString()}</td>
                <td>
                  {l.actorName || "—"} <span className="badge grey">{l.actorType}</span>
                </td>
                <td>{l.action}</td>
                <td style={{ maxWidth: 420 }}>{l.details || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 ? <p className="muted">No activity recorded yet.</p> : null}
    </AdminShell>
  );
}

import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { api } from "../lib/api";

export default function LanguagePage() {
  const [defaultLang, setDefaultLang] = useState("en");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    api<{ ok: boolean; settings: { defaultLanguage?: string } }>("/api/admin/settings")
      .then((d) => setDefaultLang(d.settings.defaultLanguage === "ur" ? "ur" : "en"))
      .catch((e) => setErr(e instanceof Error ? e.message : "Could not load settings."));
  }, []);

  return (
    <AdminShell>
      <h1>Language Settings</h1>
      {msg ? <p className="success">{msg}</p> : null}
      {err ? <p className="error">{err}</p> : null}
      <div className="card">
        <h2>Supported Languages</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Language</th>
              <th>Direction</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>English</td>
              <td>Left-to-Right</td>
              <td><span className="badge green">Enabled</span></td>
            </tr>
            <tr>
              <td>اردو (Urdu)</td>
              <td>Right-to-Left (RTL)</td>
              <td><span className="badge green">Enabled</span></td>
            </tr>
          </tbody>
        </table>
        <p className="muted">
          The store header has a language switcher. Urdu uses a full RTL layout with proper Urdu fonts, and each
          customer&apos;s choice is saved to their account.
        </p>
        <div className="field">
          <label>Default language for new visitors</label>
          <select value={defaultLang} onChange={(e) => setDefaultLang(e.target.value)} style={{ padding: "9px 11px", border: "1px solid #e5e7eb", borderRadius: 8 }}>
            <option value="en">English</option>
            <option value="ur">اردو (Urdu)</option>
          </select>
        </div>
        <button
          className="btn"
          onClick={async () => {
            setErr("");
            try {
              const d = await api<{ ok: boolean; settings: Record<string, unknown> }>("/api/admin/settings");
              await api("/api/admin/settings", {
                method: "PUT",
                body: JSON.stringify({ settings: { ...d.settings, defaultLanguage: defaultLang } }),
              });
              setMsg("Default language saved.");
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Could not save.");
            }
          }}
        >
          Save
        </button>
      </div>
    </AdminShell>
  );
}

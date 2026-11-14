import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { api } from "../lib/api";

interface Settings {
  whatsappNumber: string;
  whatsappAutoConfigured: boolean;
  [key: string]: unknown;
}

export default function WhatsappPage() {
  const [s, setS] = useState<Settings | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    api<{ ok: boolean; settings: Settings }>("/api/admin/settings")
      .then((d) => setS(d.settings))
      .catch((e) => setErr(e instanceof Error ? e.message : "Could not load settings."));
  }, []);

  const save = async () => {
    if (!s) return;
    setErr("");
    try {
      await api("/api/admin/settings", { method: "PUT", body: JSON.stringify({ settings: s }) });
      setMsg("WhatsApp settings saved.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save settings.");
    }
  };

  if (!s) return <AdminShell>{err ? <p className="error">{err}</p> : <p>Loading...</p>}</AdminShell>;

  const digits = s.whatsappNumber.replace(/[^0-9]/g, "");

  return (
    <AdminShell>
      <h1>WhatsApp Settings</h1>
      {msg ? <p className="success">{msg}</p> : null}
      {err ? <p className="error">{err}</p> : null}
      <div className="card">
        <div className="field">
          <label>WhatsApp Support Number (with country code, e.g. 923001234567)</label>
          <input value={s.whatsappNumber} onChange={(e) => setS({ ...s, whatsappNumber: e.target.value })} placeholder="923001234567" />
          <p className="hint">This number powers the floating WhatsApp support button on the store and the WhatsApp links on orders.</p>
        </div>
        <div className="field">
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 400 }}>
            <input
              type="checkbox"
              checked={s.whatsappAutoConfigured}
              onChange={(e) => setS({ ...s, whatsappAutoConfigured: e.target.checked })}
            />
            Automatic WhatsApp notifications are configured (WhatsApp Business Platform or a compatible provider)
          </label>
          <p className="hint">
            Leave this off unless a WhatsApp provider is actually connected. When it is off, the store honestly shows
            a working WhatsApp support link and never pretends order messages were sent automatically.
          </p>
        </div>
        {digits ? (
          <p>
            Test link:{" "}
            <a href={`https://wa.me/${digits}`} target="_blank" rel="noreferrer" style={{ color: "#c2410c", fontWeight: 600 }}>
              https://wa.me/{digits}
            </a>
          </p>
        ) : null}
        <button className="btn" onClick={save}>
          Save WhatsApp Settings
        </button>
      </div>
      <div className="card">
        <h2>Automatic notifications</h2>
        <p className="muted">
          When a provider is configured, the store can send: order confirmation, payment approved, payment rejected,
          order processing, and product delivered. Until then, customers are contacted through the WhatsApp support
          link and the order page.
        </p>
      </div>
    </AdminShell>
  );
}

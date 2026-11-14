import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { api } from "../lib/api";

interface Settings {
  siteName: string;
  tagline: string;
  whatsappNumber: string;
  whatsappAutoConfigured: boolean;
  jazzcashNumber: string;
  jazzcashHolder: string;
  jazzcashNote: string;
  storeNotice: string;
  showFeatured: boolean;
  showAccounts: boolean;
  showLatest: boolean;
  showBestSelling: boolean;
  showOffers: boolean;
  showNewArrivals: boolean;
  showReviews: boolean;
  showNewsletter: boolean;
}

const SECTION_TOGGLES: { key: keyof Settings; label: string }[] = [
  { key: "showFeatured", label: "Featured Games section" },
  { key: "showAccounts", label: "Popular Gaming Accounts section" },
  { key: "showLatest", label: "Latest Products section" },
  { key: "showBestSelling", label: "Best Selling section" },
  { key: "showOffers", label: "Special Offers section" },
  { key: "showNewArrivals", label: "New Arrivals section" },
  { key: "showReviews", label: "Customer Reviews section" },
  { key: "showNewsletter", label: "Newsletter section" },
];

export default function SettingsPage() {
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
      setMsg("Settings saved. The store updates immediately.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save settings.");
    }
  };

  if (!s) return <AdminShell>{err ? <p className="error">{err}</p> : <p>Loading...</p>}</AdminShell>;

  return (
    <AdminShell>
      <h1>Website Settings</h1>
      <p className="muted">Super Admin only. Changes apply to the customer store immediately — no code changes needed.</p>
      {msg ? <p className="success">{msg}</p> : null}
      {err ? <p className="error">{err}</p> : null}

      <div className="card">
        <h2>Branding</h2>
        <div className="field">
          <label>Website Name</label>
          <input value={s.siteName} onChange={(e) => setS({ ...s, siteName: e.target.value })} />
        </div>
        <div className="field">
          <label>Tagline</label>
          <input value={s.tagline} onChange={(e) => setS({ ...s, tagline: e.target.value })} />
        </div>
        <div className="field">
          <label>Store Notice (shown on the homepage)</label>
          <input value={s.storeNotice} onChange={(e) => setS({ ...s, storeNotice: e.target.value })} placeholder="e.g. Eid Sale — extra 10% off with code EID10" />
        </div>
      </div>

      <div className="card">
        <h2>JazzCash Payment Details</h2>
        <p className="muted">Customers see these details at checkout. Payments are verified by hand — never automatic.</p>
        <div className="field">
          <label>JazzCash Account Number</label>
          <input value={s.jazzcashNumber} onChange={(e) => setS({ ...s, jazzcashNumber: e.target.value })} placeholder="03XX-XXXXXXX" />
        </div>
        <div className="field">
          <label>Account Holder Name</label>
          <input value={s.jazzcashHolder} onChange={(e) => setS({ ...s, jazzcashHolder: e.target.value })} />
        </div>
        <div className="field">
          <label>Payment Instructions (shown to customers)</label>
          <textarea value={s.jazzcashNote} onChange={(e) => setS({ ...s, jazzcashNote: e.target.value })} />
        </div>
      </div>

      <div className="card">
        <h2>Homepage Sections</h2>
        <div className="checks">
          {SECTION_TOGGLES.map((t) => (
            <label key={t.key}>
              <input
                type="checkbox"
                checked={s[t.key] as boolean}
                onChange={(e) => setS({ ...s, [t.key]: e.target.checked })}
              />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      <button className="btn" onClick={save}>
        Save Settings
      </button>
    </AdminShell>
  );
}

import { Link } from "react-router-dom";
import { useState } from "react";
import { api } from "../../lib/api";
import { t, useLang } from "../../lib/i18n";

export default function ForgotPage() {
  useLang();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const d = await api<{ ok: boolean; resetCode: string | null }>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setCode(d.resetCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="form-wrap">
      <div className="form-card">
        <h1>{t("forgotPassword")}</h1>
        <p className="sub">Enter your email and we will show you a reset code.</p>
        {error ? <p className="error">{error}</p> : null}
        {code === null ? (
          <form onSubmit={submit}>
            <div className="field">
              <label>{t("email")}</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button className="btn" type="submit" disabled={busy} style={{ width: "100%" }}>
              {t("resetPassword")}
            </button>
          </form>
        ) : code ? (
          <>
            <p>No email provider is configured, so your reset code is shown here:</p>
            <div className="code-box">
              <b>{code}</b>
            </div>
            <Link className="btn" to={`/auth/reset?email=${encodeURIComponent(email)}`} style={{ width: "100%", textAlign: "center" }}>
              {t("resetPassword")} →
            </Link>
          </>
        ) : (
          <p className="success">If an account exists for this email, a reset code has been created.</p>
        )}
      </div>
    </div>
  );
}

import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { api } from "../../lib/api";
import { t, useLang } from "../../lib/i18n";

export default function ResetPage() {
  useLang();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, code, newPassword }),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="form-wrap">
      <div className="form-card">
        <h1>{t("resetPassword")}</h1>
        {done ? (
          <>
            <p className="success">Your password has been reset. Please log in with your new password.</p>
            <button className="btn" onClick={() => navigate("/auth/login")} style={{ width: "100%" }}>
              {t("login")}
            </button>
          </>
        ) : (
          <form onSubmit={submit}>
            {error ? <p className="error">{error}</p> : null}
            <div className="field">
              <label>{t("email")}</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>{t("verificationCode")}</label>
              <input required value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div className="field">
              <label>{t("newPassword")}</label>
              <input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <button className="btn" type="submit" disabled={busy} style={{ width: "100%" }}>
              {t("resetPassword")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}


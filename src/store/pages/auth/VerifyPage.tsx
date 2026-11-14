import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { api } from "../../lib/api";
import { t, useLang } from "../../lib/i18n";

export default function VerifyPage() {
  useLang();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/api/auth/verify-email", { method: "POST", body: JSON.stringify({ email, code }) });
      navigate("/auth/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="form-wrap">
      <div className="form-card">
        <h1>{t("verifyEmail")}</h1>
        <p className="sub">Enter the 6-digit code shown after registration.</p>
        {error ? <p className="error">{error}</p> : null}
        <form onSubmit={submit}>
          <div className="field">
            <label>{t("email")}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>{t("verificationCode")}</label>
            <input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
          </div>
          <button className="btn" type="submit" disabled={busy} style={{ width: "100%" }}>
            {t("verify")}
          </button>
        </form>
      </div>
    </div>
  );
}


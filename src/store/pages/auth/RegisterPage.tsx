import { Link } from "react-router-dom";
import { useState } from "react";
import { api, setSession } from "../../lib/api";
import { t, useLang } from "../../lib/i18n";

export default function RegisterPage() {
  useLang();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const d = await api<{ ok: boolean; verifyCode: string; user: Parameters<typeof setSession>[1] }>(
        "/api/auth/register",
        { method: "POST", body: JSON.stringify({ name, email, phone, password }) },
      );
      setCode(d.verifyCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setBusy(false);
    }
  };

  if (code) {
    return (
      <div className="form-wrap">
        <div className="form-card">
          <h1>{t("verifyEmail")}</h1>
          <p className="sub">
            No email provider is configured, so your verification code is shown here. Enter it below to verify your account.
          </p>
          <div className="code-box">
            <b>{code}</b>
          </div>
          <Link className="btn" to={`/auth/verify?email=${encodeURIComponent(email)}`} style={{ width: "100%", textAlign: "center" }}>
            {t("verify")} →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="form-wrap">
      <div className="form-card">
        <h1>{t("signup")}</h1>
        <p className="sub">Create your account to shop at ALIZAIN MEGA MART.</p>
        {error ? <p className="error">{error}</p> : null}
        <form onSubmit={submit}>
          <div className="field">
            <label>{t("fullName")}</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>{t("email")}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>{t("phone")}</label>
            <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03XX-XXXXXXX" />
          </div>
          <div className="field">
            <label>{t("password")}</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn" type="submit" disabled={busy} style={{ width: "100%" }}>
            {t("signup")}
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: 14 }}>
          Already have an account?{" "}
          <Link to="/auth/login" style={{ color: "#c2410c" }}>{t("login")}</Link>
        </p>
      </div>
    </div>
  );
}

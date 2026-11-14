import { Link } from "react-router-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { api, setSession } from "../../lib/api";
import { t, useLang } from "../../lib/i18n";

export default function LoginPage() {
  useLang();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const d = await api<{ ok: boolean; token: string; user: Parameters<typeof setSession>[1] }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setSession(d.token, d.user);
      navigate(params.get("next") || "/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="form-wrap">
      <div className="form-card">
        <h1>{t("login")}</h1>
        <p className="sub">ALIZAIN MEGA MART</p>
        {error ? <p className="error">{error}</p> : null}
        <form onSubmit={submit}>
          <div className="field">
            <label>{t("email")}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>{t("password")}</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn" type="submit" disabled={busy} style={{ width: "100%" }}>
            {t("login")}
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: 14 }}>
          <Link to="/auth/forgot" style={{ color: "#c2410c" }}>{t("forgotPassword")}</Link>
          {" · "}
          <Link to="/auth/register" style={{ color: "#c2410c" }}>{t("signup")}</Link>
        </p>
      </div>
    </div>
  );
}


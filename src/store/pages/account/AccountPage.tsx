import { useEffect, useState } from "react";
import { api, getSessionUser, setSession, type User } from "../../lib/api";
import { setLang, t, useLang } from "../../lib/i18n";

export default function AccountPage() {
  const lang = useLang();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const u = getSessionUser();
    if (u) {
      setUser(u);
      setName(u.name);
      setPhone(u.phone);
    }
  }, []);

  if (!user) return <div>{t("loading")}</div>;

  return (
    <div>
      <h1>{t("myProfile")}</h1>
      <div className="form-card">
        {msg ? <p className="success">{msg}</p> : null}
        {err ? <p className="error">{err}</p> : null}
        <div className="field">
          <label>{t("fullName")}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>{t("email")}</label>
          <input value={user.email} disabled />
        </div>
        <div className="field">
          <label>{t("phone")}</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="field">
          <label>Language / زبان</label>
          <select
            value={lang}
            onChange={(e) => {
              const l = e.target.value as "en" | "ur";
              setLang(l);
              api("/api/account/profile", { method: "PATCH", body: JSON.stringify({ language: l }) }).catch(() => undefined);
            }}
          >
            <option value="en">English</option>
            <option value="ur">اردو</option>
          </select>
          <p className="hint">Your language preference is saved to your account.</p>
        </div>
        <button
          className="btn"
          onClick={async () => {
            setMsg("");
            setErr("");
            try {
              const d = await api<{ ok: boolean; user: User }>("/api/account/profile", {
                method: "PATCH",
                body: JSON.stringify({ name, phone }),
              });
              const token = window.localStorage.getItem("mega_mart_token") ?? "";
              setSession(token, d.user);
              setUser(d.user);
              setMsg("Profile saved.");
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Could not save.");
            }
          }}
        >
          {t("save")}
        </button>
      </div>

      <div className="form-card" style={{ marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>{t("changePassword")}</h2>
        <div className="field">
          <label>{t("currentPassword")}</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </div>
        <div className="field">
          <label>{t("newPassword")}</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <button
          className="btn"
          onClick={async () => {
            setMsg("");
            setErr("");
            try {
              await api("/api/account/change-password", {
                method: "POST",
                body: JSON.stringify({ currentPassword, newPassword }),
              });
              setMsg("Password changed.");
              setCurrentPassword("");
              setNewPassword("");
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Could not change the password.");
            }
          }}
        >
          {t("changePassword")}
        </button>
      </div>
    </div>
  );
}

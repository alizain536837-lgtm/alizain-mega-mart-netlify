import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, setAdminSession, type AdminUser } from "../lib/api";

export default function AdminHomePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"checking" | "setup" | "login">("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ ok: boolean; hasSuperAdmin: boolean }>("/api/admin/bootstrap")
      .then((d) => setMode(d.hasSuperAdmin ? "login" : "setup"))
      .catch(() => setMode("login"));
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const d = await api<{ ok: boolean; token: string; user: AdminUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (d.user.role !== "staff" && d.user.role !== "super_admin") {
        setError("This account is not an admin account.");
        return;
      }
      setAdminSession(d.token, d.user);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  };

  const setup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const d = await api<{ ok: boolean; token: string; user: AdminUser }>("/api/admin/setup", {
        method: "POST",
        body: JSON.stringify({ name, email, phone, password }),
      });
      setAdminSession(d.token, d.user);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed.");
    } finally {
      setBusy(false);
    }
  };

  if (mode === "checking") return <div className="container" style={{ padding: 60 }}>Loading...</div>;

  return (
    <div className="login-wrap">
      <div className="card">
        <h1 style={{ margin: "0 0 4px" }}>
          ALIZAIN <span style={{ color: "#ea580c" }}>MEGA MART</span> ADMIN
        </h1>
        {mode === "setup" ? (
          <>
            <p className="muted">
              Welcome, owner. Set up the Super Admin account once — there is no default password. Keep these
              credentials safe; staff accounts are created later from inside the panel.
            </p>
            {error ? <p className="error">{error}</p> : null}
            <form onSubmit={setup}>
              <div className="field">
                <label>Full Name</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label>Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="field">
                <label>Phone Number</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="field">
                <label>Password (min 8 characters)</label>
                <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button className="btn" type="submit" disabled={busy} style={{ width: "100%" }}>
                Create Super Admin
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="muted">Sign in to manage the store.</p>
            {error ? <p className="error">{error}</p> : null}
            <form onSubmit={login}>
              <div className="field">
                <label>Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button className="btn" type="submit" disabled={busy} style={{ width: "100%" }}>
                Login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

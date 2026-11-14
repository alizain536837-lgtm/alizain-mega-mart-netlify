import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, clearSession, getSessionUser, type Category, type StoreSettings, type User } from "../lib/api";
import { setLang, t, useApplyLang, useLang } from "../lib/i18n";

export default function Header() {
  useApplyLang();
  const lang = useLang();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [q, setQ] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const load = () => setUser(getSessionUser());
    load();
    window.addEventListener("mega-mart-session", load);
    window.addEventListener("mega-mart-cart", load);
    return () => {
      window.removeEventListener("mega-mart-session", load);
      window.removeEventListener("mega-mart-cart", load);
    };
  }, []);

  useEffect(() => {
    api<{ ok: boolean; categories: Category[]; settings: StoreSettings }>("/api/storefront")
      .then((d) => {
        setCats(d.categories);
        setSettings(d.settings);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!user) {
      setCartCount(0);
      return;
    }
    api<{ ok: boolean; items: unknown[] }>("/api/cart")
      .then((d) => setCartCount(d.items.length))
      .catch(() => setCartCount(0));
  }, [user]);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/shop?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <Link to="/" className="logo">
            ALIZAIN <span>MEGA MART</span>
            <small>{settings?.tagline ?? t("tagline")}</small>
          </Link>
          <form className="searchbar" onSubmit={search}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchPlaceholder")} aria-label={t("search")} />
            <button type="submit">{t("search")}</button>
          </form>
          <nav className="navlinks">
            <Link to="/">{t("home")}</Link>
            <Link to="/shop">{t("shop")}</Link>
            <Link to="/cart">
              {t("cart")} {cartCount > 0 ? `(${cartCount})` : ""}
            </Link>
            <Link to="/account/wishlist">{t("wishlist")}</Link>
            {user ? (
              <>
                <Link to="/account">{user.name.split(" ")[0]}</Link>
                <button
                  onClick={() => {
                    clearSession();
                    navigate("/");
                  }}
                >
                  {t("logout")}
                </button>
              </>
            ) : (
              <>
                <Link to="/auth/login">{t("login")}</Link>
                <Link to="/auth/register">{t("signup")}</Link>
              </>
            )}
            <button className="langbtn" onClick={() => setLang(lang === "en" ? "ur" : "en")}>
              {lang === "en" ? "اردو" : "English"}
            </button>
          </nav>
        </div>
        <nav className="catnav">
          <div className="container catnav-inner">
            <Link to="/shop">{t("shop")}</Link>
            {cats.map((c) => (
              <Link key={c.id} to={`/shop?category=${encodeURIComponent(c.name)}`}>
                {c.name}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      {settings?.whatsappNumber ? (
        <a
          className="wa-float"
          href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`}
          target="_blank"
          rel="noreferrer"
          aria-label={t("support")}
          title={t("support")}
        >
          ✆
        </a>
      ) : null}
    </>
  );
}

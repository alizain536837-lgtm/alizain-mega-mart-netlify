import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { clearSession, getSessionUser, type User } from "../../lib/api";
import { t } from "../../lib/i18n";

const LINKS = [
  { href: "/account", label: "myProfile" },
  { href: "/account/orders", label: "myOrders" },
  { href: "/account/wishlist", label: "wishlist" },
  { href: "/account/reviews", label: "myReviews" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = getSessionUser();
    if (!u) {
      navigate("/auth/login?next=/account");
      return;
    }
    setUser(u);
  }, [navigate]);

  if (!user) return <div className="container" style={{ padding: 40 }}>{t("loading")}</div>;

  return (
    <div className="container">
      <div className="account">
        <nav className="account-nav">
          {LINKS.map((l) => (
            <Link key={l.href} to={l.href} className={pathname === l.href ? "active" : ""}>
              {t(l.label)}
            </Link>
          ))}
          <Link to="/account/payments">{t("paymentHistory")}</Link>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              clearSession();
              navigate("/");
            }}
          >
            {t("logout")}
          </a>
        </nav>
        <div className="account-main">{children}</div>
      </div>
    </div>
  );
}

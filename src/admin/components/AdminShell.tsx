import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { clearAdminSession, getAdminUser, getToken, type AdminUser } from "../lib/api";

const NAV: { group: string; links: { href: string; label: string; perm?: string }[] }[] = [
  {
    group: "Store",
    links: [
      { href: "/admin/dashboard", label: "Dashboard" },
      { href: "/admin/products", label: "Products Management", perm: "manage_products" },
      { href: "/admin/categories", label: "Categories Management", perm: "manage_categories" },
      { href: "/admin/stock", label: "Stock Management", perm: "manage_stock" },
    ],
  },
  {
    group: "Sales",
    links: [
      { href: "/admin/orders", label: "Orders Management", perm: "view_orders" },
      { href: "/admin/payments", label: "Payment Verification", perm: "verify_payments" },
      { href: "/admin/delivery", label: "Manual Delivery", perm: "deliver_products" },
      { href: "/admin/customers", label: "Customers Management", perm: "view_customers" },
      { href: "/admin/reviews", label: "Reviews Management", perm: "manage_reviews" },
      { href: "/admin/coupons", label: "Coupons & Discounts", perm: "manage_coupons" },
    ],
  },
  {
    group: "Website",
    links: [
      { href: "/admin/banners", label: "Homepage Banners", perm: "manage_banners" },
      { href: "/admin/settings", label: "Website Settings" },
      { href: "/admin/whatsapp", label: "WhatsApp Settings" },
      { href: "/admin/language", label: "Language Settings" },
      { href: "/admin/reports", label: "Sales Reports", perm: "view_reports" },
    ],
  },
  {
    group: "Administration",
    links: [
      { href: "/admin/staff", label: "Staff Management" },
      { href: "/admin/permissions", label: "Admin Permissions" },
      { href: "/admin/logs", label: "Security & Activity Logs" },
    ],
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const u = getAdminUser();
    if (!u || !getToken()) {
      navigate("/admin");
      return;
    }
    setUser(u);
  }, [navigate]);

  if (!user) return <div className="container" style={{ padding: 40 }}>Loading...</div>;

  const isSuper = user.role === "super_admin";
  const can = (perm?: string) => isSuper || !perm || user.permissions.includes(perm);

  return (
    <>
      <header className="admin-top">
        <div className="container admin-top-inner">
          <Link to="/admin/dashboard" className="logo">
            ALIZAIN <span>MEGA MART</span> ADMIN
          </Link>
          <nav>
            <span>
              {user.name} ({isSuper ? "Super Admin" : "Staff"})
            </span>
            <button
              onClick={() => {
                clearAdminSession();
                navigate("/admin");
              }}
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <div className="container">
        <div className="admin-shell">
          <nav className="admin-nav">
            {NAV.map((g) => (
              <div key={g.group}>
                <div className="nav-group">{g.group}</div>
                {g.links
                  .filter((l) => can(l.perm))
                  .map((l) => (
                    <Link key={l.href} to={l.href} className={pathname === l.href ? "active" : ""}>
                      {l.label}
                    </Link>
                  ))}
              </div>
            ))}
          </nav>
          <div className="admin-main">{children}</div>
        </div>
      </div>
    </>
  );
}

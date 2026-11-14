import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Header from "./store/components/Header";
import HomePage from "./store/pages/HomePage";
import ShopPage from "./store/pages/ShopPage";
import ProductPage from "./store/pages/ProductPage";
import CartPage from "./store/pages/CartPage";
import CheckoutPage from "./store/pages/CheckoutPage";
import LoginPage from "./store/pages/auth/LoginPage";
import RegisterPage from "./store/pages/auth/RegisterPage";
import ForgotPage from "./store/pages/auth/ForgotPage";
import ResetPage from "./store/pages/auth/ResetPage";
import VerifyPage from "./store/pages/auth/VerifyPage";
import AccountLayout from "./store/pages/account/AccountLayout";
import AccountPage from "./store/pages/account/AccountPage";
import OrdersPage from "./store/pages/account/OrdersPage";
import OrderDetailPage from "./store/pages/account/OrderDetailPage";
import PaymentsPage from "./store/pages/account/PaymentsPage";
import ReviewsPage from "./store/pages/account/ReviewsPage";
import WishlistPage from "./store/pages/account/WishlistPage";
import { getToken as getAdminToken } from "./admin/lib/api";
import AdminLogin from "./admin/pages/Login";
import AdminDashboard from "./admin/pages/Dashboard";
import AdminProducts from "./admin/pages/Products";
import AdminCategories from "./admin/pages/Categories";
import AdminOrders from "./admin/pages/Orders";
import AdminPayments from "./admin/pages/Payments";
import AdminDelivery from "./admin/pages/Delivery";
import AdminCustomers from "./admin/pages/Customers";
import AdminReviews from "./admin/pages/Reviews";
import AdminStock from "./admin/pages/Stock";
import AdminCoupons from "./admin/pages/Coupons";
import AdminBanners from "./admin/pages/Banners";
import AdminSettings from "./admin/pages/Settings";
import AdminWhatsapp from "./admin/pages/Whatsapp";
import AdminLanguage from "./admin/pages/Language";
import AdminReports from "./admin/pages/Reports";
import AdminStaff from "./admin/pages/Staff";
import AdminPermissions from "./admin/pages/Permissions";
import AdminLogs from "./admin/pages/Logs";

/** Store layout: header + outlet. Used only for storefront routes — never for /admin. */
function StoreLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}

/** Visiting /admin with an admin token goes to the dashboard; without one shows login/setup. */
function AdminRoot() {
  return getAdminToken() ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />;
}

export default function App() {
  return (
    <Routes>
      {/* ---- Admin panel (private /admin/* routes; no link to these exists on the storefront) ---- */}
      <Route path="/admin" element={<AdminRoot />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/delivery" element={<AdminDelivery />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/stock" element={<AdminStock />} />
          <Route path="/admin/coupons" element={<AdminCoupons />} />
          <Route path="/admin/banners" element={<AdminBanners />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/whatsapp" element={<AdminWhatsapp />} />
          <Route path="/admin/language" element={<AdminLanguage />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/staff" element={<AdminStaff />} />
          <Route path="/admin/permissions" element={<AdminPermissions />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
      <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

      {/* ---- Customer storefront ---- */}
      <Route element={<StoreLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot" element={<ForgotPage />} />
        <Route path="/auth/reset" element={<ResetPage />} />
        <Route path="/auth/verify" element={<VerifyPage />} />
        <Route path="/account" element={<AccountLayout><AccountPage /></AccountLayout>} />
        <Route path="/account/orders" element={<AccountLayout><OrdersPage /></AccountLayout>} />
        <Route path="/account/orders/:id" element={<AccountLayout><OrderDetailPage /></AccountLayout>} />
        <Route path="/account/payments" element={<AccountLayout><PaymentsPage /></AccountLayout>} />
        <Route path="/account/reviews" element={<AccountLayout><ReviewsPage /></AccountLayout>} />
        <Route path="/account/wishlist" element={<AccountLayout><WishlistPage /></AccountLayout>} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
}

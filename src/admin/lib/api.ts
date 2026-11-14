export const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  permissions: string[];
  emailVerified: boolean;
  language: string;
}

export function pkr(n: number): string {
  return `Rs ${n.toLocaleString("en-PK")}`;
}

export function imgUrl(src: string | null | undefined): string {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) return src;
  return `${API_URL}${src.startsWith("/") ? src : `/${src}`}`;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("mega_mart_admin_token");
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("mega_mart_admin_user");
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

export function setAdminSession(token: string, user: AdminUser): void {
  window.localStorage.setItem("mega_mart_admin_token", token);
  window.localStorage.setItem("mega_mart_admin_user", JSON.stringify(user));
  window.dispatchEvent(new Event("mega-mart-admin-session"));
}

export function clearAdminSession(): void {
  window.localStorage.removeItem("mega_mart_admin_token");
  window.localStorage.removeItem("mega_mart_admin_user");
  window.dispatchEvent(new Event("mega-mart-admin-session"));
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = (await res.json().catch(() => ({}))) as T & { ok?: boolean; error?: string };
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `Request failed (${res.status}).`);
  }
  return data;
}

export async function apiUpload<T>(path: string, file: File): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(`${API_URL}${path}`, { method: "POST", headers, body: form });
  const data = (await res.json().catch(() => ({}))) as T & { ok?: boolean; error?: string };
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `Upload failed (${res.status}).`);
  }
  return data;
}

export const ALL_PERMISSIONS: { key: string; label: string }[] = [
  { key: "view_orders", label: "View Orders" },
  { key: "manage_orders", label: "Manage Orders" },
  { key: "view_customers", label: "View Customers" },
  { key: "manage_products", label: "Manage Products" },
  { key: "verify_payments", label: "Verify Payments" },
  { key: "deliver_products", label: "Deliver Products" },
  { key: "manage_reviews", label: "Manage Reviews" },
  { key: "manage_categories", label: "Manage Categories" },
  { key: "manage_stock", label: "Manage Stock" },
  { key: "manage_coupons", label: "Manage Coupons" },
  { key: "manage_banners", label: "Manage Banners" },
  { key: "view_reports", label: "View Reports" },
];

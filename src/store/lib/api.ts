export const API_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  permissions: string[];
  emailVerified: boolean;
  language: string;
}

export interface Category {
  id: number;
  name: string;
  kind: string;
  sortOrder: number;
}

export interface Product {
  id: number;
  type: string;
  title: string;
  description: string;
  categoryId: number | null;
  categoryName?: string;
  pricePkr: number;
  compareAtPkr: number | null;
  stockStatus: string;
  isUnique: boolean;
  featured: boolean;
  active: boolean;
  imageUrls: string[];
  specs: Record<string, string>;
  customValues: Record<string, string>;
  ratingAvg: number;
  ratingCount: number;
  salesCount: number;
  createdAt: string;
}

export interface StoreSettings {
  siteName: string;
  tagline: string;
  whatsappNumber: string;
  whatsappAutoConfigured: boolean;
  jazzcashNumber: string;
  jazzcashHolder: string;
  jazzcashNote: string;
  storeNotice: string;
  showFeatured: boolean;
  showAccounts: boolean;
  showLatest: boolean;
  showBestSelling: boolean;
  showOffers: boolean;
  showNewArrivals: boolean;
  showReviews: boolean;
  showNewsletter: boolean;
}

export interface OrderItem {
  id: number;
  productId: number;
  title: string;
  pricePkr: number;
  qty: number;
}

export interface PaymentInfo {
  id: number;
  transactionId: string;
  amountPkr: number;
  screenshotKey: string | null;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
}

export interface Order {
  id: number;
  status: string;
  subtotalPkr: number;
  discountPkr: number;
  totalPkr: number;
  couponCode: string | null;
  deliveryDetails: string | null;
  deliveredAt: string | null;
  createdAt: string;
  items: OrderItem[];
  payments: PaymentInfo[];
}

export function imgUrl(src: string | null | undefined): string {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) return src;
  return `${API_URL}${src.startsWith("/") ? src : `/${src}`}`;
}

export function pkr(n: number): string {
  return `Rs ${n.toLocaleString("en-PK")}`;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("mega_mart_token");
}

export function getSessionUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("mega_mart_user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: User): void {
  window.localStorage.setItem("mega_mart_token", token);
  window.localStorage.setItem("mega_mart_user", JSON.stringify(user));
  window.dispatchEvent(new Event("mega-mart-session"));
}

export function clearSession(): void {
  window.localStorage.removeItem("mega_mart_token");
  window.localStorage.removeItem("mega_mart_user");
  window.dispatchEvent(new Event("mega-mart-session"));
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

export async function apiForm<T>(path: string, form: FormData): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { method: "POST", headers, body: form });
  const data = (await res.json().catch(() => ({}))) as T & { ok?: boolean; error?: string };
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `Request failed (${res.status}).`);
  }
  return data;
}

/** A short-lived idempotency key so a double-tap / retry never creates two orders. */
export function idempotencyKey(): string {
  return `order-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

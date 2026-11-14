import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { api, apiUpload, imgUrl, pkr } from "../lib/api";

interface Category {
  id: number;
  name: string;
  kind: string;
}

interface FieldDef {
  id: number;
  scope: string;
  label: string;
  fieldType: string;
  options: string[];
}

interface Product {
  id: number;
  type: string;
  title: string;
  description: string;
  categoryId: number | null;
  categoryName: string;
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
}

const EMPTY: Omit<Product, "id" | "categoryName" | "ratingAvg" | "ratingCount" | "salesCount"> = {
  type: "game",
  title: "",
  description: "",
  categoryId: null,
  pricePkr: 0,
  compareAtPkr: null,
  stockStatus: "available",
  isUnique: false,
  featured: false,
  active: true,
  imageUrls: [],
  specs: {},
  customValues: {},
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [editing, setEditing] = useState<(typeof EMPTY & { id?: number }) | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      const [p, c, f] = await Promise.all([
        api<{ ok: boolean; products: Product[] }>(`/api/admin/products?q=${encodeURIComponent(q)}&type=${type}&pageSize=100`),
        api<{ ok: boolean; categories: Category[] }>("/api/admin/categories"),
        api<{ ok: boolean; fieldDefs: FieldDef[] }>("/api/admin/field-defs"),
      ]);
      setProducts(p.products);
      setCats(c.categories);
      setFields(f.fieldDefs);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load products.");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, type]);

  const save = async () => {
    if (!editing) return;
    setErr("");
    setMsg("");
    setBusy(true);
    try {
      const body = {
        type: editing.type,
        title: editing.title,
        description: editing.description,
        categoryId: editing.categoryId,
        pricePkr: editing.pricePkr,
        compareAtPkr: editing.compareAtPkr,
        stockStatus: editing.stockStatus,
        isUnique: editing.isUnique,
        featured: editing.featured,
        active: editing.active,
        images: editing.imageUrls,
        specs: editing.specs,
        customValues: editing.customValues,
      };
      if (editing.id) {
        await api(`/api/admin/products/${editing.id}`, { method: "PATCH", body: JSON.stringify(body) });
        setMsg("Product updated.");
      } else {
        await api("/api/admin/products", { method: "POST", body: JSON.stringify(body) });
        setMsg("Product added.");
      }
      setEditing(null);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save the product.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p: Product) => {
    if (!confirm(`Delete "${p.title}"? Products with orders are deactivated instead of deleted.`)) return;
    try {
      const d = await api<{ ok: boolean; deactivated?: boolean }>(`/api/admin/products/${p.id}`, { method: "DELETE" });
      setMsg(d.deactivated ? "Product has orders, so it was deactivated instead of deleted." : "Product deleted.");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not delete the product.");
    }
  };

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const d = await apiUpload<{ ok: boolean; key: string }>("/api/admin/upload", file);
      if (editing) setEditing({ ...editing, imageUrls: [...editing.imageUrls, d.key] });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const catName = editing?.categoryId ? cats.find((c) => c.id === editing.categoryId)?.name ?? "" : "";
  const relevantFields = fields.filter((f) => f.scope === catName);

  return (
    <AdminShell>
      <h1>Products Management</h1>
      {msg ? <p className="success">{msg}</p> : null}
      {err ? <p className="error">{err}</p> : null}

      <div className="row" style={{ marginBottom: 14 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products..."
          style={{ flex: 1, minWidth: 200, padding: "9px 11px", border: "1px solid #e5e7eb", borderRadius: 8 }}
        />
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: "9px 11px", border: "1px solid #e5e7eb", borderRadius: 8 }}>
          <option value="">All types</option>
          <option value="game">Games</option>
          <option value="account">Gaming Accounts</option>
        </select>
        <button className="btn" onClick={() => setEditing({ ...EMPTY, specs: { Platform: "", Genre: "", Edition: "" } })}>
          + Add Product
        </button>
      </div>

      {editing ? (
        <div className="card">
          <h2>{editing.id ? "Edit Product" : "Add Product"}</h2>
          <div className="form-grid">
            <div className="field">
              <label>Type</label>
              <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                <option value="game">Game</option>
                <option value="account">Gaming Account</option>
              </select>
            </div>
            <div className="field">
              <label>Category</label>
              <select
                value={editing.categoryId ?? ""}
                onChange={(e) => setEditing({ ...editing, categoryId: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">— No category —</option>
                {cats
                  .filter((c) => c.kind === editing.type)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="field">
              <label>Title</label>
              <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div className="field">
              <label>Price (PKR)</label>
              <input type="number" min={0} value={editing.pricePkr} onChange={(e) => setEditing({ ...editing, pricePkr: Number(e.target.value) || 0 })} />
            </div>
            <div className="field">
              <label>Compare-at price (PKR, optional — shows a discount)</label>
              <input
                type="number"
                min={0}
                value={editing.compareAtPkr ?? ""}
                onChange={(e) => setEditing({ ...editing, compareAtPkr: e.target.value ? Number(e.target.value) : null })}
              />
            </div>
            <div className="field">
              <label>Stock status</label>
              <select value={editing.stockStatus} onChange={(e) => setEditing({ ...editing, stockStatus: e.target.value })}>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </div>
          <div className="form-grid">
            <div className="field">
              <label>Platform (spec)</label>
              <input value={editing.specs.Platform ?? ""} onChange={(e) => setEditing({ ...editing, specs: { ...editing.specs, Platform: e.target.value } })} />
            </div>
            <div className="field">
              <label>Genre (spec)</label>
              <input value={editing.specs.Genre ?? ""} onChange={(e) => setEditing({ ...editing, specs: { ...editing.specs, Genre: e.target.value } })} />
            </div>
            <div className="field">
              <label>Edition (spec)</label>
              <input value={editing.specs.Edition ?? ""} onChange={(e) => setEditing({ ...editing, specs: { ...editing.specs, Edition: e.target.value } })} />
            </div>
          </div>
          {relevantFields.length > 0 ? (
            <>
              <h3>Account details ({catName})</h3>
              <div className="form-grid">
                {relevantFields.map((f) => (
                  <div className="field" key={f.id}>
                    <label>{f.label}</label>
                    {f.fieldType === "select" ? (
                      <select
                        value={editing.customValues[f.label] ?? ""}
                        onChange={(e) => setEditing({ ...editing, customValues: { ...editing.customValues, [f.label]: e.target.value } })}
                      >
                        <option value="">— Select —</option>
                        {f.options.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    ) : f.fieldType === "textarea" ? (
                      <textarea
                        value={editing.customValues[f.label] ?? ""}
                        onChange={(e) => setEditing({ ...editing, customValues: { ...editing.customValues, [f.label]: e.target.value } })}
                      />
                    ) : (
                      <input
                        value={editing.customValues[f.label] ?? ""}
                        onChange={(e) => setEditing({ ...editing, customValues: { ...editing.customValues, [f.label]: e.target.value } })}
                      />
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : null}
          <div className="field">
            <label>Images (upload as many as you like)</label>
            <div className="row">
              {editing.imageUrls.map((u, i) => (
                <span key={i} style={{ position: "relative" }}>
                  <img src={imgUrl(u)} alt="" width={90} height={68} style={{ objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }} />
                  <button
                    type="button"
                    onClick={() => setEditing({ ...editing, imageUrls: editing.imageUrls.filter((_, j) => j !== i) })}
                    style={{ position: "absolute", top: -8, right: -8, background: "#dc2626", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, fontSize: 12 }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) upload(f);
                e.target.value = "";
              }}
            />
            <p className="hint">JPEG / PNG / WebP, max 8 MB each. Large phone photos are accepted and stored as-is.</p>
          </div>
          <div className="checks" style={{ marginBottom: 14 }}>
            <label>
              <input type="checkbox" checked={editing.isUnique} onChange={(e) => setEditing({ ...editing, isUnique: e.target.checked })} />
              Unique gaming account (sold once, never twice)
            </label>
            <label>
              <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
              Featured on homepage
            </label>
            <label>
              <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} />
              Active (visible on the store)
            </label>
          </div>
          <div className="row">
            <button className="btn" onClick={save} disabled={busy}>
              {editing.id ? "Save Changes" : "Add Product"}
            </button>
            <button className="btn ghost" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="product-cards">
        {products.map((p) => (
          <div key={p.id} className="product-card">
            {p.imageUrls[0] ? <img src={imgUrl(p.imageUrls[0])} alt={p.title} /> : null}
            <h3 style={{ margin: "10px 0 4px", fontSize: 15 }}>{p.title}</h3>
            <p className="muted" style={{ margin: "0 0 6px" }}>
              {p.categoryName} • {p.type} • {pkr(p.pricePkr)}
              {p.compareAtPkr ? <span style={{ textDecoration: "line-through", marginInlineStart: 6 }}>{pkr(p.compareAtPkr)}</span> : null}
            </p>
            <p style={{ margin: "0 0 8px" }}>
              <span className={`badge ${p.stockStatus === "available" ? "green" : p.stockStatus === "sold" ? "red" : "grey"}`}>{p.stockStatus}</span>{" "}
              {p.featured ? <span className="badge orange">Featured</span> : null}{" "}
              {!p.active ? <span className="badge grey">Hidden</span> : null}{" "}
              <span className="badge grey">★ {p.ratingAvg} ({p.ratingCount})</span>{" "}
              <span className="badge grey">Sold: {p.salesCount}</span>
            </p>
            <div className="row">
              <button className="btn ghost small" onClick={() => setEditing({ ...p })}>
                Edit
              </button>
              <button className="btn danger small" onClick={() => remove(p)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {products.length === 0 ? <p className="muted">No products match. Add your first product above.</p> : null}
    </AdminShell>
  );
}

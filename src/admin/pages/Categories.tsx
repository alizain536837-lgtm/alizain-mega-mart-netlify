import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { api } from "../lib/api";

interface Category {
  id: number;
  name: string;
  kind: string;
  sortOrder: number;
}

interface FieldDef {
  id: number;
  scope: string;
  label: string;
  fieldType: string;
  options: string[];
  required: boolean;
  sortOrder: number;
}

export default function CategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"game" | "account">("game");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [fScope, setFScope] = useState("");
  const [fLabel, setFLabel] = useState("");
  const [fType, setFType] = useState("text");
  const [fOptions, setFOptions] = useState("");

  const load = async () => {
    const [c, f] = await Promise.all([
      api<{ ok: boolean; categories: Category[] }>("/api/admin/categories"),
      api<{ ok: boolean; fieldDefs: FieldDef[] }>("/api/admin/field-defs"),
    ]);
    setCats(c.categories);
    setFields(f.fieldDefs);
  };

  useEffect(() => {
    load().catch((e) => setErr(e instanceof Error ? e.message : "Could not load categories."));
  }, []);

  return (
    <AdminShell>
      <h1>Categories Management</h1>
      {msg ? <p className="success">{msg}</p> : null}
      {err ? <p className="error">{err}</p> : null}

      <div className="card">
        <h2>Add Category</h2>
        <div className="row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            style={{ flex: 1, minWidth: 180, padding: "9px 11px", border: "1px solid #e5e7eb", borderRadius: 8 }}
          />
          <select value={kind} onChange={(e) => setKind(e.target.value as "game" | "account")} style={{ padding: "9px 11px", border: "1px solid #e5e7eb", borderRadius: 8 }}>
            <option value="game">Games</option>
            <option value="account">Gaming Accounts</option>
          </select>
          <button
            className="btn"
            onClick={async () => {
              setErr("");
              try {
                await api("/api/admin/categories", { method: "POST", body: JSON.stringify({ name, kind }) });
                setName("");
                setMsg("Category added.");
                await load();
              } catch (e) {
                setErr(e instanceof Error ? e.message : "Could not add the category.");
              }
            }}
          >
            Add
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Kind</th>
              <th>Order</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.kind}</td>
                <td>{c.sortOrder}</td>
                <td>
                  <button
                    className="btn danger small"
                    onClick={async () => {
                      if (!confirm(`Delete category "${c.name}"?`)) return;
                      try {
                        await api(`/api/admin/categories/${c.id}`, { method: "DELETE" });
                        setMsg("Category deleted.");
                        await load();
                      } catch (e) {
                        setErr(e instanceof Error ? e.message : "Could not delete the category.");
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2>Dynamic Custom Fields (Gaming Accounts)</h2>
        <p className="muted">
          Create custom fields for any game account category — for example Rank, Gun Skins or Edition — without
          changing any code. The fields appear on the product form for that category.
        </p>
        <div className="row">
          <select value={fScope} onChange={(e) => setFScope(e.target.value)} style={{ padding: "9px 11px", border: "1px solid #e5e7eb", borderRadius: 8 }}>
            <option value="">Category...</option>
            {cats.filter((c) => c.kind === "account").map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <input value={fLabel} onChange={(e) => setFLabel(e.target.value)} placeholder="Field label, e.g. Rank" style={{ padding: "9px 11px", border: "1px solid #e5e7eb", borderRadius: 8 }} />
          <select value={fType} onChange={(e) => setFType(e.target.value)} style={{ padding: "9px 11px", border: "1px solid #e5e7eb", borderRadius: 8 }}>
            <option value="text">Text</option>
            <option value="textarea">Long text</option>
            <option value="select">Dropdown</option>
            <option value="number">Number</option>
          </select>
          <input value={fOptions} onChange={(e) => setFOptions(e.target.value)} placeholder="Options (comma separated, for dropdown)" style={{ padding: "9px 11px", border: "1px solid #e5e7eb", borderRadius: 8 }} />
          <button
            className="btn"
            onClick={async () => {
              setErr("");
              try {
                await api("/api/admin/field-defs", {
                  method: "POST",
                  body: JSON.stringify({
                    scope: fScope,
                    label: fLabel,
                    fieldType: fType,
                    options: fOptions.split(",").map((s) => s.trim()).filter(Boolean),
                  }),
                });
                setFLabel("");
                setFOptions("");
                setMsg("Field added.");
                await load();
              } catch (e) {
                setErr(e instanceof Error ? e.message : "Could not add the field.");
              }
            }}
          >
            Add Field
          </button>
        </div>
        <div style={{ marginTop: 12 }}>
          {fields.map((f) => (
            <span key={f.id} className="badge grey" style={{ margin: "0 6px 6px 0", fontSize: 12.5, padding: "5px 10px" }}>
              {f.scope}: {f.label} ({f.fieldType}){" "}
              <button
                onClick={async () => {
                  await api(`/api/admin/field-defs/${f.id}`, { method: "DELETE" });
                  await load();
                }}
                style={{ background: "none", border: "none", color: "#dc2626", fontWeight: 700 }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}

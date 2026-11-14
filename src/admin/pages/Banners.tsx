import { useEffect, useState } from "react";
import AdminShell from "../components/AdminShell";
import { api, apiUpload, imgUrl } from "../lib/api";

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  imageKey: string | null;
  link: string;
  active: boolean;
  sortOrder: number;
}

export default function BannersPage() {
  const [rows, setRows] = useState<Banner[]>([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [link, setLink] = useState("");
  const [imageKey, setImageKey] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try {
      const d = await api<{ ok: boolean; banners: Banner[] }>("/api/admin/banners");
      setRows(d.banners);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load banners.");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <AdminShell>
      <h1>Homepage Banners</h1>
      {msg ? <p className="success">{msg}</p> : null}
      {err ? <p className="error">{err}</p> : null}
      <div className="card">
        <h2>Add Banner</h2>
        <div className="field">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Eid Gaming Sale — Up to 30% Off" />
        </div>
        <div className="field">
          <label>Subtitle</label>
          <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="e.g. PUBG, Free Fire, Minecraft and more" />
        </div>
        <div className="field">
          <label>Link (optional, e.g. /shop?category=Android%20Games)</label>
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="/shop" />
        </div>
        <div className="field">
          <label>Banner image</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setUploading(true);
              try {
                const d = await apiUpload<{ ok: boolean; key: string }>("/api/admin/upload", f);
                setImageKey(d.key);
              } catch (err2) {
                setErr(err2 instanceof Error ? err2.message : "Upload failed.");
              } finally {
                setUploading(false);
                e.target.value = "";
              }
            }}
          />
          {imageKey ? <img src={imgUrl(imageKey)} alt="" width={240} style={{ marginTop: 8, borderRadius: 8 }} /> : null}
        </div>
        <button
          className="btn"
          onClick={async () => {
            setErr("");
            try {
              await api("/api/admin/banners", { method: "POST", body: JSON.stringify({ title, subtitle, link, imageKey: imageKey || null }) });
              setTitle("");
              setSubtitle("");
              setLink("");
              setImageKey("");
              setMsg("Banner added. The first active banner is the store homepage hero.");
              await load();
            } catch (e) {
              setErr(e instanceof Error ? e.message : "Could not add the banner.");
            }
          }}
        >
          Add Banner
        </button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Banner</th>
              <th>Link</th>
              <th>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id}>
                <td>
                  <strong>{b.title}</strong>
                  <div className="muted">{b.subtitle}</div>
                </td>
                <td>{b.link || "—"}</td>
                <td>
                  <button
                    className="btn ghost small"
                    onClick={async () => {
                      await api(`/api/admin/banners/${b.id}`, { method: "PATCH", body: JSON.stringify({ active: !b.active }) });
                      await load();
                    }}
                  >
                    {b.active ? "Active" : "Hidden"}
                  </button>
                </td>
                <td>
                  <button
                    className="btn danger small"
                    onClick={async () => {
                      if (!confirm("Delete this banner?")) return;
                      await api(`/api/admin/banners/${b.id}`, { method: "DELETE" });
                      await load();
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
      {rows.length === 0 ? <p className="muted">No banners yet — the homepage shows the default hero.</p> : null}
    </AdminShell>
  );
}

import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, getSessionUser, imgUrl, pkr, type Product } from "../lib/api";
import { t, useLang } from "../lib/i18n";

interface CartItem {
  id: number;
  qty: number;
  product: Product;
}

export default function CartPage() {
  useLang();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!getSessionUser()) {
      navigate("/auth/login?next=/cart");
      return;
    }
    try {
      const d = await api<{ ok: boolean; items: CartItem[] }>("/api/cart");
      setItems(d.items);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = items.reduce((s, i) => s + i.product.pricePkr * i.qty, 0);

  if (loading) return <div className="container" style={{ padding: 40 }}>{t("loading")}</div>;

  return (
    <div className="container" style={{ padding: "24px 16px 40px" }}>
      <h1>{t("cart")}</h1>
      {items.length === 0 ? (
        <div>
          <p>{t("emptyCart")}</p>
          <Link className="btn" to="/shop">
            {t("continueShopping")}
          </Link>
        </div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>{t("price")}</th>
                <th>{t("quantity")}</th>
                <th>{t("total")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td>
                    <Link to={`/product/${i.product.id}`} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      {i.product.imageUrls[0] ? (
                        <img src={imgUrl(i.product.imageUrls[0])} alt="" width={64} height={48} style={{ objectFit: "cover", borderRadius: 8 }} />
                      ) : null}
                      {i.product.title}
                    </Link>
                  </td>
                  <td>{pkr(i.product.pricePkr)}</td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={i.qty}
                      onChange={async (e) => {
                        const qty = Math.max(1, Number(e.target.value) || 1);
                        await api(`/api/cart/${i.id}`, { method: "PATCH", body: JSON.stringify({ qty }) });
                        load();
                      }}
                      style={{ width: 64, padding: "7px 9px", border: "1px solid #e5e7eb", borderRadius: 8 }}
                    />
                  </td>
                  <td>{pkr(i.product.pricePkr * i.qty)}</td>
                  <td>
                    <button
                      className="btn ghost small"
                      onClick={async () => {
                        await api(`/api/cart/${i.id}`, { method: "DELETE" });
                        window.dispatchEvent(new Event("mega-mart-cart"));
                        load();
                      }}
                    >
                      {t("remove")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, flexWrap: "wrap", gap: 12 }}>
            <strong style={{ fontSize: 19 }}>
              {t("subtotal")}: {pkr(subtotal)}
            </strong>
            <Link className="btn" to="/checkout">
              {t("checkout")} →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

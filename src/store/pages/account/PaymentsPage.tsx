import { useEffect, useState } from "react";
import { api, pkr } from "../../lib/api";
import { t, useLang } from "../../lib/i18n";

interface PaymentRow {
  id: number;
  orderId: number;
  transactionId: string;
  amountPkr: number;
  status: string;
  rejectionReason: string | null;
  createdAt: string;
  orderTotalPkr: number;
}

export default function PaymentsPage() {
  useLang();
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ ok: boolean; payments: PaymentRow[] }>("/api/payments")
      .then((d) => setRows(d.payments))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>{t("loading")}</div>;

  return (
    <div>
      <h1>{t("paymentHistory")}</h1>
      {rows.length === 0 ? <p className="muted">No payments yet.</p> : null}
      <table className="table">
        <thead>
          <tr>
            <th>Order</th>
            <th>{t("transactionId")}</th>
            <th>{t("amount")}</th>
            <th>Status</th>
            <th>{t("date")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td>#{p.orderId}</td>
              <td>{p.transactionId}</td>
              <td>{pkr(p.amountPkr)}</td>
              <td>
                <span className="badge orange">{p.status}</span>
                {p.rejectionReason ? <div style={{ color: "#dc2626", fontSize: 13 }}>{p.rejectionReason}</div> : null}
              </td>
              <td>{new Date(p.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

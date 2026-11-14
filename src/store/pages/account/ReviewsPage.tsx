import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { t, useLang } from "../../lib/i18n";

interface MyReview {
  id: number;
  productTitle: string;
  rating: number;
  text: string;
  status: string;
  helpfulCount: number;
  createdAt: string;
}

export default function MyReviewsPage() {
  useLang();
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ ok: boolean; reviews: MyReview[] }>("/api/my-reviews")
      .then((d) => setReviews(d.reviews))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>{t("loading")}</div>;

  return (
    <div>
      <h1>{t("myReviews")}</h1>
      {reviews.length === 0 ? <p className="muted">You have not written any reviews yet.</p> : null}
      {reviews.map((r) => (
        <div key={r.id} className="order-card">
          <span className="stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>{" "}
          <span className="badge orange">{r.status}</span>
          <h3 style={{ margin: "6px 0" }}>{r.productTitle}</h3>
          <p style={{ margin: "4px 0" }}>{r.text}</p>
          <small className="muted">
            {new Date(r.createdAt).toLocaleDateString()} • {r.helpfulCount} {t("helpful")}
          </small>
        </div>
      ))}
    </div>
  );
}

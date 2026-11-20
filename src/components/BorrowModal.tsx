import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Toy } from "@/data/toys";
import { useUser } from "@/lib/useUser";
import StatusBadge from "./StatusBadge";

type Props = {
  toy: Toy;
  onClose: () => void;
  onBorrow: () => void;
};

export default function BorrowModal({ toy, onClose, onBorrow }: Props) {
  const router = useRouter();
  const { user } = useUser();
  const [period, setPeriod] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const unavailable = toy.status !== "available";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function borrow() {
    if (!user) {
      router.push("/login");
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/toys/${toy.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "processing", lendingDays: Number(period) }),
    }).catch(() => null);
    setSubmitting(false);

    if (!res) return setError("Couldn’t reach the server. Please check your connection and try again.");

    if (res.ok) return onBorrow();
    if (res.status === 401) return router.push("/login");

    // Nothing was saved; show why.
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setError(data.error ?? "Something went wrong. Please try again.");
  }

  let message = "Borrow the toy, and we will contact you on details after";
  if (unavailable) message = "This toy is currently lent out and unavailable to borrow.";
  else if (error) message = error;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-info">
          <p className="modal-eyebrow">Request for</p>
          <h2>{toy.name}</h2>
          <StatusBadge kind={toy.status} />

          <dl className="modal-details">
            <dt>Toy Features</dt>
            <dd>{toy.features}</dd>
            <dt>Lending Period</dt>
            <dd>
              <select
                className="select-time"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="" disabled>
                  Select Time
                </option>
                <option value="7">7 days</option>
                <option value="10">10 days</option>
                <option value="14">14 days</option>
              </select>
            </dd>
          </dl>

          <p className="modal-message pb-6">{message}</p>
          <div className="modal-actions">
            <button
              className="btn btn-primary btn-pill"
              onClick={borrow}
              disabled={unavailable || !period || submitting}
            >
              {unavailable ? "Unavailable" : submitting ? "Borrowing…" : "Borrow"}
            </button>
            <a
              className="btn btn-outline btn-pill"
              href="mailto:assistivetech@cornell.edu"
            >
              Contact Team
            </a>
          </div>
        </div>
        <div className="modal-image">
          {toy.image && <img src={toy.image} alt={toy.name} />}
        </div>
      </div>
    </div>
  );
}

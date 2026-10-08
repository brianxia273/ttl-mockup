import { useEffect, useState } from "react";
import type { Toy } from "../data/toys";
import StatusBadge from "./StatusBadge";

type Props = {
  toy: Toy;
  onClose: () => void;
  onBorrow: () => void;
};

export default function BorrowModal({ toy, onClose, onBorrow }: Props) {
  const [period, setPeriod] = useState("");
  const reserved = toy.status === "reserved";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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

          <p className="modal-message pb-6">
            {reserved
              ? "This toy is currently lent out and unavailable to borrow."
              : "Borrow the toy, and we will contact you on details after"}
          </p>
          <div className="modal-actions">
            <button
              className="btn btn-primary btn-pill"
              onClick={onBorrow}
              disabled={reserved}
            >
              {reserved ? "Unavailable" : "Borrow"}
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

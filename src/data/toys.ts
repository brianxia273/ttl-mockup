// Shared types for toys and loans, plus helpers that convert database rows.

export type ToyStatus = "available" | "processing" | "reserved";

export type Toy = {
  id: number;
  name: string;
  type: string;
  description: string;
  whoFor: string;
  features: string;
  lendingDays: number;
  status: ToyStatus;
  image?: string;
  // True if the logged-in user has requested or borrowed this toy
  reservedByMe?: boolean;
};

// A row of the `toys` table, as Supabase returns it.
export type ToyRow = {
  id: number;
  name: string;
  type: string;
  description: string;
  who_for: string;
  features: string;
  lending_days: number;
  image_url: string | null;
  status: ToyStatus;
};

export function toToy(row: ToyRow): Toy {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    description: row.description,
    whoFor: row.who_for,
    features: row.features,
    lendingDays: row.lending_days,
    status: row.status,
    image: row.image_url ?? undefined,
  };
}

export type ReservationStatus = "processing" | "approved" | "returned";

// What GET /api/users/[userId]/toys returns for each reservation.
export type Reservation = {
  id: number;
  status: ReservationStatus;
  lendingDays: number;
  requestedAt: string;
  dueDate: string | null;
  toy: Toy;
};

// A row of `reservations` joined with its toy.
export type ReservationRow = {
  id: number;
  status: ReservationStatus;
  lending_days: number;
  requested_at: string;
  due_date: string | null;
  toys: ToyRow;
};

export function toReservation(row: ReservationRow): Reservation {
  return {
    id: row.id,
    status: row.status,
    lendingDays: row.lending_days,
    requestedAt: row.requested_at,
    dueDate: row.due_date,
    toy: toToy(row.toys),
  };
}

export type LoanStatus = "processing" | "approved" | "overdue";

// What a card on the My Toys page shows.
export type Loan = {
  id: number;
  name: string;
  status: LoanStatus;
  dateLine: string;
  hint: string;
  image?: string;
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// "2026-10-15" -> local Date at midnight
const parseDay = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function toLoan(r: Reservation): Loan {
  const base = { id: r.id, name: r.toy.name, image: r.toy.image };

  if (r.status === "processing" || !r.dueDate) {
    return {
      ...base,
      status: "processing",
      dateLine: `Requested ${formatDate(new Date(r.requestedAt))}`,
      hint: "We’ll email you when it’s approved.",
    };
  }

  const due = parseDay(r.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((due.getTime() - today.getTime()) / MS_PER_DAY);

  if (daysLeft < 0) {
    return {
      ...base,
      status: "overdue",
      dateLine: `Planned return ${formatDate(due)}`,
      hint: "Let the team know if you’d like to keep it longer.",
    };
  }

  return {
    ...base,
    status: "approved",
    dateLine: `Due ${formatDate(due)}`,
    hint: `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`,
  };
}

// What GET /api/notifications returns.
export type Notification = {
  id: number;
  kind: "approved" | "rejected";
  toyName: string;
  dueDate: string | null;
};

export function notificationText(n: Notification): string {
  if (n.kind === "approved") {
    const due = n.dueDate ? ` Please return it by ${formatDate(parseDay(n.dueDate))}.` : "";
    return `Your request was approved! A team member will reach out about pickup.${due}`;
  }
  return "Sorry, your request wasn’t approved this time. Contact the team if you have any questions.";
}

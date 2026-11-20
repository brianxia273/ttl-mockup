import { createAdminClient } from "@/lib/supabase/admin";
import { verifyApproval, type ApprovalAction } from "@/lib/approval";

// Approve/reject links from the reservation email.
//   GET  -> shows a confirm page (email scanners may open links, so GET changes nothing)
//   POST -> actually approves or rejects

type Params = { params: Promise<{ id: string; action: string }> };

type Checked = { ok: true; id: number; action: ApprovalAction; token: string } | { ok: false; page: Response };

async function check(request: Request, { params }: Params): Promise<Checked> {
  const { id, action } = await params;
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const reservationId = Number(id);

  if (action !== "approve" && action !== "reject") {
    return { ok: false, page: page("Not found", "This link is not valid.", 404) };
  }
  if (!Number.isInteger(reservationId) || !verifyApproval(reservationId, action, token)) {
    return { ok: false, page: page("Invalid link", "This approval link is not valid.", 403) };
  }
  return { ok: true, id: reservationId, action, token };
}

export async function GET(request: Request, ctx: Params) {
  const c = await check(request, ctx);
  if (!c.ok) return c.page;

  const reservation = await getReservation(c.id);
  if (!reservation) return page("Not found", "This reservation no longer exists.", 404);
  if (reservation.status !== "processing") {
    return page("Already handled", `This reservation is already ${reservation.status}.`);
  }

  const verb = c.action === "approve" ? "Approve" : "Reject";
  return page(
    `${verb} request?`,
    `${reservation.userEmail} wants <strong>${escape(reservation.toyName)}</strong> for ${reservation.lendingDays} days.`,
    200,
    `<form method="post" action="?token=${c.token}"><button type="submit">${verb}</button></form>`,
  );
}

export async function POST(request: Request, ctx: Params) {
  const c = await check(request, ctx);
  if (!c.ok) return c.page;

  const reservation = await getReservation(c.id);
  if (!reservation) return page("Not found", "This reservation no longer exists.", 404);
  if (reservation.status !== "processing") {
    return page("Already handled", `This reservation is already ${reservation.status}.`);
  }

  // Each function is one transaction (supabase/functions.sql).
  const admin = createAdminClient();

  if (c.action === "approve") {
    const { data: dueDate, error } = await admin.rpc("approve_reservation", { p_reservation_id: c.id });
    if (error) return failed(error.message);
    return page("Approved", `${escape(reservation.toyName)} is approved. Due back ${dueDate as string}.`);
  }

  const { error } = await admin.rpc("reject_reservation", { p_reservation_id: c.id });
  if (error) return failed(error.message);
  return page("Rejected", `The request for ${escape(reservation.toyName)} was rejected. The toy is available again.`);
}

function failed(message: string) {
  if (message.includes("RESERVATION_NOT_PENDING")) {
    return page("Already handled", "This reservation was already handled.");
  }
  console.error("Approval failed:", message);
  return page("Something went wrong", "Nothing was changed. Please try again.", 500);
}

type ReservationInfo = {
  status: string;
  lendingDays: number;
  toyId: number;
  toyName: string;
  userEmail: string;
};

async function getReservation(id: number): Promise<ReservationInfo | null> {
  const { data } = await createAdminClient()
    .from("reservations")
    .select("status, lending_days, toy_id, toys(name), users(email)")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;

  const row = data as unknown as {
    status: string;
    lending_days: number;
    toy_id: number;
    toys: { name: string };
    users: { email: string };
  };
  return {
    status: row.status,
    lendingDays: row.lending_days,
    toyId: row.toy_id,
    toyName: row.toys.name,
    userEmail: row.users.email,
  };
}

function escape(text: string) {
  return text.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
}

// Small standalone HTML page in the site's colors.
function page(title: string, body: string, status = 200, extra = "") {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  body { margin: 0; font-family: system-ui, sans-serif; background: #fff1f1; color: #1e1e1e;
         min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 24px; }
  h1 { color: #d42a32; font-weight: 500; font-size: 40px; margin: 0 0 16px; }
  p { font-size: 18px; margin: 0 0 24px; }
  button { font: inherit; background: #d42a32; color: #fff; border: none; border-radius: 9999px; padding: 10px 40px; cursor: pointer; }
  button:hover { background: #b3242b; }
</style></head>
<body><main><h1>${title}</h1><p>${body}</p>${extra}</main></body></html>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

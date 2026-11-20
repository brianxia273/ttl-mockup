import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendReservationEmail } from "@/lib/email";

type PatchBody = {
  status?: unknown;
  lendingDays?: unknown;
};

type ReserveResult = { reservation_id: number; toy_name: string; lending_days: number };

// PATCH /api/toys/:id
//   { status: "processing", lendingDays: 7 } -> request to borrow the toy
//   { status: "available" }                  -> cancel your pending request
//
// DB changes run in Postgres functions (supabase/functions.sql), so each is one transaction.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const toyId = Number((await params).id);
  if (!Number.isInteger(toyId)) return NextResponse.json({ error: "Invalid toy id" }, { status: 400 });

  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as PatchBody;

  if (body.status === "processing") return reserve(toyId, user.id, user.email ?? "unknown", body.lendingDays);
  if (body.status === "available") return cancel(toyId, user.id);

  return NextResponse.json({ error: "status must be 'processing' or 'available'" }, { status: 400 });
}

async function reserve(toyId: number, userId: string, userEmail: string, lendingDays: unknown) {
  const admin = createAdminClient();
  const days =
    typeof lendingDays === "number" && Number.isInteger(lendingDays) && lendingDays > 0 && lendingDays <= 60
      ? lendingDays
      : null; // null -> use the toy's default

  // 1. Toy -> processing + new reservation, in one transaction.
  const { data, error } = await admin
    .rpc("reserve_toy", { p_user_id: userId, p_toy_id: toyId, p_lending_days: days })
    .single();

  if (error) {
    if (error.message.includes("TOY_NOT_AVAILABLE")) {
      return NextResponse.json({ error: "Sorry, this toy is no longer available." }, { status: 409 });
    }
    console.error("reserve_toy failed:", error);
    return NextResponse.json({ error: "Could not reserve the toy. Please try again." }, { status: 500 });
  }

  const r = data as ReserveResult;

  // 2. Email the team. If it fails, undo step 1 so the toy isn't stuck.
  try {
    await sendReservationEmail({
      reservationId: r.reservation_id,
      userEmail,
      toyId,
      toyName: r.toy_name,
      lendingDays: r.lending_days,
    });
  } catch (e) {
    console.error("Failed to send reservation email, rolling back:", e);
    const { error: undoError } = await admin.rpc("cancel_reservation", { p_reservation_id: r.reservation_id });
    if (undoError) console.error(`Rollback failed for reservation ${r.reservation_id}:`, undoError);
    return NextResponse.json(
      { error: "We couldn’t send your request, so it wasn’t saved. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ reservationId: r.reservation_id });
}

async function cancel(toyId: number, userId: string) {
  const admin = createAdminClient();

  const { data: pending, error } = await admin
    .from("reservations")
    .select("id")
    .eq("toy_id", toyId)
    .eq("user_id", userId)
    .eq("status", "processing")
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Could not cancel. Please try again." }, { status: 500 });
  if (!pending) return NextResponse.json({ error: "No pending request for this toy" }, { status: 404 });

  // Delete reservation + toy -> available, in one transaction.
  const { error: cancelError } = await admin.rpc("cancel_reservation", {
    p_reservation_id: (pending as { id: number }).id,
  });

  if (cancelError) {
    if (cancelError.message.includes("RESERVATION_NOT_PENDING")) {
      return NextResponse.json({ error: "This request was already handled." }, { status: 409 });
    }
    console.error("cancel_reservation failed:", cancelError);
    return NextResponse.json({ error: "Could not cancel. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

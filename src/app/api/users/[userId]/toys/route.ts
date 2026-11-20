import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { toReservation, type ReservationRow } from "@/data/toys";

// GET /api/users/:userId/toys -> the user's current reservations (with toy info)
export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  if (user.id !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await createAdminClient()
    .from("reservations")
    .select("id, status, lending_days, requested_at, due_date, toys(*)")
    .eq("user_id", userId)
    .neq("status", "returned")
    .order("requested_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json((data as unknown as ReservationRow[]).map(toReservation));
}

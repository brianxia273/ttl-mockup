import { NextResponse, type NextRequest } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { toToy, type ToyRow } from "@/data/toys";

// GET /api/toys                  -> all toys
// GET /api/toys?status=available -> only toys with that status
// Each toy has reservedByMe = true if the logged-in user requested/borrowed it.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const status = request.nextUrl.searchParams.get("status");

  let query = supabase.from("toys").select("*").order("type").order("id");
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Toy ids the current user has a pending or approved reservation for.
  const myToyIds = new Set<number>();
  const user = await getUser();
  if (user) {
    const { data: mine } = await createAdminClient()
      .from("reservations")
      .select("toy_id")
      .eq("user_id", user.id)
      .in("status", ["processing", "approved"]);
    (mine as { toy_id: number }[] | null)?.forEach((r) => myToyIds.add(r.toy_id));
  }

  const toys = (data as ToyRow[]).map((row) => ({ ...toToy(row), reservedByMe: myToyIds.has(row.id) }));
  return NextResponse.json(toys);
}

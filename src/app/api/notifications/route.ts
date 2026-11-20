import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Notification } from "@/data/toys";

type NotificationRow = {
  id: number;
  kind: Notification["kind"];
  toy_name: string;
  due_date: string | null;
};

// GET /api/notifications -> the logged-in user's notifications they haven't dismissed
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { data, error } = await createAdminClient()
    .from("notifications")
    .select("id, kind, toy_name, due_date")
    .eq("user_id", user.id)
    .is("seen_at", null)
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const notifications: Notification[] = (data as NotificationRow[]).map((n) => ({
    id: n.id,
    kind: n.kind,
    toyName: n.toy_name,
    dueDate: n.due_date,
  }));
  return NextResponse.json(notifications);
}

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("content_agent_app_users")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return NextResponse.json({ users: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { userId, status, role } = body;
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const supabase = createServerClient();
    const updates: Record<string, string> = { updated_at: new Date().toISOString() };
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      updates.status = status;
    }
    if (role && ["admin", "user"].includes(role)) {
      updates.role = role;
    }

    const { error } = await supabase
      .from("content_agent_app_users")
      .update(updates)
      .eq("id", userId);

    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("id");

  if (!userId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const supabase = createServerClient();
    const { error } = await supabase
      .from("content_agent_app_users")
      .delete()
      .eq("id", userId);

    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

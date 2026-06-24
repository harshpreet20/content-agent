import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { authUserId, email } = body;
  if (!authUserId || !email) {
    return NextResponse.json({ error: "authUserId and email are required" }, { status: 400 });
  }

  try {
    const supabase = createServerClient();

    const { data: existing } = await supabase
      .from("content_agent_app_users")
      .select("*")
      .eq("auth_user_id", authUserId)
      .single();

    if (existing) {
      return NextResponse.json({
        role: existing.role,
        status: existing.status,
        userId: existing.id,
      });
    }

    const { data: newUser, error } = await supabase
      .from("content_agent_app_users")
      .insert({
        auth_user_id: authUserId,
        email,
        role: "user",
        status: "pending",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({
      role: newUser.role,
      status: newUser.status,
      userId: newUser.id,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

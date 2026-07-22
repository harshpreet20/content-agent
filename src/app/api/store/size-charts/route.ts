import { NextResponse } from "next/server";
import { authedClient, getBearer } from "@/lib/supabase-authed";

export const dynamic = "force-dynamic";

const FIELDS = ["name", "slug", "sizes", "nominal", "rows", "active", "sort_order"] as const;

function pick(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const f of FIELDS) {
    if (f in body) out[f] = body[f];
  }
  return out;
}

/** GET /api/store/size-charts — full list incl. inactive (staff only). */
export async function GET(request: Request) {
  const token = getBearer(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = authedClient(token);
  const { data, error } = await supabase
    .from("size_charts")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 403 });
  return NextResponse.json({ sizeCharts: data || [] });
}

/** POST /api/store/size-charts — create a size chart. */
export async function POST(request: Request) {
  const token = getBearer(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const row = pick(body);
  if (!row.name || !row.slug) {
    return NextResponse.json({ error: "name and slug are required" }, { status: 400 });
  }

  const supabase = authedClient(token);
  const { data, error } = await supabase.from("size_charts").insert(row).select("*").maybeSingle();

  if (error) {
    const conflict = error.code === "23505";
    return NextResponse.json(
      { error: conflict ? "A size chart with that slug already exists." : error.message },
      { status: conflict ? 409 : 403 },
    );
  }
  return NextResponse.json({ ok: true, sizeChart: data });
}

/** PATCH /api/store/size-charts — update a size chart by id. */
export async function PATCH(request: Request) {
  const token = getBearer(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = body.id;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const supabase = authedClient(token);
  const { data, error } = await supabase
    .from("size_charts")
    .update(pick(body))
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 403 });
  if (!data) return NextResponse.json({ error: "Size chart not found" }, { status: 404 });
  return NextResponse.json({ ok: true, sizeChart: data });
}

/** DELETE /api/store/size-charts?id=... */
export async function DELETE(request: Request) {
  const token = getBearer(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = authedClient(token);
  const { error } = await supabase.from("size_charts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 403 });
  return NextResponse.json({ ok: true });
}

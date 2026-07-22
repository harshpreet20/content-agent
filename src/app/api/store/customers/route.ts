import { NextResponse } from "next/server";
import { authedClient, getBearer } from "@/lib/supabase-authed";

export const dynamic = "force-dynamic";

/**
 * GET /api/store/customers — order-derived customers merged with manually
 * imported ones (e.g. OCR'd from a photo), deduped by phone. Staff only.
 */
export async function GET(request: Request) {
  const token = getBearer(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = authedClient(token);
  const [{ data: ordered, error }, { data: manual }] = await Promise.all([
    supabase.from("customers_view").select("*").order("last_order_at", { ascending: false }),
    supabase.from("manual_customers").select("*").order("created_at", { ascending: false }),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 403 });

  const byPhone = new Map<string, Record<string, unknown>>();
  for (const c of ordered || []) byPhone.set(c.phone, c);
  for (const m of manual || []) {
    if (byPhone.has(m.phone)) continue; // an actual order already covers this customer
    byPhone.set(m.phone, {
      phone: m.phone,
      name: m.name,
      email: m.email,
      address: m.address,
      order_count: 0,
      lifetime_spend: 0,
      last_order_at: m.created_at,
      first_order_at: m.created_at,
      imported: true,
    });
  }

  return NextResponse.json({ customers: Array.from(byPhone.values()) });
}

type ImportRow = { phone: string; name?: string; email?: string; address?: string };

/** POST /api/store/customers — bulk-import customers (e.g. from an OCR'd photo). Staff only. */
export async function POST(request: Request) {
  const token = getBearer(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const rows: ImportRow[] = Array.isArray(body?.customers) ? body.customers : [];
  const clean = rows
    .map((r) => ({
      phone: (r.phone || "").trim(),
      name: (r.name || "").trim() || null,
      email: (r.email || "").trim() || null,
      address: (r.address || "").trim() || null,
      source: "ocr_import",
    }))
    .filter((r) => r.phone.length >= 6);

  if (!clean.length) return NextResponse.json({ error: "No rows with a valid phone number" }, { status: 400 });

  const supabase = authedClient(token);
  const { data, error } = await supabase
    .from("manual_customers")
    .upsert(clean, { onConflict: "phone", ignoreDuplicates: true })
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 403 });
  return NextResponse.json({ imported: data?.length || 0 });
}

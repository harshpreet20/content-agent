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
  const [
    { data: ordered, error: orderedError },
    { data: manual, error: manualError },
  ] = await Promise.all([
    supabase.from("customers_view").select("*").order("last_order_at", { ascending: false }),
    supabase.from("manual_customers").select("*").order("created_at", { ascending: false }),
  ]);

  const error = orderedError ?? manualError;
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

/** POST /api/store/customers — bulk-import customers (e.g. from an OCR'd photo). Staff only. */
export async function POST(request: Request) {
  const token = getBearer(request);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const rows: unknown[] = Array.isArray(body?.customers) ? body.customers : [];
  const clean = rows
    .flatMap((row) => {
      if (!row || typeof row !== "object") return [];
      const r = row as Record<string, unknown>;
      if (typeof r.phone !== "string") return [];
      return [{
        phone: r.phone.trim(),
        name: typeof r.name === "string" ? r.name.trim() || null : null,
        email: typeof r.email === "string" ? r.email.trim() || null : null,
        address: typeof r.address === "string" ? r.address.trim() || null : null,
        source: "ocr_import",
      }];
    })
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

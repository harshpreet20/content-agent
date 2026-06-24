import { NextResponse } from "next/server";
import { getDemographics } from "@/lib/instagram";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const raw = await getDemographics();

    const result: Record<string, any> = {};
    for (const item of raw) {
      const breakdown = item.total_value?.breakdowns?.[0];
      if (!breakdown) continue;

      const dimension = breakdown.dimension_keys?.[0] || item.name;
      const values = breakdown.results || [];
      result[`${item.name}_${dimension}`] = values.map((v: any) => ({
        label: v.dimension_values?.[0] || "unknown",
        value: v.value || 0,
      }));
    }

    return NextResponse.json({ demographics: result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

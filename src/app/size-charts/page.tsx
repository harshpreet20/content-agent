"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Sidebar from "@/components/Sidebar";

interface SizeChartRow {
  label: string;
  values: (number | string)[];
}

interface SizeChart {
  id: string;
  name: string;
  slug: string;
  sizes: string[];
  nominal: number[];
  rows: SizeChartRow[];
  active: boolean;
  sort_order: number;
}

type Draft = Partial<SizeChart> & {
  sizesText?: string;
  nominalText?: string;
  rowsJson?: string;
};

const EXAMPLE_ROWS: SizeChartRow[] = [
  { label: "Chest", values: [33, 35, 37, 39, 41] },
  { label: "Length", values: [24.5, 25.5, 26.5, 27.5, 28.5] },
];

const emptyDraft: Draft = {
  name: "",
  slug: "",
  sizesText: "S, M, L, XL",
  nominalText: "",
  rowsJson: JSON.stringify(EXAMPLE_ROWS, null, 2),
  active: true,
  sort_order: 0,
};

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function SizeChartsPage() {
  const { user, loading: authLoading, isStaff, session } = useAuth();
  const router = useRouter();
  const token = session?.access_token;

  const [charts, setCharts] = useState<SizeChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
    if (!authLoading && user && !isStaff) router.push("/");
  }, [user, authLoading, isStaff, router]);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/store/size-charts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setCharts(json.sizeCharts || []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isStaff && token) load();
  }, [isStaff, token, load]);

  function edit(c: SizeChart) {
    setError("");
    setDraft({
      ...c,
      sizesText: (c.sizes || []).join(", "),
      nominalText: (c.nominal || []).join(", "),
      rowsJson: JSON.stringify(c.rows || [], null, 2),
    });
  }

  async function save() {
    if (!draft) return;
    setError("");

    let rows: SizeChartRow[];
    try {
      rows = JSON.parse(draft.rowsJson || "[]");
      if (!Array.isArray(rows)) throw new Error();
    } catch {
      setError("Rows must be valid JSON: an array of { label, values } objects.");
      return;
    }

    const payload = {
      name: (draft.name || "").trim(),
      slug: (draft.slug || "").trim() || slugify(draft.name || ""),
      sizes: (draft.sizesText || "").split(",").map((s) => s.trim()).filter(Boolean),
      nominal: (draft.nominalText || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number)
        .filter((n) => !Number.isNaN(n)),
      rows,
      active: !!draft.active,
      sort_order: Number(draft.sort_order) || 0,
    };
    if (!payload.name || !payload.slug) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    try {
      const isNew = !draft.id;
      const res = await fetch("/api/store/size-charts", {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(isNew ? payload : { id: draft.id, ...payload }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Save failed");
        return;
      }
      setDraft(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: SizeChart) {
    if (!confirm(`Delete "${c.name}"? Products referencing this chart will just show one fewer chart.`)) return;
    await fetch(`/api/store/size-charts?id=${c.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setCharts((prev) => prev.filter((x) => x.id !== c.id));
  }

  if (authLoading || !isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const field = "w-full px-3 py-2 rounded-xl bg-white neu-input outline-none text-sm text-gray-800";
  const labelCls = "block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1";

  return (
    <div className="min-h-screen pt-16 md:pt-0 md:pl-64">
      <Sidebar active="/size-charts" />
      <main className="max-w-3xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">Size Charts</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Measurement tables shown on the storefront product page. Assign a chart to a product via its "Size chart(s)" field.
            </p>
          </div>
          <button
            onClick={() => { setError(""); setDraft({ ...emptyDraft }); }}
            className="px-4 py-2.5 text-sm font-bold rounded-xl bg-gray-900 text-white neu-btn shrink-0"
          >
            + New chart
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid gap-3">
            {charts.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl p-4 neu-card flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800 truncate">{c.name}</p>
                    {!c.active && <span className="text-[10px] font-bold text-gray-400 uppercase">Hidden</span>}
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {c.slug} · {(c.sizes || []).length} sizes · {(c.rows || []).length} measurement rows
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => edit(c)} className="px-3 py-2 text-xs font-bold rounded-xl text-gray-700 neu-btn">Edit</button>
                  <button onClick={() => remove(c)} className="px-3 py-2 text-xs font-bold rounded-xl text-red-500 neu-flat">Delete</button>
                </div>
              </div>
            ))}
            {charts.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center neu-pressed">
                <p className="text-gray-400 text-sm">No size charts yet. Add your first one.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDraft(null)} />
          <div className="relative w-full max-w-lg max-h-full bg-white rounded-3xl shadow-2xl overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-gray-900">{draft.id ? "Edit size chart" : "New size chart"}</h3>
              <button onClick={() => setDraft(null)} className="w-9 h-9 rounded-xl neu-btn text-gray-500">✕</button>
            </div>

            {error && <div className="mb-4 p-3 rounded-xl text-red-500 text-xs neu-pressed whitespace-pre-wrap">{error}</div>}

            <div className="grid gap-3">
              <div>
                <label className={labelCls}>Name</label>
                <input className={field} value={draft.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Jersey" />
              </div>
              <div>
                <label className={labelCls}>Slug (auto from name if blank)</label>
                <input className={field} value={draft.slug || ""} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} placeholder={slugify(draft.name || "") || "chart-slug"} />
              </div>
              <div>
                <label className={labelCls}>Sizes (comma separated, in order)</label>
                <input className={field} value={draft.sizesText || ""} onChange={(e) => setDraft({ ...draft, sizesText: e.target.value })} placeholder="XS, S, M, L, XL" />
              </div>
              <div>
                <label className={labelCls}>Nominal size numbers (optional, comma separated — must match Sizes count)</label>
                <input className={field} value={draft.nominalText || ""} onChange={(e) => setDraft({ ...draft, nominalText: e.target.value })} placeholder="34, 36, 38, 40, 42" />
              </div>
              <div>
                <label className={labelCls}>Rows (JSON — one object per measurement, values must match Sizes count)</label>
                <textarea
                  rows={8}
                  className={`${field} font-mono text-xs`}
                  value={draft.rowsJson || "[]"}
                  onChange={(e) => setDraft({ ...draft, rowsJson: e.target.value })}
                  spellCheck={false}
                />
              </div>
              <div>
                <label className={labelCls}>Sort order</label>
                <input type="number" className={field} value={draft.sort_order ?? 0} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={!!draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
                Active (visible in store)
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={save} disabled={saving} className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-bold neu-btn disabled:opacity-50">
                {saving ? "Saving…" : draft.id ? "Save changes" : "Create chart"}
              </button>
              <button onClick={() => setDraft(null)} className="px-5 py-3 rounded-xl text-gray-500 text-sm font-bold neu-flat">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

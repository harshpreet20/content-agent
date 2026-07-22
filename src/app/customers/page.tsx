"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Sidebar from "@/components/Sidebar";
import { recognizeText, parseCustomerList } from "@/lib/ocr";

interface Customer {
  phone: string;
  name: string | null;
  email: string | null;
  address: string | null;
  order_count: number;
  lifetime_spend: number | null;
  last_order_at: string;
  first_order_at: string;
  imported?: boolean;
}

interface ImportRow {
  phone: string;
  name: string;
}

const money = (n: number) => `₹${(n || 0).toLocaleString("en-IN")}`;

const AVATAR_GRADIENTS = [
  "from-violet-400 to-indigo-500",
  "from-rose-400 to-pink-500",
  "from-teal-400 to-cyan-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-green-500",
  "from-blue-400 to-sky-500",
];

function initials(name: string | null, phone: string) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
  }
  return phone.slice(-2);
}

export default function CustomersPage() {
  const { user, loading: authLoading, isStaff, session } = useAuth();
  const router = useRouter();
  const token = session?.access_token;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [scanning, setScanning] = useState(false);
  const [importRows, setImportRows] = useState<ImportRow[] | null>(null);
  const [importError, setImportError] = useState("");
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
    if (!authLoading && user && !isStaff) router.push("/");
  }, [user, authLoading, isStaff, router]);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/store/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setCustomers(json.customers || []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isStaff && token) load();
  }, [isStaff, token, load]);

  async function scanPhoto(file: File) {
    setScanning(true);
    setImportError("");
    try {
      const text = await recognizeText(file);
      const rows = parseCustomerList(text);
      if (!rows.length) {
        setImportError("Couldn't find any phone numbers in that photo — try a straighter, better-lit shot.");
        return;
      }
      setImportRows(rows);
    } catch {
      setImportError("OCR failed to run on that image. Try a different photo.");
    } finally {
      setScanning(false);
    }
  }

  async function confirmImport() {
    if (!importRows?.length) return;
    setImporting(true);
    try {
      const res = await fetch("/api/store/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ customers: importRows }),
      });
      const json = await res.json();
      if (!res.ok) {
        setImportError(json.error || "Import failed");
        return;
      }
      setImportRows(null);
      await load();
    } finally {
      setImporting(false);
    }
  }

  if (authLoading || !isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = customers.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  const totalSpend = customers.reduce((s, c) => s + (c.lifetime_spend || 0), 0);

  return (
    <div className="min-h-screen pt-16 md:pt-0 md:pl-64">
      <Sidebar active="/customers" />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900">Customers</h2>
          <p className="text-sm text-gray-400 mt-0.5">Derived from order history &mdash; no separate signup, just who's bought from the store.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50/70 rounded-2xl p-7 neu-card">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-4 bg-blue-100">👤</div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Customers</div>
            <div className="text-4xl font-extrabold text-gray-900">{customers.length}</div>
          </div>
          <div className="bg-emerald-50/70 rounded-2xl p-7 neu-card">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-4 bg-emerald-100">💰</div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Lifetime Revenue</div>
            <div className="text-4xl font-extrabold text-gray-900">{money(totalSpend)}</div>
          </div>
          <div className="bg-pink-50/70 rounded-2xl p-7 neu-card">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-4 bg-pink-100">🔁</div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Repeat Customers</div>
            <div className="text-4xl font-extrabold text-gray-900">{customers.filter((c) => c.order_count > 1).length}</div>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or email"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white neu-input outline-none text-sm text-gray-800"
          />
          <label className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white neu-btn text-sm font-bold text-gray-700 cursor-pointer">
            {scanning ? (
              <>
                <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                Reading…
              </>
            ) : (
              <>📷 Import from photo</>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={scanning}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) scanPhoto(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {importError && !importRows && (
          <div className="mb-4 p-3 rounded-xl text-red-500 text-xs neu-pressed whitespace-pre-wrap">{importError}</div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center neu-pressed">
            <p className="text-gray-400 text-sm">No customers yet.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((c, i) => (
              <div key={c.phone} className="bg-white rounded-2xl p-4 neu-card flex items-center gap-4">
                <div
                  className={`w-11 h-11 rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]} flex items-center justify-center text-white font-bold text-sm shrink-0 neu-raised-sm`}
                >
                  {initials(c.name, c.phone)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm truncate">{c.name || "Unnamed customer"}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {c.phone}
                    {c.email ? ` · ${c.email}` : ""}
                  </p>
                </div>
                {c.imported && (
                  <span className="hidden sm:inline-flex items-center text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-violet-50 text-violet-600 shrink-0">
                    Imported
                  </span>
                )}
                {c.order_count > 1 && (
                  <span className="hidden sm:inline-flex items-center text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-pink-50 text-pink-600 shrink-0">
                    Repeat
                  </span>
                )}
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-gray-900">{money(c.lifetime_spend || 0)}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide">{c.order_count} order{c.order_count === 1 ? "" : "s"}</div>
                </div>
                <div className="hidden md:block text-right text-xs text-gray-400 shrink-0 w-24">
                  {new Date(c.last_order_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {importRows && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setImportRows(null)} />
          <div className="relative w-full max-w-lg max-h-full bg-white rounded-3xl shadow-2xl overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-gray-900">Review scanned customers</h3>
              <button onClick={() => setImportRows(null)} className="w-9 h-9 rounded-xl neu-btn text-gray-500">✕</button>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              OCR found {importRows.length} row{importRows.length === 1 ? "" : "s"}. Fix anything wrong before importing — rows with an existing order are skipped automatically.
            </p>
            {importError && <div className="mb-4 p-3 rounded-xl text-red-500 text-xs neu-pressed whitespace-pre-wrap">{importError}</div>}
            <div className="grid gap-2 max-h-80 overflow-y-auto pr-1">
              {importRows.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="flex-1 px-3 py-2 rounded-xl bg-white neu-input outline-none text-sm text-gray-800"
                    value={r.name}
                    placeholder="Name"
                    onChange={(e) => setImportRows((rows) => rows!.map((row, ri) => (ri === i ? { ...row, name: e.target.value } : row)))}
                  />
                  <input
                    className="w-40 px-3 py-2 rounded-xl bg-white neu-input outline-none text-sm text-gray-800"
                    value={r.phone}
                    placeholder="Phone"
                    onChange={(e) => setImportRows((rows) => rows!.map((row, ri) => (ri === i ? { ...row, phone: e.target.value } : row)))}
                  />
                  <button
                    onClick={() => setImportRows((rows) => rows!.filter((_, ri) => ri !== i))}
                    className="px-3 rounded-xl text-red-500 neu-flat text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={confirmImport} disabled={importing || !importRows.length} className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-bold neu-btn disabled:opacity-50">
                {importing ? "Importing…" : `Import ${importRows.length} customer${importRows.length === 1 ? "" : "s"}`}
              </button>
              <button onClick={() => setImportRows(null)} className="px-5 py-3 rounded-xl text-gray-500 text-sm font-bold neu-flat">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

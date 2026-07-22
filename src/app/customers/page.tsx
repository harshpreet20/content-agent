"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Sidebar from "@/components/Sidebar";

interface Customer {
  phone: string;
  name: string | null;
  email: string | null;
  address: string | null;
  order_count: number;
  lifetime_spend: number | null;
  last_order_at: string;
  first_order_at: string;
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

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or email"
          className="w-full mb-4 px-3.5 py-2.5 rounded-xl bg-white neu-input outline-none text-sm text-gray-800"
        />

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
    </div>
  );
}

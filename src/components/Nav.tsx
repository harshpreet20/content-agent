"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/sponsor", label: "Sponsor" },
  { href: "/reports", label: "Reports" },
  { href: "/analytics", label: "Analytics" },
  { href: "/reviews", label: "Reviews" },
];

const STAFF_LINKS = [
  { href: "/orders", label: "Orders" },
  { href: "/products", label: "Store" },
];

export default function Nav({ active }: { active: string }) {
  const { user, isAdmin, isStaff, signOut, loading } = useAuth();

  return (
    <nav className="bg-[#e0e5ec] neu-nav sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-5 h-20 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/rcc-crest.webp"
              alt="RCC"
              className="w-[64px] h-[64px] rounded-full object-cover ring-[3px] ring-[#e0e5ec]"
              style={{
                boxShadow: "4px 4px 8px #b8bec7, -4px -4px 8px #ffffff, 0 4px 14px rgba(139,92,246,0.12)",
                transform: "translateY(2px) scale(1.05)",
              }}
            />
            <span className="text-lg font-extrabold bg-gradient-to-r from-amber-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">
              ContentAgent
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-all ${
                  active === link.href
                    ? "text-gray-700 neu-pressed"
                    : "text-gray-400 hover:text-gray-600 neu-flat"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isStaff &&
              STAFF_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-all ${
                    active === link.href
                      ? "text-emerald-700 neu-pressed"
                      : "text-emerald-600 hover:text-emerald-800 neu-flat"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-all ${
                  active === "/admin"
                    ? "text-violet-700 neu-pressed"
                    : "text-violet-500 hover:text-violet-700 neu-flat"
                }`}
              >
                Admin
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <span className="hidden sm:block text-xs text-gray-400 font-medium truncate max-w-[180px]">
                {user.email}
              </span>
              {!loading && (
                <button
                  onClick={signOut}
                  className="text-xs text-gray-400 hover:text-gray-600 font-medium transition"
                >
                  Sign out
                </button>
              )}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 via-pink-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold neu-raised-sm">
                {user.email?.[0].toUpperCase() || "U"}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

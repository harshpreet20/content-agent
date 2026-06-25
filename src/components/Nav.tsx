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

export default function Nav({ active }: { active: string }) {
  const { user, isAdmin, signOut, loading } = useAuth();

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-5 h-20 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/rcc-crest.webp"
              alt="RCC"
              className="w-[64px] h-[64px] rounded-full object-cover ring-[3px] ring-white"
              style={{
                boxShadow: "0 4px 14px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1), 0 8px 24px rgba(139,92,246,0.12)",
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
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                  active === link.href
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                  active === "/admin"
                    ? "text-gray-900 bg-gray-100"
                    : "text-violet-500 hover:text-violet-700 hover:bg-violet-50"
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 via-pink-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user.email?.[0].toUpperCase() || "U"}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

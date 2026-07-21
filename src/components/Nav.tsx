"use client";

import { useState } from "react";
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
  { href: "/insights", label: "Insights" },
];

export default function Nav({ active }: { active: string }) {
  const { user, isAdmin, isStaff, signOut, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const allLinks = [
    ...NAV_LINKS.map((l) => ({ ...l, tone: "gray" as const })),
    ...(isStaff ? STAFF_LINKS.map((l) => ({ ...l, tone: "emerald" as const })) : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin", tone: "violet" as const }] : []),
  ];

  const toneClasses = {
    gray: { active: "text-gray-700 neu-pressed", inactive: "text-gray-400 hover:text-gray-600 neu-flat" },
    emerald: { active: "text-emerald-700 neu-pressed", inactive: "text-emerald-600 hover:text-emerald-800 neu-flat" },
    violet: { active: "text-violet-700 neu-pressed", inactive: "text-violet-500 hover:text-violet-700 neu-flat" },
  };

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
            {allLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-all ${
                  active === link.href ? toneClasses[link.tone].active : toneClasses[link.tone].inactive
                }`}
              >
                {link.label}
              </Link>
            ))}
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
                  className="hidden sm:block text-xs text-gray-400 hover:text-gray-600 font-medium transition"
                >
                  Sign out
                </button>
              )}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 via-pink-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold neu-raised-sm">
                {user.email?.[0].toUpperCase() || "U"}
              </div>
            </>
          )}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="sm:hidden w-9 h-9 rounded-xl flex items-center justify-center neu-btn text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden px-5 pb-4 flex flex-col gap-1.5 border-t border-[#d0d5dc]">
          {allLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`px-3 py-2.5 mt-2 text-sm font-medium rounded-xl transition-all ${
                active === link.href ? toneClasses[link.tone].active : toneClasses[link.tone].inactive
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user && !loading && (
            <button
              onClick={() => {
                setMenuOpen(false);
                signOut();
              }}
              className="px-3 py-2.5 mt-2 text-sm font-medium text-left text-gray-400 hover:text-gray-600 rounded-xl neu-flat transition-all"
            >
              Sign out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

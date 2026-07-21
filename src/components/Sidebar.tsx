"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

type Tone = "gray" | "emerald" | "violet";
type LinkItem = { href: string; label: string };
type Section = { title: string; tone: Tone; links: LinkItem[] };

const toneClasses: Record<Tone, { active: string; inactive: string }> = {
  gray: { active: "text-gray-700 neu-pressed", inactive: "text-gray-400 hover:text-gray-600 neu-flat" },
  emerald: { active: "text-emerald-700 neu-pressed", inactive: "text-emerald-600 hover:text-emerald-800 neu-flat" },
  violet: { active: "text-violet-700 neu-pressed", inactive: "text-violet-500 hover:text-violet-700 neu-flat" },
};

function SidebarLinks({ sections, active, onNavigate }: { sections: Section[]; active: string; onNavigate?: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">{section.title}</p>
          <div className="flex flex-col gap-1">
            {section.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={`px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                  active === link.href ? toneClasses[section.tone].active : toneClasses[section.tone].inactive
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Sidebar({ active }: { active: string }) {
  const { user, isAdmin, isStaff, isContent, signOut, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const sections: Section[] = [
    ...(isContent
      ? [{ title: "Content AI", tone: "gray" as Tone, links: [
          { href: "/", label: "Dashboard" },
          { href: "/sponsor", label: "Sponsor" },
          { href: "/reports", label: "Reports" },
        ] }]
      : []),
    { title: "Performance", tone: "gray", links: [
      { href: "/analytics", label: "Analytics" },
      { href: "/reviews", label: "Reviews" },
    ] },
    ...(isStaff
      ? [{ title: "Commerce", tone: "emerald" as Tone, links: [
          { href: "/orders", label: "Orders" },
          { href: "/products", label: "Store" },
          { href: "/insights", label: "Insights" },
        ] }]
      : []),
    ...(isAdmin
      ? [{ title: "Super Admin", tone: "violet" as Tone, links: [
          { href: "/admin", label: "User Management" },
        ] }]
      : []),
  ];

  const Logo = (
    <Link href="/" className="flex items-center gap-3">
      <img
        src="/rcc-crest.webp"
        alt="RCC"
        className="w-12 h-12 rounded-full object-cover ring-[3px] ring-[#e0e5ec]"
        style={{ boxShadow: "4px 4px 8px #b8bec7, -4px -4px 8px #ffffff, 0 4px 14px rgba(139,92,246,0.12)" }}
      />
      <span className="text-lg font-extrabold bg-gradient-to-r from-amber-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">
        ContentAgent
      </span>
    </Link>
  );

  const UserFooter = user && (
    <div className="flex items-center gap-2.5 px-1">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 via-pink-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0 neu-raised-sm">
        {user.email?.[0].toUpperCase() || "U"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-600 truncate">{user.email}</p>
        {!loading && (
          <button onClick={signOut} className="text-[11px] text-gray-400 hover:text-gray-600 font-medium transition">
            Sign out
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 h-16 z-40 bg-[#e0e5ec] neu-nav flex items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/rcc-crest.webp" alt="RCC" className="w-9 h-9 rounded-full object-cover" />
          <span className="text-base font-extrabold bg-gradient-to-r from-amber-500 via-pink-500 to-violet-600 bg-clip-text text-transparent">
            ContentAgent
          </span>
        </Link>
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="w-9 h-9 rounded-xl flex items-center justify-center neu-btn text-gray-500"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 bg-[#e0e5ec] neu-nav p-5 z-30">
        <div className="mb-6">{Logo}</div>
        <div className="flex-1 overflow-y-auto">
          <SidebarLinks sections={sections} active={active} />
        </div>
        <div className="pt-4 mt-4 border-t border-[#d0d5dc]">{UserFooter}</div>
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMenuOpen(false)} />
          <div className="relative w-72 max-w-[80vw] h-full bg-[#e0e5ec] p-5 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              {Logo}
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="w-8 h-8 rounded-xl flex items-center justify-center neu-btn text-gray-500 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarLinks sections={sections} active={active} onNavigate={() => setMenuOpen(false)} />
            </div>
            <div className="pt-4 mt-4 border-t border-[#d0d5dc]">{UserFooter}</div>
          </div>
        </div>
      )}
    </>
  );
}

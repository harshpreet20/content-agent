"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { supabase, user, status } = useAuth();

  if (user && status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-5">
        <div className="w-full max-w-sm text-center">
          <img src="/rcc-crest.webp" alt="Racquets Club Community" className="w-20 h-20 rounded-full object-cover mx-auto mb-3 shadow-md" />
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-amber-500 via-pink-500 to-violet-600 bg-clip-text text-transparent mb-4">
            ContentAgent
          </h1>
          <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100 p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl">
              {"⏳"}
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Pending Approval</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Your account (<span className="font-medium text-gray-700">{user.email}</span>) is awaiting admin approval.
              You'll get access once an admin approves your request.
            </p>
            <button
              onClick={async () => {
                if (supabase) await supabase.auth.signOut();
                router.push("/login");
              }}
              className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user && status === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-5">
        <div className="w-full max-w-sm text-center">
          <img src="/rcc-crest.webp" alt="Racquets Club Community" className="w-20 h-20 rounded-full object-cover mx-auto mb-3 shadow-md" />
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-amber-500 via-pink-500 to-violet-600 bg-clip-text text-transparent mb-4">
            ContentAgent
          </h1>
          <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100 p-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-2xl flex items-center justify-center text-3xl">
              {"🚫"}
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Your access request has been declined. Contact an admin if you believe this is an error.
            </p>
            <button
              onClick={async () => {
                if (supabase) await supabase.auth.signOut();
                router.push("/login");
              }}
              className="text-xs font-semibold text-violet-600 hover:text-violet-800 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setError("Supabase not configured");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Account created! Check your email for the confirmation link.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push("/");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/rcc-crest.webp" alt="Racquets Club Community" className="w-20 h-20 rounded-full object-cover mx-auto mb-3 shadow-md" />
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-amber-500 via-pink-500 to-violet-600 bg-clip-text text-transparent mb-1">
            ContentAgent
          </h1>
          <p className="text-sm text-gray-400">
            {isSignUp ? "Create your account" : "Sign in to your dashboard"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition text-sm text-gray-900 placeholder:text-gray-300"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition text-sm text-gray-900 placeholder:text-gray-300"
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs">{error}</div>
          )}
          {message && (
            <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-green-600 text-xs">{message}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? "Loading..." : isSignUp ? "Request Access" : "Sign In"}
          </button>

          <p className="text-center text-xs text-gray-400 pt-1">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(""); setMessage(""); }}
              className="text-violet-600 font-semibold hover:underline"
            >
              {isSignUp ? "Sign In" : "Request Access"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

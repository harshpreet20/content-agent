"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  supabase: SupabaseClient | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  supabase: null,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function getClientSideSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [sb] = useState<SupabaseClient | null>(() => getClientSideSupabase());

  useEffect(() => {
    if (!sb) {
      setLoading(false);
      return;
    }

    sb.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [sb]);

  const signOut = async () => {
    if (sb) await sb.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, supabase: sb, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

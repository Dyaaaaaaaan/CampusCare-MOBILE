import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // 1. Rehydration: saat app dibuka, minta Supabase membaca token dari vault.
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setSession(data.session);
      })
      .catch((error: unknown) => {
        console.error("Gagal memulihkan sesi:", error);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    // 2. Live broadcaster: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, dst.
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        console.log("Auth Event Fired:", event);
        setSession(nextSession);
        setIsLoading(false);
      },
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    // Menghapus sesi di cloud sekaligus token terenkripsi di perangkat.
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Gagal sign out:", error.message);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ user: session?.user ?? null, session, isLoading, signOut }),
    [session, isLoading, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider.");
  }

  return context;
}

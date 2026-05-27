import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

// =========================
// AUTH CONTEXT
// =========================
// Eén bron van waarheid voor de huidige sessie + user.
// Subscribed op onAuthStateChange zodat alles automatisch reageert
// als iemand inlogt/uitlogt of een magic-link callback verwerkt wordt.

const AuthContext = createContext({
  session: null,
  user: null,
  loading: true,
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Initiële sessie ophalen — picked up automatisch als de magic-link
    // tokens nog in de URL-hash staan (Supabase SDK handelt dat af).
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session || null);
      setLoading(false);
    });

    // Subscribed op alle auth-events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, …)
    const { data: { subscription } = {} } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession || null);
        setLoading(false);
      }
    );

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user: session?.user || null,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook voor componenten — geeft { session, user, loading } terug. */
export function useAuth() {
  return useContext(AuthContext);
}

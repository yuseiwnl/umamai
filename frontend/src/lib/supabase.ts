import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase } from './supabase/client';

// Keeps the session up to date, otherwise may cause desync. DO NOT USE supabase.auth.getSession()
// Returns:
// - null if logged out
// - undefined if not checked yet
// - Session if logged in
export function useSupabaseSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined); 

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return session;
}

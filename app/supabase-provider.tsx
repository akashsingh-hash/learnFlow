"use client"

import { createContext, useContext, useState } from "react"
import { createBrowserClient, Session } from "@supabase/ssr"

const SupabaseContext = createContext<any>(null)

export function SupabaseProvider({ session, children }: { session: Session | null, children: React.ReactNode }) {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  )

  return (
    <SupabaseContext.Provider value={{ supabase, session }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  return useContext(SupabaseContext)
}

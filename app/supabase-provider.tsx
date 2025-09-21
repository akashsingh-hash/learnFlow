"use client"

import { createContext, useContext, useState } from "react"
import { Session } from "@supabase/supabase-js"
import { supabaseBrowser } from "@/lib/supabase-client"

const SupabaseContext = createContext<any>(null)

export function SupabaseProvider({ session, children }: { session: Session | null, children: React.ReactNode }) {
  const [supabase] = useState(() => supabaseBrowser())

  return (
    <SupabaseContext.Provider value={{ supabase, session }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  return useContext(SupabaseContext)
}

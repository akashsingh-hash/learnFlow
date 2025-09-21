import { createBrowserClient } from '@supabase/ssr'

// Singleton pattern (optional) to avoid creating multiple clients
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export const supabaseBrowser = () => {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,  // assert not null
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // assert not null
    )
  }
  return supabaseInstance;
}

import type React from "react"
import type { Metadata } from "next"
import { Orbitron } from "next/font/google"
import { Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { createClient } from "@/lib/supabase-server" // Correct import for server-side client
import { SupabaseProvider } from "./supabase-provider" // Correct import for client-side provider
import { Session } from "@supabase/supabase-js" // Import Session type

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

export const metadata: Metadata = {
  title: "StudyFlow - AI-Powered Student Productivity Platform",
  description: "Boost your learning with AI roadmaps, smart task management, and intelligent quiz generation",
  generator: "v0.app",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem
          fontSansVariable={poppins.variable}
          fontHeadingVariable={orbitron.variable}
        >
          <SupabaseProvider session={session}>
            <Suspense fallback={null}>{children}</Suspense>
          </SupabaseProvider>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}

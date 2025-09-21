"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { Zap, ArrowLeft, Mail, CheckCircle } from "lucide-react"
import Link from "next/link"
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    if (resetError) {
      setError(resetError.message)
      setIsLoading(false)
      return
    }

    setIsSubmitted(true)
    setIsLoading(false)
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Navigation */}
        <nav className="border-b border-border/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/login" className="flex items-center space-x-2 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <div className="w-8 h-8 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="font-heading text-xl font-bold">StudyFlow</span>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="shadow-lg">
              <CardHeader className="text-center space-y-2">
                {isSubmitted ? (
                  <>
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="font-heading text-2xl font-bold">Check Your Email</CardTitle>
                    <CardDescription className="text-pretty">
                      We've sent a password reset link to {email}
                    </CardDescription>
                  </>
                ) : (
                  <>
                    <CardTitle className="font-heading text-2xl font-bold">Reset Password</CardTitle>
                    <CardDescription className="text-pretty">
                      Enter your email address and we'll send you a link to reset your password
                    </CardDescription>
                  </>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {isSubmitted ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center text-pretty">
                      Didn't receive the email? Check your spam folder or try again.
                    </p>
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={() => {
                          setIsSubmitted(false)
                          setEmail("")
                          setError(null) // Clear error on retry
                        }}
                      >
                        Try Different Email
                      </Button>
                      <Button asChild className="w-full">
                        <Link href="/login">Back to Sign In</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Sending...</span>
                        </div>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>

                    <div className="text-center text-sm text-muted-foreground">
                      Remember your password?{" "}
                      <Link
                        href="/login"
                        className="text-secondary hover:text-secondary/80 font-medium transition-colors"
                      >
                        Sign in
                      </Link>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

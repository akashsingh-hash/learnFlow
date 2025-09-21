'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeProvider } from '@/components/theme-provider'
import { DashboardNav } from '@/components/dashboard-nav'
import { User as UserIcon, Mail, Calendar, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('full_name, username, avatar_url, member_since, learning_level')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error("Error fetching profile:", error)
          setError("Failed to load profile data.")
        } else {
          setProfile(profileData)
          setFullName(profileData.full_name || '')
          setUsername(profileData.username || '')
          setAvatarUrl(profileData.avatar_url || '')
        }
      }
      setLoading(false)
    }

    fetchUserData()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchUserData()
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!user) return

    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, username: username, avatar_url: avatarUrl })
      .eq('id', user.id)

    if (error) {
      console.error("Error updating profile:", error)
      setError("Failed to update profile.")
    } else {
      setSuccess("Profile updated successfully!")
      setEditMode(false)
      // Re-fetch to ensure UI is consistent
      const { data: updatedProfileData, error: fetchError } = await supabase
        .from('profiles')
        .select('full_name, username, avatar_url, member_since, learning_level')
        .eq('id', user.id)
        .single()
      
      if (!fetchError && updatedProfileData) {
        setProfile(updatedProfileData)
      }
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen bg-background flex flex-col">
          <DashboardNav />
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-muted-foreground">Loading profile...</p>
          </main>
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background flex flex-col">
        <DashboardNav />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-heading text-3xl font-bold text-balance">User Profile</h1>
              <p className="text-muted-foreground text-pretty">Manage your personal information and preferences</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Profile Details</CardTitle>
                <Button variant="outline" onClick={() => setEditMode(!editMode)}>
                  {editMode ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {error && <p className="text-red-500 text-center text-sm mb-4">{error}</p>}
              {success && <p className="text-green-500 text-center text-sm mb-4">{success}</p>}
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} alt={fullName || "User"} />
                    <AvatarFallback>{fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  {editMode && (
                    <div className="w-full max-w-xs">
                      <Label htmlFor="avatar-url" className="sr-only">Avatar URL</Label>
                      <Input
                        id="avatar-url"
                        type="url"
                        placeholder="Enter avatar URL"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={!editMode}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={!editMode}
                      placeholder="Your username"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email || ''} disabled type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <Input value={profile?.member_since ? new Date(profile.member_since).toLocaleDateString() : 'N/A'} disabled />
                  </div>
                </div>

                {editMode && (
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </ThemeProvider>
  )
}

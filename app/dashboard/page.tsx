"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeProvider } from "@/components/theme-provider"
import { DashboardNav } from "@/components/dashboard-nav"
import {
  Brain,
  Target,
  User,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  Calendar,
  Award,
  Zap,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { supabaseBrowser } from "@/lib/supabase-client"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("roadmap")
  const [roadmaps, setRoadmaps] = useState<any[]>([])
  const [userStats, setUserStats] = useState({
    totalRoadmaps: 0,
    completedTasks: 0,
    totalTasks: 0,
    studyStreak: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      const supabase = supabaseBrowser(); // Get the client-side Supabase instance
      const { data: { user: fetchedUser }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error fetching user:", userError);
      }
      console.log("Fetched User:", fetchedUser);
      setCurrentUser(fetchedUser)
      if (!fetchedUser) {
        console.log("No user fetched, returning from dashboard data fetch.");
        return
      }

      // Fetch Roadmaps
      const { data: roadmapsData, error: roadmapsError } = await supabase
        .from('roadmaps')
        .select(`
          id, title, description, progress, status, estimated_duration, created_at,
          roadmap_tags ( tags (name) )
        `)
        .eq('user_id', fetchedUser.id)
        .order('created_at', { ascending: false })

      if (roadmapsError) {
        console.error("Error fetching roadmaps:", roadmapsError)
      } else {
        console.log("Fetched Roadmaps:", roadmapsData);
        setRoadmaps(roadmapsData.map(roadmap => ({
          ...roadmap,
          timeLeft: roadmap.status === 'completed' ? "Completed" : roadmap.estimated_duration,
          tags: roadmap.roadmap_tags.map((rt: any) => rt.tags.name)
        })))
      }

      // Fetch User Tasks
      const { data: userTasksData, error: userTasksError } = await supabase
        .from('user_tasks')
        .select(`
          id, title, status, due_date, created_at, category, priority
        `)
        .eq('user_id', fetchedUser.id)
        .order('created_at', { ascending: false })

      let totalCompletedTasks = 0
      let totalUserTasks = 0
      if (userTasksError) {
        console.error("Error fetching user tasks:", userTasksError)
      } else {
        console.log("Fetched User Tasks:", userTasksData);
        totalUserTasks = userTasksData.length
        totalCompletedTasks = userTasksData.filter(task => task.status === 'completed').length
        // Filter for upcoming tasks (e.g., due today or this week)
        const now = new Date()
        const today = now.toISOString().split('T')[0]
        const endOfWeek = new Date(now.setDate(now.getDate() + 7)).toISOString().split('T')[0]

        setUpcomingTasks(userTasksData.filter(task => 
          task.status !== 'completed' && 
          task.due_date && 
          task.due_date >= today && 
          task.due_date <= endOfWeek
        ).slice(0, 3).map(task => ({ // Limit to 3 upcoming tasks for display
          title: task.title,
          dueDate: task.due_date === today ? "Today" : new Date(task.due_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          priority: task.priority,
        })))
      }

      // Fetch profile for member_since and calculate study streak (mock for now)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, member_since, learning_level, username') // Also fetch full_name for the welcome message
        .eq('id', fetchedUser.id)
        .single()
      
      let studyStreak = 0;
      if (profileError) {
        console.error("Error fetching profile for streak:", profileError)
      } else {
        console.log("Fetched Profile Data:", profileData);
        // Mock study streak for now, as it requires more complex logic (e.g., daily activity logging)
        studyStreak = 12; // Placeholder
        setProfile(profileData) // Set the profile data here
      }

      setUserStats({
        totalRoadmaps: roadmapsData?.length || 0,
        completedTasks: totalCompletedTasks,
        totalTasks: totalUserTasks,
        studyStreak: studyStreak,
      })

      // Construct Recent Activity
      const combinedActivity: any[] = []
      if (userTasksData) {
        userTasksData.slice(0, 5).forEach(task => {
          combinedActivity.push({ type: "task", title: task.title, time: new Date(task.created_at).toLocaleDateString(), status: task.status })
        })
      }
      if (roadmapsData) {
        roadmapsData.slice(0, 5).forEach(roadmap => {
          combinedActivity.push({ type: "roadmap", title: roadmap.title, time: new Date(roadmap.created_at).toLocaleDateString(), status: "created" })
        })
      }
      // Sort recent activity by time (most recent first)
      combinedActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      setRecentActivity(combinedActivity.slice(0, 5)) // Limit to 5 recent activities
    }

    fetchDashboardData()
    
    // Setup auth listener for real-time updates if needed (e.g., user logs in/out)
    const { data: authListener } = supabaseBrowser().auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setCurrentUser(session?.user); // Update currentUser on sign-in
        fetchDashboardData();
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null); // Clear currentUser on sign-out
        setProfile(null);
        // router.push('/login') // Redirection is handled by the auth state change listener in DashboardNav
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }

  }, [])

  // Mock data - replace with real data from your backend
  const stats = {
    totalRoadmaps: userStats.totalRoadmaps,
    completedTasks: userStats.completedTasks,
    totalTasks: userStats.totalTasks,
    studyStreak: userStats.studyStreak,
  }

  const recentActivityDisplay = recentActivity

  const upcomingTasksDisplay = upcomingTasks

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <DashboardNav />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-balance mb-2">Welcome back, {profile?.full_name || profile?.username || currentUser?.email?.split('@')[0] || "User"}! 👋</h1>
            <p className="text-muted-foreground text-pretty">
              Ready to continue your learning journey? Here's what's happening today.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Roadmaps</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRoadmaps}</div>
                <p className="text-xs text-muted-foreground">Total active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Progress</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.completedTasks}/{stats.totalTasks}
                </div>
                <Progress value={(stats.completedTasks / stats.totalTasks) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.studyStreak} days</div>
                <p className="text-xs text-muted-foreground">Keep it up!</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedTasks}</div>
                <p className="text-xs text-muted-foreground">Total completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="roadmap" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Roadmap
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="roadmap" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-heading text-2xl font-bold">AI Roadmaps</h2>
                <Button asChild className="flex items-center gap-2">
                  <Link href="/dashboard/roadmap/create">
                    <Plus className="w-4 h-4" />
                    Create New Roadmap
                  </Link>
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roadmaps.map((roadmap: any) => (
                  <Card key={roadmap.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{roadmap.title}</CardTitle>
                        <Badge variant={roadmap.status === "completed" ? "default" : "secondary"}>
                          {roadmap.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-pretty">{roadmap.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{roadmap.progress}%</span>
                        </div>
                        <Progress value={roadmap.progress} />
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-1" />
                          {roadmap.timeLeft}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-heading text-2xl font-bold">Task Management</h2>
                <Button asChild className="flex items-center gap-2">
                  <Link href="/dashboard/tasks">
                    <Target className="w-4 h-4" />
                    Manage Tasks
                  </Link>
                </Button>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Today's Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {upcomingTasksDisplay.slice(0, 1).map((task: any, index: any) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <CheckCircle className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{task.title}</p>
                            <p className="text-xs text-muted-foreground">{task.dueDate}</p>
                          </div>
                          <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>
                            {task.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {upcomingTasksDisplay.slice(1).map((task: any, index: any) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <CheckCircle className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{task.title}</p>
                            <p className="text-xs text-muted-foreground">{task.dueDate}</p>
                          </div>
                          <Badge variant={task.priority === "high" ? "destructive" : "secondary"}>
                            {task.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Progress Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Daily Tasks</span>
                          <span>3/5</span>
                        </div>
                        <Progress value={60} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Weekly Goals</span>
                          <span>7/10</span>
                        </div>
                        <Progress value={70} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Monthly Targets</span>
                          <span>15/20</span>
                        </div>
                        <Progress value={75} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-heading text-2xl font-bold">Profile & Progress</h2>
                <Button variant="outline">Edit Profile</Button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                  <CardHeader className="text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                      <User className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle>{profile?.full_name || currentUser?.email?.split('@')[0] || "User"}</CardTitle>
                    <CardDescription>{profile?.learning_level || "Learner"}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-2">
                    {profile?.learning_level && <Badge variant="secondary">{profile.learning_level}</Badge>}
                    <p className="text-sm text-muted-foreground">Member since {profile?.member_since ? new Date(profile.member_since).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}</p>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Learning Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">{/* Placeholder */}156</div>
                        <p className="text-sm text-muted-foreground">Hours Studied</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">{/* Placeholder */}23</div>
                        <p className="text-sm text-muted-foreground">Certificates Earned</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">{/* Placeholder */}89%</div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">{userStats.studyStreak}</div>
                        <p className="text-sm text-muted-foreground">Day Streak</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivityDisplay.map((activity: any, index: any) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {activity.type === "task" && <Target className="w-4 h-4 text-primary" />}
                          {activity.type === "roadmap" && <Brain className="w-4 h-4 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{activity.time}</p>
                        </div>
                        <Badge
                          variant={
                            activity.status === "completed"
                              ? "default"
                              : activity.status === "in-progress"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {activity.status}
                          {activity.score && ` (${activity.score}%)`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ThemeProvider>
  )
}

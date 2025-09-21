"use client"

import { useState } from "react"
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
  BookOpen,
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

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("roadmap")

  // Mock data - replace with real data from your backend
  const stats = {
    totalRoadmaps: 3,
    completedTasks: 24,
    totalTasks: 45,
    quizzesTaken: 8,
    averageScore: 87,
  }

  const recentActivity = [
    { type: "task", title: "Complete React Hooks tutorial", time: "2 hours ago", status: "completed" },
    { type: "quiz", title: "JavaScript Fundamentals Quiz", time: "1 day ago", status: "completed", score: 92 },
    { type: "roadmap", title: "Full Stack Development", time: "2 days ago", status: "created" },
    { type: "task", title: "Build portfolio website", time: "3 days ago", status: "in-progress" },
  ]

  const upcomingTasks = [
    { title: "Study Node.js basics", dueDate: "Today", priority: "high" },
    { title: "Complete database design", dueDate: "Tomorrow", priority: "medium" },
    { title: "Review API documentation", dueDate: "This week", priority: "low" },
  ]

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <DashboardNav />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-balance mb-2">Welcome back, Alex! 👋</h1>
            <p className="text-muted-foreground text-pretty">
              Ready to continue your learning journey? Here's what's happening today.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Roadmaps</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRoadmaps}</div>
                <p className="text-xs text-muted-foreground">+1 from last month</p>
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
                <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.quizzesTaken}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageScore}%</div>
                <p className="text-xs text-green-600">+5% from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12 days</div>
                <p className="text-xs text-muted-foreground">Keep it up!</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="roadmap" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Roadmap
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="notes-quiz" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Notes & Quiz
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
                {[
                  {
                    title: "Full Stack Development",
                    description: "Master React, Node.js, and databases",
                    progress: 65,
                    timeLeft: "2 months",
                    status: "active",
                  },
                  {
                    title: "Data Structures & Algorithms",
                    description: "Prepare for technical interviews",
                    progress: 30,
                    timeLeft: "3 months",
                    status: "active",
                  },
                  {
                    title: "Machine Learning Basics",
                    description: "Introduction to ML concepts",
                    progress: 100,
                    timeLeft: "Completed",
                    status: "completed",
                  },
                ].map((roadmap, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
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
                      {upcomingTasks.slice(0, 1).map((task, index) => (
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
                      {upcomingTasks.slice(1).map((task, index) => (
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

            <TabsContent value="notes-quiz" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="font-heading text-2xl font-bold">Notes & Quizzes</h2>
                <Button asChild className="flex items-center gap-2">
                  <Link href="/dashboard/notes-quiz">
                    <BookOpen className="w-4 h-4" />
                    Generate Notes & Quiz
                  </Link>
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Notes</CardTitle>
                    <CardDescription>AI-generated notes from your documents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { title: "React Hooks Overview", date: "2 days ago", pages: 5 },
                        { title: "Database Design Principles", date: "1 week ago", pages: 8 },
                        { title: "JavaScript ES6 Features", date: "2 weeks ago", pages: 3 },
                      ].map((note, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        >
                          <div>
                            <p className="font-medium">{note.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {note.date} • {note.pages} pages
                            </p>
                          </div>
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quiz Results</CardTitle>
                    <CardDescription>Your recent quiz performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { title: "React Hooks Quiz", score: 92, date: "1 day ago", questions: 10 },
                        { title: "Database Quiz", score: 85, date: "3 days ago", questions: 15 },
                        { title: "JavaScript Quiz", score: 88, date: "1 week ago", questions: 12 },
                      ].map((quiz, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        >
                          <div>
                            <p className="font-medium">{quiz.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {quiz.date} • {quiz.questions} questions
                            </p>
                          </div>
                          <Badge
                            variant={quiz.score >= 90 ? "default" : quiz.score >= 80 ? "secondary" : "destructive"}
                          >
                            {quiz.score}%
                          </Badge>
                        </div>
                      ))}
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
                    <CardTitle>Alex Johnson</CardTitle>
                    <CardDescription>Computer Science Student</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-2">
                    <Badge variant="secondary">Level 5 Learner</Badge>
                    <p className="text-sm text-muted-foreground">Member since Jan 2024</p>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Learning Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">156</div>
                        <p className="text-sm text-muted-foreground">Hours Studied</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">23</div>
                        <p className="text-sm text-muted-foreground">Certificates Earned</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">89%</div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">12</div>
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
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {activity.type === "task" && <Target className="w-4 h-4 text-primary" />}
                          {activity.type === "quiz" && <BookOpen className="w-4 h-4 text-primary" />}
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

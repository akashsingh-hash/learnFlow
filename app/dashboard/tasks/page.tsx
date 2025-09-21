"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ThemeProvider } from "@/components/theme-provider"
import { DashboardNav } from "@/components/dashboard-nav"
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Edit,
  Trash2,
  Search,
  Target,
  TrendingUp,
  BarChart3,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { supabaseBrowser } from "@/lib/supabase-client"
import { useEffect } from 'react'

interface Task {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  category: "daily" | "weekly" | "monthly"
  status: "todo" | "in-progress" | "completed"
  dueDate: string
  createdAt: string
  estimatedHours?: number
  tags?: string[]
}

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  // Mock tasks data - replace with real data from your backend
  const [tasks, setTasks] = useState<Task[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchTasks = async () => {
      const supabase = supabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id)
      if (user) {
        const { data, error } = await supabase
          .from('user_tasks')
          .select(`
            id, title, description, priority, category, status, due_date, created_at, estimated_hours,
            user_task_tags ( tags (name) )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error("Error fetching tasks:", error)
        } else {
          setTasks(data.map(task => ({
            ...task,
            dueDate: task.due_date,
            createdAt: new Date(task.created_at).toISOString().split('T')[0],
            tags: task.user_task_tags.map((utt: any) => utt.tags.name)
          })))
        }
      } else {
        setUserId(null)
        setTasks([])
      }
    }

    fetchTasks()
    // Listen for auth changes to refetch tasks if user logs in/out
    const { data: authListener } = supabaseBrowser().auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchTasks()
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    category: "daily" as const,
    dueDate: "",
    estimatedHours: 1,
    tags: "",
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "in-progress":
        return "text-blue-600"
      case "todo":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "daily":
        return <Calendar className="w-4 h-4" />
      case "weekly":
        return <TrendingUp className="w-4 h-4" />
      case "monthly":
        return <BarChart3 className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority
    const matchesStatus = filterStatus === "all" || task.status === filterStatus
    const matchesTab = activeTab === "all" || task.category === activeTab

    return matchesSearch && matchesPriority && matchesStatus && matchesTab
  })

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    todo: tasks.filter((t) => t.status === "todo").length,
  }

  const toggleTaskStatus = async (taskId: string) => {
    const taskToUpdate = tasks.find((task) => task.id === taskId)
    if (!taskToUpdate || !userId) return

    const newStatus = taskToUpdate.status === "completed" ? "todo" : taskToUpdate.status === "todo" ? "in-progress" : "completed"

    const { error } = await supabaseBrowser()
      .from('user_tasks')
      .update({ status: newStatus })
      .eq('id', taskId)
      .eq('user_id', userId)

    if (error) {
      console.error("Error updating task status:", error)
      alert("Failed to update task status.")
    } else {
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      )
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!userId) return
    const { error } = await supabaseBrowser()
      .from('user_tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId)

    if (error) {
      console.error("Error deleting task:", error)
      alert("Failed to delete task.")
    } else {
      setTasks(tasks.filter((task) => task.id !== taskId))
    }
  }

  const addTask = async () => {
    if (!userId) {
      alert("You must be logged in to add tasks.")
      return
    }
    if (!newTask.title) {
      alert("Task title is required.")
      return
    }

    setIsAddDialogOpen(false)

    const taskToInsert = {
      user_id: userId,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      category: newTask.category,
      status: "todo",
      due_date: newTask.dueDate || null,
      estimated_hours: newTask.estimatedHours,
    }

    const { data: insertedTask, error } = await supabaseBrowser()
      .from('user_tasks')
      .insert(taskToInsert)
      .select()
      .single()

    if (error || !insertedTask) {
      console.error("Error adding task:", error)
      alert("Failed to add task.")
      return
    }

    // Handle tags
    const newTags = newTask.tags ? newTask.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : []
    if (newTags.length > 0) {
      for (const tagName of newTags) {
        let { data: tagData, error: tagFetchError } = await supabaseBrowser()
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .single()

        if (tagFetchError && tagFetchError.code === 'PGRST116') { // No rows found
          const { data: newTagData, error: tagInsertError } = await supabaseBrowser()
            .from('tags')
            .insert({ name: tagName })
            .select('id')
            .single()
          if (tagInsertError) {
            console.error("Error creating tag:", tagInsertError)
            continue
          }
          tagData = newTagData
        } else if (tagFetchError) {
          console.error("Error fetching tag:", tagFetchError)
          continue
        }

        if (tagData) {
          const { error: userTaskTagError } = await supabaseBrowser()
            .from('user_task_tags')
            .insert({ user_task_id: insertedTask.id, tag_id: tagData.id })
          if (userTaskTagError) console.error("Error saving user task tag:", userTaskTagError)
        }
      }
    }

    setTasks(prevTasks => [
      {
        ...insertedTask,
        dueDate: insertedTask.due_date,
        createdAt: new Date(insertedTask.created_at).toISOString().split('T')[0],
        tags: newTags,
        user_task_tags: newTags.map(tag => ({ tags: { name: tag } })) // For consistent data structure
      },
      ...prevTasks,
    ])

    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      category: "daily",
      dueDate: "",
      estimatedHours: 1,
      tags: "",
    })
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <DashboardNav />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="font-heading text-3xl font-bold text-balance">Task Management</h1>
              <p className="text-muted-foreground text-pretty">
                Organize and track your daily, weekly, and monthly learning tasks
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                  <DialogDescription>Create a new task to add to your learning schedule</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Enter task title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Describe what you need to do"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newTask.category}
                        onValueChange={(value: any) => setNewTask({ ...newTask, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedHours">Estimated Hours</Label>
                      <Input
                        id="estimatedHours"
                        type="number"
                        min="1"
                        value={newTask.estimatedHours}
                        onChange={(e) =>
                          setNewTask({ ...newTask, estimatedHours: Number.parseInt(e.target.value) || 1 })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={newTask.tags}
                      onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                      placeholder="react, javascript, tutorial"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addTask} disabled={!newTask.title}>
                    Add Task
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{taskStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">To Do</CardTitle>
                <Circle className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{taskStats.todo}</div>
                <Progress value={(taskStats.completed / taskStats.total) * 100} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task Categories Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="daily" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Daily
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Weekly
              </TabsTrigger>
              <TabsTrigger value="monthly" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Monthly
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredTasks.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center space-y-4">
                      <Target className="w-12 h-12 mx-auto text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold text-lg">No tasks found</h3>
                        <p className="text-muted-foreground">
                          {searchQuery || filterPriority !== "all" || filterStatus !== "all"
                            ? "Try adjusting your filters or search query"
                            : "Create your first task to get started"}
                        </p>
                      </div>
                      {!searchQuery && filterPriority === "all" && filterStatus === "all" && (
                        <Button onClick={() => setIsAddDialogOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Task
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredTasks.map((task) => (
                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={task.status === "completed"}
                            onCheckedChange={() => toggleTaskStatus(task.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3
                                  className={`font-semibold ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                                >
                                  {task.title}
                                </h3>
                                <p className="text-sm text-muted-foreground text-pretty">{task.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700"
                                  onClick={() => deleteTask(task.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                {getCategoryIcon(task.category)}
                                <span className="capitalize">{task.category}</span>
                              </div>
                              <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                              {task.estimatedHours && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  <span>{task.estimatedHours}h</span>
                                </div>
                              )}
                              <Badge variant="outline" className={getStatusColor(task.status)}>
                                {task.status.replace("-", " ")}
                              </Badge>
                            </div>
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {task.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ThemeProvider>
  )
}

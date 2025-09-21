"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ThemeProvider } from "@/components/theme-provider"
import { DashboardNav } from "@/components/dashboard-nav"
import {
  Brain,
  Clock,
  Target,
  BookOpen,
  Code,
  Video,
  FileText,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Calendar,
  Zap,
} from "lucide-react"
import Link from "next/link"

interface Roadmap {
  title: string
  description: string
  estimatedDuration: string
  difficulty: string
  milestones: Array<{
    id: string
    title: string
    description: string
    estimatedWeeks: number
    tasks: Array<{
      id: string
      title: string
      description: string
      type: string
      estimatedHours: number
      resources?: string[]
    }>
    prerequisites?: string[]
  }>
  tags: string[]
  resources: Array<{
    title: string
    url?: string
    type: string
  }>
}

export default function CreateRoadmapPage() {
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedRoadmap, setGeneratedRoadmap] = useState<Roadmap | null>(null)
  const [formData, setFormData] = useState({
    goal: "",
    timeframe: "",
    currentLevel: "",
    preferences: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const generateRoadmap = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to generate roadmap")

      const data = await response.json()
      setGeneratedRoadmap(data.roadmap)
      setStep(3)
    } catch (error) {
      console.error("Error generating roadmap:", error)
      alert("Failed to generate roadmap. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "reading":
        return <BookOpen className="w-4 h-4" />
      case "practice":
        return <Code className="w-4 h-4" />
      case "project":
        return <Target className="w-4 h-4" />
      case "quiz":
        return <Brain className="w-4 h-4" />
      case "video":
        return <Video className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const saveRoadmap = async () => {
    // The API route already saves the roadmap, so this function can just navigate.
    alert("Roadmap saved successfully!")
    window.location.href = "/dashboard"
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <DashboardNav />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-heading text-3xl font-bold text-balance">Create AI Roadmap</h1>
              <p className="text-muted-foreground text-pretty">
                Let AI create a personalized learning path for your goals
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Step {step} of 3</span>
              <span className="text-sm text-muted-foreground">
                {step === 1 && "Goal Setting"}
                {step === 2 && "Generating"}
                {step === 3 && "Review & Save"}
              </span>
            </div>
            <Progress value={(step / 3) * 100} />
          </div>

          {/* Step 1: Goal Setting */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Tell us about your learning goal
                </CardTitle>
                <CardDescription>
                  Provide details about what you want to learn and we'll create a personalized roadmap
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="goal">What do you want to learn? *</Label>
                  <Textarea
                    id="goal"
                    placeholder="e.g., Full-stack web development with React and Node.js"
                    value={formData.goal}
                    onChange={(e) => handleInputChange("goal", e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeframe">How much time do you have? *</Label>
                    <Select value={formData.timeframe} onValueChange={(value) => handleInputChange("timeframe", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeframe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-month">1 Month</SelectItem>
                        <SelectItem value="2-months">2 Months</SelectItem>
                        <SelectItem value="3-months">3 Months</SelectItem>
                        <SelectItem value="6-months">6 Months</SelectItem>
                        <SelectItem value="1-year">1 Year</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentLevel">Current skill level *</Label>
                    <Select
                      value={formData.currentLevel}
                      onValueChange={(value) => handleInputChange("currentLevel", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="complete-beginner">Complete Beginner</SelectItem>
                        <SelectItem value="some-basics">Know Some Basics</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferences">Learning preferences (optional)</Label>
                  <Textarea
                    id="preferences"
                    placeholder="e.g., I prefer hands-on projects, video tutorials, or specific technologies to focus on"
                    value={formData.preferences}
                    onChange={(e) => handleInputChange("preferences", e.target.value)}
                  />
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full"
                  disabled={!formData.goal || !formData.timeframe || !formData.currentLevel}
                >
                  Generate AI Roadmap
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Generating */}
          {step === 2 && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-semibold mb-2">
                      {isGenerating ? "Creating your personalized roadmap..." : "Ready to generate!"}
                    </h3>
                    <p className="text-muted-foreground text-pretty">
                      {isGenerating
                        ? "Our AI is analyzing your goals and creating a step-by-step learning path tailored just for you."
                        : "Click the button below to start generating your roadmap."}
                    </p>
                  </div>
                  {isGenerating ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-secondary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-secondary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  ) : (
                    <Button onClick={generateRoadmap} size="lg">
                      Generate Roadmap
                      <Zap className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review Generated Roadmap */}
          {step === 3 && generatedRoadmap && (
            <div className="space-y-6">
              {/* Roadmap Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-heading text-2xl">{generatedRoadmap.title}</CardTitle>
                      <CardDescription className="text-pretty mt-2">{generatedRoadmap.description}</CardDescription>
                    </div>
                    <Badge className={getDifficultyColor(generatedRoadmap.difficulty)}>
                      {generatedRoadmap.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{generatedRoadmap.estimatedDuration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{generatedRoadmap.milestones.length} Milestones</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{generatedRoadmap.resources.length} Resources</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {generatedRoadmap.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Milestones */}
              <div className="space-y-4">
                <h3 className="font-heading text-xl font-semibold">Learning Milestones</h3>
                {generatedRoadmap.milestones.map((milestone, index) => (
                  <Card key={milestone.id}>
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{milestone.title}</CardTitle>
                          <CardDescription className="text-pretty">{milestone.description}</CardDescription>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {milestone.estimatedWeeks} weeks
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              {milestone.tasks.length} tasks
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {milestone.tasks.map((task) => (
                          <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg">
                            <div className="text-muted-foreground mt-0.5">{getTaskIcon(task.type)}</div>
                            <div className="flex-1">
                              <h4 className="font-medium">{task.title}</h4>
                              <p className="text-sm text-muted-foreground text-pretty">{task.description}</p>
                              <div className="flex items-center gap-4 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {task.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">~{task.estimatedHours}h</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Resources */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Resources</CardTitle>
                  <CardDescription>Curated resources to support your learning journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {generatedRoadmap.resources.map((resource, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="text-muted-foreground">
                          {resource.type === "book" && <BookOpen className="w-4 h-4" />}
                          {resource.type === "course" && <Video className="w-4 h-4" />}
                          {resource.type === "documentation" && <FileText className="w-4 h-4" />}
                          {resource.type === "tutorial" && <Code className="w-4 h-4" />}
                          {resource.type === "practice" && <Target className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{resource.title}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {resource.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                  Create Another
                </Button>
                <Button onClick={saveRoadmap} className="flex-1">
                  Save Roadmap
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </ThemeProvider>
  )
}

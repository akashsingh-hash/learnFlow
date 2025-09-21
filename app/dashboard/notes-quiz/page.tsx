"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ThemeProvider } from "@/components/theme-provider"
import { DashboardNav } from "@/components/dashboard-nav"
import {
  Upload,
  Brain,
  Clock,
  CheckCircle,
  X,
  ArrowLeft,
  BookOpen,
  Award,
  Target,
  Download,
  Eye,
  Play,
  RotateCcw,
} from "lucide-react"
import Link from "next/link"

interface Notes {
  title: string
  summary: string
  keyPoints: string[]
  sections: Array<{
    heading: string
    content: string
    bulletPoints?: string[]
  }>
  concepts?: Array<{
    term: string
    definition: string
  }>
  tags: string[]
}

interface Quiz {
  title: string
  description: string
  questions: Array<{
    id: string
    type: "multiple-choice" | "short-answer" | "true-false"
    question: string
    options?: string[]
    correctAnswer: string
    explanation: string
    difficulty: "easy" | "medium" | "hard"
    points: number
  }>
  totalPoints: number
  estimatedTime: number
  tags: string[]
}

interface QuizAttempt {
  answers: Record<string, string>
  score: number
  totalPoints: number
  completed: boolean
  startTime: Date
  endTime?: Date
}

export default function NotesQuizPage() {
  const [activeTab, setActiveTab] = useState("upload")
  const [isUploading, setIsUploading] = useState(false)
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false)
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [documentText, setDocumentText] = useState("")
  const [generatedNotes, setGeneratedNotes] = useState<Notes | null>(null)
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null)
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [showResults, setShowResults] = useState(false)

  // Mock existing notes and quizzes
  const [savedNotes] = useState([
    {
      id: "1",
      title: "React Hooks Overview",
      summary: "Comprehensive guide to React Hooks including useState, useEffect, and custom hooks",
      createdAt: "2024-01-10",
      tags: ["react", "javascript", "hooks"],
    },
    {
      id: "2",
      title: "Database Design Principles",
      summary: "Key concepts in database design, normalization, and relationship modeling",
      createdAt: "2024-01-05",
      tags: ["database", "sql", "design"],
    },
  ])

  const [quizHistory] = useState([
    {
      id: "1",
      title: "React Hooks Quiz",
      score: 92,
      totalPoints: 100,
      completedAt: "2024-01-12",
      questions: 10,
      difficulty: "medium",
    },
    {
      id: "2",
      title: "Database Quiz",
      score: 85,
      totalPoints: 100,
      completedAt: "2024-01-08",
      questions: 15,
      difficulty: "hard",
    },
  ])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      // In a real app, you'd extract text from PDF/DOCX files here
      // For demo purposes, we'll use the document text input
    }
  }

  const generateNotes = async () => {
    if (!documentText.trim()) {
      alert("Please provide document text to generate notes")
      return
    }

    setIsGeneratingNotes(true)
    try {
      const response = await fetch("/api/generate-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText,
          fileName: uploadedFile?.name || "Document",
        }),
      })

      if (!response.ok) throw new Error("Failed to generate notes")

      const data = await response.json()
      setGeneratedNotes(data.notes)
      setActiveTab("notes")
    } catch (error) {
      console.error("Error generating notes:", error)
      alert("Failed to generate notes. Please try again.")
    } finally {
      setIsGeneratingNotes(false)
    }
  }

  const generateQuiz = async () => {
    if (!documentText.trim()) {
      alert("Please provide document text to generate quiz")
      return
    }

    setIsGeneratingQuiz(true)
    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText,
          fileName: uploadedFile?.name || "Document",
          questionCount: 10,
          difficulty: "mixed",
        }),
      })

      if (!response.ok) throw new Error("Failed to generate quiz")

      const data = await response.json()
      setGeneratedQuiz(data.quiz)
      setActiveTab("quiz")
    } catch (error) {
      console.error("Error generating quiz:", error)
      alert("Failed to generate quiz. Please try again.")
    } finally {
      setIsGeneratingQuiz(false)
    }
  }

  const startQuiz = () => {
    if (!generatedQuiz) return

    setQuizAttempt({
      answers: {},
      score: 0,
      totalPoints: generatedQuiz.totalPoints,
      completed: false,
      startTime: new Date(),
    })
    setCurrentQuestionIndex(0)
    setShowResults(false)
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    if (!quizAttempt) return

    setQuizAttempt({
      ...quizAttempt,
      answers: {
        ...quizAttempt.answers,
        [questionId]: answer,
      },
    })
  }

  const submitQuiz = () => {
    if (!quizAttempt || !generatedQuiz) return

    let score = 0
    generatedQuiz.questions.forEach((question) => {
      const userAnswer = quizAttempt.answers[question.id]
      if (userAnswer === question.correctAnswer) {
        score += question.points
      }
    })

    const completedAttempt = {
      ...quizAttempt,
      score,
      completed: true,
      endTime: new Date(),
    }

    setQuizAttempt(completedAttempt)
    setShowResults(true)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <DashboardNav />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-heading text-3xl font-bold text-balance">Notes & Quiz Generator</h1>
              <p className="text-muted-foreground text-pretty">
                Upload documents to generate AI-powered notes and quizzes
              </p>
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                History
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Document
                  </CardTitle>
                  <CardDescription>Upload a PDF, DOCX, or paste text to generate notes and quizzes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file-upload">Upload File (PDF, DOCX)</Label>
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileUpload}
                        className="mt-2"
                      />
                      {uploadedFile && (
                        <p className="text-sm text-muted-foreground mt-2">Selected: {uploadedFile.name}</p>
                      )}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or paste text</span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="document-text">Document Text</Label>
                      <Textarea
                        id="document-text"
                        placeholder="Paste your document content here..."
                        value={documentText}
                        onChange={(e) => setDocumentText(e.target.value)}
                        className="min-h-[200px] mt-2"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={generateNotes}
                      disabled={isGeneratingNotes || !documentText.trim()}
                      className="flex-1"
                    >
                      {isGeneratingNotes ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Generating Notes...
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-4 h-4 mr-2" />
                          Generate Notes
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={generateQuiz}
                      disabled={isGeneratingQuiz || !documentText.trim()}
                      className="flex-1 bg-transparent"
                      variant="outline"
                    >
                      {isGeneratingQuiz ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin mr-2" />
                          Generating Quiz...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Generate Quiz
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-6">
              {generatedNotes ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="font-heading text-2xl">{generatedNotes.title}</CardTitle>
                          <CardDescription className="text-pretty mt-2">{generatedNotes.summary}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                          <Button size="sm">Save Notes</Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {generatedNotes.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Key Points */}
                      <div className="mb-8">
                        <h3 className="font-heading text-lg font-semibold mb-4">Key Points</h3>
                        <ul className="space-y-2">
                          {generatedNotes.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-pretty">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Sections */}
                      <div className="space-y-6">
                        {generatedNotes.sections.map((section, index) => (
                          <div key={index}>
                            <h3 className="font-heading text-lg font-semibold mb-3">{section.heading}</h3>
                            <p className="text-pretty mb-3">{section.content}</p>
                            {section.bulletPoints && (
                              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {section.bulletPoints.map((point, pointIndex) => (
                                  <li key={pointIndex}>{point}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Concepts */}
                      {generatedNotes.concepts && generatedNotes.concepts.length > 0 && (
                        <div className="mt-8">
                          <h3 className="font-heading text-lg font-semibold mb-4">Key Concepts</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            {generatedNotes.concepts.map((concept, index) => (
                              <Card key={index}>
                                <CardContent className="pt-4">
                                  <h4 className="font-semibold mb-2">{concept.term}</h4>
                                  <p className="text-sm text-muted-foreground text-pretty">{concept.definition}</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center space-y-4">
                      <BookOpen className="w-12 h-12 mx-auto text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold text-lg">No notes generated yet</h3>
                        <p className="text-muted-foreground">Upload a document and generate notes to see them here</p>
                      </div>
                      <Button onClick={() => setActiveTab("upload")}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Quiz Tab */}
            <TabsContent value="quiz" className="space-y-6">
              {generatedQuiz ? (
                <div className="space-y-6">
                  {!quizAttempt ? (
                    // Quiz Overview
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="font-heading text-2xl">{generatedQuiz.title}</CardTitle>
                            <CardDescription className="text-pretty mt-2">{generatedQuiz.description}</CardDescription>
                          </div>
                          <Button onClick={startQuiz} className="flex items-center gap-2">
                            <Play className="w-4 h-4" />
                            Start Quiz
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{generatedQuiz.questions.length} Questions</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">~{generatedQuiz.estimatedTime} minutes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{generatedQuiz.totalPoints} points</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {generatedQuiz.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="space-y-3">
                          <h3 className="font-semibold">Question Preview:</h3>
                          {generatedQuiz.questions.slice(0, 3).map((question, index) => (
                            <div key={question.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Question {index + 1}</span>
                                <Badge className={getDifficultyColor(question.difficulty)}>{question.difficulty}</Badge>
                              </div>
                              <p className="text-sm text-pretty">{question.question}</p>
                            </div>
                          ))}
                          {generatedQuiz.questions.length > 3 && (
                            <p className="text-sm text-muted-foreground">
                              ...and {generatedQuiz.questions.length - 3} more questions
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ) : showResults ? (
                    // Quiz Results
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="w-5 h-5" />
                          Quiz Results
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center mb-8">
                          <div className="text-4xl font-bold mb-2">
                            {Math.round((quizAttempt.score / quizAttempt.totalPoints) * 100)}%
                          </div>
                          <p className="text-muted-foreground">
                            {quizAttempt.score} out of {quizAttempt.totalPoints} points
                          </p>
                          <Progress
                            value={(quizAttempt.score / quizAttempt.totalPoints) * 100}
                            className="mt-4 max-w-md mx-auto"
                          />
                        </div>

                        <div className="space-y-4">
                          {generatedQuiz.questions.map((question, index) => {
                            const userAnswer = quizAttempt.answers[question.id]
                            const isCorrect = userAnswer === question.correctAnswer

                            return (
                              <Card key={question.id} className={isCorrect ? "border-green-200" : "border-red-200"}>
                                <CardContent className="pt-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <h4 className="font-medium">Question {index + 1}</h4>
                                    <div className="flex items-center gap-2">
                                      {isCorrect ? (
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                      ) : (
                                        <X className="w-4 h-4 text-red-600" />
                                      )}
                                      <Badge className={getDifficultyColor(question.difficulty)}>
                                        {question.difficulty}
                                      </Badge>
                                    </div>
                                  </div>
                                  <p className="mb-3 text-pretty">{question.question}</p>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <span className="font-medium">Your answer:</span>{" "}
                                      <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                                        {userAnswer || "No answer"}
                                      </span>
                                    </p>
                                    {!isCorrect && (
                                      <p>
                                        <span className="font-medium">Correct answer:</span>{" "}
                                        <span className="text-green-600">{question.correctAnswer}</span>
                                      </p>
                                    )}
                                    <p className="text-muted-foreground text-pretty">
                                      <span className="font-medium">Explanation:</span> {question.explanation}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>

                        <div className="flex gap-4 mt-8">
                          <Button
                            onClick={() => {
                              setQuizAttempt(null)
                              setShowResults(false)
                            }}
                            variant="outline"
                            className="flex-1"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Retake Quiz
                          </Button>
                          <Button className="flex-1">Save Results</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    // Quiz Taking Interface
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>
                            Question {currentQuestionIndex + 1} of {generatedQuiz.questions.length}
                          </CardTitle>
                          <Badge
                            className={getDifficultyColor(generatedQuiz.questions[currentQuestionIndex].difficulty)}
                          >
                            {generatedQuiz.questions[currentQuestionIndex].difficulty}
                          </Badge>
                        </div>
                        <Progress value={((currentQuestionIndex + 1) / generatedQuiz.questions.length) * 100} />
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-medium mb-4 text-pretty">
                              {generatedQuiz.questions[currentQuestionIndex].question}
                            </h3>

                            {generatedQuiz.questions[currentQuestionIndex].type === "multiple-choice" && (
                              <RadioGroup
                                value={quizAttempt.answers[generatedQuiz.questions[currentQuestionIndex].id] || ""}
                                onValueChange={(value) =>
                                  handleAnswerChange(generatedQuiz.questions[currentQuestionIndex].id, value)
                                }
                              >
                                {generatedQuiz.questions[currentQuestionIndex].options?.map((option, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`option-${index}`} />
                                    <Label htmlFor={`option-${index}`} className="text-pretty">
                                      {option}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            )}

                            {generatedQuiz.questions[currentQuestionIndex].type === "short-answer" && (
                              <Textarea
                                placeholder="Enter your answer..."
                                value={quizAttempt.answers[generatedQuiz.questions[currentQuestionIndex].id] || ""}
                                onChange={(e) =>
                                  handleAnswerChange(generatedQuiz.questions[currentQuestionIndex].id, e.target.value)
                                }
                              />
                            )}

                            {generatedQuiz.questions[currentQuestionIndex].type === "true-false" && (
                              <RadioGroup
                                value={quizAttempt.answers[generatedQuiz.questions[currentQuestionIndex].id] || ""}
                                onValueChange={(value) =>
                                  handleAnswerChange(generatedQuiz.questions[currentQuestionIndex].id, value)
                                }
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="True" id="true" />
                                  <Label htmlFor="true">True</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="False" id="false" />
                                  <Label htmlFor="false">False</Label>
                                </div>
                              </RadioGroup>
                            )}
                          </div>

                          <div className="flex justify-between">
                            <Button
                              variant="outline"
                              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                              disabled={currentQuestionIndex === 0}
                            >
                              Previous
                            </Button>

                            {currentQuestionIndex === generatedQuiz.questions.length - 1 ? (
                              <Button onClick={submitQuiz}>Submit Quiz</Button>
                            ) : (
                              <Button
                                onClick={() =>
                                  setCurrentQuestionIndex(
                                    Math.min(generatedQuiz.questions.length - 1, currentQuestionIndex + 1),
                                  )
                                }
                              >
                                Next
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center space-y-4">
                      <Brain className="w-12 h-12 mx-auto text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold text-lg">No quiz generated yet</h3>
                        <p className="text-muted-foreground">
                          Upload a document and generate a quiz to test your knowledge
                        </p>
                      </div>
                      <Button onClick={() => setActiveTab("upload")}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Saved Notes
                    </CardTitle>
                    <CardDescription>Your previously generated notes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {savedNotes.map((note) => (
                        <div
                          key={note.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{note.title}</h4>
                            <p className="text-sm text-muted-foreground text-pretty">{note.summary}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">{note.createdAt}</span>
                              <div className="flex gap-1">
                                {note.tags.slice(0, 2).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Quiz History
                    </CardTitle>
                    <CardDescription>Your quiz attempts and scores</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {quizHistory.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{quiz.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {quiz.questions} questions • {quiz.difficulty} difficulty
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{quiz.completedAt}</p>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant={quiz.score >= 90 ? "default" : quiz.score >= 70 ? "secondary" : "destructive"}
                            >
                              {quiz.score}%
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {quiz.score}/{quiz.totalPoints}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ThemeProvider>
  )
}

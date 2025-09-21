import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

const quizSchema = z.object({
  title: z.string().describe("Title for the quiz"),
  description: z.string().describe("Brief description of what the quiz covers"),
  questions: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["multiple-choice", "short-answer", "true-false"]),
      question: z.string(),
      options: z.array(z.string()).optional().describe("Options for multiple choice questions"),
      correctAnswer: z.string(),
      explanation: z.string().describe("Explanation of why this is the correct answer"),
      difficulty: z.enum(["easy", "medium", "hard"]),
      points: z.number().default(1),
    }),
  ),
  totalPoints: z.number(),
  estimatedTime: z.number().describe("Estimated time to complete in minutes"),
  tags: z.array(z.string()),
})

export async function POST(req: Request) {
  try {
    const { documentText, fileName, questionCount = 10, difficulty = "mixed" } = await req.json()

    if (!documentText) {
      return Response.json({ error: "Document text is required" }, { status: 400 })
    }

    const prompt = `Create a comprehensive quiz based on the following document:

Document: ${fileName || "Uploaded Document"}
Content: ${documentText}

Quiz Requirements:
- Generate ${questionCount} questions
- Difficulty level: ${difficulty}
- Mix of question types: multiple choice, short answer, and true/false
- Include clear explanations for each answer
- Focus on key concepts and important information
- Make questions challenging but fair

Ensure questions test understanding, not just memorization.`

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: quizSchema,
      prompt,
      maxTokens: 3000,
      temperature: 0.4,
    })

    return Response.json({ quiz: object })
  } catch (error) {
    console.error("Error generating quiz:", error)
    return Response.json({ error: "Failed to generate quiz" }, { status: 500 })
  }
}

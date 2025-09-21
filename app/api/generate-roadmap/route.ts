import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

const roadmapSchema = z.object({
  title: z.string().describe("The title of the learning roadmap"),
  description: z.string().describe("A brief description of what the student will learn"),
  estimatedDuration: z.string().describe('Estimated time to complete (e.g., "3 months", "6 weeks")'),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  milestones: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      estimatedWeeks: z.number(),
      tasks: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          type: z.enum(["reading", "practice", "project", "quiz", "video"]),
          estimatedHours: z.number(),
          resources: z.array(z.string()).optional(),
        }),
      ),
      prerequisites: z.array(z.string()).optional(),
    }),
  ),
  tags: z.array(z.string()),
  resources: z.array(
    z.object({
      title: z.string(),
      url: z.string().optional(),
      type: z.enum(["book", "course", "documentation", "tutorial", "practice"]),
    }),
  ),
})

export async function POST(req: Request) {
  try {
    const { goal, timeframe, currentLevel, preferences } = await req.json()

    const prompt = `Create a comprehensive learning roadmap for: "${goal}"

Student Details:
- Timeframe: ${timeframe}
- Current Level: ${currentLevel}
- Learning Preferences: ${preferences || "Not specified"}

Requirements:
- Break down into 4-8 major milestones
- Each milestone should have 3-6 specific tasks
- Include a mix of theory, practice, and projects
- Provide realistic time estimates
- Include relevant resources and prerequisites
- Make it actionable and measurable

Focus on practical, hands-on learning with clear progression from basics to advanced concepts.`

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: roadmapSchema,
      prompt,
      maxTokens: 3000,
      temperature: 0.7,
    })

    return Response.json({ roadmap: object })
  } catch (error) {
    console.error("Error generating roadmap:", error)
    return Response.json({ error: "Failed to generate roadmap" }, { status: 500 })
  }
}

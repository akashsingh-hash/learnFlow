import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

const notesSchema = z.object({
  title: z.string().describe("Title for the generated notes"),
  summary: z.string().describe("Brief summary of the document content"),
  keyPoints: z.array(z.string()).describe("Main key points from the document"),
  sections: z.array(
    z.object({
      heading: z.string(),
      content: z.string(),
      bulletPoints: z.array(z.string()).optional(),
    }),
  ),
  concepts: z
    .array(
      z.object({
        term: z.string(),
        definition: z.string(),
      }),
    )
    .optional(),
  tags: z.array(z.string()),
})

export async function POST(req: Request) {
  try {
    const { documentText, fileName } = await req.json()

    if (!documentText) {
      return Response.json({ error: "Document text is required" }, { status: 400 })
    }

    const prompt = `Analyze the following document and create comprehensive study notes:

Document: ${fileName || "Uploaded Document"}
Content: ${documentText}

Please create well-structured notes that include:
- A clear title and summary
- Key points and main concepts
- Organized sections with headings
- Important terms and definitions
- Relevant tags for categorization

Focus on making the notes clear, concise, and useful for studying.`

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: notesSchema,
      prompt,
      maxTokens: 2000,
      temperature: 0.3,
    })

    return Response.json({ notes: object })
  } catch (error) {
    console.error("Error generating notes:", error)
    return Response.json({ error: "Failed to generate notes" }, { status: 500 })
  }
}

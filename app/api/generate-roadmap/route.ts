import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import { supabase } from '@/lib/supabase'

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

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    // Save generated roadmap to Supabase
    const { data: roadmapData, error: roadmapError } = await supabase
      .from('roadmaps')
      .insert({
        user_id: user.id,
        title: object.title,
        description: object.description,
        estimated_duration: object.estimatedDuration,
        difficulty: object.difficulty,
      })
      .select()
      .single()

    if (roadmapError || !roadmapData) {
      console.error("Error saving roadmap:", roadmapError)
      return Response.json({ error: "Failed to save roadmap" }, { status: 500 })
    }

    // Save milestones and tasks
    if (object.milestones && object.milestones.length > 0) {
      for (const milestone of object.milestones) {
        const { data: milestoneData, error: milestoneError } = await supabase
          .from('milestones')
          .insert({
            roadmap_id: roadmapData.id,
            title: milestone.title,
            description: milestone.description,
            estimated_weeks: milestone.estimatedWeeks,
          })
          .select()
          .single()

        if (milestoneError || !milestoneData) {
          console.error("Error saving milestone:", milestoneError)
          continue
        }

        // Save tasks for the milestone
        if (milestone.tasks && milestone.tasks.length > 0) {
          for (const task of milestone.tasks) {
            const { data: taskData, error: taskError } = await supabase
              .from('roadmap_tasks')
              .insert({
                milestone_id: milestoneData.id,
                title: task.title,
                description: task.description,
                type: task.type,
                estimated_hours: task.estimatedHours,
              })
              .select()
              .single()

            if (taskError || !taskData) {
              console.error("Error saving roadmap task:", taskError)
              continue
            }

            // Save task resources
            if (task.resources && task.resources.length > 0) {
              for (const resourceUrl of task.resources) {
                let { data: resourceData, error: resourceFetchError } = await supabase
                  .from('resources')
                  .select('id')
                  .eq('url', resourceUrl) // Assuming URL is unique for a resource
                  .single()

                if (resourceFetchError && resourceFetchError.code === 'PGRST116') { // No rows found
                  const { data: newResourceData, error: resourceInsertError } = await supabase
                    .from('resources')
                    .insert({ title: resourceUrl, url: resourceUrl, type: 'other' }) // Default to 'other' type, title as URL
                    .select('id')
                    .single()
                  if (resourceInsertError) {
                    console.error("Error creating resource for task:", resourceInsertError)
                    continue
                  }
                  resourceData = newResourceData
                } else if (resourceFetchError) {
                  console.error("Error fetching resource for task:", resourceFetchError)
                  continue
                }

                if (resourceData) {
                  const { error: roadmapTaskResourceError } = await supabase
                    .from('roadmap_task_resources')
                    .insert({ roadmap_task_id: taskData.id, resource_id: resourceData.id })
                  if (roadmapTaskResourceError) console.error("Error saving roadmap task resource:", roadmapTaskResourceError)
                }
              }
            }
          }
        }

        // Save prerequisites
        if (milestone.prerequisites && milestone.prerequisites.length > 0) {
          const prerequisitesToInsert = milestone.prerequisites.map((prereq) => ({
            milestone_id: milestoneData.id,
            prerequisite_description: prereq,
          }))
          const { error: prereqError } = await supabase.from('milestone_prerequisites').insert(prerequisitesToInsert)
          if (prereqError) console.error("Error saving prerequisites:", prereqError)
        }
      }
    }

    // Save roadmap tags
    if (object.tags && object.tags.length > 0) {
      for (const tagName of object.tags) {
        let { data: tagData, error: tagFetchError } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .single()

        if (tagFetchError && tagFetchError.code === 'PGRST116') { // No rows found
          const { data: newTagData, error: tagInsertError } = await supabase
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
          const { error: roadmapTagError } = await supabase
            .from('roadmap_tags')
            .insert({ roadmap_id: roadmapData.id, tag_id: tagData.id })
          if (roadmapTagError) console.error("Error saving roadmap tag:", roadmapTagError)
        }
      }
    }

    // Save general roadmap resources
    if (object.resources && object.resources.length > 0) {
      for (const resource of object.resources) {
        let { data: resourceData, error: resourceFetchError } = await supabase
          .from('resources')
          .select('id')
          .eq('url', resource.url) // Assuming URL is unique for a resource
          .single()

        if (resourceFetchError && resourceFetchError.code === 'PGRST116') { // No rows found
          const { data: newResourceData, error: resourceInsertError } = await supabase
            .from('resources')
            .insert({ title: resource.title, url: resource.url, type: resource.type })
            .select('id')
            .single()
          if (resourceInsertError) {
            console.error("Error creating resource:", resourceInsertError)
            continue
          }
          resourceData = newResourceData
        } else if (resourceFetchError) {
          console.error("Error fetching resource:", resourceFetchError)
          continue
        }

        if (resourceData) {
          const { error: roadmapResourceError } = await supabase
            .from('roadmap_resources')
            .insert({ roadmap_id: roadmapData.id, resource_id: resourceData.id })
          if (roadmapResourceError) console.error("Error saving roadmap resource:", roadmapResourceError)
        }
      }
    }

    return Response.json({ roadmap: object })
  } catch (error) {
    console.error("Error generating roadmap:", error)
    return Response.json({ error: "Failed to generate roadmap" }, { status: 500 })
  }
}

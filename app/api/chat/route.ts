import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { experimental_createMCPClient as createMCPClient } from "ai"

export async function POST(req: Request) {
  const { messages } = await req.json()

  try {
    // Create MCP client to connect to our filesystem server
    const mcpClient = await createMCPClient({
      transport: {
        type: "sse",
        url: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/mcp`,
      },
    })

    // Get tools from MCP server
    const tools = await mcpClient.getTools()

    const result = streamText({
      model: openai("gpt-4o"),
      messages,
      tools,
      system: `You are a helpful filesystem assistant. You can help users manage their files and folders.
      
Available operations:
- List files in directories
- Read file contents
- Create new files
- Edit existing files
- Delete files
- Create directories

When users ask you to perform file operations, use the appropriate tools. Always be clear about what operations you're performing and provide feedback on the results.

If a user asks you to edit files, make sure to read the current content first, then make the requested changes while preserving the overall structure and functionality of the code.`,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Error processing request", { status: 500 })
  }
}

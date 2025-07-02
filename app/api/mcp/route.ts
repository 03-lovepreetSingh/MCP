import { z } from "zod"
import { createMcpHandler } from "@vercel/mcp-adapter"
import { promises as fs } from "fs"
import path from "path"

const UPLOAD_DIR = path.join(process.cwd(), "uploads")

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR)
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  }
}

const handler = createMcpHandler(
  (server) => {
    // Tool to list files in a directory
    server.tool(
      "list_files",
      "List all files in the specified directory",
      {
        directory: z.string().describe("Directory path to list files from").optional().default("."),
      },
      async ({ directory }) => {
        try {
          await ensureUploadDir()
          const targetDir = path.join(UPLOAD_DIR, directory)
          const files = await fs.readdir(targetDir, { withFileTypes: true })

          const fileList = files.map((file) => ({
            name: file.name,
            type: file.isDirectory() ? "directory" : "file",
            path: path.join(directory, file.name),
          }))

          return {
            content: [
              {
                type: "text",
                text: `Files in ${directory}:\n${JSON.stringify(fileList, null, 2)}`,
              },
            ],
          }
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error listing files: ${error instanceof Error ? error.message : "Unknown error"}`,
              },
            ],
          }
        }
      },
    )

    // Tool to read file content
    server.tool(
      "read_file",
      "Read the content of a specific file",
      {
        filePath: z.string().describe("Path to the file to read"),
      },
      async ({ filePath }) => {
        try {
          await ensureUploadDir()
          const fullPath = path.join(UPLOAD_DIR, filePath)
          const content = await fs.readFile(fullPath, "utf-8")

          return {
            content: [
              {
                type: "text",
                text: `Content of ${filePath}:\n\n${content}`,
              },
            ],
          }
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error reading file: ${error instanceof Error ? error.message : "Unknown error"}`,
              },
            ],
          }
        }
      },
    )

    // Tool to create a new file
    server.tool(
      "create_file",
      "Create a new file with specified content",
      {
        filePath: z.string().describe("Path where the file should be created"),
        content: z.string().describe("Content to write to the file"),
      },
      async ({ filePath, content }) => {
        try {
          await ensureUploadDir()
          const fullPath = path.join(UPLOAD_DIR, filePath)
          const dir = path.dirname(fullPath)

          // Ensure directory exists
          await fs.mkdir(dir, { recursive: true })
          await fs.writeFile(fullPath, content, "utf-8")

          return {
            content: [
              {
                type: "text",
                text: `✅ File created successfully: ${filePath}`,
              },
            ],
          }
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error creating file: ${error instanceof Error ? error.message : "Unknown error"}`,
              },
            ],
          }
        }
      },
    )

    // Tool to edit/update an existing file
    server.tool(
      "edit_file",
      "Edit an existing file by replacing its content",
      {
        filePath: z.string().describe("Path to the file to edit"),
        content: z.string().describe("New content for the file"),
      },
      async ({ filePath, content }) => {
        try {
          await ensureUploadDir()
          const fullPath = path.join(UPLOAD_DIR, filePath)

          // Check if file exists
          await fs.access(fullPath)
          await fs.writeFile(fullPath, content, "utf-8")

          return {
            content: [
              {
                type: "text",
                text: `✅ File edited successfully: ${filePath}`,
              },
            ],
          }
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error editing file: ${error instanceof Error ? error.message : "Unknown error"}`,
              },
            ],
          }
        }
      },
    )

    // Tool to delete a file
    server.tool(
      "delete_file",
      "Delete a specific file",
      {
        filePath: z.string().describe("Path to the file to delete"),
      },
      async ({ filePath }) => {
        try {
          await ensureUploadDir()
          const fullPath = path.join(UPLOAD_DIR, filePath)
          await fs.unlink(fullPath)

          return {
            content: [
              {
                type: "text",
                text: `✅ File deleted successfully: ${filePath}`,
              },
            ],
          }
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error deleting file: ${error instanceof Error ? error.message : "Unknown error"}`,
              },
            ],
          }
        }
      },
    )

    // Tool to create a directory
    server.tool(
      "create_directory",
      "Create a new directory",
      {
        dirPath: z.string().describe("Path where the directory should be created"),
      },
      async ({ dirPath }) => {
        try {
          await ensureUploadDir()
          const fullPath = path.join(UPLOAD_DIR, dirPath)
          await fs.mkdir(fullPath, { recursive: true })

          return {
            content: [
              {
                type: "text",
                text: `✅ Directory created successfully: ${dirPath}`,
              },
            ],
          }
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error creating directory: ${error instanceof Error ? error.message : "Unknown error"}`,
              },
            ],
          }
        }
      },
    )
  },
  {},
  { basePath: "/api" },
)

export { handler as GET, handler as POST, handler as DELETE }

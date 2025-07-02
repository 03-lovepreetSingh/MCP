import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const UPLOAD_DIR = path.join(process.cwd(), "uploads")

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 })
    }

    // Ensure upload directory exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true })

    const uploadedFiles = []

    for (const file of files) {
      if (file.size === 0) continue

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Get the relative path from the file's webkitRelativePath or use just the name
      const relativePath = (file as any).webkitRelativePath || file.name
      const filePath = path.join(UPLOAD_DIR, relativePath)

      // Ensure the directory exists
      const dir = path.dirname(filePath)
      await fs.mkdir(dir, { recursive: true })

      // Write the file
      await fs.writeFile(filePath, buffer)
      uploadedFiles.push(relativePath)
    }

    return NextResponse.json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 })
  }
}

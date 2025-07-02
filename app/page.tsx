"use client"

import type React from "react"

import { useState } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload, Send, FileText, Folder } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function FileSystemMCP() {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  })

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const formData = new FormData()

    // Add all files to FormData
    Array.from(files).forEach((file) => {
      formData.append("files", file)
    })

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        setUploadedFiles(result.files)
        toast({
          title: "Success",
          description: `${result.files.length} files uploaded successfully`,
        })
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">MCP Filesystem Assistant</h1>
          <p className="text-lg text-gray-600">Upload files and use AI to manage your filesystem operations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Upload Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                File Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  type="file"
                  multiple
                  webkitdirectory=""
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-500 mt-2">Select a folder to upload all its files</p>
              </div>

              {uploading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Uploading files...</p>
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    Uploaded Files ({uploadedFiles.length})
                  </h3>
                  <ScrollArea className="h-40 border rounded p-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 py-1">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm truncate">{file}</span>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>AI Filesystem Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Messages */}
                <ScrollArea className="h-96 border rounded p-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p className="mb-4">👋 Hi! I'm your filesystem assistant.</p>
                      <p className="text-sm">Upload some files and ask me to help you manage them. I can:</p>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• List and explore your files</li>
                        <li>• Read and show file contents</li>
                        <li>• Create new files</li>
                        <li>• Edit existing files</li>
                        <li>• Delete files</li>
                        <li>• Create directories</li>
                      </ul>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              message.role === "user" ? "bg-blue-600 text-white" : "bg-white border shadow-sm"
                            }`}
                          >
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask me to help with your files... (e.g., 'List all files', 'Create a new README.md', 'Edit the main.js file')"
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>

                {/* Example Prompts */}
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Example prompts:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "List all files in the project",
                      "Show me the content of package.json",
                      "Create a new file called notes.txt",
                      "Edit the README.md file to add installation instructions",
                      "Delete the old-file.txt",
                    ].map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleInputChange({ target: { value: prompt } } as any)}
                        disabled={isLoading}
                        className="text-xs"
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

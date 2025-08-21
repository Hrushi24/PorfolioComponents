"use client"

import type React from "react"

import { useEffect, useState } from "react"
import type { Project } from "@/types/project"
import { getProjects, saveProjects } from "@/lib/projects"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Download, Edit } from "lucide-react"

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isClientAuth, setIsClientAuth] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")

  // Client-side password protection fallback
  useEffect(() => {
    const stored = localStorage.getItem("admin-authenticated")
    if (stored === "true") {
      setIsClientAuth(true)
      loadProjects()
    }
  }, [])

  const loadProjects = () => {
    setProjects(getProjects())
  }

  const handleClientAuth = async () => {
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        localStorage.setItem("admin-authenticated", "true")
        setIsClientAuth(true)
        setAuthError("")
        loadProjects()
      } else {
        setAuthError(data.error || "Invalid password")
      }
    } catch (error) {
      setAuthError("Authentication failed. Please try again.")
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const stackString = formData.get("stack") as string
    const stack = stackString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    const projectData: Project = {
      id: editingProject?.id || Date.now().toString(),
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      stack,
      coverImage: formData.get("coverImage") as string,
      projectUrl: (formData.get("projectUrl") as string) || undefined,
      githubUrl: (formData.get("githubUrl") as string) || undefined,
      summary: (formData.get("summary") as string) || undefined,
      videoUrl: (formData.get("videoUrl") as string) || undefined,
    }

    let updatedProjects
    if (editingProject) {
      updatedProjects = projects.map((p) => (p.id === editingProject.id ? projectData : p))
    } else {
      updatedProjects = [...projects, projectData]
    }

    setProjects(updatedProjects)
    saveProjects(updatedProjects)
    setEditingProject(null)

    // Reset form
    e.currentTarget.reset()
  }

  const handleDelete = (id: string) => {
    const updatedProjects = projects.filter((p) => p.id !== id)
    setProjects(updatedProjects)
    saveProjects(updatedProjects)
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
  }

  const exportData = () => {
    const dataStr = JSON.stringify(projects, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "projects.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleLogout = () => {
    localStorage.removeItem("admin-authenticated")
    setIsClientAuth(false)
    setPassword("")
    setAuthError("")
    window.location.href = "/projects"
  }

  // Client-side auth gate
  if (!isClientAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleClientAuth()}
              />
            </div>
            {authError && <p className="text-destructive text-sm">{authError}</p>}
            <Button onClick={handleClientAuth} className="w-full">
              Access Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Admin: Projects</h1>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{editingProject ? "Edit Project" : "Add New Project"}</CardTitle>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Logout
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  <Input id="name" name="name" required defaultValue={editingProject?.name} />
                </div>

                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" name="slug" required defaultValue={editingProject?.slug} />
                </div>

                <div>
                  <Label htmlFor="stack">Tech Stack (comma-separated)</Label>
                  <Input
                    id="stack"
                    name="stack"
                    required
                    defaultValue={editingProject?.stack.join(", ")}
                    placeholder="Next.js, TypeScript, Tailwind CSS"
                  />
                </div>

                <div>
                  <Label htmlFor="coverImage">Cover Image URL</Label>
                  <Input
                    id="coverImage"
                    name="coverImage"
                    type="url"
                    required
                    defaultValue={editingProject?.coverImage}
                  />
                </div>

                <div>
                  <Label htmlFor="projectUrl">Project URL (optional)</Label>
                  <Input id="projectUrl" name="projectUrl" type="url" defaultValue={editingProject?.projectUrl} />
                </div>

                <div>
                  <Label htmlFor="githubUrl">GitHub URL (optional)</Label>
                  <Input id="githubUrl" name="githubUrl" type="url" defaultValue={editingProject?.githubUrl} />
                </div>

                <div>
                  <Label htmlFor="videoUrl">Video URL (optional)</Label>
                  <Input
                    id="videoUrl"
                    name="videoUrl"
                    type="url"
                    defaultValue={editingProject?.videoUrl}
                    placeholder="YouTube embed URL or MP4 file URL"
                  />
                </div>

                <div>
                  <Label htmlFor="summary">Summary (Markdown supported)</Label>
                  <Textarea
                    id="summary"
                    name="summary"
                    rows={6}
                    defaultValue={editingProject?.summary}
                    placeholder="Project description in Markdown..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">{editingProject ? "Update" : "Add"} Project</Button>
                  {editingProject && (
                    <Button type="button" variant="outline" onClick={() => setEditingProject(null)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Projects List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Current Projects</h2>
            {projects.map((project) => (
              <Card key={project.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-card-foreground">{project.name}</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(project)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(project.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">/{project.slug}</p>
                  <div className="flex flex-wrap gap-1">
                    {project.stack.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

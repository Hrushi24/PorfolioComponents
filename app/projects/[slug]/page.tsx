"use client"

import { useEffect, useState } from "react"
import { notFound } from "next/navigation"
import type { Project } from "@/types/project"
import { getProjectBySlug } from "@/lib/projects"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, Github } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import ReactMarkdown from "react-markdown"

interface ProjectPageProps {
  params: { slug: string }
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const foundProject = getProjectBySlug(params.slug)
    setProject(foundProject || null)
    setLoading(false)

    if (foundProject) {
      document.title = `${foundProject.name} | Projects`

      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement("meta")
        metaDescription.setAttribute("name", "description")
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute("content", foundProject.summary?.slice(0, 160) || "")

      // Update OG tags
      const updateOrCreateMeta = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`)
        if (!meta) {
          meta = document.createElement("meta")
          meta.setAttribute("property", property)
          document.head.appendChild(meta)
        }
        meta.setAttribute("content", content)
      }

      updateOrCreateMeta("og:title", foundProject.name)
      updateOrCreateMeta("og:description", foundProject.summary?.slice(0, 160) || "")
      updateOrCreateMeta("og:image", foundProject.coverImage || "")
      updateOrCreateMeta("og:type", "article")
    }
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!project) {
    notFound()
  }

  const isYouTubeUrl = project.videoUrl?.includes("youtube.com") || project.videoUrl?.includes("youtu.be")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link href="/projects">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">{project.name}</h1>
            <div className="flex flex-wrap gap-2 mb-6">
              {project.stack.map((tech) => (
                <Badge key={tech} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>

            <div className="flex gap-4">
              {project.projectUrl && (
                <Button asChild>
                  <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Live Demo
                  </a>
                </Button>
              )}

              {project.githubUrl && (
                <Button asChild variant="outline">
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-2" />
                    View Code
                  </a>
                </Button>
              )}
            </div>
          </div>

          {project.videoUrl ? (
            <div className="mb-8">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                {isYouTubeUrl ? (
                  <iframe
                    src={project.videoUrl}
                    title={project.name}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video controls poster={project.coverImage} className="w-full h-full object-cover">
                    <source src={project.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={project.coverImage || "/placeholder.svg"}
                  alt={project.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {project.summary && (
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <ReactMarkdown>{project.summary}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

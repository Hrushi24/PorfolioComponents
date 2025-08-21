"use client"

import { useEffect, useState } from "react"
import type { Project } from "@/types/project"
import { getProjects } from "@/lib/projects"
import { ProjectCard } from "@/components/project-card"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    setProjects(getProjects())
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Projects</h1>
          <p className="text-muted-foreground text-lg">A collection of my recent work and side projects.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} showDetails />
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No projects found.</p>
          </div>
        )}
      </div>
    </div>
  )
}

import type { Project } from "@/types/project"
import projectsData from "@/data/projects.json"

export function getProjects(): Project[] {
  if (typeof window === "undefined") {
    // Server-side: return static data, will be hydrated on client
    return projectsData
  }

  try {
    // Try to get from localStorage first (admin edits)
    const stored = localStorage.getItem("projects")
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.warn("Failed to parse projects from localStorage:", error)
  }

  // Fallback to static data
  return projectsData
}

export function getProjectBySlug(slug: string): Project | undefined {
  const projects = getProjects()
  return projects.find((project) => project.slug === slug)
}

export function saveProjects(projects: Project[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("projects", JSON.stringify(projects, null, 2))
  }
}

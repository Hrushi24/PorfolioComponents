export interface Project {
  id: string
  name: string
  slug: string
  stack: string[]
  coverImage: string
  projectUrl?: string
  githubUrl?: string
  summary?: string
  videoUrl?: string
}

import type { Project } from "@/types/project"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface ProjectCardProps {
  project: Project
  showDetails?: boolean
}

export function ProjectCard({ project, showDetails = false }: ProjectCardProps) {
  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="relative aspect-video">
        <Image src={project.coverImage || "/placeholder.svg"} alt={project.name} fill className="object-cover" />
      </div>

      <CardHeader>
        <CardTitle className="text-card-foreground">{project.name}</CardTitle>
        <div className="flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardFooter className="flex gap-2">
        {showDetails ? (
          <Link href={`/projects/${project.slug}`} className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              View Details
            </Button>
          </Link>
        ) : null}

        {project.projectUrl && (
          <Button asChild size="sm" variant="outline">
            <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}

        {project.githubUrl && (
          <Button asChild size="sm" variant="outline">
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

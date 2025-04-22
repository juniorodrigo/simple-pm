import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"
import { CalendarRange, Clock, Plus, Search, Tag } from "lucide-react"
import CreateProjectForm from "@/components/create-project-form"

export default function ProjectsPage() {
  // Mock data for projects
  const projects = [
    {
      id: "1",
      name: "Infrastructure Upgrade",
      description: "Server infrastructure upgrade and migration",
      startDate: "2023-10-01",
      endDate: "2023-12-15",
      progress: 75,
      tags: ["Infrastructure", "Critical"],
      activities: 12,
    },
    {
      id: "2",
      name: "CRM Development",
      description: "Customer relationship management system development",
      startDate: "2023-09-15",
      endDate: "2024-03-30",
      progress: 45,
      tags: ["Development"],
      activities: 24,
    },
    {
      id: "3",
      name: "Network Maintenance",
      description: "Quarterly network maintenance and security updates",
      startDate: "2023-11-01",
      endDate: "2023-11-15",
      progress: 90,
      tags: ["Maintenance"],
      activities: 8,
    },
    {
      id: "4",
      name: "Database Migration",
      description: "Migrate legacy database to new cloud platform",
      startDate: "2023-12-01",
      endDate: "2024-02-28",
      progress: 20,
      tags: ["Infrastructure", "Development"],
      activities: 18,
    },
    {
      id: "5",
      name: "Security Audit",
      description: "Comprehensive security audit and vulnerability assessment",
      startDate: "2023-10-15",
      endDate: "2023-11-30",
      progress: 100,
      tags: ["Maintenance", "Critical"],
      activities: 15,
    },
    {
      id: "6",
      name: "Mobile App Development",
      description: "Internal mobile application for field technicians",
      startDate: "2023-08-01",
      endDate: "2024-01-31",
      progress: 60,
      tags: ["Development"],
      activities: 32,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search projects..." className="w-full pl-8" />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <CreateProjectForm />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link href={`/projects/${project.id}`} key={project.id}>
                <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <CalendarRange className="mr-1 h-4 w-4" />
                          <span>
                            {new Date(project.startDate).toLocaleDateString()} -{" "}
                            {new Date(project.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>{project.activities} activities</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm font-medium">{project.progress}%</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${project.progress}%` }} />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                          >
                            <Tag className="mr-1 h-3 w-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="active" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects
              .filter((project) => project.progress < 100)
              .map((project) => (
                <Link href={`/projects/${project.id}`} key={project.id}>
                  <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <CalendarRange className="mr-1 h-4 w-4" />
                            <span>
                              {new Date(project.startDate).toLocaleDateString()} -{" "}
                              {new Date(project.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span>{project.activities} activities</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm font-medium">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-secondary h-2 rounded-full">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${project.progress}%` }} />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                            >
                              <Tag className="mr-1 h-3 w-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects
              .filter((project) => project.progress === 100)
              .map((project) => (
                <Link href={`/projects/${project.id}`} key={project.id}>
                  <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <CalendarRange className="mr-1 h-4 w-4" />
                            <span>
                              {new Date(project.startDate).toLocaleDateString()} -{" "}
                              {new Date(project.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span>{project.activities} activities</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm font-medium">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-secondary h-2 rounded-full">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${project.progress}%` }} />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                            >
                              <Tag className="mr-1 h-3 w-3" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

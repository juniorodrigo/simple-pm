"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search } from "lucide-react"
import GanttChart from "@/components/gantt-chart"
import CreateActivityForm from "@/components/create-activity-form"

export default function GanttPage() {
  const [selectedProject, setSelectedProject] = useState<string>("all")

  // Mock data for projects and activities
  const projects = [
    { id: "1", name: "Infrastructure Upgrade" },
    { id: "2", name: "CRM Development" },
    { id: "3", name: "Network Maintenance" },
    { id: "4", name: "Database Migration" },
  ]

  const activities = [
    {
      id: "a1",
      title: "Requirements Analysis",
      description: "Gather and analyze system requirements",
      status: "done",
      assignee: "Jane Smith",
      startDate: "2023-10-01",
      dueDate: "2023-10-10",
      priority: "high",
      tags: ["Infrastructure"],
      projectId: "1",
    },
    {
      id: "a2",
      title: "Architecture Design",
      description: "Design system architecture",
      status: "done",
      assignee: "John Doe",
      startDate: "2023-10-11",
      dueDate: "2023-10-25",
      priority: "high",
      tags: ["Infrastructure"],
      projectId: "1",
    },
    {
      id: "a3",
      title: "Server Provisioning",
      description: "Provision and configure new servers",
      status: "in-progress",
      assignee: "Robert Johnson",
      startDate: "2023-10-26",
      dueDate: "2023-11-15",
      priority: "medium",
      tags: ["Infrastructure"],
      projectId: "1",
    },
    {
      id: "a4",
      title: "Data Migration",
      description: "Migrate data to new infrastructure",
      status: "todo",
      assignee: "Emily Davis",
      startDate: "2023-11-16",
      dueDate: "2023-12-05",
      priority: "critical",
      tags: ["Infrastructure", "Critical"],
      projectId: "1",
    },
    {
      id: "a5",
      title: "Database Schema Design",
      description: "Design database schema for CRM",
      status: "done",
      assignee: "Jane Smith",
      startDate: "2023-09-15",
      dueDate: "2023-09-30",
      priority: "high",
      tags: ["Development"],
      projectId: "2",
    },
    {
      id: "a6",
      title: "Frontend Development",
      description: "Develop CRM frontend",
      status: "in-progress",
      assignee: "Robert Johnson",
      startDate: "2023-10-01",
      dueDate: "2023-11-15",
      priority: "medium",
      tags: ["Development"],
      projectId: "2",
    },
    {
      id: "a7",
      title: "Backend API Development",
      description: "Develop CRM backend APIs",
      status: "in-progress",
      assignee: "John Doe",
      startDate: "2023-10-01",
      dueDate: "2023-11-30",
      priority: "high",
      tags: ["Development"],
      projectId: "2",
    },
    {
      id: "a8",
      title: "Network Audit",
      description: "Perform network audit",
      status: "done",
      assignee: "Emily Davis",
      startDate: "2023-11-01",
      dueDate: "2023-11-07",
      priority: "medium",
      tags: ["Maintenance"],
      projectId: "3",
    },
    {
      id: "a9",
      title: "Security Updates",
      description: "Apply security patches",
      status: "todo",
      assignee: "Robert Johnson",
      startDate: "2023-11-08",
      dueDate: "2023-11-15",
      priority: "critical",
      tags: ["Maintenance", "Critical"],
      projectId: "3",
    },
  ]

  // Filter activities based on selected project
  const filteredActivities =
    selectedProject === "all" ? activities : activities.filter((activity) => activity.projectId === selectedProject)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gantt Chart</h1>
          <p className="text-muted-foreground">Visualize project timeline and dependencies</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Activity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <CreateActivityForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="w-full md:w-64">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search activities..." className="w-full pl-8" />
        </div>
      </div>

      <div className="border rounded-lg p-4 overflow-hidden">
        <GanttChart activities={filteredActivities} />
      </div>
    </div>
  )
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CalendarRange, Clock, Edit, Plus, Users, ListPlus } from "lucide-react";
import KanbanBoard from "@/components/kanban-board";
import GanttChart from "@/components/gantt-chart";
import CreateActivityModal from "@/components/create-activity-modal";
import ProjectStagesModal from "@/components/project-stages-modal";

export default function ProjectPage({ params }: { params: { id: string } }) {
	const [activeView, setActiveView] = useState<"kanban" | "gantt">("kanban");
	const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
	const [projectActivities, setProjectActivities] = useState([] as any[]);
	const [isStagesModalOpen, setIsStagesModalOpen] = useState(false);
	const [projectStages, setProjectStages] = useState([] as any[]);

	// Mock project data
	const project = {
		id: params.id,
		name: "Infrastructure Upgrade",
		description: "Server infrastructure upgrade and migration to cloud platform with improved security and performance.",
		startDate: "2023-10-01",
		endDate: "2023-12-15",
		progress: 75,
		tags: ["Infrastructure", "Critical"],
		manager: "John Doe",
		team: ["Jane Smith", "Robert Johnson", "Emily Davis"],
		stages: [
			{
				id: "s1",
				name: "Planning",
				description: "Initial planning and requirements gathering",
				color: "blue",
				order: 1,
			},
			{
				id: "s2",
				name: "Architecture",
				description: "System architecture design",
				color: "purple",
				order: 2,
			},
			{
				id: "s3",
				name: "Implementation",
				description: "Implementation and development",
				color: "green",
				order: 3,
			},
			{
				id: "s4",
				name: "Testing",
				description: "Testing and quality assurance",
				color: "yellow",
				order: 4,
			},
		],
		activities: [
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
				stageId: "s1",
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
				stageId: "s2",
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
				stageId: "s3",
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
				stageId: "s3",
			},
			{
				id: "a5",
				title: "Testing",
				description: "Perform system testing",
				status: "todo",
				assignee: "Jane Smith",
				startDate: "2023-12-06",
				dueDate: "2023-12-12",
				priority: "high",
				tags: ["Infrastructure"],
				stageId: "s4",
			},
			{
				id: "a6",
				title: "Deployment",
				description: "Deploy to production",
				status: "todo",
				assignee: "John Doe",
				startDate: "2023-12-13",
				dueDate: "2023-12-15",
				priority: "critical",
				tags: ["Infrastructure", "Critical"],
				stageId: "s4",
			},
		],
	};

	useState(() => {
		setProjectStages(project.stages);
	}, []);

	const handleAddActivity = (newActivity: any) => {
		setProjectActivities([...projectActivities, newActivity]);
	};

	const handleUpdateStages = (updatedStages: any[]) => {
		setProjectStages(updatedStages);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">{project.name}</h1>
					<p className="text-muted-foreground">{project.description}</p>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline">
						<Edit className="mr-2 h-4 w-4" />
						Edit Project
					</Button>
					<Dialog open={isStagesModalOpen} onOpenChange={setIsStagesModalOpen}>
						<Button variant="outline" onClick={() => setIsStagesModalOpen(true)}>
							<ListPlus className="mr-2 h-4 w-4" />
							Manage Stages
						</Button>
						<DialogContent className="sm:max-w-[700px]">
							<ProjectStagesModal projectId={project.id} stages={projectStages} onClose={() => setIsStagesModalOpen(false)} onSave={handleUpdateStages} />
						</DialogContent>
					</Dialog>
					<Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
						<Button onClick={() => setIsActivityModalOpen(true)}>
							<Plus className="mr-2 h-4 w-4" />
							New Activity
						</Button>
						<DialogContent className="sm:max-w-[600px]">
							<CreateActivityModal projectId={project.id} stages={project.stages} onClose={() => setIsActivityModalOpen(false)} onSuccess={handleAddActivity} />
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Progress</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{project.progress}%</div>
						<div className="mt-2 w-full bg-secondary h-2 rounded-full">
							<div className="bg-primary h-2 rounded-full" style={{ width: `${project.progress}%` }} />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Timeline</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center text-sm">
							<CalendarRange className="mr-1 h-4 w-4 text-muted-foreground" />
							<span>
								{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
							</span>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Activities</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center text-sm">
							<Clock className="mr-1 h-4 w-4 text-muted-foreground" />
							<span>{project.activities.length} total activities</span>
						</div>
						<div className="mt-2 grid grid-cols-3 gap-2 text-xs">
							<div className="flex flex-col items-center justify-center rounded-lg bg-secondary p-2">
								<span className="font-medium">To Do</span>
								<span className="text-lg font-bold">{project.activities.filter((a) => a.status === "todo").length}</span>
							</div>
							<div className="flex flex-col items-center justify-center rounded-lg bg-secondary p-2">
								<span className="font-medium">In Progress</span>
								<span className="text-lg font-bold">{project.activities.filter((a) => a.status === "in-progress").length}</span>
							</div>
							<div className="flex flex-col items-center justify-center rounded-lg bg-secondary p-2">
								<span className="font-medium">Done</span>
								<span className="text-lg font-bold">{project.activities.filter((a) => a.status === "done").length}</span>
							</div>
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium">Team</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center text-sm mb-2">
							<Users className="mr-1 h-4 w-4 text-muted-foreground" />
							<span>{project.team.length + 1} team members</span>
						</div>
						<div className="text-sm">
							<div className="font-medium">Manager: {project.manager}</div>
							<div className="mt-1">Team: {project.team.join(", ")}</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="flex items-center justify-between">
				<h2 className="text-xl font-bold">Project Activities</h2>
				<div className="flex items-center space-x-2">
					<Button variant={activeView === "kanban" ? "default" : "outline"} size="sm" onClick={() => setActiveView("kanban")}>
						Kanban
					</Button>
					<Button variant={activeView === "gantt" ? "default" : "outline"} size="sm" onClick={() => setActiveView("gantt")}>
						Gantt
					</Button>
				</div>
			</div>

			<div className="border rounded-lg p-4">
				{activeView === "kanban" ? <KanbanBoard activities={projectActivities} stages={projectStages} /> : <GanttChart activities={projectActivities} stages={projectStages} />}
			</div>
		</div>
	);
}

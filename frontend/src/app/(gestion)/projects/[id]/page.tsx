"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CalendarRange, Clock, Edit, Plus, Users, ListPlus } from "lucide-react";
import KanbanBoard from "@/components/kanban-board";
import GanttChart from "@/components/gantt-chart";
import CreateActivityModal from "@/components/create-activity-modal";
import ProjectStagesModal from "@/components/project-stages-modal";
import { BaseActivity } from "@/app/types/activity.type";
import { BaseStage } from "@/app/types/stage.type";
import { ExtendedProject } from "@/app/types/project.type";
import { ActivityPriority, ActivityStatus, Colors } from "@/app/types/enums";

export default function ProjectPage({ params }: { params: { id: string } }) {
	const [activeView, setActiveView] = useState<"kanban" | "gantt">("kanban");
	const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
	const [projectActivities, setProjectActivities] = useState<BaseActivity[]>([]);
	const [isStagesModalOpen, setIsStagesModalOpen] = useState(false);
	const [projectStages, setProjectStages] = useState<BaseStage[]>([]);

	// Project data con tipos correctos
	const project: ExtendedProject = {
		id: 1,
		name: "Infrastructure Upgrade",
		description: "Server infrastructure upgrade and migration to cloud platform with improved security and performance.",
		startDate: new Date("2023-10-01"),
		endDate: new Date("2023-12-15"),
		progressPercentage: 75,
		managerUserId: "1",
		managerUserName: "John Doe",
		team: [
			{ id: "2", name: "Jane", lastname: "Smith", projectRole: "Developer" },
			{ id: "3", name: "Robert", lastname: "Johnson", projectRole: "Developer" },
			{ id: "4", name: "Emily", lastname: "Davis", projectRole: "QA" },
		],
		stages: {
			id: "stages-1",
			name: "Project Stages",
			description: "All project stages",
			color: Colors.BLUE,
			projectId: 1,
			ordinalNumber: 1,
			activities: [
				{
					id: "a1",
					title: "Requirements Analysis",
					description: "Gather and analyze system requirements",
					status: ActivityStatus.DONE,
					assignedToUser: { id: "2", name: "Jane", lastname: "Smith", projectRole: "Developer" },
					startDate: new Date("2023-10-01"),
					endDate: new Date("2023-10-10"),
					priority: ActivityPriority.HIGH,
					stageId: "s1",
				},
				{
					id: "a2",
					title: "Architecture Design",
					description: "Design system architecture",
					status: ActivityStatus.DONE,
					assignedToUser: { id: "1", name: "John", lastname: "Doe", projectRole: "Manager" },
					startDate: new Date("2023-10-11"),
					endDate: new Date("2023-10-25"),
					priority: ActivityPriority.HIGH,
					stageId: "s2",
				},
			],
		},
	};

	useEffect(() => {
		// Solo actualizar si hay cambios reales
		const newActivities = project.stages?.activities || [];
		if (JSON.stringify(newActivities) !== JSON.stringify(projectActivities)) {
			setProjectActivities(newActivities);
		}

		// Actualizar stages
		const newStages = project.stages ? [project.stages] : [];
		if (JSON.stringify(newStages) !== JSON.stringify(projectStages)) {
			setProjectStages(newStages);
		}
	}, [project]);

	const handleAddActivity = (newActivity: BaseActivity) => {
		setProjectActivities((prev) => [...prev, newActivity]);
	};

	const handleUpdateStages = (updatedStages: BaseStage[]) => {
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
							<DialogTitle>Gestionar Etapas del Proyecto</DialogTitle>
							<DialogDescription>Create and organize stages for this project</DialogDescription>
							<ProjectStagesModal projectId={project.id} stages={projectStages} onClose={() => setIsStagesModalOpen(false)} onSave={handleUpdateStages} />
						</DialogContent>
					</Dialog>
					<Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
						<Button onClick={() => setIsActivityModalOpen(true)}>
							<Plus className="mr-2 h-4 w-4" />
							New Activity
						</Button>
						<DialogContent className="sm:max-w-[600px]">
							<DialogTitle>Crear Nueva Actividad</DialogTitle>
							<DialogDescription>Create and organize activities for this project</DialogDescription>

							<CreateActivityModal projectId={project.id} stages={projectStages} onClose={() => setIsActivityModalOpen(false)} onSuccess={handleAddActivity} />
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
						<div className="text-2xl font-bold">{project.progressPercentage}%</div>
						<div className="mt-2 w-full bg-secondary h-2 rounded-full">
							<div className="bg-primary h-2 rounded-full" style={{ width: `${project.progressPercentage}%` }} />
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
							<span>{projectActivities.length} total activities</span>
						</div>
						<div className="mt-2 grid grid-cols-3 gap-2 text-xs">
							<div className="flex flex-col items-center justify-center rounded-lg bg-secondary p-2">
								<span className="font-medium">To Do</span>
								<span className="text-lg font-bold">{projectActivities.filter((a) => a.status === ActivityStatus.TODO).length}</span>
							</div>
							<div className="flex flex-col items-center justify-center rounded-lg bg-secondary p-2">
								<span className="font-medium">In Progress</span>
								<span className="text-lg font-bold">{projectActivities.filter((a) => a.status === ActivityStatus.IN_PROGRESS).length}</span>
							</div>
							<div className="flex flex-col items-center justify-center rounded-lg bg-secondary p-2">
								<span className="font-medium">Done</span>
								<span className="text-lg font-bold">{projectActivities.filter((a) => a.status === ActivityStatus.DONE).length}</span>
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
							<div className="font-medium">Manager: {project.managerUserName}</div>
							<div className="mt-1">Team: {project.team.map((member) => `${member.name} ${member.lastname}`).join(", ")}</div>
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

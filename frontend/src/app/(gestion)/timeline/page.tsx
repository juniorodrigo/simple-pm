"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { ProjectCard } from "@/components/project/project-bystage-card";

export default function GanttPage() {
	const [selectedProject, setSelectedProject] = useState<string>("all");

	// Mock data for projects and stages
	const projects = [
		{
			id: "1",
			name: "Infrastructure Upgrade",
			startDate: "2023-10-01",
			endDate: "2023-12-15",
			progress: 75,
			stages: [
				{ id: "s1", name: "Planning", progress: 100, color: "blue", startDate: "2023-10-01", endDate: "2023-10-10" },
				{
					id: "s2",
					name: "Architecture",
					progress: 100,
					color: "purple",
					startDate: "2023-10-11",
					endDate: "2023-10-25",
				},
				{
					id: "s3",
					name: "Implementation",
					progress: 50,
					color: "green",
					startDate: "2023-10-26",
					endDate: "2023-12-05",
				},
				{ id: "s4", name: "Testing", progress: 0, color: "yellow", startDate: "2023-12-06", endDate: "2023-12-15" },
			],
		},
		{
			id: "2",
			name: "CRM Development",
			startDate: "2023-09-15",
			endDate: "2024-03-30",
			progress: 45,
			stages: [
				{ id: "s1", name: "Planning", progress: 100, color: "blue", startDate: "2023-09-15", endDate: "2023-09-30" },
				{ id: "s2", name: "Design", progress: 100, color: "purple", startDate: "2023-10-01", endDate: "2023-10-31" },
				{ id: "s3", name: "Backend", progress: 70, color: "green", startDate: "2023-11-01", endDate: "2023-12-31" },
				{ id: "s4", name: "Frontend", progress: 30, color: "pink", startDate: "2024-01-01", endDate: "2024-02-29" },
				{ id: "s5", name: "Testing", progress: 0, color: "yellow", startDate: "2024-03-01", endDate: "2024-03-30" },
			],
		},
		{
			id: "3",
			name: "Network Maintenance",
			startDate: "2023-11-01",
			endDate: "2023-11-15",
			progress: 90,
			stages: [
				{ id: "s1", name: "Planning", progress: 100, color: "blue", startDate: "2023-11-01", endDate: "2023-11-03" },
				{ id: "s2", name: "Audit", progress: 100, color: "purple", startDate: "2023-11-04", endDate: "2023-11-07" },
				{
					id: "s3",
					name: "Implementation",
					progress: 80,
					color: "green",
					startDate: "2023-11-08",
					endDate: "2023-11-12",
				},
				{
					id: "s4",
					name: "Verification",
					progress: 50,
					color: "yellow",
					startDate: "2023-11-13",
					endDate: "2023-11-15",
				},
			],
		},
	];

	// Filter projects based on selected project
	const filteredProjects = selectedProject === "all" ? projects : projects.filter((project) => project.id === selectedProject);

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">Vista de Proyectos por Etapas</h1>
					<p className="text-muted-foreground">Visualiza el progreso de los proyectos por etapas individuales</p>
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
					<Input type="search" placeholder="Buscar proyectos..." className="w-full pl-8" />
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{filteredProjects.map((project) => (
					<ProjectCard key={project.id} project={project} />
				))}
			</div>
		</div>
	);
}

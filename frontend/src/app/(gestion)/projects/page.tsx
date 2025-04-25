"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import { CalendarRange, Clock, Plus, Search, Tag } from "lucide-react";
import CreateProjectForm from "@/components/create-project-form";
import type { ExtendedProject } from "@/app/types/project.type";
import { Badge } from "@/components/ui/badge";
import { getTagColorClass } from "@/lib/colors";
import { ProjectsService } from "@/services/project.service";

export default function ProjectsPage() {
	const [projects, setProjects] = useState<ExtendedProject[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadProjects = async () => {
			setIsLoading(true);
			const response = await ProjectsService.getProjects();
			if (response.success && response.data) {
				setProjects(response.data);
			}
			setIsLoading(false);
		};

		loadProjects();
	}, []);

	const EmptyState = () => (
		<Card className="w-full p-6">
			<div className="text-center space-y-2">
				<p className="text-lg font-medium">No hay proyectos</p>
				<p className="text-muted-foreground">No se encontraron proyectos para mostrar.</p>
			</div>
		</Card>
	);

	const ProjectGrid = ({ projects }: { projects: ExtendedProject[] }) => {
		if (projects.length === 0) return <EmptyState />;

		return (
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
												{new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
											</span>
										</div>
										<div className="flex items-center">
											<Clock className="mr-1 h-4 w-4 text-muted-foreground" />
											<span>{project.activitiesCount ?? 0} activities</span>
										</div>
									</div>
									<div>
										<div className="flex justify-between mb-1">
											<span className="text-sm font-medium">Progreso</span>
											<span className="text-sm font-medium">{project.progressPercentage ?? 0}%</span>
										</div>
										<div className="w-full bg-secondary h-2 rounded-full">
											<div className="bg-primary h-2 rounded-full" style={{ width: `${project.progressPercentage ?? 0}%` }} />
										</div>
									</div>
									{project.categoryName && (
										<div className="flex flex-wrap gap-2">
											<Badge variant="outline" className={getTagColorClass(project.categoryColor || "gray")}>
												<Tag className="mr-1 h-3 w-3" />
												{project.categoryName}
											</Badge>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		);
	};

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
							Nuevo Proyecto
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogTitle>Crear Proyecto</DialogTitle>
						<CreateProjectForm />
					</DialogContent>
				</Dialog>
			</div>

			<Tabs defaultValue="all">
				<TabsList>
					<TabsTrigger value="all">Todos</TabsTrigger>
					<TabsTrigger value="active">Activos</TabsTrigger>
					<TabsTrigger value="completed">Completados</TabsTrigger>
				</TabsList>
				<TabsContent value="all" className="mt-4">
					{isLoading ? <div className="text-center p-4">Cargando proyectos...</div> : <ProjectGrid projects={projects} />}
				</TabsContent>
				<TabsContent value="active" className="mt-4">
					{isLoading ? <div className="text-center p-4">Cargando proyectos...</div> : <ProjectGrid projects={projects.filter((project) => (project.progressPercentage ?? 0) < 100)} />}
				</TabsContent>
				<TabsContent value="completed" className="mt-4">
					{isLoading ? <div className="text-center p-4">Cargando proyectos...</div> : <ProjectGrid projects={projects.filter((project) => project.progressPercentage === 100)} />}
				</TabsContent>
			</Tabs>
		</div>
	);
}

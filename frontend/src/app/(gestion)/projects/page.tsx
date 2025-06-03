"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Loader2, KanbanSquare, GanttChart } from "lucide-react";
import { ProjectsService } from "@/services/project.service";
import { BaseProject } from "@/types/project.type";
import ProjectKanbanBoard from "@/components/projects/project-kanban-board";
import { useToast } from "@/hooks/use-toast";
import CreateProjectForm from "@/components/projects/create-project-form";
import { useRouter } from "next/navigation";
import ProjectsGantt from "@/components/project/projects-gantt";
import { useAuth } from "@/contexts/auth-context";

export default function KanbanPage() {
	const { user } = useAuth();
	const isViewer = user?.role === "viewer";
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [projects, setProjects] = useState<BaseProject[]>([]);
	const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [activeView, setActiveView] = useState<"kanban" | "gantt">("kanban");
	const { toast } = useToast();
	const router = useRouter();

	// Cargar proyectos
	useEffect(() => {
		async function loadProjects() {
			setLoading(true);
			try {
				const response = await ProjectsService.getProjects();
				if (response.success && response.data) {
					setProjects(response.data);

					// Extraer categorías únicas de los proyectos
					const uniqueCategories = new Map();
					response.data.forEach((project: BaseProject) => {
						if (project.categoryId && project.categoryName) {
							uniqueCategories.set(project.categoryId, {
								id: project.categoryId,
								name: project.categoryName,
							});
						}
					});
					setCategories(Array.from(uniqueCategories.values()));
				} else {
					toast({
						title: "Error",
						description: "No se recibieron datos de proyectos",
						variant: "destructive",
					});
				}
			} catch (error) {
				toast({
					title: "Error",
					description: "No se pudieron cargar los proyectos",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		}

		loadProjects();
	}, [toast]);

	// Filtrar proyectos por categoría y término de búsqueda
	const filteredProjects = projects.filter((project) => {
		const matchesCategory = selectedCategory === "all" || project.categoryId === selectedCategory;
		const matchesSearch = searchTerm === "" || project.name.toLowerCase().includes(searchTerm.toLowerCase()) || project.description?.toLowerCase().includes(searchTerm.toLowerCase());

		return matchesCategory && matchesSearch;
	});

	// Manejar cambios en proyectos (después de arrastrar)
	const handleProjectChange = async (updatedProjects: BaseProject[]) => {
		setProjects(updatedProjects);
	};

	// Función para recargar proyectos después de crear uno nuevo
	const handleProjectCreated = async () => {
		setIsDialogOpen(false);
		setLoading(true);
		try {
			const response = await ProjectsService.getProjects();
			if (response.success && response.data) {
				setProjects(response.data);

				// Extraer categorías únicas de los proyectos
				const uniqueCategories = new Map();
				response.data.forEach((project: BaseProject) => {
					if (project.categoryId && project.categoryName) {
						uniqueCategories.set(project.categoryId, {
							id: project.categoryId,
							name: project.categoryName,
						});
					}
				});
				setCategories(Array.from(uniqueCategories.values()));
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "No se pudieron recargar los proyectos",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	// Función para manejar el clic en un proyecto
	const handleProjectClick = (project: BaseProject) => {
		router.push(`/projects/${project.id}`);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">Lista de Proyectos</h1>
					<p className="text-muted-foreground">Gestiona tus proyectos usando arrastrar y soltar</p>
				</div>
				{!isViewer && (
					<div className="flex items-center gap-2">
						<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
							<DialogTrigger asChild>
								<Button>
									<Plus className="mr-2 h-4 w-4" />
									Nuevo Proyecto
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
								<DialogHeader>
									<DialogTitle>Crear nuevo proyecto</DialogTitle>
								</DialogHeader>
								<CreateProjectForm onSuccess={handleProjectCreated} />
							</DialogContent>
						</Dialog>
					</div>
				)}
			</div>

			<div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
				<div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
					<div className="w-full md:w-64">
						<Select value={selectedCategory} onValueChange={setSelectedCategory}>
							<SelectTrigger>
								<SelectValue placeholder="Filtrar por categoría" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todas las categorías</SelectItem>
								{categories.map((category) => (
									<SelectItem key={category.id} value={category.id}>
										{category.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="relative w-full md:w-64">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input type="search" placeholder="Buscar proyectos..." className="w-full pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
					</div>
					<div className="text-sm text-muted-foreground">
						{loading ? (
							<span className="flex items-center">
								<Loader2 className="h-3 w-3 mr-1 animate-spin" />
								Cargando proyectos...
							</span>
						) : (
							`${filteredProjects.length} proyectos`
						)}
					</div>
				</div>

				<div className="flex border rounded-md overflow-hidden">
					<Button variant={activeView === "kanban" ? "default" : "ghost"} className={`rounded-none ${activeView === "kanban" ? "" : "border-r"}`} onClick={() => setActiveView("kanban")}>
						<KanbanSquare className="mr-2 h-4 w-4" />
						Kanban
					</Button>
					<Button variant={activeView === "gantt" ? "default" : "ghost"} className="rounded-none" onClick={() => setActiveView("gantt")}>
						<GanttChart className="mr-2 h-4 w-4" />
						Gantt
					</Button>
				</div>
			</div>

			{loading ? (
				<div className="flex justify-center items-center h-64">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			) : activeView === "kanban" ? (
				<ProjectKanbanBoard projects={filteredProjects} onProjectChange={handleProjectChange} onProjectClick={handleProjectClick} isViewer={isViewer} />
			) : (
				<ProjectsGantt projects={filteredProjects} />
			)}
		</div>
	);
}

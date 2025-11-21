"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Search, Loader2, KanbanSquare, GanttChart, Archive, FolderOpen, Grid3X3 } from "lucide-react";
import { ProjectsService } from "@/services/project.service";
import { Project } from "@/types/new/project.type";
import ProjectKanbanBoard from "@/components/projects/project-kanban-board";
import { useToast } from "@/hooks/use-toast";
import CreateProjectForm from "@/components/projects/project-form";
import { useRouter } from "next/navigation";
import ProjectsGantt from "@/components/projects/projects-gantt";
import { useAuth } from "@/contexts/auth-context";
import { ApiResponse } from "@/types/api-response.type";
import { SelectService } from "@/services/select.service";

export default function KanbanPage() {
	const { user, isLoading: authLoading } = useAuth();
	const isViewer = user?.role === "viewer";
	const isGerenteGeneral = user?.role === "gerente_general";
	const [selectedCategory, setSelectedCategory] = useState<string>(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("selectedCategory") || "all";
		}
		return "all";
	});
	const [selectedArea, setSelectedArea] = useState<string>("all");
	const [selectedManager, setSelectedManager] = useState<string>("all");
	const [projects, setProjects] = useState<Project[]>([]);
	const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
	const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);
	const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [showArchived, setShowArchived] = useState(false);
	const [loading, setLoading] = useState(true);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [activeView, setActiveView] = useState<"kanban" | "gantt">("kanban");
	const { toast } = useToast();
	const router = useRouter();

	// Cargar proyectos y áreas
	useEffect(() => {
		// No hacer peticiones mientras se está cargando la autenticación
		if (authLoading) return;

		const loadData = async () => {
			setLoading(true);

			try {
				const [projectResponse, areasResponse] = await Promise.all([
					ProjectsService.getProjects(user?.id || null),
					isGerenteGeneral ? SelectService.getAreas() : Promise.resolve({ success: true, data: [] }),
				]);

				console.log("Respuesta de áreas:", areasResponse);

				if (projectResponse.success && projectResponse.data) {
					const projectsData = Array.isArray(projectResponse.data) ? projectResponse.data : [projectResponse.data];
					console.log(
						"Proyectos recibidos:",
						projectsData.map((p) => ({
							id: p.id,
							name: p.name,
							areaId: p.areaId,
							manager: p.manager,
						}))
					);

					// Validar y convertir cada proyecto
					const validProjects: Project[] = [];
					const uniqueManagers = new Map<string, { id: string; name: string }>();

					projectsData.forEach((project: Project) => {
						if (project.categoryId && project.categoryName) {
							validProjects.push(project);

							// Extraer managers únicos del objeto manager
							if (project.manager) {
								const managerName = `${project.manager.name} ${project.manager.lastname}`.trim();
								uniqueManagers.set(project.manager.id, {
									id: project.manager.id,
									name: managerName,
								});
							}
						}
					});

					console.log("Managers únicos encontrados:", Array.from(uniqueManagers.values()));
					setProjects(validProjects);
					setManagers(Array.from(uniqueManagers.values()));

					// Extraer categorías únicas de los proyectos
					const uniqueCategories = new Map();
					validProjects.forEach((project: Project) => {
						if (project.categoryId && project.categoryName) {
							uniqueCategories.set(project.categoryId, {
								id: project.categoryId,
								name: project.categoryName,
							});
						}
					});
					setCategories(Array.from(uniqueCategories.values()));
				}

				if (areasResponse.success && areasResponse.data) {
					console.log("Áreas cargadas:", areasResponse.data);
					setAreas(areasResponse.data);
				}
			} catch (error) {
				toast({
					title: "Error",
					description: "No se pudieron cargar los datos",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [toast, user, authLoading, isGerenteGeneral]);

	// Filtrar proyectos por categoría, área, manager y término de búsqueda
	// Guardar la categoría seleccionada en localStorage
	useEffect(() => {
		if (typeof window !== "undefined") {
			localStorage.setItem("selectedCategory", selectedCategory);
		}
	}, [selectedCategory]);

	const filteredProjects = projects.filter((project) => {
		const matchesCategory = selectedCategory === "all" || project.categoryId === selectedCategory;
		const matchesArea = selectedArea === "all" || project.areaId === selectedArea;
		const matchesManager = selectedManager === "all" || (project.manager && project.manager.id === selectedManager);
		const matchesSearch = searchTerm === "" || project.name.toLowerCase().includes(searchTerm.toLowerCase()) || project.description?.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesArchived = showArchived || !project.archived;

		console.log("Filtrado de proyecto:", {
			projectName: project.name,
			projectAreaId: project.areaId,
			selectedArea,
			matchesArea,
			matchesCategory,
			matchesManager,
			matchesSearch,
			matchesArchived,
		});

		return matchesCategory && matchesArea && matchesManager && matchesSearch && matchesArchived;
	});

	// Manejar cambios en proyectos (después de arrastrar)
	const handleProjectChange = async (updatedProjects: Project[]) => {
		setProjects(updatedProjects);

		try {
			const projectResponse: ApiResponse = await ProjectsService.getProjects(user?.id || null);

			if (projectResponse.success && projectResponse.data) {
				const projectsData = Array.isArray(projectResponse.data) ? projectResponse.data : [projectResponse.data];

				const validProjects: Project[] = [];
				projectsData.forEach((project: Project) => {
					if (project.categoryId && project.categoryName) {
						validProjects.push(project);
					}
				});

				setProjects(validProjects);

				// Extraer categorías únicas de los proyectos
				const uniqueCategories = new Map();
				validProjects.forEach((project: Project) => {
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
			console.error("Error refreshing projects:", error);
		}
	};

	// Función para recargar proyectos después de crear uno nuevo
	const handleProjectCreated = async () => {
		setIsDialogOpen(false);
		setLoading(true);
		try {
			const response = await ProjectsService.getProjects(user?.id || null);
			if (response.success && response.data) {
				setProjects(response.data);

				// Extraer categorías únicas de los proyectos
				const uniqueCategories = new Map();
				response.data.forEach((project: Project) => {
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
	const handleProjectClick = (project: Project) => {
		router.push(`/proyectos/${project.id}`);
	};

	return (
		<div className="h-full flex flex-col space-y-6">
			{/* Header distintivo para la vista de lista de proyectos */}
			<div className="relative flex-shrink-0">
				<div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg"></div>
				<div className="relative bg-card/50 backdrop-blur-sm border rounded-lg p-6">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-primary/10 rounded-lg">
								<Grid3X3 className="h-6 w-6 text-primary" />
							</div>
							<div>
								<h1 className="text-2xl font-bold flex items-center gap-2">Gestión de Proyectos</h1>
								<p className="text-muted-foreground">Vista general de proyectos</p>
							</div>
						</div>
						{!isViewer && (
							<div className="flex items-center gap-2">
								<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
									<DialogTrigger asChild>
										<Button className="shadow-lg">
											<Plus className="mr-2 h-4 w-4" />
											Nuevo Proyecto
										</Button>
									</DialogTrigger>
									<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
										<DialogHeader>
											<DialogTitle>Crear nuevo proyecto</DialogTitle>
										</DialogHeader>
										<CreateProjectForm onSuccess={handleProjectCreated} onCancel={() => setIsDialogOpen(false)} defaultCategoryId={selectedCategory} />
									</DialogContent>
								</Dialog>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between flex-shrink-0">
				<div className="flex flex-col md:flex-row gap-4 items-start md:items-center flex-wrap">
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

					{isGerenteGeneral && (
						<>
							<div className="w-full md:w-64">
								<Select value={selectedArea} onValueChange={setSelectedArea}>
									<SelectTrigger>
										<SelectValue placeholder="Filtrar por área" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Todas las áreas</SelectItem>
										{areas.map((area) => (
											<SelectItem key={area.id} value={area.id}>
												{area.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="w-full md:w-64">
								<Select value={selectedManager} onValueChange={setSelectedManager}>
									<SelectTrigger>
										<SelectValue placeholder="Filtrar por manager" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Todos los managers</SelectItem>
										{managers.map((manager) => (
											<SelectItem key={manager.id} value={manager.id}>
												{manager.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</>
					)}

					<div className="relative w-full md:w-64">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input type="search" placeholder="Buscar categorías..." className="w-full pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
					</div>
					<div className="flex items-center space-x-2">
						<Switch id="show-archived" checked={showArchived} onCheckedChange={setShowArchived} />
						<Label htmlFor="show-archived" className="text-sm font-medium cursor-pointer flex items-center">
							<Archive className="mr-1 h-3 w-3" />
							Mostrar archivados
						</Label>
					</div>
					<div className="text-sm text-muted-foreground">
						{loading ? (
							<span className="flex items-center">
								<Loader2 className="h-3 w-3 mr-1 animate-spin" />
								Cargando proyectos...
							</span>
						) : (
							`${filteredProjects.length} proyectos${showArchived ? " (incluyendo archivados)" : " (activos)"}`
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

			<div className="flex-1 min-h-0">
				{loading ? (
					<div className="flex justify-center items-center h-64">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : activeView === "kanban" ? (
					<ProjectKanbanBoard initialProjects={filteredProjects} onProjectChange={handleProjectChange} onProjectClick={handleProjectClick} isViewer={isViewer} />
				) : (
					<ProjectsGantt projects={filteredProjects} />
				)}
			</div>
		</div>
	);
}

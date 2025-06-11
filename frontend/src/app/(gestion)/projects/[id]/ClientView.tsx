// app/projects/[id]/ClientView.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Plus, ListPlus, ChevronDown, ChevronUp, X, BarChart3, ArrowLeft, Folder, Target } from "lucide-react";
import KanbanBoard from "@/components/project/kanban-board";
import GanttChart from "@/components/project/gantt-chart";
import CreateActivityModal from "@/components/project/activity-modal";
import ProjectStagesModal from "@/components/project/project-stages-modal";
import ProjectStatsCards from "@/components/projects/project-stats-cards";
import { BaseActivity } from "@/types/activity.type";
import { BaseStage } from "@/types/stage.type";
import { ExtendedProject } from "@/types/new/project.type";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getTagColorClass } from "@/lib/colors";
import CreateProjectForm from "@/components/projects/project-form";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { ProjectStatus, ProjectStatusLabels } from "@/types/enums";
import { ProjectsService } from "@/services/project.service";
import { ArchiveRestore, RotateCcw, Check } from "lucide-react";

interface ClientViewProps {
	project: ExtendedProject;
	activities: BaseActivity[];
}

export default function ClientView({ project: initialProject, activities: initialActivities }: ClientViewProps) {
	const { toast } = useToast();
	const { user } = useAuth();
	const isViewer = user?.role === "viewer";
	const isEditor = user?.role === "admin" || user?.role === "editor";
	const router = useRouter();
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

	// Estado inicial
	const [project, setProject] = useState<ExtendedProject>(initialProject);
	const [projectActivities, setProjectActivities] = useState<BaseActivity[]>(initialActivities);
	const [projectStages, setProjectStages] = useState<BaseStage[]>(Array.isArray(initialProject.stages) ? initialProject.stages : []);
	const [activeView, setActiveView] = useState<"kanban" | "gantt">("kanban");
	const [ganttViewMode, setGanttViewMode] = useState<"days" | "weeks">("days");
	const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
	const [editingActivity, setEditingActivity] = useState<BaseActivity | null>(null);
	const [isStagesModalOpen, setIsStagesModalOpen] = useState(false);
	const [statsVisible, setStatsVisible] = useState(false);
	const [selectedStageId, setSelectedStageId] = useState<string>("all");
	const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);

	// Normalizar el status del proyecto
	const normalizedStatus = project.status || "pending";

	// Variables auxiliares para estados específicos
	const isProjectCompleted = project.status === "completed";
	const isProjectArchived = project.archived === true;
	const isProjectInReview = project.status === "review";

	// Variable unificada para control de acceso - combina todas las condiciones que requieren modo vista
	const isInViewMode = isViewer || isProjectCompleted || isProjectArchived;

	// Filtrado
	const filteredActivities = selectedStageId !== "all" ? projectActivities.filter((a) => a.stageId === selectedStageId) : projectActivities;

	// ——— Funciones de actualización ———
	const handleActivityChange = (updated: BaseActivity[]) => {
		setProjectActivities(updated);

		// Actualizar progreso y activities dentro de stages
		const updatedProject = { ...project };
		if (Array.isArray(updatedProject.stages)) {
			updatedProject.stages = updatedProject.stages.map((stage) => ({
				...stage,
				activities: updated.filter((act) => act.stageId === stage.id),
			}));
		}
		const total = updated.length;
		updatedProject.progressPercentage = total > 0 ? Math.round((updated.filter((a) => a.status === "completed").length / total) * 100) : 0;
		setProject(updatedProject);
	};

	const handleAddActivity = (newAct: BaseActivity) => {
		handleActivityChange([...projectActivities, newAct]);
	};

	const handleUpdateStages = (newStages: BaseStage[]) => {
		setProjectStages(newStages);
		setProject({ ...project, stages: newStages });
	};

	const handleProjectUpdated = async () => {
		setIsEditProjectModalOpen(false);
		toast({ title: "Proyecto actualizado con éxito" });
		// Opcional: re-fetch si hace falta
	};

	const handleUnarchiveProject = async () => {
		if (isUpdating) return;

		setIsUpdating(true);
		try {
			const updateData = { id: project.id, archived: false };
			const result = await ProjectsService.updateProject(project.id.toString(), updateData);

			if (result.success) {
				toast({
					title: "Proyecto desarchivado",
					description: "El proyecto ha sido desarchivado exitosamente",
				});

				// Actualizar el proyecto localmente
				setProject({ ...project, archived: false });
			} else {
				throw new Error(result.message || "Error al desarchivar el proyecto");
			}
		} catch (error) {
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Error al desarchivar el proyecto",
				variant: "destructive",
			});
		} finally {
			setIsUpdating(false);
		}
	};

	const handleReturnToReview = async () => {
		if (isUpdating) return;

		setIsUpdating(true);
		try {
			const updateData = { id: project.id, status: "review" };
			const result = await ProjectsService.updateProject(project.id.toString(), updateData);

			if (result.success) {
				toast({
					title: "Proyecto regresado a revisión",
					description: "El proyecto ha sido regresado a revisión exitosamente",
				});

				// Actualizar el proyecto localmente
				setProject({ ...project, status: "review" });
			} else {
				throw new Error(result.message || "Error al regresar el proyecto a revisión");
			}
		} catch (error) {
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Error al regresar el proyecto a revisión",
				variant: "destructive",
			});
		} finally {
			setIsUpdating(false);
		}
	};

	const handleCompleteProject = async () => {
		if (isUpdating) return;

		setIsUpdating(true);
		try {
			const updateData = { id: project.id, status: "completed" };
			const result = await ProjectsService.updateProject(project.id.toString(), updateData);

			if (result.success) {
				toast({
					title: "Proyecto completado",
					description: "El proyecto ha sido completado exitosamente",
				});

				// Actualizar el proyecto localmente
				setProject({ ...project, status: "completed" });
			} else {
				throw new Error(result.message || "Error al completar el proyecto");
			}
		} catch (error) {
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Error al completar el proyecto",
				variant: "destructive",
			});
		} finally {
			setIsUpdating(false);
		}
	};

	// ——— UI ———
	return (
		<div className="h-full flex flex-col space-y-6">
			{/* Header distintivo del proyecto específico */}
			<div className="space-y-4 flex-shrink-0">
				{/* Breadcrumb navigation */}
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Button variant="ghost" size="sm" className="p-0 h-auto font-normal" onClick={() => router.back()}>
						<ArrowLeft className="h-4 w-4 mr-1" />
						Volver a Proyectos
					</Button>
					<span>/</span>
					<Folder className="h-4 w-4" />
					<span className="font-medium text-foreground">{project.name}</span>
				</div>

				{/* Project header con el mismo estilo que page.tsx */}
				<div className="relative">
					<div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg"></div>
					<div className="relative bg-card/50 backdrop-blur-sm border rounded-lg p-6">
						<div className="flex flex-col md:flex-row md:justify-between gap-4">
							<div className="flex items-start gap-3">
								<div className="p-2 bg-muted rounded-lg">
									<Target className="h-6 w-6 text-muted-foreground" />
								</div>
								<div>
									<div className="flex items-center gap-3 mb-1 flex-wrap">
										<h1 className="text-2xl font-bold">{project.name}</h1>
										{project.categoryName && project.categoryColor && (
											<div className={`px-3 py-1 text-xs rounded-full font-medium border ${getTagColorClass(project.categoryColor)}`}>{project.categoryName}</div>
										)}

										{/* Estado actual del proyecto */}
										{project.status && (
											<div className={`px-3 py-1 text-xs rounded-full font-medium border ${isProjectCompleted ? "bg-green-100 text-green-800 border-green-200" : "bg-blue-100 text-blue-800 border-blue-200"}`}>
												{ProjectStatusLabels[project.status as ProjectStatus] || project.status}
											</div>
										)}

										{/* Indicador de archivado */}
										{isProjectArchived && <div className="px-3 py-1 text-xs rounded-full font-medium border bg-gray-100 text-gray-800 border-gray-200">📁 Archivado</div>}
									</div>
									<div className="space-y-2">
										<p className="text-muted-foreground text-justify">
											{isDescriptionExpanded || (project.description || "").length <= 120 ? project.description || "" : (project.description || "").slice(0, 120) + "..."}
											{project.description && project.description.length > 120 && (
												<Button variant="ghost" size="sm" className="p-0 h-auto text-muted-foreground hover:text-foreground align-baseline ml-2" onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}>
													{isDescriptionExpanded ? (
														<>
															<ChevronUp className="h-4 w-4 mr-1 inline" />
															Mostrar menos
														</>
													) : (
														<>
															<ChevronDown className="h-4 w-4 mr-1 inline" />
															Leer más
														</>
													)}
												</Button>
											)}
										</p>
									</div>
								</div>
							</div>

							<div className="flex gap-2">
								{/* Mostrar/Ocultar resumen */}
								<Button variant="outline" size="sm" onClick={() => setStatsVisible(!statsVisible)}>
									<BarChart3 className="mr-2 h-4 w-4" />
									{statsVisible ? "Ocultar resumen" : "Mostrar resumen"}
								</Button>

								{/* Botón Desarchivar - solo si está archivado */}
								{isProjectArchived && isEditor && (
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button variant="outline" size="sm" disabled={isUpdating}>
												<ArchiveRestore className="mr-2 h-4 w-4" />
												{isUpdating ? "Desarchivando..." : "Desarchivar"}
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>¿Desarchivar proyecto?</AlertDialogTitle>
												<AlertDialogDescription>
													¿Estás seguro de que deseas desarchivar el proyecto &quot;{project.name}&quot;? El proyecto volverá a aparecer en las listas principales y podrás realizar cambios.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancelar</AlertDialogCancel>
												<AlertDialogAction onClick={handleUnarchiveProject} disabled={isUpdating}>
													{isUpdating ? "Desarchivando..." : "Desarchivar"}
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								)}

								{/* Botón Completar - solo si está en revisión */}
								{isProjectInReview && !isProjectArchived && isEditor && (
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button variant="outline" size="sm" disabled={isUpdating}>
												<Check className="mr-2 h-4 w-4" />
												{isUpdating ? "Completando..." : "Completar"}
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>¿Completar proyecto?</AlertDialogTitle>
												<AlertDialogDescription>¿Estás seguro de que deseas marcar el proyecto &quot;{project.name}&quot; como completado? Esta acción cambiará el estado del proyecto.</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancelar</AlertDialogCancel>
												<AlertDialogAction onClick={handleCompleteProject} disabled={isUpdating}>
													{isUpdating ? "Completando..." : "Completar"}
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								)}

								{/* Botón Regresar a revisión - solo si está completado pero no archivado */}
								{isProjectCompleted && !isProjectArchived && isEditor && (
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button variant="outline" size="sm" disabled={isUpdating}>
												<RotateCcw className="mr-2 h-4 w-4" />
												{isUpdating ? "Regresando..." : "Regresar a revisión"}
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent>
											<AlertDialogHeader>
												<AlertDialogTitle>¿Regresar proyecto a revisión?</AlertDialogTitle>
												<AlertDialogDescription>
													¿Estás seguro de que deseas regresar el proyecto &quot;{project.name}&quot; al estado de revisión? Esto permitirá realizar cambios nuevamente.
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Cancelar</AlertDialogCancel>
												<AlertDialogAction onClick={handleReturnToReview} disabled={isUpdating}>
													{isUpdating ? "Regresando..." : "Regresar a revisión"}
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								)}

								{!isInViewMode && isEditor && (
									<>
										{/* Editar proyecto */}
										<Dialog open={isEditProjectModalOpen} onOpenChange={setIsEditProjectModalOpen}>
											<Button variant="outline" size="sm" onClick={() => setIsEditProjectModalOpen(true)}>
												<Edit className="mr-2 h-4 w-4" /> Editar
											</Button>
											<DialogContent className="sm:max-w-[700px]">
												<DialogTitle>Editar Proyecto</DialogTitle>
												<DialogDescription>Actualiza los detalles del proyecto</DialogDescription>
												<CreateProjectForm isEditing projectData={project} onSuccess={handleProjectUpdated} />
											</DialogContent>
										</Dialog>

										{/* Gestionar etapas */}
										<Dialog open={isStagesModalOpen} onOpenChange={setIsStagesModalOpen}>
											<Button variant="outline" size="sm" onClick={() => setIsStagesModalOpen(true)}>
												<ListPlus className="mr-2 h-4 w-4" /> Etapas
											</Button>
											<DialogContent className="sm:max-w-[700px]">
												<DialogTitle>Gestionar Etapas del Proyecto</DialogTitle>
												<DialogDescription>Crea y gestiona las etapas del proyecto</DialogDescription>
												<ProjectStagesModal projectId={project.id} stages={projectStages} onClose={() => setIsStagesModalOpen(false)} onSave={handleUpdateStages} />
											</DialogContent>
										</Dialog>

										{/* Nueva actividad */}
										<Dialog
											open={isActivityModalOpen}
											onOpenChange={(open) => {
												setIsActivityModalOpen(open);
												if (!open) setEditingActivity(null);
											}}
										>
											<Button size="sm" onClick={() => setIsActivityModalOpen(true)}>
												<Plus className="mr-2 h-4 w-4" /> Nueva Actividad
											</Button>
											<DialogContent className="sm:max-w-[600px]">
												<DialogTitle>{editingActivity ? "Editar Actividad" : "Nueva Actividad"}</DialogTitle>
												<DialogDescription>{editingActivity ? "Actualiza los detalles de la actividad" : "Crea una actividad para el proyecto"}</DialogDescription>
												<CreateActivityModal
													projectId={project.id}
													stages={projectStages}
													activity={editingActivity}
													onClose={() => setIsActivityModalOpen(false)}
													onSuccess={(act) => {
														if (editingActivity) {
															handleActivityChange(projectActivities.map((a) => (a.id === act.id ? act : a)));
														} else {
															handleAddActivity(act);
														}
													}}
												/>
											</DialogContent>
										</Dialog>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Resumen del proyecto - mostrar cuando statsVisible es true */}
			{statsVisible && (
				<div className="border rounded-lg p-4 bg-gradient-to-r from-green-500/5 to-blue-500/5 flex-shrink-0">
					<div className="flex items-center gap-2 mb-4">
						<BarChart3 className="h-5 w-5 text-blue-600" />
						<h3 className="text-lg font-medium">Resumen del Proyecto</h3>
					</div>
					<ProjectStatsCards project={project} activities={projectActivities} />
				</div>
			)}

			{/* Filtros y vistas */}
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-bold"></h2>
				<div className="flex flex-wrap gap-2 items-center">
					{activeView === "gantt" && (
						<Select value={ganttViewMode} onValueChange={(value: "days" | "weeks") => setGanttViewMode(value)}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Seleccionar vista" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="days">Vista diaria</SelectItem>
								<SelectItem value="weeks">Vista semanal</SelectItem>
							</SelectContent>
						</Select>
					)}
					<Select value={selectedStageId} onValueChange={setSelectedStageId}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Filtrar por etapa" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todas las etapas</SelectItem>
							{projectStages.map((s) => (
								<SelectItem key={s.id} value={s.id}>
									<Badge variant="outline" className={getTagColorClass(s.color)}>
										{s.name}
									</Badge>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{selectedStageId !== "all" && (
						<Button variant="outline" size="sm" onClick={() => setSelectedStageId("all")}>
							<X className="mr-2 h-4 w-4" /> Limpiar filtro
						</Button>
					)}
					<Button size="sm" variant={activeView === "kanban" ? "default" : "outline"} onClick={() => setActiveView("kanban")}>
						Kanban
					</Button>
					<Button size="sm" variant={activeView === "gantt" ? "default" : "outline"} onClick={() => setActiveView("gantt")}>
						Gantt
					</Button>
				</div>
			</div>

			{/* Tablero / Gantt */}
			<div className="flex-1 min-h-0">
				<div className="border rounded-lg px-4 py-2 h-full">
					{activeView === "kanban" ? (
						<KanbanBoard
							activities={filteredActivities}
							stages={projectStages}
							onActivityChange={isInViewMode ? undefined : handleActivityChange}
							onActivityClick={(a) => {
								if (!isInViewMode) {
									setEditingActivity(a);
									setIsActivityModalOpen(true);
								}
							}}
							isViewer={isInViewMode}
						/>
					) : (
						<GanttChart activities={filteredActivities} stages={projectStages} viewMode={ganttViewMode} />
					)}
				</div>
			</div>
		</div>
	);
}

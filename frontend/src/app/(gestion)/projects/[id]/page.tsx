"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Edit, Plus, ListPlus, ChevronDown, ChevronUp, X } from "lucide-react";
import KanbanBoard from "@/components/kanban-board";
import GanttChart from "@/components/gantt-chart";
import CreateActivityModal from "@/components/create-activity-modal";
import ProjectStagesModal from "@/components/project-stages-modal";
import ProjectStatsCards from "@/components/project/project-stats-cards";
import { BaseActivity } from "@/app/types/activity.type";
import { BaseStage } from "@/app/types/stage.type";
import { ExtendedProject } from "@/app/types/project.type";
import { ProjectsService } from "@/services/project.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getTagColorClass } from "@/lib/colors";
import CreateProjectForm from "@/components/create-project-form";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";

export default function ProjectPage({ params }: { params: { id: string } }) {
	const { toast } = useToast();
	const { user } = useAuth();
	const isViewer = user?.role === "viewer";

	// @ts-expect-error: test
	const { id } = use(params);
	const [activeView, setActiveView] = useState<"kanban" | "gantt">("kanban");
	const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
	const [editingActivity, setEditingActivity] = useState<BaseActivity | null>(null);
	const [projectActivities, setProjectActivities] = useState<BaseActivity[]>([]);
	const [isStagesModalOpen, setIsStagesModalOpen] = useState(false);
	const [projectStages, setProjectStages] = useState<BaseStage[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [project, setProject] = useState<ExtendedProject | null>(null);
	const [statsVisible, setStatsVisible] = useState(false);
	const [selectedStageId, setSelectedStageId] = useState<string | null>("all");
	const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);

	// Filtrar actividades basadas en la etapa seleccionada
	const filteredActivities = selectedStageId && selectedStageId !== "all" ? projectActivities.filter((activity) => activity.stageId === selectedStageId) : projectActivities;

	useEffect(() => {
		const loadProject = async () => {
			setLoading(true);
			try {
				const response = await ProjectsService.getSingleProject(id);
				if (response.success && response.data) {
					setProject(response.data);
					setError(null);
				} else {
					setError("No se pudo cargar el proyecto");
				}
			} catch (err) {
				setError("Error al cargar los datos del proyecto");
			} finally {
				setLoading(false);
			}
		};

		loadProject();
	}, [id]);

	useEffect(() => {
		if (!project) return;

		// Solo actualizar si hay cambios reales
		const newActivities = project.stages?.flatMap((stage) => stage.activities || []) || [];
		if (JSON.stringify(newActivities) !== JSON.stringify(projectActivities)) {
			setProjectActivities(newActivities);
		}

		// Actualizar stages - asegurándonos que sea un array plano
		let newStages: BaseStage[] = [];
		if (project.stages) {
			// Si project.stages es un array, lo usamos directamente
			if (Array.isArray(project.stages)) {
				newStages = project.stages;
			}
			// Si project.stages tiene a su vez una propiedad stages que es un array
			else if (Array.isArray(project.stages)) {
				newStages = project.stages;
			}
			// Si stages es un objeto único, lo convertimos en array
			else {
				newStages = [project.stages];
			}
		}

		if (JSON.stringify(newStages) !== JSON.stringify(projectStages)) {
			setProjectStages(newStages);
		}
	}, [project]);

	// Esta función maneja cualquier cambio en las actividades
	const handleActivityChange = (updatedActivities: BaseActivity[]) => {
		setProjectActivities(updatedActivities);

		// También actualizamos el project para que ProjectStatsCards se actualice
		if (project) {
			const updatedProject = { ...project };

			// Actualizamos las actividades dentro de sus respectivos stages
			if (updatedProject.stages && Array.isArray(updatedProject.stages)) {
				updatedProject.stages = updatedProject.stages.map((stage) => {
					if (stage.activities && Array.isArray(stage.activities)) {
						// Filtramos solo las actividades que pertenecen a este stage
						const stageActivities = updatedActivities.filter((act) => act.stageId === stage.id);
						return { ...stage, activities: stageActivities };
					}
					return stage;
				});
			}

			// Calcular nuevo porcentaje de progreso basado en actividades completadas
			const totalActivities = updatedActivities.length;
			if (totalActivities > 0) {
				const completedActivities = updatedActivities.filter((act) => act.status == "completed").length;
				// Actualizar el porcentaje de progreso (redondeado a entero)
				updatedProject.progressPercentage = Math.round((completedActivities / totalActivities) * 100);
			} else {
				updatedProject.progressPercentage = 0;
			}

			setProject(updatedProject);
		}
	};

	const handleAddActivity = (newActivity: BaseActivity) => {
		const updatedActivities = [...projectActivities, newActivity];
		setProjectActivities(updatedActivities);

		handleActivityChange(updatedActivities);
	};

	const handleUpdateStages = (updatedStages: BaseStage[]) => {
		setProjectStages(updatedStages);

		if (project) {
			setProject({
				...project,
				stages: updatedStages,
			});
		}
	};

	const handleActivityClick = (activity: BaseActivity) => {
		setEditingActivity(activity);
		setIsActivityModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsActivityModalOpen(false);
		setEditingActivity(null);
	};

	const handleAddOrUpdateActivity = (activity: BaseActivity) => {
		if (editingActivity) {
			// Es una actualización - reemplazar la actividad editada
			const updatedActivities = projectActivities.map((a) => (a.id === activity.id ? activity : a));
			setProjectActivities(updatedActivities);
			handleActivityChange(updatedActivities);
		} else {
			// Es una nueva actividad
			handleAddActivity(activity);
		}
	};

	const clearFilter = () => {
		setSelectedStageId("all");
	};

	const handleProjectUpdated = async () => {
		// Cerrar el modal primero
		setIsEditProjectModalOpen(false);

		// Mostrar el mensaje de confirmación inmediatamente
		toast({
			title: "Proyecto actualizado con éxito",
			variant: "default",
		});

		// Recargar los datos del proyecto
		try {
			const response = await ProjectsService.getSingleProject(id);
			if (response.success && response.data) {
				setProject(response.data);
			}
		} catch (error) {
			console.error("Error al recargar el proyecto", error);
			toast({
				title: "Error al cargar los datos actualizados",
				description: "El proyecto se actualizó pero no se pudieron cargar los nuevos datos",
				variant: "destructive",
			});
		}
	};

	if (loading) return <div className="flex items-center justify-center h-screen">Cargando datos del proyecto...</div>;
	if (error || !project) return <div className="flex items-center justify-center h-screen">Error: {error || "No se encontró el proyecto"}</div>;

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold">{project.name}</h1>
					<p className="text-muted-foreground">{project.description}</p>
				</div>
				{!isViewer && (
					<div className="flex items-center gap-2">
						<Dialog open={isEditProjectModalOpen} onOpenChange={setIsEditProjectModalOpen}>
							<Button variant="outline" onClick={() => setIsEditProjectModalOpen(true)}>
								<Edit className="mr-2 h-4 w-4" />
								Editar Proyecto
							</Button>
							<DialogContent className="sm:max-w-[700px]">
								<DialogTitle>Editar Proyecto</DialogTitle>
								<DialogDescription>Actualiza los detalles del proyecto</DialogDescription>
								{project && <CreateProjectForm isEditing={true} projectData={project} onSuccess={handleProjectUpdated} />}
							</DialogContent>
						</Dialog>
						<Dialog open={isStagesModalOpen} onOpenChange={setIsStagesModalOpen}>
							<Button variant="outline" onClick={() => setIsStagesModalOpen(true)}>
								<ListPlus className="mr-2 h-4 w-4" />
								Administrar Etapas
							</Button>

							<DialogContent className="sm:max-w-[700px]">
								<DialogTitle>Gestionar Etapas del Proyecto</DialogTitle>
								<DialogDescription>Crea y gestiona las etapas del proyecto</DialogDescription>
								<ProjectStagesModal projectId={project.id} stages={projectStages} onClose={() => setIsStagesModalOpen(false)} onSave={handleUpdateStages} />
							</DialogContent>
						</Dialog>
						<Dialog
							open={isActivityModalOpen}
							onOpenChange={(open) => {
								setIsActivityModalOpen(open);
								if (!open) setEditingActivity(null);
							}}
						>
							<Button onClick={() => setIsActivityModalOpen(true)}>
								<Plus className="mr-2 h-4 w-4" />
								Nueva Actividad
							</Button>
							<DialogContent className="sm:max-w-[600px]">
								<DialogTitle>{editingActivity ? "Editar Actividad" : "Nueva Actividad"}</DialogTitle>
								<DialogDescription>{editingActivity ? "Actualiza los detalles de la actividad" : "Crea una actividad para el proyecto"}</DialogDescription>
								<CreateActivityModal projectId={project.id} stages={projectStages} activity={editingActivity} onClose={handleCloseModal} onSuccess={handleAddOrUpdateActivity} />
							</DialogContent>
						</Dialog>
					</div>
				)}
			</div>

			{/* Estadísticas contraíbles con mejor diseño */}
			<div className="border rounded-lg overflow-hidden transition-all duration-300">
				<div className="flex items-center justify-between px-4 py-3 bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors" onClick={() => setStatsVisible(!statsVisible)}>
					<h3 className="text-lg font-medium flex items-center gap-2">
						<span className="text-muted-foreground">Resumen del Proyecto</span>
					</h3>
					<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
						{statsVisible ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
					</Button>
				</div>

				<div className={`transition-all duration-300 ease-in-out ${statsVisible ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
					<div className="p-4">
						<ProjectStatsCards project={project} activities={projectActivities} />
					</div>
				</div>
			</div>

			<div className="flex items-center justify-between">
				<h2 className="text-xl font-bold">Acividades del Proyecto</h2>
				<div className="flex items-center space-x-2 flex-wrap gap-2">
					{/* Selector de etapas para filtrar */}
					<Select value={selectedStageId || "all"} onValueChange={(value) => setSelectedStageId(value)}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Filtrar por etapa" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todas las etapas</SelectItem>
							{projectStages.map((stage) => (
								<SelectItem key={stage.id} value={stage.id}>
									<div className="flex items-center">
										<Badge variant="outline" className={getTagColorClass(stage.color)}>
											{stage.name}
										</Badge>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{/* Botón para limpiar filtros (solo visible cuando hay filtro activo y no es "all") */}
					{selectedStageId && selectedStageId !== "all" && (
						<Button variant="outline" size="sm" onClick={clearFilter}>
							<X className="mr-2 h-4 w-4" />
							Limpiar filtro
						</Button>
					)}

					<Button variant={activeView === "kanban" ? "default" : "outline"} size="sm" onClick={() => setActiveView("kanban")}>
						Kanban
					</Button>

					<Button variant={activeView === "gantt" ? "default" : "outline"} size="sm" onClick={() => setActiveView("gantt")}>
						Gantt
					</Button>
				</div>
			</div>

			<div className="border rounded-lg p-4">
				{activeView === "kanban" ? (
					<KanbanBoard activities={filteredActivities} stages={projectStages} onActivityChange={isViewer ? undefined : handleActivityChange} onActivityClick={handleActivityClick} isViewer={isViewer} />
				) : (
					<GanttChart activities={filteredActivities} stages={projectStages} />
				)}
			</div>
		</div>
	);
}

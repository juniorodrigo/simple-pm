// app/projects/[id]/ClientView.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
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
import CreateProjectForm from "@/components/projects/create-project-form";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface ClientViewProps {
	project: ExtendedProject;
	activities: BaseActivity[];
}

export default function ClientView({ project: initialProject, activities: initialActivities }: ClientViewProps) {
	const { toast } = useToast();
	const { user } = useAuth();
	const isViewer = user?.role === "viewer";
	const router = useRouter();

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

				{/* Project header sin colores específicos */}
				<div className="bg-card border rounded-lg p-6">
					<div className="flex flex-col md:flex-row md:justify-between gap-4">
						<div className="flex items-start gap-3">
							<div className="p-2 bg-muted rounded-lg">
								<Target className="h-6 w-6 text-muted-foreground" />
							</div>
							<div>
								<div className="flex items-center gap-3 mb-1 flex-wrap">
									<h1 className="text-2xl font-bold">{project.name}</h1>
									{project.categoryName && project.categoryColor && <div className={`px-3 py-1 text-xs rounded-full font-medium border ${getTagColorClass(project.categoryColor)}`}>{project.categoryName}</div>}
								</div>
								<p className="text-muted-foreground">{project.description}</p>
							</div>
						</div>
						{!isViewer && (
							<div className="flex gap-2">
								{/* Mostrar/Ocultar resumen */}
								<Button variant="outline" size="sm" onClick={() => setStatsVisible(!statsVisible)}>
									<BarChart3 className="mr-2 h-4 w-4" />
									{statsVisible ? "Ocultar resumen" : "Mostrar resumen"}
								</Button>

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
							</div>
						)}
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
			<div className="flex justify-between items-center flex-shrink-0">
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
				<div className="border rounded-lg p-4 h-full">
					{activeView === "kanban" ? (
						<KanbanBoard
							activities={filteredActivities}
							stages={projectStages}
							onActivityChange={isViewer ? undefined : handleActivityChange}
							onActivityClick={(a) => {
								setEditingActivity(a);
								setIsActivityModalOpen(true);
							}}
							isViewer={isViewer}
						/>
					) : (
						<GanttChart activities={filteredActivities} stages={projectStages} viewMode={ganttViewMode} />
					)}
				</div>
			</div>
		</div>
	);
}

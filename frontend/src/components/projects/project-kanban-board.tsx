"use client";

import { useState, useEffect, useCallback, memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types/new/project.type";
import { ProjectsService } from "@/services/project.service";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProjectStatus, ProjectStatusLabels } from "@/types/enums";
import ProjectCard from "@/components/projects/project-card";

// Definir las columnas del kanban a partir del enum
const LANES = Object.values(ProjectStatus).map((statusValue) => ({
	id: statusValue,
	title: ProjectStatusLabels[statusValue],
}));

interface ProjectKanbanBoardProps {
	initialProjects: Project[];
	onProjectChange: (updatedProjects: Project[]) => Promise<void>;
	onProjectClick: (project: Project) => void;
	isViewer?: boolean;
}

export default function ProjectKanbanBoard({ initialProjects, onProjectChange, onProjectClick, isViewer }: ProjectKanbanBoardProps) {
	const [projects, setProjects] = useState<Project[]>([]);
	const { toast } = useToast();

	// Estados para el modal de confirmación de eliminación
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

	useEffect(() => {
		if (JSON.stringify(projects) !== JSON.stringify(initialProjects)) {
			setProjects(initialProjects);
		}
	}, [initialProjects]);

	// Función para manejar actualizaciones de proyectos
	const handleProjectUpdate = useCallback(
		async (updatedProject: Project) => {
			const updatedProjects = projects.map((project) => (project.id === updatedProject.id ? updatedProject : project));
			setProjects(updatedProjects);
			if (onProjectChange) {
				await onProjectChange(updatedProjects);
			}
		},
		[projects, onProjectChange]
	);

	// Función para mostrar el modal de confirmación de eliminación
	const handleDeleteProject = useCallback((projectId: string) => {
		setProjectToDelete(projectId);
		setIsDeleteModalOpen(true);
	}, []);

	// Función para confirmar la eliminación
	const confirmDeleteProject = useCallback(async () => {
		if (!projectToDelete) return;

		const response = await ProjectsService.deleteProject(projectToDelete);

		if (response.success) {
			const updatedProjects = projects.filter((project) => project.id.toString() !== projectToDelete);
			setProjects(updatedProjects);

			if (onProjectChange) {
				onProjectChange(updatedProjects);
			}

			toast({
				title: "Proyecto eliminado",
				description: "El proyecto ha sido eliminado correctamente",
			});
		} else {
			toast({
				title: "Error",
				description: "No se pudo eliminar el proyecto",
				variant: "destructive",
			});
		}

		setIsDeleteModalOpen(false);
		setProjectToDelete(null);
	}, [projectToDelete, projects, onProjectChange, toast]);

	// Función para cancelar la eliminación
	const cancelDeleteProject = useCallback(() => {
		setIsDeleteModalOpen(false);
		setProjectToDelete(null);
	}, []);

	// Organizar proyectos por lane (status)
	const laneProjects = useMemo(() => {
		const result: Record<string, Project[]> = {};

		// Inicializar lanes con arrays vacíos
		LANES.forEach((lane) => {
			result[lane.id] = [];
		});

		// Asignar proyectos a lanes según su status
		projects.forEach((project) => {
			const status = project.status || ProjectStatus.PENDING;
			if (result[status]) {
				result[status].push(project);
			} else {
				// Si no tiene status válido, lo asignamos a PENDING
				result[ProjectStatus.PENDING].push(project);
			}
		});

		return result;
	}, [projects]);

	// Manejador para clics en proyectos
	const handleProjectClick = useCallback(
		(project: Project) => {
			if (onProjectClick) {
				onProjectClick(project);
			}
		},
		[onProjectClick]
	);

	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
				{LANES.map((lane) => (
					<LaneContainer
						key={lane.id}
						lane={lane}
						projects={laneProjects[lane.id] || []}
						onDeleteProject={handleDeleteProject}
						onProjectClick={handleProjectClick}
						onProjectUpdate={handleProjectUpdate}
						isViewer={isViewer}
					/>
				))}
			</div>

			{/* Modal de confirmación de eliminación */}
			<Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Confirmar eliminación</DialogTitle>
						<DialogDescription>¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={cancelDeleteProject}>
							Cancelar
						</Button>
						<Button variant="destructive" onClick={confirmDeleteProject}>
							Eliminar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

// Componente para cada columna del kanban
const LaneContainer = memo(
	({
		lane,
		projects,
		onDeleteProject,
		onProjectClick,
		onProjectUpdate,
		isViewer,
	}: {
		lane: { id: string; title: string };
		projects: Project[];
		onDeleteProject: (id: string) => void;
		onProjectClick?: (project: Project) => void;
		onProjectUpdate: (updatedProject: Project) => Promise<void>;
		isViewer?: boolean;
	}) => {
		// Manejar el evento de rueda para prevenir la propagación
		const handleWheel = useCallback((e: React.WheelEvent) => {
			const element = e.currentTarget;
			const isAtBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 1;
			const isAtTop = element.scrollTop <= 0;

			// Solo prevenir la propagación si estamos en un extremo y tratamos de seguir scrolleando en esa dirección
			if ((isAtBottom && e.deltaY > 0) || (isAtTop && e.deltaY < 0)) {
				return;
			}

			// Si no estamos en los extremos o estamos scrolleando hacia el centro, permitimos el scroll pero detenemos la propagación
			e.stopPropagation();
		}, []);

		return (
			<div className="flex flex-col h-full">
				<div className="flex items-center justify-between mb-2">
					<h3 className="font-medium">{lane.title}</h3>
					<Badge variant="outline">{projects.length}</Badge>
				</div>

				<div
					className="bg-secondary/50 rounded-lg p-2 flex-1 overflow-y-auto"
					style={{
						scrollbarWidth: "none" /* Firefox */,
						msOverflowStyle: "none" /* IE/Edge */,
					}}
					onWheel={handleWheel}
				>
					<style jsx>{`
						div::-webkit-scrollbar {
							display: none; /* Chrome, Safari */
						}
					`}</style>
					{projects.length > 0 ? (
						<div className="space-y-2">
							{projects.map((project) => (
								<ProjectCard
									key={project.id.toString()}
									project={project}
									onDelete={isViewer ? undefined : () => onDeleteProject(project.id.toString())}
									onClick={onProjectClick ? () => onProjectClick(project) : undefined}
									onProjectUpdate={onProjectUpdate}
								/>
							))}
						</div>
					) : (
						<div className="text-muted-foreground text-center p-4 border border-dashed rounded-md mt-2 h-32 flex items-center justify-center">No hay proyectos en esta etapa</div>
					)}
				</div>
			</div>
		);
	}
);
LaneContainer.displayName = "LaneContainer";

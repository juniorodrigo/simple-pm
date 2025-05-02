"use client";

import { useState, useEffect, useCallback, memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
	DndContext,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	rectIntersection,
	useDroppable,
	MeasuringStrategy,
	AutoScrollActivator,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { BaseProject } from "@/app/types/project.type";
import { ProjectsService } from "@/services/project.service";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProjectStatus, ProjectStatusLabels } from "@/app/types/enums";
import ProjectCard from "@/components/project-card";

// Definir las columnas del kanban a partir del enum
const LANES = Object.values(ProjectStatus).map((statusValue) => ({
	id: statusValue,
	title: ProjectStatusLabels[statusValue],
}));

interface ProjectKanbanBoardProps {
	projects: BaseProject[];
	onProjectChange: (updatedProjects: BaseProject[]) => Promise<void>;
	onProjectClick: (project: BaseProject) => void;
	isViewer?: boolean; // Nueva propiedad para controlar permisos
}

export default function ProjectKanbanBoard({ projects: initialProjects, onProjectChange, onProjectClick, isViewer }: ProjectKanbanBoardProps) {
	const [projects, setProjects] = useState<BaseProject[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const { toast } = useToast();

	// Estados para el modal de confirmación de eliminación
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

	useEffect(() => {
		if (JSON.stringify(projects) !== JSON.stringify(initialProjects)) {
			setProjects(initialProjects);
		}
	}, [initialProjects]);

	// Configuración de sensores para drag and drop
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 }, // Aumentar ligeramente la distancia
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// Deshabilitar drag and drop si el usuario es viewer
	const isDraggable = !isViewer;

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

	// Manejar inicio de arrastre
	const handleDragStart = useCallback((event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	}, []);

	// Manejar finalización de arrastre
	const handleDragEnd = useCallback(
		async (event: DragEndEvent) => {
			const { active, over } = event;

			if (!over) {
				setActiveId(null);
				return;
			}

			const activeId = active.id as string;
			const overId = over.id as string;

			const activeProject = projects.find((p) => p.id.toString() === activeId);
			if (!activeProject) {
				setActiveId(null);
				return;
			}

			// Verificar si se está soltando en una lane (columna)
			if (LANES.some((lane) => lane.id === overId)) {
				const newStatus = overId as ProjectStatus;
				if (activeProject.status !== newStatus) {
					// Actualizar estado local para UX inmediata
					const updatedProjects = projects.map((project) => {
						if (project.id.toString() === activeId) {
							return { ...project, status: newStatus };
						}
						return project;
					});

					setProjects(updatedProjects);

					// Notificar al componente padre
					if (onProjectChange) {
						onProjectChange(updatedProjects);
					}

					// Actualizar en la base de datos
					try {
						await ProjectsService.updateProject(activeId, {
							...activeProject,
							status: newStatus,
						});

						toast({
							title: "Estado actualizado",
							description: `El proyecto ahora está "${ProjectStatusLabels[newStatus]}"`,
						});
					} catch (error) {
						toast({
							title: "Error",
							description: "No se pudo actualizar el estado del proyecto",
							variant: "destructive",
						});
						// Podríamos revertir el cambio en el estado local
					}
				}
			}

			setActiveId(null);
		},
		[projects, onProjectChange, toast]
	);

	// Proyecto actualmente siendo arrastrado
	const activeProject = useMemo(() => {
		if (!activeId) return null;
		return projects.find((p) => p.id.toString() === activeId);
	}, [activeId, projects]);

	// Organizar proyectos por lane (status)
	const laneProjects = useMemo(() => {
		const result: Record<string, BaseProject[]> = {};

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
				// Si no tiene status válido, lo asignamos a PLANNING
				result[ProjectStatus.PENDING].push(project);
			}
		});

		return result;
	}, [projects]);

	// DragOverlay para mostrar el proyecto mientras se arrastra
	const dragOverlay = useMemo(() => {
		if (!activeId || !activeProject) return null;
		return <ProjectCard project={activeProject} isDragging={true} />;
	}, [activeId, activeProject]);

	// Manejador para clics en proyectos
	const handleProjectClick = useCallback(
		(project: BaseProject) => {
			if (onProjectClick) {
				onProjectClick(project);
			}
		},
		[onProjectClick]
	);

	return (
		<>
			<DndContext
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				collisionDetection={rectIntersection}
				measuring={{
					droppable: {
						strategy: MeasuringStrategy.WhileDragging,
					},
				}}
				autoScroll={{
					threshold: {
						x: 0,
						y: 0.2,
					},
					// speed: {
					// 	x: 10,
					// 	y: 10,
					// },
				}}
			>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden">
					{LANES.map((lane) => (
						<LaneContainer key={lane.id} lane={lane} projects={laneProjects[lane.id] || []} onDeleteProject={handleDeleteProject} onProjectClick={handleProjectClick} isViewer={isViewer} />
					))}
				</div>

				<DragOverlay>{dragOverlay}</DragOverlay>
			</DndContext>

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
		isViewer,
	}: {
		lane: { id: string; title: string };
		projects: BaseProject[];
		onDeleteProject: (id: string) => void;
		onProjectClick?: (project: BaseProject) => void;
		isViewer?: boolean;
	}) => {
		const { setNodeRef, isOver } = useDroppable({
			id: lane.id,
			data: {
				type: "lane",
				id: lane.id,
			},
		});

		// Memoización de IDs para optimizar
		const itemIds = useMemo(() => projects.map((p) => p.id.toString()), [projects]);

		// Clases condicionales para la lane con scrollbar oculta
		const laneClassName = `bg-secondary/50 rounded-lg p-2 flex-1 min-h-[500px] overflow-y-auto max-h-[70vh] ${isOver ? "ring-2 ring-primary bg-secondary/70" : ""}`;

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
			<div className="flex flex-col h-full relative">
				<div className="flex items-center justify-between mb-2">
					<h3 className="font-medium">{lane.title}</h3>
					<Badge variant="outline">{projects.length}</Badge>
				</div>

				<div
					ref={setNodeRef}
					className={laneClassName}
					style={{
						transition: "background-color 0.2s ease",
						scrollbarWidth: "none" /* Firefox */,
						msOverflowStyle: "none" /* IE/Edge */,
						isolation: "isolate" /* Crea un nuevo contexto de apilamiento */,
					}}
					onWheel={handleWheel}
				>
					<style jsx>{`
						div::-webkit-scrollbar {
							display: none; /* Chrome, Safari */
						}
					`}</style>
					{projects.length > 0 ? (
						<SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
							{projects.map((project) => (
								<SortableItem key={project.id.toString()} project={project} onDelete={isViewer ? undefined : onDeleteProject} onClick={onProjectClick} />
							))}
						</SortableContext>
					) : (
						<div className="text-muted-foreground text-center p-4 border border-dashed rounded-md mt-2 h-32 flex items-center justify-center">Arrastra proyectos aquí</div>
					)}
				</div>
			</div>
		);
	}
);
LaneContainer.displayName = "LaneContainer";

// Elemento arrastrable
const SortableItem = memo(({ project, onDelete, onClick }: { project: BaseProject; onDelete?: (id: string) => void; onClick?: (project: BaseProject) => void }) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: project.id.toString(),
		data: {
			type: "project",
			project,
		},
	});

	const style = {
		transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
		transition,
		opacity: isDragging ? 0.5 : 1,
		zIndex: isDragging ? 999 : 0,
		position: isDragging ? "relative" : undefined,
		touchAction: "none",
	};

	return (
		<div ref={setNodeRef} {...attributes} {...listeners} className="mb-2 touch-manipulation">
			<ProjectCard project={project} onDelete={onDelete ? () => onDelete(project.id.toString()) : undefined} onClick={onClick ? () => onClick(project) : undefined} isDragging={isDragging} />
		</div>
	);
});
SortableItem.displayName = "SortableItem";

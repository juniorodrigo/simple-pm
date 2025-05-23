/* eslint-disable react/display-name */
"use client";

import { useState, useEffect, useCallback, memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
	DndContext,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
	DragOverEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	closestCenter,
	useDroppable,
	MeasuringStrategy,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { BaseActivity } from "@/app/types/activity.type";
import { BaseStage } from "@/app/types/stage.type";
import { ActivityStatus, ActivitiesLabels } from "@/app/types/enums";
import { ActivitysService } from "@/services/activity.service";
import { useToast } from "@/hooks/use-toast";
import { ActivityCard } from "@/components/activity-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getPriorityColor } from "@/lib/colors";
import ExecutionDateModal from "@/components/execution-date-modal";

interface KanbanBoardProps {
	activities: BaseActivity[];
	stages: BaseStage[];
	onActivityChange?: (updatedActivities: BaseActivity[]) => void;
	onActivityClick?: (activity: BaseActivity) => void;
	isViewer?: boolean; // Nueva propiedad para controlar permisos
}

// Generar las columnas (lanes) automáticamente desde el enum ActivityStatus y sus etiquetas
const LANES = Object.values(ActivityStatus).map((statusValue) => ({
	id: statusValue,
	title: ActivitiesLabels[statusValue],
}));

// Componente principal optimizado
export default function KanbanBoard({ activities: initialActivities, stages, onActivityChange, onActivityClick }: KanbanBoardProps) {
	const [activities, setActivities] = useState<BaseActivity[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [overId, setOverId] = useState<string | null>(null);
	const { toast } = useToast();

	// Estados para el modal de confirmación
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [activityToDelete, setActivityToDelete] = useState<string | null>(null);

	// Nuevos estados para el modal de fechas de ejecución
	const [isExecutionDateModalOpen, setIsExecutionDateModalOpen] = useState(false);
	const [completedActivity, setCompletedActivity] = useState<BaseActivity | null>(null);

	// Actualizar actividades solo cuando cambian
	useEffect(() => {
		if (JSON.stringify(activities) !== JSON.stringify(initialActivities)) {
			setActivities(initialActivities);
		}
	}, [initialActivities, activities]);

	// Configuración de sensores simplificada
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// Función para mostrar el modal de confirmación
	const handleDeleteActivity = useCallback((activityId: string) => {
		setActivityToDelete(activityId);
		setIsDeleteModalOpen(true);
	}, []);

	// Función para confirmar la eliminación
	const confirmDeleteActivity = useCallback(async () => {
		if (!activityToDelete) return;

		// Llamar al servicio para eliminar la actividad
		const response = await ActivitysService.deleteActivity(activityToDelete);

		if (response.success) {
			// Actualizar el estado local eliminando la actividad
			const updatedActivities = activities.filter((activity) => activity.id !== activityToDelete);
			setActivities(updatedActivities);

			// Notificar al componente padre sobre el cambio
			if (onActivityChange) {
				onActivityChange(updatedActivities);
			}

			toast({
				title: "Actividad eliminada",
				description: "La actividad ha sido eliminada correctamente",
			});
		} else {
			toast({
				title: "Error",
				description: "No se pudo eliminar la actividad",
				variant: "destructive",
			});
		}

		// Cerrar el modal y limpiar el estado
		setIsDeleteModalOpen(false);
		setActivityToDelete(null);
	}, [activityToDelete, activities, onActivityChange, toast]);

	// Función para cancelar la eliminación
	const cancelDeleteActivity = useCallback(() => {
		setIsDeleteModalOpen(false);
		setActivityToDelete(null);
	}, []);

	// Callbacks optimizados
	const handleDragStart = useCallback((event: DragStartEvent) => {
		const { active } = event;
		setActiveId(active.id as string);
	}, []);

	const handleDragEnd = useCallback(
		async (event: DragEndEvent) => {
			const { active, over } = event;

			if (!over) {
				setActiveId(null);
				setOverId(null);
				return;
			}

			const activeId = active.id as string;
			const overId = over.id as string;

			const activeActivity = activities.find((a) => a.id === activeId);
			if (!activeActivity) {
				setActiveId(null);
				setOverId(null);
				return;
			}

			// Verificar si se está soltando en una lane (columna)
			if (LANES.some((lane) => lane.id === overId)) {
				const newStatus = overId as ActivityStatus;

				if (newStatus && activeActivity.status !== newStatus) {
					try {
						// Actualizar estado local para una experiencia de usuario inmediata
						const updatedActivities = activities.map((activity) => (activity.id === activeId ? { ...activity, status: newStatus } : activity));

						setActivities(updatedActivities);

						// Si el nuevo estado es IN_PROGRESS y viene de TODO, mostrar el modal para fecha de inicio
						if (newStatus === ActivityStatus.IN_PROGRESS && activeActivity.status === ActivityStatus.TODO) {
							setCompletedActivity({ ...activeActivity, status: newStatus });
							setIsExecutionDateModalOpen(true);
						}
						// Si el nuevo estado es DONE, mostrar el modal para fecha de fin
						else if (newStatus === ActivityStatus.DONE) {
							setCompletedActivity({ ...activeActivity, status: newStatus });
							setIsExecutionDateModalOpen(true);
						}

						// Notificar al componente padre sobre el cambio
						if (onActivityChange) {
							onActivityChange(updatedActivities);
						}

						// Llamar a la API para persistir el cambio
						const response = await ActivitysService.updateActivityStatus(activeId, newStatus);
						if (!response.success) {
							throw new Error("Error al actualizar el estado");
						}
					} catch (error) {
						console.error("Error al actualizar el estado:", error);
						toast({
							title: "Error",
							description: "No se pudo actualizar el estado de la actividad",
							variant: "destructive",
						});
					}
				}
			}

			setActiveId(null);
			setOverId(null);
		},
		[activities, onActivityChange, toast]
	);

	// Manejar el éxito del registro de fechas de ejecución
	const handleExecutionDateSuccess = useCallback(
		(updatedActivity: BaseActivity) => {
			// Actualizar la actividad en el estado local
			const updatedActivities = activities.map((activity) => (activity.id === updatedActivity.id ? updatedActivity : activity));

			setActivities(updatedActivities);

			// Notificar al componente padre sobre el cambio
			if (onActivityChange) {
				onActivityChange(updatedActivities);
			}

			// Cerrar el modal
			setIsExecutionDateModalOpen(false);
			setCompletedActivity(null);
		},
		[activities, onActivityChange]
	);

	// Actividad activa memoizada eficientemente
	const activeActivity = useMemo(() => (activeId ? activities.find((a) => a.id === activeId) : null), [activeId, activities]);

	// Optimización: organizar actividades por lane (status) una sola vez
	const laneActivities = useMemo(() => {
		const result: Record<string, BaseActivity[]> = {};

		// Inicializar todas las lanes con arrays vacíos
		LANES.forEach((lane) => {
			result[lane.id] = [];
		});

		// Asignar actividades a sus lanes según su status
		activities.forEach((activity) => {
			if (result[activity.status]) {
				result[activity.status].push(activity);
			}
		});

		return result;
	}, [activities]);

	// DragOverlay optimizado con una referencia estable
	const dragOverlay = useMemo(() => {
		if (!activeId || !activeActivity) return null;
		return <ActivityCard activity={activeActivity} stages={stages} />;
	}, [activeId, activeActivity, stages]);

	// Manejador para clics de actividad
	const handleActivityClick = useCallback(
		(activity: BaseActivity) => {
			if (onActivityClick) {
				onActivityClick(activity);
			}
		},
		[onActivityClick]
	);

	// Nuevo manejador para el evento dragOver
	const handleDragOver = useCallback((event: DragOverEvent) => {
		const { over } = event;
		setOverId((over?.id as string) || null);
	}, []);

	return (
		<>
			<DndContext
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				onDragOver={handleDragOver}
				collisionDetection={closestCenter}
				measuring={{
					droppable: {
						strategy: MeasuringStrategy.Always,
					},
				}}
			>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{LANES.map((lane) => (
						<LaneContainer
							key={lane.id}
							lane={lane}
							activities={laneActivities[lane.id] || []}
							getPriorityColor={getPriorityColor}
							stages={stages}
							onDeleteActivity={handleDeleteActivity}
							onActivityClick={handleActivityClick}
							isOver={overId === lane.id}
						/>
					))}
				</div>

				<DragOverlay>{activeId ? <ActivityCard activity={activities.find((a) => a.id === activeId)!} stages={stages} /> : null}</DragOverlay>
			</DndContext>

			{/* Modal de confirmación de eliminación */}
			<Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Confirmar eliminación</DialogTitle>
						<DialogDescription>¿Estás seguro de que deseas eliminar esta actividad? Esta acción no se puede deshacer.</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={cancelDeleteActivity}>
							Cancelar
						</Button>
						<Button variant="destructive" onClick={confirmDeleteActivity}>
							Eliminar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Nuevo modal para fechas de ejecución */}
			<ExecutionDateModal activity={completedActivity} isOpen={isExecutionDateModalOpen} onClose={() => setIsExecutionDateModalOpen(false)} onSuccess={handleExecutionDateSuccess} />
		</>
	);
}

// Contenedor de lane optimizado
const LaneContainer = memo(
	({
		lane,
		activities,
		getPriorityColor,
		stages,
		onDeleteActivity,
		onActivityClick,
		isOver,
	}: {
		lane: { id: string; title: string };
		activities: BaseActivity[];
		getPriorityColor: (priority: string) => string;
		stages: BaseStage[];
		onDeleteActivity: (id: string) => void;
		onActivityClick?: (activity: BaseActivity) => void;
		isOver: boolean;
	}) => {
		const { setNodeRef } = useDroppable({
			id: lane.id,
			data: {
				type: "lane",
				id: lane.id,
				accepts: ["task"],
			},
		});

		const itemIds = useMemo(() => activities.map((a) => a.id), [activities]);

		const laneClassName = `bg-secondary/50 rounded-lg p-2 flex-1 min-h-[500px] transition-all duration-200 ${isOver ? "ring-2 ring-primary bg-secondary/70" : ""}`;

		return (
			<div className="flex flex-col h-full">
				<div className="flex items-center justify-between mb-2">
					<h3 className="font-medium">{lane.title}</h3>
					<Badge variant="outline">{activities.length}</Badge>
				</div>

				<div ref={setNodeRef} className={laneClassName}>
					{activities.length > 0 ? (
						<SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
							<div className="space-y-3">
								{activities.map((activity) => (
									<SortableItem key={activity.id} activity={activity} getPriorityColor={getPriorityColor} stages={stages} onDelete={onDeleteActivity} onClick={onActivityClick} />
								))}
							</div>
						</SortableContext>
					) : (
						<div className="text-muted-foreground text-center p-4 border border-dashed rounded-md mt-2 h-32 flex items-center justify-center">Arrastra elementos aquí</div>
					)}
				</div>
			</div>
		);
	}
);

// Item sortable optimizado
const SortableItem = memo(
	({
		activity,
		getPriorityColor,
		stages,
		onDelete,
		onClick,
	}: {
		activity: BaseActivity;
		getPriorityColor: (priority: string) => string;
		stages: BaseStage[];
		onDelete?: (id: string) => void;
		onClick?: (activity: BaseActivity) => void;
	}) => {
		const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
			id: activity.id,
			data: {
				type: "task",
				activity,
				status: activity.status,
			},
		});

		const style = {
			transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
			transition,
			opacity: isDragging ? 0.5 : 1,
			zIndex: isDragging ? 1 : 0,
			cursor: "grab",
			touchAction: "none",
		};

		return (
			<div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
				<ActivityCard activity={activity} stages={stages} onDelete={onDelete} onClick={onClick} />
			</div>
		);
	}
);

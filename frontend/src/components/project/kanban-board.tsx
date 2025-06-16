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
import { Lock } from "lucide-react";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { BaseActivity } from "@/types/activity.type";
import { BaseStage } from "@/types/stage.type";
import { ActivityStatus, ActivitiesLabels } from "@/types/enums";
import { ActivitysService } from "@/services/activity.service";
import { useToast } from "@/hooks/use-toast";
import { ActivityCard } from "@/components/project/activity-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getPriorityColor } from "@/lib/colors";
import ExecutionDateModal from "@/components/project/execution-date-modal";
import CreateActivityModal from "@/components/project/activity-modal";

interface KanbanBoardProps {
	activities: BaseActivity[];
	stages: BaseStage[];
	onActivityChange?: (updatedActivities: BaseActivity[]) => void;
	onActivityClick?: (activity: BaseActivity) => void;
	isViewer?: boolean; // Propiedad unificada para controlar acceso (modo vista)
}

// Generar las columnas (lanes) automáticamente desde el enum ActivityStatus y sus etiquetas
const LANES = Object.values(ActivityStatus).map((statusValue) => ({
	id: statusValue,
	title: ActivitiesLabels[statusValue],
}));

// Definir el orden de los estados
const STATUS_ORDER = [ActivityStatus.TODO, ActivityStatus.IN_PROGRESS, ActivityStatus.REVIEW, ActivityStatus.DONE];

// Componente principal optimizado
export default function KanbanBoard({ activities: initialActivities, stages, onActivityChange, onActivityClick, isViewer: isInViewMode }: KanbanBoardProps) {
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

	// Nuevo estado para cambios pendientes
	const [pendingStatusChange, setPendingStatusChange] = useState<null | { activity: BaseActivity; newStatus: ActivityStatus }>(null);

	// Nuevo estado para el modal de confirmación de retroceso
	const [isRollbackModalOpen, setIsRollbackModalOpen] = useState(false);
	const [rollbackActivity, setRollbackActivity] = useState<null | { activity: BaseActivity; newStatus: ActivityStatus }>(null);

	// Estados para el modal de actividad en modo solo lectura
	const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
	const [selectedActivity, setSelectedActivity] = useState<BaseActivity | null>(null);

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
	const handleDragStart = useCallback(
		(event: DragStartEvent) => {
			if (isInViewMode) return;
			const { active } = event;
			setActiveId(active.id as string);
		},
		[isInViewMode]
	);

	const handleDragEnd = useCallback(
		async (event: DragEndEvent) => {
			if (isInViewMode) {
				setActiveId(null);
				setOverId(null);
				return;
			}
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
			if (LANES.some((lane) => lane.id === overId)) {
				const newStatus = overId as ActivityStatus;
				if (newStatus && activeActivity.status !== newStatus) {
					// Validar que el cambio de estado no salte más de un estado
					const currentIdx = STATUS_ORDER.indexOf(activeActivity.status);
					const newIdx = STATUS_ORDER.indexOf(newStatus);
					if (currentIdx === -1 || newIdx === -1 || Math.abs(newIdx - currentIdx) > 1) {
						toast({
							title: "Cambio de estado no permitido",
							description: "No puedes saltar etapas. El flujo es: Pendiente → En Progreso → Revisión → Completado.",
							variant: "destructive",
						});
						setActiveId(null);
						setOverId(null);
						return;
					}

					// Verificar si es un retroceso (el nuevo índice es menor que el actual)
					if (newIdx < currentIdx) {
						setRollbackActivity({ activity: activeActivity, newStatus });
						setIsRollbackModalOpen(true);
						setActiveId(null);
						setOverId(null);
						return;
					}

					if ((newStatus === ActivityStatus.IN_PROGRESS && activeActivity.status === ActivityStatus.TODO) || newStatus === ActivityStatus.DONE) {
						setPendingStatusChange({ activity: activeActivity, newStatus });
						setCompletedActivity({ ...activeActivity, status: newStatus });
						setIsExecutionDateModalOpen(true);
					} else {
						// Cambio normal, sin fecha de ejecución
						try {
							const updatedActivities = activities.map((activity) => (activity.id === activeId ? { ...activity, status: newStatus } : activity));
							setActivities(updatedActivities);
							if (onActivityChange) {
								onActivityChange(updatedActivities);
							}
							const response = await ActivitysService.updateActivityStatus(activeId, newStatus);
							if (!response.success) throw new Error("Error al actualizar el estado");
						} catch (error) {
							console.error("Error al actualizar el estado:", error);
							toast({ title: "Error", description: "No se pudo actualizar el estado de la actividad", variant: "destructive" });
						}
					}
				}
			}
			setActiveId(null);
			setOverId(null);
		},
		[activities, onActivityChange, toast, isInViewMode]
	);

	// Manejar el éxito del registro de fechas de ejecución
	const handleExecutionDateSuccess = useCallback(
		(updatedActivity: BaseActivity) => {
			if (pendingStatusChange) {
				const updatedActivities = activities.map((activity) => (activity.id === updatedActivity.id ? { ...updatedActivity, status: pendingStatusChange.newStatus } : activity));
				setActivities(updatedActivities);
				if (onActivityChange) {
					onActivityChange(updatedActivities);
				}
				setPendingStatusChange(null);
				setIsExecutionDateModalOpen(false);
				setCompletedActivity(null);
			} else {
				// Fallback por si acaso
				const updatedActivities = activities.map((activity) => (activity.id === updatedActivity.id ? updatedActivity : activity));
				setActivities(updatedActivities);
				if (onActivityChange) {
					onActivityChange(updatedActivities);
				}
				setIsExecutionDateModalOpen(false);
				setCompletedActivity(null);
			}
		},
		[activities, onActivityChange, pendingStatusChange]
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
			if (isInViewMode) {
				// Si está en modo visor, abrir el modal en solo lectura
				setSelectedActivity(activity);
				setIsActivityModalOpen(true);
			} else if (onActivityClick) {
				// Si no está en modo visor, usar el callback original
				onActivityClick(activity);
			}
		},
		[onActivityClick, isInViewMode]
	);

	// Manejador para cerrar el modal de actividad
	const handleActivityModalClose = useCallback(() => {
		setIsActivityModalOpen(false);
		setSelectedActivity(null);
	}, []);

	// Manejador para el éxito del modal de actividad (no debería usarse en modo solo lectura)
	const handleActivityModalSuccess = useCallback(() => {
		// En modo solo lectura esto no debería ejecutarse, pero lo incluimos por completitud
		setIsActivityModalOpen(false);
		setSelectedActivity(null);
	}, []);

	// Nuevo manejador para el evento dragOver
	const handleDragOver = useCallback(
		(event: DragOverEvent) => {
			if (isInViewMode) return;
			const { over } = event;
			setOverId((over?.id as string) || null);
		},
		[isInViewMode]
	);

	// Nuevo manejador para confirmar el retroceso
	const handleRollbackConfirm = useCallback(async () => {
		if (!rollbackActivity) return;

		try {
			// Limpiar las fechas de ejecución cuando se retrocede el estado
			const updatedActivity = {
				...rollbackActivity.activity,
				status: rollbackActivity.newStatus,
				executedEndDate: undefined, // Limpiar la fecha de finalización
			};

			const updatedActivities = activities.map((activity) => (activity.id === rollbackActivity.activity.id ? updatedActivity : activity));

			setActivities(updatedActivities);
			if (onActivityChange) {
				onActivityChange(updatedActivities);
			}

			// Actualizar en el backend
			const response = await ActivitysService.updateActivity(rollbackActivity.activity.id, updatedActivity);
			if (!response.success) throw new Error("Error al actualizar el estado");

			toast({
				title: "Estado actualizado",
				description: "La actividad ha sido retrocedida correctamente",
			});
		} catch (error) {
			console.error("Error al actualizar el estado:", error);
			toast({ title: "Error", description: "No se pudo actualizar el estado de la actividad", variant: "destructive" });
		}

		setIsRollbackModalOpen(false);
		setRollbackActivity(null);
	}, [activities, onActivityChange, rollbackActivity, toast]);

	// Nuevo manejador para cancelar el retroceso
	const handleRollbackCancel = useCallback(() => {
		setIsRollbackModalOpen(false);
		setRollbackActivity(null);
	}, []);

	return (
		<>
			<div className="flex flex-col h-full">
				{/* Indicador de bloqueo */}
				{isInViewMode && (
					<div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2 text-amber-800 flex-shrink-0">
						<Lock className="h-4 w-4" />
						<span className="text-sm font-medium">Este tablero está bloqueado por estar completado, archivado o ser un usuario visualizador.</span>
					</div>
				)}

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
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 min-h-0">
						{LANES.map((lane) => (
							<LaneContainer
								key={lane.id}
								lane={lane}
								activities={laneActivities[lane.id] || []}
								getPriorityColor={getPriorityColor}
								stages={stages}
								onDeleteActivity={isInViewMode ? undefined : handleDeleteActivity}
								onActivityClick={handleActivityClick}
								isOver={overId === lane.id}
								isViewer={isInViewMode}
							/>
						))}
					</div>

					<DragOverlay>{activeId && !isInViewMode ? <ActivityCard activity={activities.find((a) => a.id === activeId)!} stages={stages} /> : null}</DragOverlay>
				</DndContext>
			</div>
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

			{/* Modal de confirmación de retroceso */}
			<Dialog open={isRollbackModalOpen} onOpenChange={setIsRollbackModalOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Confirmar retroceso</DialogTitle>
						<DialogDescription>
							¿Estás seguro de que deseas retroceder esta actividad a {rollbackActivity ? ActivitiesLabels[rollbackActivity.newStatus] : ""}? Esta acción puede afectar el seguimiento del progreso.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={handleRollbackCancel}>
							Cancelar
						</Button>
						<Button variant="default" onClick={handleRollbackConfirm}>
							Confirmar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Modal de fechas de ejecución */}
			<ExecutionDateModal
				activity={completedActivity}
				isOpen={isExecutionDateModalOpen}
				onClose={() => {
					if (pendingStatusChange) {
						toast({
							title: "Debes ingresar la fecha",
							description: "Para continuar, primero debes guardar la fecha de ejecución.",
							variant: "destructive",
						});
						return;
					}
					setIsExecutionDateModalOpen(false);
					setCompletedActivity(null);
				}}
				onSuccess={handleExecutionDateSuccess}
			/>

			{/* Modal de actividad en solo lectura */}
			{isActivityModalOpen && selectedActivity && (
				<Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
					<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Detalles de la Actividad</DialogTitle>
							<DialogDescription>Vista detallada de la actividad (solo lectura)</DialogDescription>
						</DialogHeader>
						<CreateActivityModal
							projectId={0} // No se usa en modo solo lectura
							stages={stages}
							activity={selectedActivity}
							isReadOnly={true}
							onClose={handleActivityModalClose}
							onSuccess={handleActivityModalSuccess}
						/>
					</DialogContent>
				</Dialog>
			)}
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
		isViewer,
	}: {
		lane: { id: string; title: string };
		activities: BaseActivity[];
		getPriorityColor: (priority: string) => string;
		stages: BaseStage[];
		onDeleteActivity?: (id: string) => void;
		onActivityClick?: (activity: BaseActivity) => void;
		isOver: boolean;
		isViewer?: boolean;
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

		const laneClassName = `bg-secondary/50 rounded-lg p-2 flex-1 overflow-y-auto transition-all duration-200 ${isOver ? "ring-2 ring-primary bg-secondary/70" : ""}`;

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
									<SortableItem key={activity.id} activity={activity} getPriorityColor={getPriorityColor} stages={stages} onDelete={onDeleteActivity} onClick={onActivityClick} isViewer={isViewer} />
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
		isViewer,
	}: {
		activity: BaseActivity;
		getPriorityColor: (priority: string) => string;
		stages: BaseStage[];
		onDelete?: (id: string) => void;
		onClick?: (activity: BaseActivity) => void;
		isViewer?: boolean;
	}) => {
		const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
			id: activity.id,
			data: {
				type: "task",
				activity,
				status: activity.status,
			},
			disabled: isViewer,
		});

		const style = {
			transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
			transition,
			opacity: isDragging ? 0.5 : 1,
			zIndex: isDragging ? 1 : 0,
			cursor: isViewer ? "default" : "grab",
			touchAction: isViewer ? "auto" : "none",
		};

		return (
			<div ref={setNodeRef} style={style} {...attributes} {...listeners} className={isViewer ? "" : "touch-none"}>
				<ActivityCard activity={activity} stages={stages} onDelete={onDelete} onClick={onClick} />
			</div>
		);
	}
);

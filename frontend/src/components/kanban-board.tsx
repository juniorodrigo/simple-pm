/* eslint-disable react/display-name */
"use client";

import { useState, useEffect, useCallback, memo, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarClock } from "lucide-react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, useSensor, useSensors, closestCorners, useDroppable, MeasuringStrategy } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { BaseActivity } from "@/app/types/activity.type";
import { BaseStage } from "@/app/types/stage.type";
import { ActivityStatus } from "@/app/types/enums";
import { getTagColorClass } from "@/lib/colors";

type KanbanBoardProps = {
	activities: BaseActivity[];
	stages: BaseStage[];
};

// Mapeo de prioridades a clases CSS (constante para evitar recálculos)
const PRIORITY_COLORS = {
	low: "bg-green-100 text-green-800 border-green-200",
	medium: "bg-blue-100 text-blue-800 border-blue-200",
	high: "bg-orange-100 text-orange-800 border-orange-200",
	critical: "bg-red-100 text-red-800 border-red-200",
	default: "bg-gray-100 text-gray-800 border-gray-200",
};

// Definir las columnas (lanes) basadas en ActivityStatus
const LANES = [
	{ id: ActivityStatus.TODO, title: "To Do" },
	{ id: ActivityStatus.IN_PROGRESS, title: "In Progress" },
	{ id: ActivityStatus.REVIEW, title: "Review" },
	{ id: ActivityStatus.DONE, title: "Done" },
];

// Componentes memoizados
const PriorityBadge = memo(({ priority, className }: { priority: string; className: string }) => (
	<Badge variant="outline" className={className}>
		{priority}
	</Badge>
));

const UserAvatar = memo(({ name, initials }: { name: string; initials: string }) => (
	<Avatar className="h-6 w-6">
		<AvatarImage src="/placeholder-user.jpg" alt={name} />
		<AvatarFallback>{initials}</AvatarFallback>
	</Avatar>
));

// Utilidad para obtener iniciales (fuera del componente para evitar recreación)
const getInitials = (name: string): string =>
	name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase();

// Componente de contenido de tarjeta memoizado (separado de la lógica de arrastre)
const ActivityCardContent = memo(({ activity, getPriorityColor, stages }: { activity: BaseActivity; getPriorityColor: (priority: string) => string; stages: BaseStage[] }) => {
	const priorityClass = getPriorityColor(activity.priority);
	const userInitials = getInitials(activity.assignedToUser.name + " " + activity.assignedToUser.lastname);
	const dueDate = new Date(activity.endDate).toLocaleDateString();

	// Encontrar el stage al que pertenece esta actividad
	const activityStage = stages.find((s) => s.id === activity.stageId);

	return (
		<div className="space-y-2 h-full pl-3">
			<div className="font-medium">{activity.title}</div>
			<p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<PriorityBadge priority={activity.priority} className={`rounded-md ${priorityClass}`} />
					{activityStage && (
						<Badge variant="outline" className={`text-xs rounded-full ${getTagColorClass(activityStage.color.toLowerCase())}`}>
							{activityStage.name}
						</Badge>
					)}
				</div>
				<UserAvatar name={activity.assignedToUser.name + " " + activity.assignedToUser.lastname} initials={userInitials} />
			</div>
			<div className="flex items-center text-xs text-muted-foreground">
				<CalendarClock className="mr-1 h-3 w-3" />
				<span>Due: {dueDate}</span>
			</div>
		</div>
	);
});
ActivityCardContent.displayName = "ActivityCardContent";

// Componente de tarjeta de actividad optimizado
const ActivityCard = memo(({ activity, getPriorityColor, stages }: { activity: BaseActivity; getPriorityColor: (priority: string) => string; stages: BaseStage[] }) => {
	const activityStage = stages.find((s) => s.id === activity.stageId);
	const stageColor = activityStage?.color || "";

	const getStageColorValue = (color: string) => {
		switch (color.toLowerCase()) {
			case "red":
				return "#ef4444";
			case "green":
				return "#22c55e";
			case "blue":
				return "#3b82f6";
			case "yellow":
				return "#eab308";
			case "purple":
				return "#a855f7";
			case "pink":
				return "#ec4899";
			case "gray":
				return "#6b7280";
			default:
				return "#6b7280";
		}
	};

	const borderColor = activityStage ? getStageColorValue(activityStage.color) : undefined;

	return (
		<Card className="mb-2 cursor-grab overflow-hidden" style={{ borderLeft: borderColor ? `4px solid ${borderColor}` : undefined }}>
			<CardContent className="p-3">
				<ActivityCardContent activity={activity} getPriorityColor={getPriorityColor} stages={stages} />
			</CardContent>
		</Card>
	);
});

// Componente principal optimizado
export default function KanbanBoard({ activities: initialActivities, stages }: KanbanBoardProps) {
	const [activities, setActivities] = useState<BaseActivity[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);

	// Actualizar actividades solo cuando cambian
	useEffect(() => {
		if (JSON.stringify(activities) !== JSON.stringify(initialActivities)) {
			setActivities(initialActivities);
		}
	}, [initialActivities]);

	// Configuración de sensores optimizada
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 5 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// Callbacks optimizados
	const handleDragStart = useCallback((event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	}, []);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;

			if (!over) {
				setActiveId(null);
				return;
			}

			const activeId = active.id as string;
			const overId = over.id as string;

			const activeActivity = activities.find((a) => a.id === activeId);
			if (!activeActivity) {
				setActiveId(null);
				return;
			}

			// Verificar si se está soltando en una lane (columna)
			if (LANES.some((lane) => lane.id === overId)) {
				const newStatus = overId as ActivityStatus;

				if (newStatus && activeActivity.status !== newStatus) {
					setActivities((prev) => prev.map((activity) => (activity.id === activeId ? { ...activity, status: newStatus } : activity)));
				}
			}

			setActiveId(null);
		},
		[activities]
	);

	// Usar función simple en vez de callback para getPriorityColor
	const getPriorityColor = (priority: string): string => PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.default;

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
		return <ActivityCard activity={activeActivity} getPriorityColor={getPriorityColor} stages={stages} />;
	}, [activeId, activeActivity, getPriorityColor, stages]);

	return (
		<DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCorners} measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{LANES.map((lane) => (
					<LaneContainer key={lane.id} lane={lane} activities={laneActivities[lane.id] || []} getPriorityColor={getPriorityColor} stages={stages} />
				))}
			</div>

			<DragOverlay>{dragOverlay}</DragOverlay>
		</DndContext>
	);
}

// Contenedor de lane optimizado
const LaneContainer = memo(
	({ lane, activities, getPriorityColor, stages }: { lane: { id: string; title: string }; activities: BaseActivity[]; getPriorityColor: (priority: string) => string; stages: BaseStage[] }) => {
		const { setNodeRef, isOver } = useDroppable({
			id: lane.id,
			data: {
				type: "lane",
				id: lane.id,
				accepts: ["task"],
			},
		});

		// Memoización eficiente de IDs
		const itemIds = useMemo(() => activities.map((a) => a.id), [activities]);

		// Optimización: cálculo de clases condicionales
		const laneClassName = `bg-secondary/50 rounded-lg p-2 flex-1 min-h-[500px] ${isOver ? "ring-2 ring-primary bg-secondary/70" : ""}`;

		return (
			<div className="flex flex-col h-full">
				<div className="flex items-center justify-between mb-2">
					<h3 className="font-medium">{lane.title}</h3>
					<Badge variant="outline">{activities.length}</Badge>
				</div>

				<div ref={setNodeRef} className={laneClassName} style={{ transition: "background-color 0.2s ease" }}>
					{activities.length > 0 ? (
						<SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
							{activities.map((activity) => (
								<SortableItem key={activity.id} activity={activity} getPriorityColor={getPriorityColor} stages={stages} />
							))}
						</SortableContext>
					) : (
						<div className="text-muted-foreground text-center p-4 border border-dashed rounded-md mt-2 h-32 flex items-center justify-center">Arrastra elementos aquí</div>
					)}
				</div>
			</div>
		);
	}
);

// Item sortable optimizado - ahora más ligero
const SortableItem = memo(({ activity, getPriorityColor, stages }: { activity: BaseActivity; getPriorityColor: (priority: string) => string; stages: BaseStage[] }) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: activity.id,
		data: {
			type: "task",
			activity,
			status: activity.status,
		},
	});

	// Encontrar el stage y obtener el color
	const activityStage = stages.find((s) => s.id === activity.stageId);
	const getStageColorValue = (color: string) => {
		switch (color.toLowerCase()) {
			case "red":
				return "#ef4444";
			case "green":
				return "#22c55e";
			case "blue":
				return "#3b82f6";
			case "yellow":
				return "#eab308";
			case "purple":
				return "#a855f7";
			case "pink":
				return "#ec4899";
			case "gray":
				return "#6b7280";
			default:
				return "#6b7280";
		}
	};

	const borderColor = activityStage ? getStageColorValue(activityStage.color) : undefined;

	const style = {
		transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
		transition,
		opacity: isDragging ? 0.5 : 1,
		zIndex: isDragging ? 1 : 0,
		borderLeft: borderColor ? `4px solid ${borderColor}` : undefined,
	};

	return (
		<Card ref={setNodeRef} style={style} className="mb-2 cursor-grab active:cursor-grabbing overflow-hidden" {...attributes} {...listeners}>
			<CardContent className="p-3">
				<ActivityCardContent activity={activity} getPriorityColor={getPriorityColor} stages={stages} />
			</CardContent>
		</Card>
	);
});

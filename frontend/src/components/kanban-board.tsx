/* eslint-disable react/display-name */
"use client";

import { useState, useEffect, useCallback, memo, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarClock, Tag } from "lucide-react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, useSensor, useSensors, closestCorners, useDroppable, MeasuringStrategy } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";

type Activity = {
	id: string;
	title: string;
	description: string;
	status: string;
	assignee: string;
	startDate: string;
	dueDate: string;
	priority: string;
	tags: string[];
};

type KanbanBoardProps = {
	activities: Activity[];
};

// Mapeo de prioridades a clases CSS (constante para evitar recálculos)
const PRIORITY_COLORS = {
	low: "bg-green-100 text-green-800 border-green-200",
	medium: "bg-blue-100 text-blue-800 border-blue-200",
	high: "bg-orange-100 text-orange-800 border-orange-200",
	critical: "bg-red-100 text-red-800 border-red-200",
	default: "bg-gray-100 text-gray-800 border-gray-200",
};

// Columnas estáticas definidas fuera del componente para evitar recreaciones
const COLUMNS = [
	{ id: "todo", title: "To Do" },
	{ id: "in-progress", title: "In Progress" },
	{ id: "review", title: "Review" },
	{ id: "done", title: "Done" },
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
const ActivityCardContent = memo(({ activity, getPriorityColor }: { activity: Activity; getPriorityColor: (priority: string) => string }) => {
	// Precalcular valores para evitar cálculos en el render
	const priorityClass = getPriorityColor(activity.priority);
	const userInitials = getInitials(activity.assignee);
	const dueDate = new Date(activity.dueDate).toLocaleDateString();

	return (
		<div className="space-y-2">
			<div className="font-medium">{activity.title}</div>
			<p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
			<div className="flex items-center justify-between">
				<PriorityBadge priority={activity.priority} className={priorityClass} />
				<UserAvatar name={activity.assignee} initials={userInitials} />
			</div>
			<div className="flex items-center text-xs text-muted-foreground">
				<CalendarClock className="mr-1 h-3 w-3" />
				<span>Due: {dueDate}</span>
			</div>
			{activity.tags.length > 0 && (
				<div className="flex flex-wrap gap-1">
					{activity.tags.map((tag, i) => (
						<span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
							<Tag className="mr-1 h-2 w-2" />
							{tag}
						</span>
					))}
				</div>
			)}
		</div>
	);
});
ActivityCardContent.displayName = "ActivityCardContent";

// Componente de tarjeta de actividad optimizado
const ActivityCard = memo(({ activity, getPriorityColor }: { activity: Activity; getPriorityColor: (priority: string) => string }) => {
	return (
		<Card className="mb-2 cursor-grab">
			<CardContent className="p-3">
				<ActivityCardContent activity={activity} getPriorityColor={getPriorityColor} />
			</CardContent>
		</Card>
	);
});

// Componente principal optimizado
export default function KanbanBoard({ activities: initialActivities }: KanbanBoardProps) {
	const [activities, setActivities] = useState<Activity[]>([]);
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

			// Optimización: acceso directo al status en vez de buscar toda la actividad
			const activeActivity = activities.find((a) => a.id === activeId);
			if (!activeActivity) {
				setActiveId(null);
				return;
			}

			// Determinar nueva columna de destino de manera más eficiente
			const newStatus = over.data?.current?.type === "column" ? overId : activities.find((a) => a.id === overId)?.status || activeActivity.status;

			// Actualizar solo si hay cambio real
			if (newStatus && activeActivity.status !== newStatus) {
				// Optimización: inmutabilidad sin recrear todo el array
				setActivities((prev) => prev.map((activity) => (activity.id === activeId ? { ...activity, status: newStatus } : activity)));
			}

			setActiveId(null);
		},
		[activities]
	);

	// Usar función simple en vez de callback para getPriorityColor
	const getPriorityColor = (priority: string): string => PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.default;

	// Actividad activa memoizada eficientemente
	const activeActivity = useMemo(() => (activeId ? activities.find((a) => a.id === activeId) : null), [activeId, activities]);

	// Optimización: organizar actividades por columna una sola vez
	const columnActivities = useMemo(() => {
		const result: Record<string, Activity[]> = {};

		// Inicializar todas las columnas con arrays vacíos
		COLUMNS.forEach((col) => {
			result[col.id] = [];
		});

		// Asignar actividades a sus columnas en una sola pasada
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
		return <ActivityCard activity={activeActivity} getPriorityColor={getPriorityColor} />;
	}, [activeId, activeActivity, getPriorityColor]);

	return (
		<DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCorners} measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{COLUMNS.map((column) => (
					<ColumnContainer key={column.id} column={column} activities={columnActivities[column.id] || []} getPriorityColor={getPriorityColor} />
				))}
			</div>

			<DragOverlay>{dragOverlay}</DragOverlay>
		</DndContext>
	);
}

// Contenedor de columna optimizado
const ColumnContainer = memo(({ column, activities, getPriorityColor }: { column: { id: string; title: string }; activities: Activity[]; getPriorityColor: (priority: string) => string }) => {
	const { setNodeRef, isOver } = useDroppable({
		id: column.id,
		data: {
			type: "column",
			id: column.id,
			accepts: ["task"],
		},
	});

	// Memoización eficiente de IDs
	const itemIds = useMemo(() => activities.map((a) => a.id), [activities]);

	// Optimización: cálculo de clases condicionales
	const columnClassName = `bg-secondary/50 rounded-lg p-2 flex-1 min-h-[500px] ${isOver ? "ring-2 ring-primary bg-secondary/70" : ""}`;

	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between mb-2">
				<h3 className="font-medium">{column.title}</h3>
				<Badge variant="outline">{activities.length}</Badge>
			</div>

			<div ref={setNodeRef} className={columnClassName} style={{ transition: "background-color 0.2s ease" }}>
				{activities.length > 0 ? (
					<SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
						{activities.map((activity) => (
							<SortableItem key={activity.id} activity={activity} getPriorityColor={getPriorityColor} />
						))}
					</SortableContext>
				) : (
					<div className="text-muted-foreground text-center p-4 border border-dashed rounded-md mt-2 h-32 flex items-center justify-center">Arrastra elementos aquí</div>
				)}
			</div>
		</div>
	);
});

// Item sortable optimizado - ahora más ligero
const SortableItem = memo(({ activity, getPriorityColor }: { activity: Activity; getPriorityColor: (priority: string) => string }) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: activity.id,
		data: {
			type: "task",
			activity,
			status: activity.status,
		},
	});

	// Estilos para el arrastre
	const style = {
		transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
		transition,
		opacity: isDragging ? 0.5 : 1,
		zIndex: isDragging ? 1 : 0,
	};

	// No renderizar todo el contenido aquí, solo un contenedor
	// que incluye el contenido memoizado como hijo
	return (
		<Card ref={setNodeRef} style={style} className="mb-2 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
			<CardContent className="p-3">
				<ActivityCardContent activity={activity} getPriorityColor={getPriorityColor} />
			</CardContent>
		</Card>
	);
});

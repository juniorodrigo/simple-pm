"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { addDays, differenceInDays, format, startOfDay, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { BaseActivity } from "@/app/types/activity.type";
import { BaseStage } from "@/app/types/stage.type";
import { CalendarIcon, AlertTriangleIcon, CheckIcon, ArrowRightIcon, ClockIcon } from "lucide-react";
import { es } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getStageColorValue, getPriorityColor, getStatusColor } from "@/lib/colors";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type GanttChartProps = {
	activities: BaseActivity[];
	stages: BaseStage[];
	viewMode: "days" | "weeks";
};

type ExecutionStatus = {
	late: boolean;
	startDiff: number;
	endDiff: number | null;
};

// Funciones auxiliares
const getInitials = (name: string) => {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase();
};

const getPriorityIcon = (priority: string) => {
	switch (priority) {
		case "critical":
			return <AlertTriangleIcon className="h-4 w-4" />;
		case "high":
			return <AlertTriangleIcon className="h-3 w-3" />;
		case "medium":
			return <ArrowRightIcon className="h-3 w-3" />;
		case "low":
			return <CheckIcon className="h-3 w-3" />;
		default:
			return null;
	}
};

const getStageColor = (stageId: string, stages: BaseStage[]): string => {
	const stage = stages.find((s) => s.id === stageId);
	return stage?.color || "base";
};

const isWeekend = (date: Date) => {
	const day = date.getDay();
	return day === 0 || day === 6;
};

const isToday = (date: Date) => {
	const today = new Date();
	return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

const isPast = (date: Date) => {
	const today = new Date();
	return date < startOfDay(today);
};

const getExecutionStatus = (activity: BaseActivity): ExecutionStatus | null => {
	if (!activity.executedStartDate) return null;

	const planned = {
		start: new Date(activity.startDate),
		end: new Date(activity.endDate),
	};

	const executed = {
		start: new Date(activity.executedStartDate),
		end: activity.executedEndDate ? new Date(activity.executedEndDate) : new Date(),
	};

	const startDiff = differenceInDays(executed.start, planned.start);
	const endDiff = activity.executedEndDate ? differenceInDays(executed.end, planned.end) : null;

	return {
		startDiff,
		endDiff,
		late: startDiff > 0 || (endDiff !== null && endDiff > 0),
	};
};

// Funciones auxiliares para calcular posiciones
const WEEK_WIDTH = 100; // ancho reducido para cada semana

const getBarPosition = (activity: BaseActivity, dateRange: Date[], viewMode: "days" | "weeks") => {
	if (dateRange.length === 0) return { left: 0, width: 0 };

	const startDate = new Date(activity.startDate);
	const dueDate = new Date(activity.endDate);
	const firstDate = dateRange[0];

	if (viewMode === "weeks") {
		const startOffset = differenceInDays(startDate, firstDate);
		const duration = differenceInDays(dueDate, startDate) + 1;
		const left = startOffset * (WEEK_WIDTH / 7); // proporcional al nuevo ancho
		const width = Math.max(duration * (WEEK_WIDTH / 7), 16);
		return { left, width };
	} else {
		const startOffset = differenceInDays(startDate, firstDate);
		const duration = differenceInDays(dueDate, startDate) + 1;
		const left = startOffset * 40;
		const width = Math.max(duration * 40, 16);
		return { left, width };
	}
};

const getExecutedBarPosition = (activity: BaseActivity, dateRange: Date[], viewMode: "days" | "weeks") => {
	if (dateRange.length === 0 || !activity.executedStartDate) return null;

	const startDate = new Date(activity.executedStartDate);
	const endDate = activity.executedEndDate ? new Date(activity.executedEndDate) : new Date(activity.executedStartDate);
	const firstDate = dateRange[0];

	if (viewMode === "weeks") {
		const startOffset = differenceInDays(startDate, firstDate);
		const duration = differenceInDays(endDate, startDate) + 1;
		const left = startOffset * (WEEK_WIDTH / 7);
		const width = Math.max(duration * (WEEK_WIDTH / 7), 16);
		return { left, width };
	} else {
		const startOffset = differenceInDays(startDate, firstDate);
		const duration = differenceInDays(endDate, startDate) + 1;
		const left = startOffset * 40;
		const width = Math.max(duration * 40, 16);
		return { left, width };
	}
};

const MIN_WEEKS = 22;

// Modificar el hook useDateRange para asegurar mínimo de 12 semanas en vista semanal
const useDateRange = (activities: BaseActivity[], viewMode: "days" | "weeks") => {
	return useMemo(() => {
		if (activities.length === 0) return [];

		let earliestDate = new Date(activities[0].startDate);
		let latestDate = new Date(activities[0].endDate);

		activities.forEach((activity) => {
			const startDate = new Date(activity.startDate);
			const dueDate = new Date(activity.endDate);

			if (activity.executedStartDate) {
				const executedStart = new Date(activity.executedStartDate);
				earliestDate = executedStart < earliestDate ? executedStart : earliestDate;
			}

			if (activity.executedEndDate) {
				const executedEnd = new Date(activity.executedEndDate);
				latestDate = executedEnd > latestDate ? executedEnd : latestDate;
			}

			earliestDate = startDate < earliestDate ? startDate : earliestDate;
			latestDate = dueDate > latestDate ? dueDate : latestDate;
		});

		earliestDate = addDays(earliestDate, -2);
		latestDate = addDays(latestDate, 2);

		if (viewMode === "weeks") {
			earliestDate = startOfWeek(earliestDate, { weekStartsOn: 1 });
			latestDate = startOfWeek(latestDate, { weekStartsOn: 1 });
			// Asegurar mínimo de 12 semanas
			const numWeeks = Math.ceil((latestDate.getTime() - earliestDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
			if (numWeeks < MIN_WEEKS) {
				latestDate = addDays(earliestDate, (MIN_WEEKS - 1) * 7);
			}
		}

		const range: Date[] = [];
		let currentDate = startOfDay(earliestDate);

		while (currentDate <= latestDate) {
			if (viewMode === "weeks") {
				if (currentDate.getDay() === 1) {
					range.push(currentDate);
				}
			} else {
				range.push(currentDate);
			}
			currentDate = addDays(currentDate, 1);
		}

		return range;
	}, [activities, viewMode]);
};

const useChartDimensions = (dateRange: Date[], viewMode: "days" | "weeks") => {
	const [chartWidth, setChartWidth] = useState(0);

	useEffect(() => {
		const updateWidth = () => {
			const width = Math.max(dateRange.length * (viewMode === "weeks" ? 280 : 40), 800);
			setChartWidth(width);
		};

		updateWidth();
		window.addEventListener("resize", updateWidth);
		return () => window.removeEventListener("resize", updateWidth);
	}, [dateRange, viewMode]);

	return chartWidth;
};

// Componentes más pequeños
const Legend = ({ showLegend, setShowLegend }: { showLegend: boolean; setShowLegend: (show: boolean) => void }) => (
	<div className="flex items-center gap-4 text-sm p-3 bg-muted/20 rounded-md">
		<h4 className="font-medium">Leyenda:</h4>
		<div className="flex items-center gap-2">
			<div className="h-3 w-8 rounded bg-blue-500"></div>
			<span>Fechas planificadas</span>
		</div>
		<div className="flex items-center gap-2">
			<div className="h-3 w-8 rounded bg-green-600 border-2 border-dashed border-green-800"></div>
			<span>Fechas ejecutadas (a tiempo)</span>
		</div>
		<div className="flex items-center gap-2">
			<div className="h-3 w-8 rounded bg-amber-500 border-2 border-dashed border-amber-700"></div>
			<span>Fechas ejecutadas (con retraso)</span>
		</div>
		<button onClick={() => setShowLegend(false)} className="ml-auto text-xs text-muted-foreground hover:text-foreground">
			Ocultar
		</button>
	</div>
);

// Agrupa las semanas por mes para el header
function getMonthGroups(dateRange: Date[]) {
	const groups: { month: string; startIdx: number; span: number }[] = [];
	let currentMonth = format(dateRange[0], "MMMM", { locale: es });
	let startIdx = 0;
	for (let i = 1; i < dateRange.length; i++) {
		const month = format(dateRange[i], "MMMM", { locale: es });
		if (month !== currentMonth) {
			groups.push({ month: currentMonth, startIdx, span: i - startIdx });
			currentMonth = month;
			startIdx = i;
		}
	}
	groups.push({ month: currentMonth, startIdx, span: dateRange.length - startIdx });
	return groups;
}

const DateHeader = ({ dateRange, chartWidth, viewMode }: { dateRange: Date[]; chartWidth: number; viewMode: "days" | "weeks" }) => {
	if (viewMode === "weeks") {
		const monthGroups = getMonthGroups(dateRange);
		return (
			<div style={{ width: `${dateRange.length * WEEK_WIDTH}px` }}>
				{/* Fila de meses */}
				<div className="flex">
					{monthGroups.map((group, idx) => (
						<div key={group.month + idx} className="text-center text-sm font-semibold border-b bg-background" style={{ width: `${group.span * WEEK_WIDTH}px` }}>
							{group.month.charAt(0).toUpperCase() + group.month.slice(1)}
						</div>
					))}
				</div>
				{/* Fila de semanas */}
				<div className="flex">
					{dateRange.map((weekStart, index) => {
						const monday = startOfWeek(weekStart, { weekStartsOn: 1 });
						return (
							<div key={index} className={`flex-shrink-0 border-r w-[${WEEK_WIDTH}px]`} style={{ width: `${WEEK_WIDTH}px` }}>
								<div className="text-center text-xs py-2 bg-secondary/20 font-medium border-b">Semana {format(monday, "w", { locale: es })}</div>
							</div>
						);
					})}
				</div>
			</div>
		);
	}
	// Vista diaria (opcional, pero la dejamos igual)
	return (
		<div className="flex" style={{ width: `${chartWidth}px` }}>
			{dateRange.map((date, index) => (
				<div
					key={index}
					className={`w-10 flex-shrink-0 text-center text-xs py-2 border-r
						${isToday(date) ? "bg-primary/20 font-bold" : ""}`}
				>
					<div className="font-medium">{format(date, "d")}</div>
					<div>{format(date, "MMM", { locale: es })}</div>
					{isToday(date) && <div className="h-1 w-full bg-primary mt-1"></div>}
				</div>
			))}
		</div>
	);
};

const ActivityTooltipContent = ({ activity, executionStatus }: { activity: BaseActivity; executionStatus: ExecutionStatus | null }) => (
	<div className="text-sm">
		<p className="font-medium">{activity.title}</p>
		<p className="text-xs mt-1">Prioridad: {activity.priority}</p>
		<p className="text-xs">Estado: {activity.status}</p>
		<p className="text-xs">Asignado a: {activity.assignedToUser.name}</p>
		<div className="border-t border-border mt-2 pt-1">
			<p className="text-xs font-medium">Fechas planificadas:</p>
			<p className="text-xs">
				{format(new Date(activity.startDate), "dd MMM yyyy", { locale: es })} - {format(new Date(activity.endDate), "dd MMM yyyy", { locale: es })}
			</p>

			{activity.executedStartDate && (
				<>
					<p className="text-xs font-medium mt-1">Fechas reales:</p>
					<p className="text-xs">
						{format(new Date(activity.executedStartDate), "dd MMM yyyy", { locale: es })}
						{activity.executedEndDate && ` - ${format(new Date(activity.executedEndDate), "dd MMM yyyy", { locale: es })}`}
					</p>
					{executionStatus && (
						<p className={`text-xs mt-1 ${executionStatus.late ? "text-amber-600" : "text-green-600"}`}>
							{executionStatus.late
								? `Retraso: ${executionStatus.startDiff > 0 ? `${executionStatus.startDiff} días inicio` : ""} ${
										executionStatus.endDiff && executionStatus.endDiff > 0 ? `${executionStatus.startDiff > 0 ? "," : ""} ${executionStatus.endDiff} días fin` : ""
								  }`
								: "Completada a tiempo"}
						</p>
					)}
				</>
			)}
		</div>
	</div>
);

const ExecutedBarTooltipContent = ({ activity, executionStatus }: { activity: BaseActivity; executionStatus: ExecutionStatus | null }) => (
	<div className="text-sm">
		<p className="font-medium">Fechas reales de ejecución</p>
		<p className="text-xs mt-1">Inicio: {format(new Date(activity.executedStartDate!), "dd MMM yyyy", { locale: es })}</p>
		{activity.executedEndDate && <p className="text-xs">Fin: {format(new Date(activity.executedEndDate), "dd MMM yyyy", { locale: es })}</p>}
		{executionStatus && (
			<p className={`text-xs mt-1 ${executionStatus.late ? "text-amber-600" : "text-green-600"} font-medium`}>
				{executionStatus.late
					? `Retraso: ${executionStatus.startDiff > 0 ? `${executionStatus.startDiff} días inicio` : ""} ${
							executionStatus.endDiff && executionStatus.endDiff > 0 ? `${executionStatus.startDiff > 0 ? "," : ""} ${executionStatus.endDiff} días fin` : ""
					  }`
					: "Completada a tiempo"}
			</p>
		)}
	</div>
);

const ActivityInfo = ({ activity, executionStatus, stages }: { activity: BaseActivity; executionStatus: ExecutionStatus | null; stages: BaseStage[] }) => (
	<div className={`w-64 min-w-64 p-3 border-r border-l-4 bg-background/100 shadow-sm border-l-${getStageColor(activity.stageId, stages)}-500 sticky left-0 z-20`}>
		<div className="font-medium">{activity.title}</div>
		<div className="flex items-center space-x-2 mt-2">
			<Badge variant="outline" className={`text-xs px-1.5 py-0 font-medium shadow-sm border bg-white ${getPriorityColor(activity.priority)}`}>
				{activity.priority}
			</Badge>
			<div className="flex-grow"></div>
			<Avatar className="h-6 w-6">
				<AvatarImage src="/placeholder-user.jpg" alt={activity.assignedToUser.name} />
				<AvatarFallback>{getInitials(activity.assignedToUser.name)}</AvatarFallback>
			</Avatar>
		</div>
		<div className="text-xs text-muted-foreground mt-2">
			{format(new Date(activity.startDate), "dd MMM", { locale: es })} - {format(new Date(activity.endDate), "dd MMM", { locale: es })}
		</div>
		{activity.executedStartDate && (
			<div className="text-xs flex items-center gap-1 mt-1">
				<ClockIcon className="h-3 w-3" />
				<span className={executionStatus?.late ? "text-amber-600" : "text-green-600"}>
					Ejecutada: {format(new Date(activity.executedStartDate), "dd MMM", { locale: es })}
					{activity.executedEndDate && ` - ${format(new Date(activity.executedEndDate), "dd MMM", { locale: es })}`}
				</span>
			</div>
		)}
	</div>
);

const GridLines = ({ dateRange, viewMode }: { dateRange: Date[]; viewMode: "days" | "weeks" }) => {
	if (viewMode === "weeks") {
		return (
			<>
				{dateRange.map((date, dateIndex) => (
					<div key={dateIndex} className="absolute top-0 bottom-0 border-r" style={{ left: dateIndex * WEEK_WIDTH, width: WEEK_WIDTH }} />
				))}
			</>
		);
	}
	// Vista diaria
	return (
		<>
			{dateRange.map((date, dateIndex) => (
				<div
					key={dateIndex}
					className={`absolute top-0 bottom-0 w-10 border-r
						${isToday(date) ? "bg-primary/20" : ""}`}
					style={{ left: dateIndex * 40 }}
				/>
			))}
		</>
	);
};

const ActivityBar = ({
	activity,
	barPosition,
	executedBarPos,
	executionStatus,
	stageColor,
}: {
	activity: BaseActivity;
	barPosition: { left: number; width: number };
	executedBarPos: { left: number; width: number } | null;
	executionStatus: ExecutionStatus | null;
	stageColor: string;
}) => {
	const isShortBar = barPosition.width < 120;

	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<div
						className="absolute top-3 rounded-md shadow-md hover:shadow-lg transition-shadow z-10 cursor-pointer overflow-hidden group"
						style={{
							left: `${barPosition.left}px`,
							width: `${barPosition.width}px`,
							backgroundColor: stageColor,
							height: executedBarPos ? "40px" : "60px",
							border: `1px solid ${isPast(new Date(activity.endDate)) ? "#d1d5db" : "transparent"}`,
						}}
					>
						{!isShortBar && (
							<div className="h-full p-2 text-white">
								<div className="flex items-center justify-between">
									<div className="font-medium truncate text-sm">{activity.title}</div>
									<div className="ml-1">{getPriorityIcon(activity.priority)}</div>
								</div>
								<div className="text-xs mt-1 opacity-90 group-hover:opacity-100">
									{format(new Date(activity.startDate), "dd MMM", { locale: es })} - {format(new Date(activity.endDate), "dd MMM", { locale: es })}
								</div>
							</div>
						)}
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<ActivityTooltipContent activity={activity} executionStatus={executionStatus} />
				</TooltipContent>
			</Tooltip>

			{executedBarPos && (
				<Tooltip>
					<TooltipTrigger asChild>
						<div
							className="absolute rounded-md overflow-hidden cursor-pointer transition-shadow z-9"
							style={{
								left: `${executedBarPos.left}px`,
								width: `${executedBarPos.width}px`,
								backgroundColor: executionStatus?.late ? "#f59e0b" : "#16a34a",
								height: "15px",
								top: "48px",
								borderWidth: "2px",
								borderStyle: "dashed",
								borderColor: executionStatus?.late ? "#b45309" : "#166534",
							}}
						/>
					</TooltipTrigger>
					<TooltipContent>
						<ExecutedBarTooltipContent activity={activity} executionStatus={executionStatus} />
					</TooltipContent>
				</Tooltip>
			)}
		</>
	);
};

// Componente principal
export default function GanttChart({ activities, stages, viewMode }: GanttChartProps) {
	const [showLegend, setShowLegend] = useState(true);
	const [scrollLeft, setScrollLeft] = useState(0);
	const contentRef = useRef<HTMLDivElement>(null);
	const headerScrollRef = useRef<HTMLDivElement>(null);

	const dateRange = useDateRange(activities, viewMode);
	const chartWidthDays = useChartDimensions(dateRange, viewMode);
	const chartWidth = viewMode === "weeks" ? dateRange.length * WEEK_WIDTH : chartWidthDays;

	const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
		const container = e.currentTarget;
		setScrollLeft(container.scrollLeft);

		if (headerScrollRef.current) {
			headerScrollRef.current.scrollLeft = container.scrollLeft;
		}
	}, []);

	const handleHeaderScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
		const headerContainer = e.currentTarget;
		if (contentRef.current) {
			contentRef.current.scrollLeft = headerContainer.scrollLeft;
		}
		setScrollLeft(headerContainer.scrollLeft);
	}, []);

	if (activities.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center p-12 text-center border rounded-md bg-secondary/20">
				<CalendarIcon className="h-12 w-12 mb-2 text-muted-foreground" />
				<h3 className="text-lg font-medium">No hay actividades disponibles</h3>
				<p className="text-sm text-muted-foreground mt-1">Añade algunas actividades para visualizarlas en el diagrama Gantt</p>
			</div>
		);
	}

	const hasExecutedActivities = activities.some((activity) => activity.executedStartDate);

	return (
		<TooltipProvider>
			<div className="space-y-3">
				{hasExecutedActivities && showLegend && <Legend showLegend={showLegend} setShowLegend={setShowLegend} />}

				<div className="border rounded-md shadow relative">
					<div className="flex sticky top-0 z-50 bg-background border-b" style={{ maxWidth: "100%" }}>
						<div className="w-64 min-w-64 p-3 border-r font-medium bg-background z-50 shadow-sm sticky left-0">Actividad</div>
						<div ref={headerScrollRef} className="flex-1 overflow-x-auto scrollbar-hide" onScroll={handleHeaderScroll} style={{ maxWidth: "calc(100% - 256px)" }}>
							<DateHeader dateRange={dateRange} chartWidth={chartWidth} viewMode={viewMode} />
						</div>
					</div>

					<div ref={contentRef} className="overflow-x-auto overflow-y-auto max-h-[70vh]" style={{ maxWidth: "100%" }} onScroll={handleScroll}>
						<div style={{ width: `${chartWidth + 256}px` }}>
							{activities.map((activity) => {
								const executedBarPos = getExecutedBarPosition(activity, dateRange, viewMode);
								const executionStatus = getExecutionStatus(activity);
								const barPosition = getBarPosition(activity, dateRange, viewMode);
								const stageColor = getStageColorValue(getStageColor(activity.stageId, stages));

								return (
									<div key={activity.id} className="flex border-b hover:bg-secondary/20">
										<ActivityInfo activity={activity} executionStatus={executionStatus} stages={stages} />
										<div className="flex-1 relative" style={{ height: "120px" }}>
											<GridLines dateRange={dateRange} viewMode={viewMode} />
											<ActivityBar activity={activity} barPosition={barPosition} executedBarPos={executedBarPos} executionStatus={executionStatus} stageColor={stageColor} />
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>

				<style jsx global>{`
					.scrollbar-hide::-webkit-scrollbar {
						display: none;
					}
					.scrollbar-hide {
						-ms-overflow-style: none;
						scrollbar-width: none;
					}
				`}</style>
			</div>
		</TooltipProvider>
	);
}

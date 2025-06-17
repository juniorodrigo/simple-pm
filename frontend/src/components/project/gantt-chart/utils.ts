import { addDays, differenceInDays, format, startOfDay, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { BaseActivity } from "@/types/activity.type";
import { BaseStage } from "@/types/stage.type";
import { getStageColorTailwind } from "@/lib/colors";
import { ExecutionStatus, BarPosition, MonthGroup, WEEK_WIDTH, DAY_WIDTH, MIN_BAR_WIDTH } from "./types";

// Funciones auxiliares para nombres y avatares
export const getInitials = (name: string): string => {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase();
};

// Funciones auxiliares para fechas
export const isWeekend = (date: Date): boolean => {
	const day = date.getDay();
	return day === 0 || day === 6;
};

export const isToday = (date: Date): boolean => {
	const today = new Date();
	return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

export const isPast = (date: Date): boolean => {
	const today = new Date();
	return date < startOfDay(today);
};

// Funciones auxiliares para etapas
export const getStageColor = (stageId: string, stages: BaseStage[]): string => {
	return stages.find((s) => s.id === stageId)?.color || "base";
};

export const getBorderStageColor = (stageId: string, stages: BaseStage[]): string => {
	const stage = stages.find((s) => s.id === stageId);
	const result = getStageColorTailwind(stage?.color || "base");
	console.log(`border-l-${result} `);
	return result;
};

// Función para calcular el estado de ejecución
export const getExecutionStatus = (activity: BaseActivity): ExecutionStatus | null => {
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

// Funciones de cálculo de posiciones
export const getBarPosition = (activity: BaseActivity, dateRange: Date[], viewMode: "days" | "weeks"): BarPosition => {
	if (dateRange.length === 0) return { left: 0, width: 0 };

	const startDate = new Date(activity.startDate);
	const dueDate = new Date(activity.endDate);
	const firstDate = dateRange[0];
	const widthMultiplier = viewMode === "weeks" ? WEEK_WIDTH / 7 : DAY_WIDTH;

	const startOffset = differenceInDays(startDate, firstDate);
	const duration = differenceInDays(dueDate, startDate) + 1;

	return {
		left: startOffset * widthMultiplier,
		width: Math.max(duration * widthMultiplier, MIN_BAR_WIDTH),
	};
};

export const getExecutedBarPosition = (activity: BaseActivity, dateRange: Date[], viewMode: "days" | "weeks"): BarPosition | null => {
	if (dateRange.length === 0 || !activity.executedStartDate) return null;

	const startDate = new Date(activity.executedStartDate);
	const endDate = activity.executedEndDate ? new Date(activity.executedEndDate) : new Date();
	const firstDate = dateRange[0];
	const widthMultiplier = viewMode === "weeks" ? WEEK_WIDTH / 7 : DAY_WIDTH;

	const startOffset = differenceInDays(startDate, firstDate);
	const duration = differenceInDays(endDate, startDate) + 1;

	return {
		left: startOffset * widthMultiplier,
		width: Math.max(duration * widthMultiplier, MIN_BAR_WIDTH),
	};
};

// Función para agrupar meses
export const getMonthGroups = (dateRange: Date[]): MonthGroup[] => {
	const groups: MonthGroup[] = [];
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

	groups.push({
		month: currentMonth,
		startIdx,
		span: dateRange.length - startIdx,
	});

	return groups;
};

// Función para calcular la posición del día actual en la vista de semanas
export const getTodayPositionInWeeks = (dateRange: Date[]): number | null => {
	const today = new Date();
	const todayStart = startOfDay(today);

	for (let i = 0; i < dateRange.length; i++) {
		const weekStart = startOfWeek(dateRange[i], { weekStartsOn: 1 });
		const weekEnd = addDays(weekStart, 6);

		if (todayStart >= weekStart && todayStart <= weekEnd) {
			// Calcular la posición exacta dentro de la semana
			const dayOfWeek = differenceInDays(todayStart, weekStart);
			const weekPosition = i * WEEK_WIDTH;
			const dayPosition = (dayOfWeek / 7) * WEEK_WIDTH;
			return weekPosition + dayPosition;
		}
	}

	return null;
};

// Función para verificar si el día actual está dentro del rango de una semana
export const isTodayInWeek = (weekStart: Date): boolean => {
	const today = new Date();
	const todayStart = startOfDay(today);
	const monday = startOfWeek(weekStart, { weekStartsOn: 1 });
	const sunday = addDays(monday, 6);

	return todayStart >= monday && todayStart <= sunday;
};

export const hasLateStart = (activity: BaseActivity): boolean => {
	const now = new Date();
	const startDate = new Date(activity.startDate);
	// Inicio tardío: llegado el día de inicio planificado, aún no tiene fecha de inicio real
	return now > startDate && !activity.executedStartDate;
};

export const hasLateCompletion = (activity: BaseActivity): boolean => {
	// Solo aplica si ya tiene fecha de inicio ejecutada
	if (!activity.executedStartDate) return false;

	const now = new Date();
	const endDate = new Date(activity.endDate);

	if (!activity.executedEndDate) {
		// Progreso con retraso: ya inició, ya pasó la fecha de fin planificada y aún no terminó
		return now > endDate;
	}

	// Completado con retraso: ya terminó pero después de la fecha planificada
	const actualEndDate = new Date(activity.executedEndDate);
	return actualEndDate > endDate;
};

export const hasInProgressDelay = (activity: BaseActivity): boolean => {
	// Solo aplica si ya tiene fecha de inicio ejecutada pero no terminó
	if (!activity.executedStartDate || activity.executedEndDate) return false;

	const now = new Date();
	const endDate = new Date(activity.endDate);

	// Progreso con retraso: ya inició, ya pasó la fecha de fin planificada y aún no terminó
	return now > endDate;
};

export const hasCompletedLate = (activity: BaseActivity): boolean => {
	// Solo aplica si ya terminó
	if (!activity.executedEndDate) return false;

	// Completado con retraso: ya terminó pero después de la fecha planificada
	const plannedEndDate = new Date(activity.endDate);
	const actualEndDate = new Date(activity.executedEndDate);
	return actualEndDate > plannedEndDate;
};

import { useState, useEffect, useMemo } from "react";
import { addDays, startOfDay, startOfWeek } from "date-fns";
import { BaseActivity } from "@/types/activity.type";
import { WEEK_WIDTH, DAY_WIDTH, MIN_WEEKS } from "./types";

// Hook para el rango de fechas
export const useDateRange = (activities: BaseActivity[], viewMode: "days" | "weeks"): Date[] => {
	return useMemo(() => {
		if (activities.length === 0) return [];

		const today = new Date();
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

		// Asegurar que hoy siempre esté incluido
		const todayStart = startOfDay(today);
		if (todayStart < earliestDate) {
			earliestDate = todayStart;
		}
		if (todayStart > latestDate) {
			latestDate = todayStart;
		}

		// Agregar padding al inicio (una semana antes del día más temprano)
		earliestDate = addDays(earliestDate, -7);

		// Agregar como máximo 20 días después de la mayor fecha
		latestDate = addDays(latestDate, 20);

		if (viewMode === "weeks") {
			earliestDate = startOfWeek(earliestDate, { weekStartsOn: 1 });
			latestDate = startOfWeek(latestDate, { weekStartsOn: 1 });

			const numWeeks = Math.ceil((latestDate.getTime() - earliestDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
			if (numWeeks < MIN_WEEKS) {
				latestDate = addDays(earliestDate, (MIN_WEEKS - 1) * 7);
			}
		} else {
			// Para vista de días, asegurar que tengamos suficientes días para llenar el contenedor
			const daysDifference = Math.ceil((latestDate.getTime() - earliestDate.getTime()) / (24 * 60 * 60 * 1000));
			// Calculamos un ancho mínimo que sea suficiente para mostrar bien el gantt
			// Considerando que el contenedor disponible suele ser de al menos 1200px después de restar la columna de actividades
			const minContainerWidth = 1200; // Ancho mínimo deseado para el área del gantt
			const minDays = Math.ceil(minContainerWidth / DAY_WIDTH);

			if (daysDifference < minDays) {
				latestDate = addDays(earliestDate, minDays - 1);
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

// Hook para dimensiones del gráfico
export const useChartDimensions = (dateRange: Date[], viewMode: "days" | "weeks"): number => {
	const [chartWidth, setChartWidth] = useState(0);

	useEffect(() => {
		const updateWidth = () => {
			const width = Math.max(dateRange.length * (viewMode === "weeks" ? WEEK_WIDTH : DAY_WIDTH), 800);
			setChartWidth(width);
		};

		updateWidth();
		window.addEventListener("resize", updateWidth);
		return () => window.removeEventListener("resize", updateWidth);
	}, [dateRange, viewMode]);

	return chartWidth;
};

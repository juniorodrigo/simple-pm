import { useState, useEffect, useMemo } from "react";
import { addDays, startOfDay, startOfWeek } from "date-fns";
import { BaseActivity } from "@/types/activity.type";
import { WEEK_WIDTH, DAY_WIDTH, MIN_WEEKS } from "./types";

// Hook para el rango de fechas
export const useDateRange = (activities: BaseActivity[], viewMode: "days" | "weeks"): Date[] => {
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

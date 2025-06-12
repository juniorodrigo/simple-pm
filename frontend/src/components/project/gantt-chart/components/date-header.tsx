import { memo } from "react";
import { format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { isToday, getMonthGroups, getTodayPositionInWeeks, isTodayInWeek } from "../utils";
import { WEEK_WIDTH, DAY_WIDTH } from "../types";

type DateHeaderProps = {
	dateRange: Date[];
	chartWidth: number;
	viewMode: "days" | "weeks";
};

export const DateHeader = memo(({ dateRange, chartWidth, viewMode }: DateHeaderProps) => {
	if (viewMode === "weeks") {
		const monthGroups = getMonthGroups(dateRange);
		const todayPosition = getTodayPositionInWeeks(dateRange);

		return (
			<div style={{ width: `${dateRange.length * WEEK_WIDTH}px` }} className="relative">
				<div className="flex">
					{monthGroups.map((group, idx) => (
						<div key={group.month + idx} className="text-center text-sm font-semibold border-b border-r bg-background" style={{ width: `${group.span * WEEK_WIDTH}px` }}>
							{group.month.charAt(0).toUpperCase() + group.month.slice(1)}
						</div>
					))}
				</div>
				<div className="flex">
					{dateRange.map((weekStart, index) => {
						const monday = startOfWeek(weekStart, { weekStartsOn: 1 });
						const hasToday = isTodayInWeek(weekStart);
						return (
							<div key={index} className="flex-shrink-0 border-r" style={{ width: `${WEEK_WIDTH}px` }}>
								<div className={`text-center text-xs py-2 bg-secondary/20 font-medium border-b ${hasToday ? "bg-primary/10 font-bold" : ""}`}>Semana {format(monday, "w", { locale: es })}</div>
							</div>
						);
					})}
				</div>

				{/* Línea vertical para indicar el día actual */}
				{todayPosition !== null && (
					<div className="absolute top-0 bottom-0 w-0.5 bg-primary z-[5]" style={{ left: `${todayPosition}px` }}>
						<div className="absolute -top-1 -left-1 w-2 h-2 bg-primary rounded-full"></div>
					</div>
				)}
			</div>
		);
	}

	const monthGroups = getMonthGroups(dateRange);
	return (
		<div style={{ width: `${chartWidth}px` }}>
			<div className="flex">
				{monthGroups.map((group, idx) => (
					<div key={group.month + idx} className="text-center text-sm font-semibold border-b border-r bg-background" style={{ width: `${group.span * DAY_WIDTH}px` }}>
						{group.month.charAt(0).toUpperCase() + group.month.slice(1)}
					</div>
				))}
			</div>
			<div className="flex">
				{dateRange.map((date, index) => (
					<div
						key={index}
						className={`w-10 flex-shrink-0 text-center text-xs py-2 border-r
							${isToday(date) ? "bg-primary/20 font-bold" : ""}`}
					>
						<div className="font-medium">{format(date, "d")}</div>
						{isToday(date) && <div className="h-1 w-full bg-primary mt-1"></div>}
					</div>
				))}
			</div>
		</div>
	);
});

DateHeader.displayName = "DateHeader";

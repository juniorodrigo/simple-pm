import { memo } from "react";
import { isToday, getTodayPositionInWeeks } from "../utils";
import { WEEK_WIDTH, DAY_WIDTH } from "../types";

type GridLinesProps = {
	dateRange: Date[];
	viewMode: "days" | "weeks";
};

export const GridLines = memo(({ dateRange, viewMode }: GridLinesProps) => {
	if (viewMode === "weeks") {
		const todayPosition = getTodayPositionInWeeks(dateRange);

		return (
			<>
				{dateRange.map((date, dateIndex) => (
					<div key={dateIndex} className="absolute top-0 bottom-0 border-r" style={{ left: dateIndex * WEEK_WIDTH, width: WEEK_WIDTH }} />
				))}

				{/* Línea vertical para el día actual */}
				{todayPosition !== null && <div className="absolute top-0 bottom-0 w-0.5 bg-primary/60 z-20" style={{ left: `${todayPosition}px` }} />}
			</>
		);
	}

	return (
		<>
			{dateRange.map((date, dateIndex) => (
				<div
					key={dateIndex}
					className={`absolute top-0 bottom-0 w-10 border-r
						${isToday(date) ? "bg-primary/20" : ""}`}
					style={{ left: dateIndex * DAY_WIDTH }}
				/>
			))}
		</>
	);
});

GridLines.displayName = "GridLines";

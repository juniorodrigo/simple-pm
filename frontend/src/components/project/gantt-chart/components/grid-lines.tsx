import { memo } from "react";
import { isToday } from "../utils";
import { WEEK_WIDTH, DAY_WIDTH } from "../types";

type GridLinesProps = {
	dateRange: Date[];
	viewMode: "days" | "weeks";
};

export const GridLines = memo(({ dateRange, viewMode }: GridLinesProps) => {
	if (viewMode === "weeks") {
		return (
			<>
				{dateRange.map((date, dateIndex) => (
					<div key={dateIndex} className="absolute top-0 bottom-0 border-r" style={{ left: dateIndex * WEEK_WIDTH, width: WEEK_WIDTH }} />
				))}
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

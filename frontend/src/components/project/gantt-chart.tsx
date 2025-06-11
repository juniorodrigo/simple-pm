"use client";

import { useState, useRef, useCallback } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getStageColorValue } from "@/lib/colors";

// Importaciones locales
import { GanttChartProps, WEEK_WIDTH } from "./gantt-chart/types";
import { useDateRange, useChartDimensions } from "./gantt-chart/hooks";
import { getBarPosition, getExecutedBarPosition, getExecutionStatus, getStageColor } from "./gantt-chart/utils";
import { Legend, DateHeader, ActivityInfo, GridLines, ActivityBar, EmptyState } from "./gantt-chart/components";

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
		return <EmptyState />;
	}

	return (
		<TooltipProvider>
			<div className="h-full flex flex-col space-y-3">
				{showLegend && (
					<div className="flex-shrink-0">
						<Legend showLegend={showLegend} setShowLegend={setShowLegend} />
					</div>
				)}

				<div className="border rounded-md shadow relative flex-1 flex flex-col min-h-0">
					<div className="flex sticky top-0 bg-background border-b flex-shrink-0" style={{ maxWidth: "100%" }}>
						<div className="w-64 min-w-64 p-3 border-r font-medium bg-background z-30 shadow-sm sticky left-0">Actividad</div>
						<div ref={headerScrollRef} className="flex-1 overflow-x-auto scrollbar-hide" onScroll={handleHeaderScroll} style={{ maxWidth: "calc(100% - 256px)" }}>
							<DateHeader dateRange={dateRange} chartWidth={chartWidth} viewMode={viewMode} />
						</div>
					</div>

					<div ref={contentRef} className="overflow-x-auto overflow-y-auto flex-1" style={{ maxWidth: "100%" }} onScroll={handleScroll}>
						<div style={{ width: `${chartWidth + 256}px` }}>
							{activities.map((activity) => {
								const executedBarPos = getExecutedBarPosition(activity, dateRange, viewMode);
								const executionStatus = getExecutionStatus(activity);
								const barPosition = getBarPosition(activity, dateRange, viewMode);
								const stageColor = getStageColorValue(getStageColor(activity.stageId, stages));
								const stageOriginalColor = getStageColor(activity.stageId, stages);

								return (
									<div key={activity.id} className="flex border-b hover:bg-secondary/20 items-center relative">
										<div className="absolute inset-0 left-64">
											<GridLines dateRange={dateRange} viewMode={viewMode} />
										</div>

										<ActivityInfo activity={activity} executionStatus={executionStatus} stages={stages} />
										<div className="flex-1 relative ">
											<div className="relative z-10 h-20 flex items-center justify-center">
												<div className="flex items-center w-full h-full">
													<ActivityBar
														activity={activity}
														barPosition={barPosition}
														executedBarPos={executedBarPos}
														executionStatus={executionStatus}
														stageColor={stageColor}
														stageOriginalColor={stageOriginalColor}
													/>
												</div>
											</div>
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

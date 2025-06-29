"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getStageColorValue } from "@/lib/colors";

// Importaciones locales
import { GanttChartProps, WEEK_WIDTH, DAY_WIDTH, FilterGroup, FilterState } from "./types";
import { useDateRange } from "./hooks";
import { getBarPosition, getExecutedBarPosition, getExecutionStatus, getStageColor, hasLateStart, hasInProgressDelay, hasCompletedLate } from "./utils";
import { Legend, DateHeader, ActivityInfo, GridLines, ActivityBar, EmptyState } from "./components";
import { BaseActivity } from "@/types/activity.type";

export default function GanttChart({ activities, stages, viewMode }: GanttChartProps) {
	const [showLegend, setShowLegend] = useState(true);
	const [scrollLeft, setScrollLeft] = useState(0);
	const [filters, setFilters] = useState<FilterState>({
		lateStart: false,
		inProgressLate: false,
		completedLate: false,
	});
	const contentRef = useRef<HTMLDivElement>(null);
	const headerScrollRef = useRef<HTMLDivElement>(null);

	const dateRange = useDateRange(activities, viewMode);
	const chartWidth = viewMode === "weeks" ? dateRange.length * WEEK_WIDTH : dateRange.length * DAY_WIDTH;

	const handleFilterChange = useCallback((group: FilterGroup, value: boolean) => {
		setFilters((prev: FilterState) => {
			const newFilters = { ...prev };
			// Si se selecciona un filtro, deseleccionar los otros grupos
			if (value) {
				Object.keys(newFilters).forEach((key) => {
					if (key !== group) {
						newFilters[key as FilterGroup] = false;
					}
				});
			}
			newFilters[group] = value;
			return newFilters;
		});
	}, []);

	const filteredActivities = useMemo(() => {
		if (!filters.lateStart && !filters.inProgressLate && !filters.completedLate) {
			return activities;
		}

		return activities.filter((activity: BaseActivity) => {
			if (filters.lateStart) {
				return hasLateStart(activity);
			}
			if (filters.inProgressLate) {
				return hasInProgressDelay(activity);
			}
			if (filters.completedLate) {
				return hasCompletedLate(activity);
			}
			return true;
		});
	}, [activities, filters]);

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
			<div className="h-full flex flex-col space-y-3 overflow-hidden">
				{showLegend && (
					<div className="flex-shrink-0">
						<Legend showLegend={showLegend} setShowLegend={setShowLegend} filters={filters} onFilterChange={handleFilterChange} />
					</div>
				)}

				{!showLegend && (
					<div className="flex-shrink-0">
						<button onClick={() => setShowLegend(true)} className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md border border-dashed transition-colors">
							Mostrar leyenda
						</button>
					</div>
				)}

				<div className="border rounded-md shadow relative flex-1 flex flex-col min-h-0 overflow-hidden">
					{/* Header fijo */}
					<div className="flex sticky top-0 bg-background border-b flex-shrink-0 z-[20]">
						<div className="w-64 min-w-64 p-3 border-r font-medium bg-background z-[21] shadow-sm sticky left-0">
							Actividad {filteredActivities.length !== activities.length && `(${filteredActivities.length}/${activities.length})`}
						</div>
						<div ref={headerScrollRef} className="flex-1 overflow-x-auto scrollbar-hide" onScroll={handleHeaderScroll}>
							<DateHeader dateRange={dateRange} chartWidth={chartWidth} viewMode={viewMode} />
						</div>
					</div>

					{/* Contenido con scroll */}
					<div ref={contentRef} className="flex-1 overflow-x-auto overflow-y-auto" onScroll={handleScroll}>
						<div className="relative" style={{ width: `${chartWidth + 256}px`, minHeight: "100%" }}>
							{filteredActivities.map((activity) => {
								const executedBarPos = getExecutedBarPosition(activity, dateRange, viewMode);
								const executionStatus = getExecutionStatus(activity);
								const barPosition = getBarPosition(activity, dateRange, viewMode);
								const stageColor = getStageColorValue(getStageColor(activity.stageId, stages));
								const stageOriginalColor = getStageColor(activity.stageId, stages);

								return (
									<div key={activity.id} className="flex border-b hover:bg-secondary/20 items-center relative">
										{/* Grid lines con ancho limitado */}
										<div className="absolute inset-0 left-64 z-[1]" style={{ width: `${chartWidth}px` }}>
											<GridLines dateRange={dateRange} viewMode={viewMode} />
										</div>

										{/* Activity info sticky */}
										<div className="sticky left-0 z-[19] bg-background">
											<ActivityInfo activity={activity} executionStatus={executionStatus} stages={stages} />
										</div>

										{/* Activity bar con z-index apropiado */}
										<div className="flex-1 relative">
											<div className="relative z-[10] h-20 flex items-center justify-center">
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

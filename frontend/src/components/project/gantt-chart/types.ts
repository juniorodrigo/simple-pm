import { BaseActivity } from "@/types/activity.type";
import { BaseStage } from "@/types/stage.type";

export type GanttChartProps = {
	activities: BaseActivity[];
	stages: BaseStage[];
	viewMode: "days" | "weeks";
};

export type ExecutionStatus = {
	late: boolean;
	startDiff: number;
	endDiff: number | null;
};

export type BarPosition = {
	left: number;
	width: number;
};

export type MonthGroup = {
	month: string;
	startIdx: number;
	span: number;
};

// Constantes
export const WEEK_WIDTH = 60;
export const MIN_WEEKS = 22;
export const DAY_WIDTH = 40;
export const MIN_BAR_WIDTH = 16;

export type FilterGroup = "lateStart" | "inProgressLate" | "completedLate";

export type FilterState = {
	lateStart: boolean;
	inProgressLate: boolean;
	completedLate: boolean;
};

export type LegendProps = {
	showLegend: boolean;
	setShowLegend: (show: boolean) => void;
	filters: FilterState;
	onFilterChange: (group: FilterGroup, value: boolean) => void;
};

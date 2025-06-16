import { AlertTriangleIcon, ClockIcon, CheckIcon } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";

export type FilterGroup = "lateStart" | "inProgressLate" | "completedLate";

export type FilterState = {
	lateStart: boolean;
	inProgressLate: boolean;
	completedLate: boolean;
};

type ProjectsLegendProps = {
	showLegend: boolean;
	setShowLegend: (show: boolean) => void;
	filters: FilterState;
	onFilterChange: (group: FilterGroup, value: boolean) => void;
};

export const ProjectsLegend = memo(({ showLegend, setShowLegend, filters, onFilterChange }: ProjectsLegendProps) => {
	const handleFilterChange = (group: FilterGroup) => {
		const newValue = !filters[group];
		onFilterChange(group, newValue);
	};

	return (
		<div className="flex flex-wrap items-center gap-4 text-xs p-3 bg-muted/30 rounded-lg border">
			<h4 className="font-medium text-foreground">Leyenda:</h4>

			{/* Grupo 1: Estados básicos */}
			<div className="flex items-center gap-3">
				<div className="flex items-center gap-2">
					<div className="h-3 w-6 rounded bg-blue-500"></div>
					<span className="text-muted-foreground">Planificado</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="h-3 w-6 rounded bg-green-600"></div>
					<span className="text-muted-foreground">Completado</span>
				</div>
			</div>

			{/* Separador visual */}
			<div className="h-4 w-px bg-border"></div>

			{/* Grupo 2: Alertas y problemas */}
			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={() => handleFilterChange("lateStart")}
					className={cn("flex items-center gap-2 px-2 py-1 rounded-md transition-colors", filters.lateStart ? "bg-primary/10" : "hover:bg-muted/50")}
				>
					<div className="relative h-3 w-6 rounded bg-blue-500">
						<div className="absolute -top-0.5 -right-0.5 bg-red-500 rounded-full p-0.5">
							<ClockIcon className="h-2 w-2 text-white" />
						</div>
					</div>
					<span className={cn("text-muted-foreground", filters.lateStart && "text-foreground")}>Inicio tardío</span>
					{filters.lateStart && <CheckIcon className="h-3 w-3" />}
				</button>

				<button
					type="button"
					onClick={() => handleFilterChange("inProgressLate")}
					className={cn("flex items-center gap-2 px-2 py-1 rounded-md transition-colors", filters.inProgressLate ? "bg-primary/10" : "hover:bg-muted/50")}
				>
					<div className="relative h-3 w-6 rounded" style={{ backgroundColor: "rgba(34, 197, 94, 0.8)" }}>
						<div className="absolute -top-0.5 -right-0.5 bg-red-500 rounded-full p-0.5">
							<ClockIcon className="h-2 w-2 text-white" />
						</div>
					</div>
					<span className={cn("text-muted-foreground", filters.inProgressLate && "text-foreground")}>En progreso con retraso</span>
					{filters.inProgressLate && <CheckIcon className="h-3 w-3" />}
				</button>

				<button
					type="button"
					onClick={() => handleFilterChange("completedLate")}
					className={cn("flex items-center gap-2 px-2 py-1 rounded-md transition-colors", filters.completedLate ? "bg-primary/10" : "hover:bg-muted/50")}
				>
					<div className="relative h-3 w-6 rounded" style={{ backgroundColor: "rgba(34, 197, 94, 0.8)" }}>
						<div className="absolute -top-0.5 -right-0.5 bg-amber-500 rounded-full p-0.5">
							<AlertTriangleIcon className="h-2 w-2 text-white" />
						</div>
					</div>
					<span className={cn("text-muted-foreground", filters.completedLate && "text-foreground")}>Completado con retraso</span>
					{filters.completedLate && <CheckIcon className="h-3 w-3" />}
				</button>
			</div>

			{/* Botón para ocultar */}
			<button type="button" onClick={() => setShowLegend(false)} className="ml-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors">
				Ocultar
			</button>
		</div>
	);
});

ProjectsLegend.displayName = "ProjectsLegend";

import { AlertTriangleIcon, ClockIcon } from "lucide-react";
import { memo } from "react";

type ProjectsLegendProps = {
	showLegend: boolean;
	setShowLegend: (show: boolean) => void;
};

export const ProjectsLegend = memo(({ showLegend, setShowLegend }: ProjectsLegendProps) => (
	<div className="flex flex-wrap items-center gap-4 text-xs p-3 bg-muted/30 rounded-lg border">
		<h4 className="font-medium text-foreground">Leyenda:</h4>

		{/* Grupo 1: Estados básicos */}
		<div className="flex items-center gap-3">
			<div className="flex items-center gap-2">
				<div className="h-3 w-6 rounded bg-blue-500"></div>
				<span className="text-muted-foreground">Planificado</span>
			</div>
			<div className="flex items-center gap-2">
				<div className="h-3 w-6 rounded" style={{ backgroundColor: "rgba(34, 197, 94, 0.8)" }}></div>
				<span className="text-muted-foreground">Ejecutado</span>
			</div>
		</div>

		{/* Separador visual */}
		<div className="h-4 w-px bg-border"></div>

		{/* Grupo 2: Alertas y problemas */}
		<div className="flex items-center gap-3">
			<div className="flex items-center gap-2">
				<div className="relative h-3 w-6 rounded bg-blue-500">
					<div className="absolute -top-0.5 -right-0.5 bg-red-500 rounded-full p-0.5">
						<ClockIcon className="h-2 w-2 text-white" />
					</div>
				</div>
				<span className="text-muted-foreground">Inicio tardío</span>
			</div>
			<div className="flex items-center gap-2">
				<div className="relative h-3 w-6 rounded" style={{ backgroundColor: "rgba(34, 197, 94, 0.8)" }}>
					<div className="absolute -top-0.5 -right-0.5 bg-red-500 rounded-full p-0.5">
						<ClockIcon className="h-2 w-2 text-white" />
					</div>
				</div>
				<span className="text-muted-foreground">En progreso con retraso</span>
			</div>
			<div className="flex items-center gap-2">
				<div className="relative h-3 w-6 rounded" style={{ backgroundColor: "rgba(34, 197, 94, 0.8)" }}>
					<div className="absolute -top-0.5 -right-0.5 bg-amber-500 rounded-full p-0.5">
						<AlertTriangleIcon className="h-2 w-2 text-white" />
					</div>
				</div>
				<span className="text-muted-foreground">Completado con retraso</span>
			</div>
		</div>

		{/* Botón para ocultar */}
		<button onClick={() => setShowLegend(false)} className="ml-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors">
			Ocultar
		</button>
	</div>
));

ProjectsLegend.displayName = "ProjectsLegend";

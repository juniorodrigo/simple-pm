import { memo } from "react";

type LegendProps = {
	showLegend: boolean;
	setShowLegend: (show: boolean) => void;
};

export const Legend = memo(({ showLegend, setShowLegend }: LegendProps) => (
	<div className="flex items-center gap-4 text-sm p-3 bg-muted/20 rounded-md">
		<h4 className="font-medium">Leyenda:</h4>
		<div className="flex items-center gap-2">
			<div className="h-3 w-8 rounded bg-blue-500"></div>
			<span>Fechas planificadas</span>
		</div>
		<div className="flex items-center gap-2">
			<div className="h-3 w-8 rounded bg-green-600 border-green-800"></div>
			<span>Fechas reales</span>
		</div>
		<div className="flex items-center gap-2">
			<div className="h-3 w-8 rounded border-2 border-dashed border-gray-400"></div>
			<span>Actividades pasadas</span>
		</div>
		<div className="flex items-center gap-2">
			<div className="h-3 w-8 rounded border-2 border-gray-400"></div>
			<span>Actividades vigentes</span>
		</div>
		<button onClick={() => setShowLegend(false)} className="ml-auto text-xs text-muted-foreground hover:text-foreground">
			Ocultar
		</button>
	</div>
));

Legend.displayName = "Legend";

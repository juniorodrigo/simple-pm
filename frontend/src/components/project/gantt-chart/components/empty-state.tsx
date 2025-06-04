import { memo } from "react";
import { CalendarIcon } from "lucide-react";

export const EmptyState = memo(() => (
	<div className="flex flex-col items-center justify-center p-12 text-center border rounded-md bg-secondary/20">
		<CalendarIcon className="h-12 w-12 mb-2 text-muted-foreground" />
		<h3 className="text-lg font-medium">No hay actividades disponibles</h3>
		<p className="text-sm text-muted-foreground mt-1">Añade algunas actividades para visualizarlas en el diagrama Gantt</p>
	</div>
));

EmptyState.displayName = "EmptyState";

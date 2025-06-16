import { Project } from "@/types/new/project.type";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ProjectStatusLabels } from "@/types/enums";
import { TooltipContent } from "@/components/ui/tooltip";

interface ProjectBarTooltipProps {
	project: Project;
	type: "planned" | "real";
	showDelayInPlanned?: boolean;
	showExecutionDelay?: boolean;
	showLateCompletion?: boolean;
}

export function ProjectBarTooltip({ project, type, showDelayInPlanned, showExecutionDelay, showLateCompletion }: ProjectBarTooltipProps) {
	const isPlanned = type === "planned";

	return (
		<TooltipContent>
			<div className="text-sm">
				<p className="font-medium">
					{project.name} {!isPlanned && "- Ejecución Real"}
				</p>

				{/* Información básica del proyecto */}
				<div className="mt-2 space-y-1">
					<p className="text-xs">Categoría: {project.categoryName || "Sin categoría"}</p>
					<p className="text-xs">Estado: {ProjectStatusLabels[project.status as keyof typeof ProjectStatusLabels] || "No definido"}</p>
					<p className="text-xs">Responsable: {project.managerUserName}</p>
					<p className="text-xs">Avance: {project.progressPercentage}%</p>
					{project.team && <p className="text-xs">Equipo: {project.team.length} miembros</p>}
					{project.activitiesCount !== undefined && <p className="text-xs">Actividades: {project.activitiesCount}</p>}
				</div>

				{/* Alertas */}
				{(showDelayInPlanned || showExecutionDelay || showLateCompletion) && (
					<div className="border-t border-border mt-2 pt-2 space-y-2">
						{showDelayInPlanned && (
							<div>
								<p className="text-xs text-red-600 font-medium">⚠️ Proyecto no iniciado</p>
								<p className="text-xs text-red-600">El proyecto debería haber comenzado el {format(new Date(project.startDate), "dd MMM yyyy", { locale: es })}</p>
							</div>
						)}

						{showExecutionDelay && (
							<div>
								<p className="text-xs text-red-600 font-medium">⚠️ Proyecto atrasado</p>
								<p className="text-xs text-red-600">El proyecto debería haber terminado el {format(new Date(project.endDate), "dd MMM yyyy", { locale: es })}</p>
							</div>
						)}

						{showLateCompletion && (
							<div>
								<p className="text-xs text-amber-600 font-medium">⚠️ Terminado con retraso</p>
								<p className="text-xs text-amber-600">
									Terminó tarde: {format(new Date(project.realEndDate!), "dd MMM yyyy", { locale: es })}
									(planificado: {format(new Date(project.endDate), "dd MMM yyyy", { locale: es })})
								</p>
							</div>
						)}
					</div>
				)}

				{/* Fechas */}
				<div className="border-t border-border mt-2 pt-1">
					{isPlanned ? (
						<p className="text-xs">
							Plan: {format(new Date(project.startDate), "dd MMM yyyy", { locale: es })} - {format(new Date(project.endDate), "dd MMM yyyy", { locale: es })}
						</p>
					) : (
						<p className="text-xs">
							Real: {format(new Date(project.realStartDate!), "dd MMM yyyy", { locale: es })} -{project.realEndDate ? format(new Date(project.realEndDate), "dd MMM yyyy", { locale: es }) : "hoy"}
						</p>
					)}
				</div>
			</div>
		</TooltipContent>
	);
}

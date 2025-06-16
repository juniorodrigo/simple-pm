import { memo } from "react";
import { AlertTriangleIcon, ClockIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { BaseActivity } from "@/types/activity.type";
import { BarPosition, ExecutionStatus } from "../types";
import { isPast } from "../utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type ActivityBarProps = {
	activity: BaseActivity;
	barPosition: BarPosition;
	executedBarPos: BarPosition | null;
	executionStatus: ExecutionStatus | null;
	stageColor: string;
	stageOriginalColor: string;
};

const shouldShowDelayIcon = (activity: BaseActivity): boolean => {
	const now = new Date();
	const startDate = new Date(activity.startDate);
	const endDate = new Date(activity.endDate);

	// Si no ha iniciado, mantener la lógica original
	if (!activity.executedStartDate) {
		return now > startDate;
	}

	// Si inició después de la fecha planificada
	const executedStartDate = new Date(activity.executedStartDate);
	const startedLate = executedStartDate > startDate;
	const notFinished = !activity.executedEndDate;
	const notInExecutionDelay = now <= endDate;

	return startedLate && notFinished && notInExecutionDelay;
};

const shouldShowExecutionDelayIcon = (activity: BaseActivity): boolean => {
	const now = new Date();
	const endDate = new Date(activity.endDate);

	// Mostrar ícono de retraso en barra ejecutada si:
	// 1. Ya pasó la fecha de fin planificada
	// 2. Tiene fecha de inicio ejecutada (está en progreso)
	// 3. No tiene fecha de fin de ejecución
	return now > endDate && !!activity.executedStartDate && !activity.executedEndDate;
};

const isLateCompletion = (activity: BaseActivity): boolean => {
	// Verificar si se terminó tarde (la fecha de fin ejecutada es posterior a la planificada)
	if (!activity.executedEndDate) return false;

	const plannedEndDate = new Date(activity.endDate);
	const actualEndDate = new Date(activity.executedEndDate);

	return actualEndDate > plannedEndDate;
};

const UnifiedTooltipContent = memo(({ activity, executionStatus }: { activity: BaseActivity; executionStatus: ExecutionStatus | null }) => {
	const lateStart = shouldShowDelayIcon(activity);
	const lateCompletion = isLateCompletion(activity);
	const showExecutionDelay = shouldShowExecutionDelayIcon(activity);

	const getStatusInfo = () => {
		if (!executionStatus) return { color: "bg-gray-500", text: "No iniciada" };
		if (activity.executedEndDate) return { color: "bg-green-500", text: "Completada" };
		return { color: "bg-blue-500", text: "En progreso" };
	};

	const statusInfo = getStatusInfo();

	return (
		<div className="text-sm space-y-3 p-1">
			{/* Header */}
			<div>
				<h3 className="font-semibold text-base">{activity.title}</h3>
				<p className="text-xs text-muted-foreground">Asignado a: {activity.assignedToUser.name}</p>
			</div>

			{/* Estado de la actividad */}
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
					<span className="text-xs font-medium">{statusInfo.text}</span>
				</div>

				{/* Alertas */}
				{(lateStart || showExecutionDelay || lateCompletion) && (
					<div className="space-y-1">
						{lateStart && (
							<div className="flex items-center gap-1 text-red-600">
								<ClockIcon className="h-3 w-3" />
								<span className="text-xs">Retraso en inicio</span>
							</div>
						)}
						{showExecutionDelay && (
							<div className="flex items-center gap-1 text-red-600">
								<ClockIcon className="h-3 w-3" />
								<span className="text-xs">Retraso en ejecución</span>
							</div>
						)}
						{lateCompletion && (
							<div className="flex items-center gap-1 text-amber-600">
								<AlertTriangleIcon className="h-3 w-3" />
								<span className="text-xs">Completada con retraso</span>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Fechas */}
			<div className="space-y-2 border-t pt-2">
				<div>
					<p className="text-xs font-medium text-muted-foreground">Fechas planificadas</p>
					<p className="text-xs">
						{format(new Date(activity.startDate), "dd MMM yyyy", { locale: es })} - {format(new Date(activity.endDate), "dd MMM yyyy", { locale: es })}
					</p>
				</div>

				{activity.executedStartDate && (
					<div>
						<p className="text-xs font-medium text-muted-foreground">Fechas reales</p>
						<p className="text-xs">
							{format(new Date(activity.executedStartDate), "dd MMM yyyy", { locale: es })}
							{activity.executedEndDate && ` - ${format(new Date(activity.executedEndDate), "dd MMM yyyy", { locale: es })}`}
						</p>
					</div>
				)}
			</div>
		</div>
	);
});

UnifiedTooltipContent.displayName = "UnifiedTooltipContent";

export const ActivityBar = memo(({ activity, barPosition, executedBarPos, executionStatus, stageColor, stageOriginalColor }: ActivityBarProps) => {
	const isShortBar = barPosition.width < 120;
	const showDelayInPlanned = shouldShowDelayIcon(activity);
	const showExecutionDelay = shouldShowExecutionDelayIcon(activity);
	const showLateCompletion = isLateCompletion(activity);

	// Función para renderizar los íconos de alerta en la barra planificada (azul)
	const renderPlannedAlertIcons = () => (
		<div className="absolute top-1 right-1 flex items-center space-x-1">
			{showDelayInPlanned && (
				<div className="bg-red-500 rounded-full p-0.5" title="Retraso en inicio">
					<ClockIcon className="h-3 w-3 text-white" />
				</div>
			)}
		</div>
	);

	// Función para renderizar los íconos de alerta en la barra ejecutada (verde)
	const renderExecutedAlertIcons = () => (
		<div className="absolute top-1 right-1 flex items-center space-x-1">
			{showExecutionDelay && (
				<div className="bg-red-500 rounded-full p-0.5" title="Retraso en ejecución">
					<ClockIcon className="h-3 w-3 text-white" />
				</div>
			)}
			{showLateCompletion && (
				<div className="bg-amber-500 rounded-full p-0.5" title="Completada con retraso">
					<AlertTriangleIcon className="h-3 w-3 text-white" />
				</div>
			)}
		</div>
	);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<div
					className="relative flex flex-col justify-center gap-1 cursor-pointer"
					style={{
						left: `${barPosition.left}px`,
						width: `${barPosition.width}px`,
						height: "auto",
					}}
				>
					{/* Barra planificada (azul) */}
					<div
						className={`
							rounded-md shadow-md hover:shadow-lg transition-shadow overflow-hidden group relative bg-blue-500 hover:bg-blue-600 border-2 border-transparent`}
						style={{
							height: "32px",
						}}
					>
						{!isShortBar && (
							<div className="h-full px-2 py-1 text-white flex items-center justify-between">
								<div className="font-medium truncate text-xs flex-1">{activity.title}</div>
							</div>
						)}
						{renderPlannedAlertIcons()}
					</div>

					{/* Barra ejecutada */}
					{executedBarPos && (
						<div
							className="relative rounded-md overflow-hidden transition-shadow flex items-center"
							style={{
								width: `${(executedBarPos.width / barPosition.width) * 100}%`,
								backgroundColor: "rgba(34, 197, 94, 0.8)",
								height: "32px",
								marginLeft: `${((executedBarPos.left - barPosition.left) / barPosition.width) * 100}%`,
							}}
						>
							{renderExecutedAlertIcons()}
						</div>
					)}
				</div>
			</TooltipTrigger>
			<TooltipPrimitive.Portal>
				<TooltipContent className="max-w-[300px]">
					<UnifiedTooltipContent activity={activity} executionStatus={executionStatus} />
				</TooltipContent>
			</TooltipPrimitive.Portal>
		</Tooltip>
	);
});

ActivityBar.displayName = "ActivityBar";

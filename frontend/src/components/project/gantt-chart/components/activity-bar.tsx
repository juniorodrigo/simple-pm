import { memo } from "react";
import { AlertTriangleIcon, ClockIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BaseActivity } from "@/types/activity.type";
import { BarPosition, ExecutionStatus } from "../types";
import { isPast } from "../utils";
import { ActivityTooltipContent, ExecutedBarTooltipContent } from "./tooltip-content";

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

	// Mostrar ícono de retraso en barra planificada si:
	// 1. Ya pasó la fecha de inicio planificada
	// 2. No tiene fecha de inicio de ejecución
	return now > startDate && !activity.executedStartDate;
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

export const ActivityBar = memo(({ activity, barPosition, executedBarPos, executionStatus, stageColor, stageOriginalColor }: ActivityBarProps) => {
	const isShortBar = barPosition.width < 120;
	const showDelayInPlanned = shouldShowDelayIcon(activity);
	const showExecutionDelay = shouldShowExecutionDelayIcon(activity);
	const showLateCompletion = isLateCompletion(activity);

	return (
		<div
			className="relative flex flex-col justify-center gap-1"
			style={{
				left: `${barPosition.left}px`,
				width: `${barPosition.width}px`,
				height: "auto",
			}}
		>
			{/* Barra planificada (azul) */}
			<Tooltip>
				<TooltipTrigger asChild>
					<div
						className={`
							rounded-md shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group relative
							${isPast(new Date(activity.endDate)) ? "border-2 border-dashed border-muted" : "border-2 border-transparent"}
							bg-blue-500 hover:bg-blue-600
						`}
						style={{
							height: "32px",
						}}
					>
						{!isShortBar && (
							<div className="h-full px-2 py-1 text-white flex items-center justify-between">
								<div className="font-medium truncate text-xs flex-1">{activity.title}</div>
							</div>
						)}

						{/* Íconos en la esquina superior derecha */}
						<div className="absolute top-1 right-1 flex items-center space-x-1">
							{/* Ícono de retraso si estamos en rango pero no hay ejecución */}
							{showDelayInPlanned && (
								<div className="bg-red-500 rounded-full p-0.5">
									<ClockIcon className="h-3 w-3 text-white" />
								</div>
							)}
						</div>
					</div>
				</TooltipTrigger>
				<TooltipContent className="tooltip-high-z">
					<ActivityTooltipContent activity={activity} executionStatus={executionStatus} />
				</TooltipContent>
			</Tooltip>

			{/* Barra ejecutada (siempre verde, con indicadores) */}
			{executedBarPos && (
				<Tooltip>
					<TooltipTrigger asChild>
						<div
							className="relative rounded-md overflow-hidden cursor-pointer transition-shadow flex items-center"
							style={{
								width: `${(executedBarPos.width / barPosition.width) * 100}%`,
								backgroundColor: "rgba(34, 197, 94, 0.8)", // Siempre verde
								height: "32px",
								marginLeft: `${((executedBarPos.left - barPosition.left) / barPosition.width) * 100}%`,
							}}
						>
							{/* Íconos en la esquina superior derecha */}
							<div className="absolute top-1 right-1 flex items-center space-x-1">
								{/* Ícono de retraso en ejecución (no ha cerrado a tiempo) */}
								{showExecutionDelay && (
									<div className="bg-red-500 rounded-full p-0.5">
										<ClockIcon className="h-3 w-3 text-white" />
									</div>
								)}

								{/* Ícono de terminación tardía */}
								{showLateCompletion && (
									<div className="bg-amber-500 rounded-full p-0.5">
										<AlertTriangleIcon className="h-3 w-3 text-white" />
									</div>
								)}

								{/* Ícono de alerta general si hay retraso (mantener lógica existente para casos no cubiertos) */}
								{/* {executionStatus?.late && !showLateCompletion && !showExecutionDelay && (
									<div className="bg-amber-500 rounded-full p-0.5">
										<AlertTriangleIcon className="h-3 w-3 text-white" />
									</div>
								)} */}
							</div>
						</div>
					</TooltipTrigger>
					<TooltipContent className="tooltip-high-z">
						<ExecutedBarTooltipContent activity={activity} executionStatus={executionStatus} />
					</TooltipContent>
				</Tooltip>
			)}
		</div>
	);
});

ActivityBar.displayName = "ActivityBar";

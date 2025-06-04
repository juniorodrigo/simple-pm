import { memo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BaseActivity } from "@/types/activity.type";
import { ExecutionStatus } from "../types";

type ActivityTooltipContentProps = {
	activity: BaseActivity;
	executionStatus: ExecutionStatus | null;
};

const hasLateStart = (activity: BaseActivity): boolean => {
	const now = new Date();
	const startDate = new Date(activity.startDate);
	// Retraso de inicio: ya pasó la fecha de inicio planificada y no tiene fecha de inicio real
	return now > startDate && !activity.executedStartDate;
};

const hasLateCompletion = (activity: BaseActivity): boolean => {
	if (!activity.executedStartDate) return false; // No ha iniciado

	const now = new Date();
	const endDate = new Date(activity.endDate);

	if (!activity.executedEndDate) {
		// Está en progreso pero ya pasó la fecha de fin planificada
		return now > endDate;
	}

	// Ya terminó, verificar si se terminó tarde
	const actualEndDate = new Date(activity.executedEndDate);
	return actualEndDate > endDate;
};

const getLateStartDays = (activity: BaseActivity): number => {
	const now = new Date();
	const startDate = new Date(activity.startDate);
	const diffTime = now.getTime() - startDate.getTime();
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getLateCompletionDays = (activity: BaseActivity): number => {
	const endDate = new Date(activity.endDate);

	if (!activity.executedEndDate) {
		// Está en progreso, calcular días de retraso desde la fecha planificada
		const now = new Date();
		const diffTime = now.getTime() - endDate.getTime();
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	}

	// Ya terminó, calcular días de retraso
	const actualEndDate = new Date(activity.executedEndDate);
	const diffTime = actualEndDate.getTime() - endDate.getTime();
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const ActivityTooltipContent = memo(({ activity, executionStatus }: ActivityTooltipContentProps) => {
	const lateStart = hasLateStart(activity);
	const lateCompletion = hasLateCompletion(activity);
	const lateStartDays = lateStart ? getLateStartDays(activity) : 0;
	const lateCompletionDays = lateCompletion ? getLateCompletionDays(activity) : 0;

	return (
		<div className="text-sm">
			<p className="font-medium">{activity.title}</p>
			<p className="text-xs mt-1">Asignado a: {activity.assignedToUser.name}</p>
			<div className="border-t border-border mt-2 pt-1">
				<p className="text-xs font-medium">Fechas planificadas:</p>
				<p className="text-xs">
					{format(new Date(activity.startDate), "dd MMM yyyy", { locale: es })} - {format(new Date(activity.endDate), "dd MMM yyyy", { locale: es })}
				</p>

				{activity.executedStartDate && (
					<>
						<p className="text-xs font-medium mt-1">Fechas reales:</p>
						<p className="text-xs">
							{format(new Date(activity.executedStartDate), "dd MMM yyyy", { locale: es })}
							{activity.executedEndDate && ` - ${format(new Date(activity.executedEndDate), "dd MMM yyyy", { locale: es })}`}
						</p>
						{lateCompletion && (
							<p className="text-xs mt-1 text-red-600">{activity.executedEndDate ? `Terminó con retraso: ${lateCompletionDays} días` : `Retraso en finalización: ${lateCompletionDays} días`}</p>
						)}
						{!lateCompletion && activity.executedEndDate && <p className="text-xs mt-1 text-green-600">Completada a tiempo</p>}
					</>
				)}

				{/* Mostrar retraso de inicio si no ha iniciado pero ya debería haber iniciado */}
				{lateStart && <p className="text-xs mt-1 text-red-600">{`Retraso en inicio: ${lateStartDays} días`}</p>}
			</div>
		</div>
	);
});

ActivityTooltipContent.displayName = "ActivityTooltipContent";

type ExecutedBarTooltipContentProps = {
	activity: BaseActivity;
	executionStatus: ExecutionStatus | null;
};

export const ExecutedBarTooltipContent = memo(({ activity, executionStatus }: ExecutedBarTooltipContentProps) => {
	const lateCompletion = hasLateCompletion(activity);
	const lateCompletionDays = lateCompletion ? getLateCompletionDays(activity) : 0;

	return (
		<div className="text-sm">
			<p className="font-medium">Fechas reales de ejecución</p>
			<p className="text-xs mt-1">Inicio: {format(new Date(activity.executedStartDate!), "dd MMM yyyy", { locale: es })}</p>
			{activity.executedEndDate && <p className="text-xs">Fin: {format(new Date(activity.executedEndDate), "dd MMM yyyy", { locale: es })}</p>}
			<p className={`text-xs mt-1 ${lateCompletion ? "text-red-600" : "text-green-600"} font-medium`}>
				{lateCompletion && lateCompletionDays > 0
					? activity.executedEndDate
						? `Terminó con retraso: ${lateCompletionDays} días`
						: `Retraso en finalización: ${lateCompletionDays} días`
					: "Completada a tiempo"}
			</p>
		</div>
	);
});

ExecutedBarTooltipContent.displayName = "ExecutedBarTooltipContent";

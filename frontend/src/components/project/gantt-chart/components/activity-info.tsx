import { memo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ClockIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BaseActivity } from "@/types/activity.type";
import { BaseStage } from "@/types/stage.type";
import { ExecutionStatus } from "../types";
import { getInitials } from "../utils";

type ActivityInfoProps = {
	activity: BaseActivity;
	executionStatus: ExecutionStatus | null;
	stages: BaseStage[];
	compactMode?: boolean;
};

export const ActivityInfo = memo(({ activity, executionStatus, stages, compactMode = false }: ActivityInfoProps) => {
	if (compactMode) {
		return (
			<div className="w-64 min-w-64 px-3 py-2 border-r bg-background shadow-sm flex items-center">
				<div className="font-medium text-sm truncate">{activity.title}</div>
			</div>
		);
	}

	return (
		<div className="w-64 min-w-64 p-3 border-r bg-background shadow-sm">
			<div className="font-medium">{activity.title}</div>
			<div className="flex items-center space-x-2 mt-2">
				<div className="text-xs mt-2 flex items-center gap-1">
					<ClockIcon className="h-3 w-3" />
					<div className="text-muted-foreground">
						Plan: {format(new Date(activity.startDate), "dd MMM", { locale: es })} - {format(new Date(activity.endDate), "dd MMM", { locale: es })}
					</div>
				</div>
				<div className="flex-grow"></div>
				<Avatar className="h-6 w-6">
					<AvatarImage src="/placeholder-user.jpg" alt={activity.assignedToUser.name} />
					<AvatarFallback className="text-sm">{getInitials(activity.assignedToUser.name + " " + activity.assignedToUser.lastname)} </AvatarFallback>
				</Avatar>
			</div>

			<div className="text-xs flex items-center gap-1 mt-1">
				<ClockIcon className="h-3 w-3" />
				{(activity.executedStartDate && (
					<span className={executionStatus?.late ? "text-amber-600" : "text-green-600"}>
						Real: {format(new Date(activity.executedStartDate), "dd MMM", { locale: es })}
						{(activity.executedEndDate && ` - ${format(new Date(activity.executedEndDate), "dd MMM", { locale: es })}`) || " - hoy"}
					</span>
				)) || <span className="text-muted-foreground">No se ha ejecutado</span>}
			</div>
		</div>
	);
});

ActivityInfo.displayName = "ActivityInfo";

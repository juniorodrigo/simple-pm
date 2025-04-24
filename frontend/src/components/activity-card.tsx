import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarClock, Trash2 } from "lucide-react";
import { BaseActivity } from "@/app/types/activity.type";
import { BaseStage } from "@/app/types/stage.type";
import { getTagColorClass, getStageColorValue, getPriorityColor } from "@/lib/colors";

// Utilidad para obtener iniciales (fuera del componente para evitar recreación)
export const getInitials = (name: string): string =>
	name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase();

// Componentes memoizados
export const PriorityBadge = memo(({ priority, className }: { priority: string; className: string }) => (
	<Badge variant="outline" className={className}>
		{priority}
	</Badge>
));
PriorityBadge.displayName = "PriorityBadge";

export const UserAvatar = memo(({ name, initials }: { name: string; initials: string }) => (
	<Avatar className="h-6 w-6">
		<AvatarImage src="/placeholder-user.jpg" alt={name} />
		<AvatarFallback>{initials}</AvatarFallback>
	</Avatar>
));
UserAvatar.displayName = "UserAvatar";

// Componente de contenido de tarjeta memoizado
export const ActivityCardContent = memo(({ activity, stages, onDelete }: { activity: BaseActivity; stages: BaseStage[]; onDelete?: (id: string) => void }) => {
	const priorityClass = getPriorityColor(activity.priority);
	const userInitials = getInitials(activity.assignedToUser.name + " " + activity.assignedToUser.lastname);
	const dueDate = new Date(activity.endDate).toLocaleDateString();

	// Encontrar el stage al que pertenece esta actividad
	const activityStage = stages.find((s) => s.id === activity.stageId);

	return (
		<div className="space-y-1.5 h-full pl-2 relative">
			<div className="absolute top-0 right-0 flex gap-1.5 items-center">
				<PriorityBadge priority={activity.priority} className={`text-xs px-1.5 py-0 font-medium shadow-sm border bg-white ${priorityClass}`} />

				{onDelete && (
					<button
						onClick={(e) => {
							e.stopPropagation();
							onDelete(activity.id);
						}}
						className="text-gray-400 hover:text-red-500 p-0.5 rounded transition-colors"
					>
						<Trash2 className="h-3.5 w-3.5" />
					</button>
				)}
			</div>

			<div className="font-medium pt-6">{activity.title}</div>
			<p className="text-xs text-muted-foreground line-clamp-2">{activity.description}</p>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-1.5">
					{activityStage && (
						<Badge variant="outline" className={`text-[10px] px-1.5 py-0 border border-dashed bg-transparent hover:bg-transparent ${getTagColorClass(activityStage.color.toLowerCase())}`}>
							{activityStage.name}
						</Badge>
					)}
				</div>
				<UserAvatar name={activity.assignedToUser.name + " " + activity.assignedToUser.lastname} initials={userInitials} />
			</div>
			<div className="flex items-center text-xs text-muted-foreground">
				<CalendarClock className="mr-1 h-3 w-3" />
				<span>{dueDate}</span>
			</div>
		</div>
	);
});
ActivityCardContent.displayName = "ActivityCardContent";

// Componente de tarjeta de actividad optimizado
export const ActivityCard = memo(
	({ activity, stages, onDelete, onClick }: { activity: BaseActivity; stages: BaseStage[]; onDelete?: (id: string) => void; onClick?: (activity: BaseActivity) => void }) => {
		const activityStage = stages.find((s) => s.id === activity.stageId);
		const borderColor = activityStage ? getStageColorValue(activityStage.color) : undefined;

		const handleClick = (e: React.MouseEvent) => {
			if (onClick) {
				e.stopPropagation();
				onClick(activity);
			}
		};

		return (
			<Card className="mb-1.5 cursor-grab overflow-hidden shadow-sm" style={{ borderLeft: borderColor ? `4px solid ${borderColor}` : undefined }} onClick={handleClick}>
				<CardContent className="p-2.5">
					<ActivityCardContent activity={activity} stages={stages} onDelete={onDelete} />
				</CardContent>
			</Card>
		);
	}
);
ActivityCard.displayName = "ActivityCard";

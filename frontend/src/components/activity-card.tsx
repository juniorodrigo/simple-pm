import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarClock, Trash2 } from "lucide-react";
import { BaseActivity } from "@/app/types/activity.type";
import { BaseStage } from "@/app/types/stage.type";
import { getStageColorValue, getPriorityColor } from "@/lib/colors";
import { useAuth } from "@/contexts/auth-context";
import { ActivityPriorityLabels } from "@/app/types/enums";

// Utilidades
const getInitials = (name: string): string =>
	name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase();

// Componentes de UI básicos
export const PriorityBadge = memo(({ priority, className }: { priority: string; className: string }) => (
	<Badge variant="outline" className={`text-xs px-2 py-0.5 font-medium shadow-sm border rounded-full ${className}`}>
		{ActivityPriorityLabels[priority as keyof typeof ActivityPriorityLabels]}
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

// Componente de contenido de tarjeta
export const ActivityCardContent = memo(({ activity, stages, onDelete }: { activity: BaseActivity; stages: BaseStage[]; onDelete?: (id: string) => void }) => {
	const { user } = useAuth();
	const isViewer = user?.role === "viewer";
	const priorityClass = getPriorityColor(activity.priority);
	const userInitials = getInitials(`${activity.assignedToUser.name} ${activity.assignedToUser.lastname}`);
	const dueDate = new Date(activity.endDate).toLocaleDateString();

	return (
		<div className="space-y-1.5 h-full pl-2 relative">
			{/* Header con prioridad y acciones */}
			<div className="flex justify-between items-center absolute top-0 w-full right-0">
				<div className="flex items-center gap-1.5" />
				<div className="flex gap-1.5 items-center">
					<PriorityBadge priority={activity.priority} className={priorityClass} />
					{onDelete && !isViewer && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								onDelete(activity.id);
							}}
							className="text-gray-400 hover:text-red-500 p-0.5 rounded transition-colors"
							aria-label="Eliminar actividad"
						>
							<Trash2 className="h-3.5 w-3.5" />
						</button>
					)}
				</div>
			</div>

			{/* Contenido principal */}
			<div className="font-medium pt-6">{activity.title}</div>
			<p className="text-xs text-muted-foreground line-clamp-2">{activity.description}</p>

			{/* Footer con usuario y fecha */}
			<div className="flex items-center justify-between">
				<UserAvatar name={`${activity.assignedToUser.name} ${activity.assignedToUser.lastname}`} initials={userInitials} />
				<div className="flex items-center text-xs text-muted-foreground">
					<CalendarClock className="mr-1 h-3 w-3" />
					<span>Vence: {dueDate}</span>
				</div>
			</div>
		</div>
	);
});
ActivityCardContent.displayName = "ActivityCardContent";

// Componente principal de tarjeta
export const ActivityCard = memo(
	({ activity, stages, onDelete, onClick }: { activity: BaseActivity; stages: BaseStage[]; onDelete?: (id: string) => void; onClick?: (activity: BaseActivity) => void }) => {
		const activityStage = stages.find((s) => s.id === activity.stageId);
		const borderColor = activityStage ? getStageColorValue(activityStage.color) : undefined;
		// Obtener el usuario para saber si es viewer
		const { user } = useAuth();
		const isViewer = user?.role === "viewer";

		const handleClick = (e: React.MouseEvent) => {
			if (onClick) {
				e.stopPropagation();
				onClick(activity);
			}
		};

		return (
			<Card
				className="mb-2 cursor-pointer overflow-hidden shadow-md hover:shadow-lg transition-shadow rounded-xl"
				style={{ borderLeft: borderColor ? `6px solid ${borderColor}` : undefined }}
				onClick={handleClick}
			>
				<CardContent className="p-4">
					{/* Header */}
					<div className="flex justify-between items-center mb-2">
						<PriorityBadge priority={activity.priority} className="!text-sm !px-3 !py-1" />
						{onDelete && !isViewer && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									onDelete(activity.id);
								}}
								className="text-zinc-400 hover:text-red-500 p-1 rounded transition-colors"
								aria-label="Eliminar actividad"
							>
								<Trash2 className="h-4 w-4" />
							</button>
						)}
					</div>
					{/* Título y descripción */}
					<div className="mb-3">
						<div className="font-bold text-base text-white mb-1">{activity.title}</div>
						<p className="text-xs text-zinc-400 line-clamp-2">{activity.description}</p>
					</div>
					{/* Footer */}
					<div className="flex items-center justify-between pt-2 border-t border-zinc-800">
						<UserAvatar name={`${activity.assignedToUser.name} ${activity.assignedToUser.lastname}`} initials={getInitials(`${activity.assignedToUser.name} ${activity.assignedToUser.lastname}`)} />
						<div className="flex items-center text-xs text-zinc-400">
							<CalendarClock className="mr-1 h-3 w-3" />
							<span>Vence: {new Date(activity.endDate).toLocaleDateString()}</span>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}
);
ActivityCard.displayName = "ActivityCard";

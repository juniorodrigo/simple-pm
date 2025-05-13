import { memo } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Trash2, CheckSquare } from "lucide-react";
import { BaseProject } from "@/app/types/project.type";
import { ProjectStatus, ProjectStatusLabels } from "@/app/types/enums";
import { getStageColorValue } from "@/lib/colors";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";

interface ProjectCardProps {
	project: BaseProject;
	onDelete?: () => void;
	onClick?: () => void;
	isDragging?: boolean;
}

const ProjectCard = memo(({ project, onDelete, onClick, isDragging }: ProjectCardProps) => {
	const { user } = useAuth();
	const isViewer = user?.role === "viewer";
	const formattedStartDate = new Date(project.startDate).toLocaleDateString();
	const formattedEndDate = new Date(project.endDate).toLocaleDateString();

	// Determinar el color de la categoría usando la función del sistema de colores
	const categoryColor = getStageColorValue(project.categoryColor || "gray");

	// Asegurar que progressPercentage sea un número válido
	const progress = typeof project.progressPercentage === "number" ? Math.round(project.progressPercentage) : 0;

	// Obtener iniciales del manager
	const getInitials = (name: string) => {
		return (
			name
				?.split(" ")
				.map((part) => part[0])
				.join("")
				.toUpperCase()
				.substring(0, 2) || "NA"
		);
	};

	// Determinar color de la barra de progreso basado en el porcentaje (versiones más tenues)
	const getProgressColor = () => {
		if (progress > 66) return "bg-green-500/40";
		if (progress > 33) return "bg-yellow-500/40";
		return "bg-primary/40";
	};

	const managerName = project.manager?.name + " " + project.manager?.lastname || "Sin asignar";
	const managerInitials = getInitials(managerName);

	// Obtener el recuento de actividades (si existe)
	const activitiesCount = project.activitiesCount || 0;

	return (
		<Card
			className={`mb-4 hover:shadow-md transition-shadow overflow-hidden px-4 py-2 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
			onClick={onClick}
			style={{ borderLeft: `4px solid ${categoryColor}` }}
		>
			<CardHeader className="p-3 pb-0 flex flex-row justify-between items-start">
				<div>
					<div className="flex items-center gap-2">
						<div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColor }} />
						<span className="text-xs text-muted-foreground">{project.categoryName || "Sin categoría"}</span>
					</div>
					<h3 className="font-medium text-base mt-1">{project.name}</h3>
				</div>
				{onDelete && !isViewer && (
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={(e) => {
							e.stopPropagation();
							onDelete();
						}}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				)}
			</CardHeader>

			<CardContent className="p-3">
				{project.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{project.description}</p>}

				<div className="mt-2 mb-2">
					<div className="flex justify-between items-center mb-1 text-xs">
						<span className="text-muted-foreground">Progreso:</span>
						<div
							className={`px-1.5 py-0.5 rounded-full text-xs font-medium`} //  ${progress >= 75 ? "bg-green-100 text-green-800" : progress >= 25 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}
						>
							{progress}%
						</div>
					</div>
					<div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
						<div className={`h-full rounded-full transition-all duration-500 ease-in-out ${getProgressColor()}`} style={{ width: `${progress}%` }} />
					</div>
				</div>

				<div className="flex justify-between items-center text-xs text-muted-foreground">
					<div className="flex items-center">
						<CalendarIcon className="h-3 w-3 mr-1" />
						<span>
							{formattedStartDate} - {formattedEndDate}
						</span>
					</div>
					<div className="flex items-center gap-1">
						<CheckSquare className="h-3 w-3" />
						<span>{activitiesCount} actividades</span>
					</div>
				</div>
			</CardContent>

			<CardFooter className="p-3 pt-0 flex justify-end">
				<div className="flex items-center gap-1.5">
					<Avatar className="h-5 w-5">
						<AvatarFallback className="text-[10px] bg-muted">{managerInitials}</AvatarFallback>
					</Avatar>
					<span className="text-xs">{managerName}</span>
				</div>
			</CardFooter>
		</Card>
	);
});

ProjectCard.displayName = "ProjectCard";

export default ProjectCard;

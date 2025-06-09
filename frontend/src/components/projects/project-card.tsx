import { memo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Trash2, CheckSquare, ChevronDown, ChevronUp, Clock, Target, Check, Archive } from "lucide-react";
import { Project } from "@/types/new/project.type";
import { getStageColorValue } from "@/lib/colors";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ProjectsService } from "@/services/project.service";
import { useToast } from "@/hooks/use-toast";

interface ProjectCardProps {
	project: Project;
	onDelete?: () => void;
	onClick?: () => void;
	isDragging?: boolean;
	onProjectUpdate?: (updatedProject: Project) => void;
}

const ProjectCard = memo(({ project, onDelete, onClick, isDragging, onProjectUpdate }: ProjectCardProps) => {
	const { user } = useAuth();
	const { toast } = useToast();
	const isViewer = user?.role === "viewer";
	const [isExpanded, setIsExpanded] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);

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

	// Determinar color de la barra de progreso basado en el porcentaje
	const getProgressColor = () => {
		if (progress > 75) return "bg-green-500";
		if (progress > 50) return "bg-blue-500";
		if (progress > 25) return "bg-yellow-500";
		return "bg-red-500";
	};

	const managerName = project.manager?.name + " " + project.manager?.lastname || "Sin asignar";
	const managerInitials = getInitials(managerName);

	// Obtener el recuento de actividades (si existe)
	const activitiesCount = project.activitiesCount || 0;

	// Calcular días restantes
	const today = new Date();
	const endDate = new Date(project.endDate);
	const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

	const handleCardClick = (e: React.MouseEvent) => {
		// Si se hizo clic en el botón de expandir, no ejecutar onClick principal
		if ((e.target as HTMLElement).closest(".expand-toggle")) {
			return;
		}
		// Si se hizo clic en algún botón de acción (AlertDialog triggers), no ejecutar onClick principal
		if ((e.target as HTMLElement).closest(".action-button")) {
			return;
		}
		if (onClick) {
			onClick();
		}
	};

	const handleToggleExpand = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsExpanded(!isExpanded);
	};

	const handleCompleteProject = async () => {
		if (isUpdating) return;

		setIsUpdating(true);
		try {
			const updateData = { id: project.id, status: "completed" };
			const result = await ProjectsService.updateProject(project.id.toString(), updateData);

			if (result.success) {
				toast({
					description: "Proyecto completado exitosamente",
				});

				// Actualizar el proyecto localmente
				const updatedProject = { ...project, status: "completed" };
				if (onProjectUpdate) {
					onProjectUpdate(updatedProject);
				}
			} else {
				throw new Error(result.message || "Error al completar el proyecto");
			}
		} catch (error) {
			toast({
				variant: "destructive",
				description: error instanceof Error ? error.message : "Error al completar el proyecto",
			});
		} finally {
			setIsUpdating(false);
		}
	};

	const handleArchiveProject = async () => {
		if (isUpdating) return;

		setIsUpdating(true);
		try {
			const updateData = { id: project.id, archived: true };
			const result = await ProjectsService.updateProject(project.id.toString(), updateData);

			if (result.success) {
				toast({
					description: "Proyecto archivado exitosamente",
				});

				// Actualizar el proyecto localmente
				const updatedProject = { ...project, archived: true };
				if (onProjectUpdate) {
					onProjectUpdate(updatedProject);
				}
			} else {
				throw new Error(result.message || "Error al archivar el proyecto");
			}
		} catch (error) {
			toast({
				variant: "destructive",
				description: error instanceof Error ? error.message : "Error al archivar el proyecto",
			});
		} finally {
			setIsUpdating(false);
		}
	};

	const shouldShowCompleteButton = project.status === "review" && !isViewer;
	const shouldShowArchiveButton = project.status === "completed" && !project.archived && !isViewer;

	return (
		<Card
			className={`group hover:shadow-lg transition-all duration-200 overflow-hidden ${isDragging ? "cursor-grabbing shadow-xl" : "cursor-pointer"}`}
			onClick={handleCardClick}
			style={!isExpanded ? { borderLeft: `4px solid ${categoryColor}` } : {}}
		>
			{/* Línea de categoría - arriba cuando está expandido, izquierda cuando está contraído */}
			{isExpanded && <div className="h-1 w-full" style={{ backgroundColor: categoryColor }} />}

			<CardHeader className="pb-3">
				{/* Fila superior: Categoría y acciones */}
				<div className="flex items-center justify-between mb-2">
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColor }} />
						<span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{project.categoryName || "Sin categoría"}</span>
					</div>
					<div className="flex items-center gap-1">
						<Button variant="ghost" size="sm" className="expand-toggle h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleToggleExpand}>
							{isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
						</Button>

						{/* Botón Completar para proyectos en review */}
						{shouldShowCompleteButton && (
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="action-button h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-green-600 hover:text-green-800"
										disabled={isUpdating}
										onClick={(e) => e.stopPropagation()}
									>
										<Check className="h-3 w-3" />
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>¿Completar proyecto?</AlertDialogTitle>
										<AlertDialogDescription>¿Estás seguro de que deseas marcar el proyecto &quot;{project.name}&quot; como completado? Esta acción cambiará el estado del proyecto.</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancelar</AlertDialogCancel>
										<AlertDialogAction
											onClick={(e) => {
												e.stopPropagation();
												handleCompleteProject();
											}}
											disabled={isUpdating}
										>
											{isUpdating ? "Completando..." : "Completar"}
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						)}

						{/* Botón Archivar para proyectos completados */}
						{shouldShowArchiveButton && (
							<AlertDialog>
								<AlertDialogTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="action-button h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-800"
										disabled={isUpdating}
										onClick={(e) => e.stopPropagation()}
									>
										<Archive className="h-3 w-3" />
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>¿Archivar proyecto?</AlertDialogTitle>
										<AlertDialogDescription>
											¿Estás seguro de que deseas archivar el proyecto &quot;{project.name}&quot;? Los proyectos archivados pueden seguir siendo consultados pero no aparecerán en las listas principales.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancelar</AlertDialogCancel>
										<AlertDialogAction
											onClick={(e) => {
												e.stopPropagation();
												handleArchiveProject();
											}}
											disabled={isUpdating}
										>
											{isUpdating ? "Archivando..." : "Archivar"}
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						)}

						{onDelete && !isViewer && (
							<Button
								variant="ghost"
								size="sm"
								className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
								onClick={(e) => {
									e.stopPropagation();
									onDelete();
								}}
							>
								<Trash2 className="h-3 w-3" />
							</Button>
						)}
					</div>
				</div>

				{/* Título del proyecto */}
				<CardTitle className="text-lg font-semibold leading-tight line-clamp-2">{project.name}</CardTitle>

				{/* Información básica siempre visible */}
				<div className="flex items-center justify-between mt-3">
					<div className="flex items-center gap-3">
						<div className="text-sm">
							<span className="text-2xl font-bold">{progress}</span>
							<span className="text-muted-foreground text-xs ml-1">%</span>
						</div>
						<div className="flex-1 max-w-[80px]">
							<div className="w-full bg-secondary h-1.5 rounded-full">
								<div className={`h-full rounded-full transition-all duration-300 ${getProgressColor()}`} style={{ width: `${progress}%` }} />
							</div>
						</div>
					</div>
					<div className="flex items-center gap-1.5">
						<Avatar className="h-6 w-6">
							<AvatarFallback className="text-[10px] bg-muted">{managerInitials}</AvatarFallback>
						</Avatar>
						<span className="text-xs text-muted-foreground">{managerName.split(" ")[0]}</span>
					</div>
				</div>
			</CardHeader>

			{/* Contenido expandible */}
			{isExpanded && (
				<CardContent className="pt-0 animate-in slide-in-from-top-2 duration-200">
					{/* Descripción */}
					{project.description && (
						<div className="mb-4">
							<p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
						</div>
					)}

					{/* Métricas detalladas */}
					<div className="grid grid-cols-2 gap-4 mb-4">
						<div className="flex items-center gap-2">
							<div className="p-1.5 rounded-full bg-blue-100">
								<CheckSquare className="h-3 w-3 text-blue-600" />
							</div>
							<div>
								<div className="text-sm font-medium">{activitiesCount}</div>
								<div className="text-xs text-muted-foreground">Actividades</div>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<div className="p-1.5 rounded-full bg-green-100">
								<Clock className="h-3 w-3 text-green-600" />
							</div>
							<div>
								<div className={`text-sm font-medium ${daysRemaining < 0 ? "text-red-600" : daysRemaining < 7 ? "text-yellow-600" : "text-green-600"}`}>
									{daysRemaining < 0 ? "Vencido" : `${daysRemaining}d`}
								</div>
								<div className="text-xs text-muted-foreground">Restantes</div>
							</div>
						</div>
					</div>

					{/* Fechas */}
					<div className="border-t pt-3">
						<div className="flex items-center justify-between text-xs">
							<div className="flex items-center gap-1 text-muted-foreground">
								<CalendarIcon className="h-3 w-3" />
								<span>Inicio:</span>
							</div>
							<span className="font-medium">{formattedStartDate}</span>
						</div>
						<div className="flex items-center justify-between text-xs mt-1">
							<div className="flex items-center gap-1 text-muted-foreground">
								<Target className="h-3 w-3" />
								<span>Entrega:</span>
							</div>
							<span className="font-medium">{formattedEndDate}</span>
						</div>
					</div>
				</CardContent>
			)}
		</Card>
	);
});

ProjectCard.displayName = "ProjectCard";

export default ProjectCard;

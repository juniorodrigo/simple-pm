import { ExtendedProject } from "@/app/types/project.type";
import { BaseActivity } from "@/app/types/activity.type";
import { ActivityStatus } from "@/app/types/enums";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarRange, Clock, Users, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProjectStatsCardsProps {
	project: ExtendedProject;
	activities: BaseActivity[];
}

export default function ProjectStatsCards({ project, activities }: ProjectStatsCardsProps) {
	// Calcular la duración del proyecto en días
	const projectDuration = Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24));

	// Calcular días transcurridos
	const daysElapsed = Math.ceil((Date.now() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24));

	// Calcular porcentaje de tiempo transcurrido
	const timePercentage = Math.min(100, Math.max(0, (daysElapsed / projectDuration) * 100));

	// Obtener iniciales del manager
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((part) => part[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

	const managerInitials = getInitials(project.managerUserName || "");

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{/* Tarjeta de Progreso */}
			<Card className="overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow transition-shadow">
				<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-muted/30">
					<CardTitle className="text-sm font-medium">Progreso</CardTitle>
					<div className="rounded-full bg-primary/20 p-1.5">
						<TrendingUp className="h-4 w-4 text-primary" />
					</div>
				</CardHeader>
				<CardContent className="pt-4">
					<div className="flex justify-between items-center mb-2">
						<div className="text-2xl font-bold">{project.progressPercentage}%</div>
						<div
							className={`px-2 py-1 rounded-full text-xs font-medium ${
								project.progressPercentage >= 75 ? "bg-green-100 text-green-800" : project.progressPercentage >= 25 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
							}`}
						>
							{project.progressPercentage >= 75 ? "Avanzado" : project.progressPercentage >= 25 ? "En progreso" : "Iniciando"}
						</div>
					</div>
					<div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
						<div
							className={`h-full rounded-full transition-all duration-500 ease-in-out ${project.progressPercentage > 66 ? "bg-green-500" : project.progressPercentage > 33 ? "bg-yellow-500" : "bg-primary"}`}
							style={{ width: `${project.progressPercentage}%` }}
						/>
					</div>
					<p className="text-xs text-muted-foreground mt-2">{project.progressPercentage >= 100 ? "¡Proyecto completado!" : `${100 - project.progressPercentage}% pendiente`}</p>
				</CardContent>
			</Card>

			{/* Tarjeta de Rango de Tiempo */}
			<Card className="overflow-hidden border-l-4 border-l-blue-500 shadow-sm hover:shadow transition-shadow">
				<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-muted/30">
					<CardTitle className="text-sm font-medium">Rango de Tiempo</CardTitle>
					<div className="rounded-full bg-blue-100 p-1.5">
						<CalendarRange className="h-4 w-4 text-blue-600" />
					</div>
				</CardHeader>
				<CardContent className="pt-4">
					<div className="flex flex-col space-y-3">
						<div className="grid grid-cols-2 gap-1 text-sm">
							<div className="flex items-center">
								<div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
								<span className="text-muted-foreground">Inicio:</span>
							</div>
							<span className="font-medium">{new Date(project.startDate).toLocaleDateString()}</span>
						</div>
						<div className="grid grid-cols-2 gap-1 text-sm">
							<div className="flex items-center">
								<div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
								<span className="text-muted-foreground">Fin:</span>
							</div>
							<span className="font-medium">{new Date(project.endDate).toLocaleDateString()}</span>
						</div>
						<div>
							<div className="flex justify-between items-center text-xs mb-1">
								<span>{Math.min(daysElapsed, projectDuration)} días</span>
								<span>{projectDuration} días</span>
							</div>
							<div className="h-1.5 w-full bg-gray-200 rounded-full">
								<div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${timePercentage}%` }} />
							</div>
							<p className="text-xs text-muted-foreground mt-1 text-center">{timePercentage >= 100 ? "Plazo completado" : `${Math.round(timePercentage)}% del tiempo transcurrido`}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tarjeta de Actividades */}
			<Card className="overflow-hidden border-l-4 border-l-purple-500 shadow-sm hover:shadow transition-shadow">
				<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-muted/30">
					<CardTitle className="text-sm font-medium">Actividades</CardTitle>
					<div className="rounded-full bg-purple-100 p-1.5">
						<Clock className="h-4 w-4 text-purple-600" />
					</div>
				</CardHeader>
				<CardContent className="pt-4">
					<div className="text-sm mb-3 flex justify-between">
						<span className="text-muted-foreground">Total:</span>
						<span className="font-medium">{activities.length} actividades</span>
					</div>
					<div className="grid grid-cols-3 gap-2 text-xs">
						<div className="flex flex-col items-center justify-center rounded-lg bg-red-50 border border-red-100 p-2">
							<div className="flex items-center justify-center w-7 h-7 rounded-full bg-red-100 mb-1">
								<span className="text-red-700 font-bold">{activities.filter((a) => a.status === ActivityStatus.TODO).length}</span>
							</div>
							<span className="font-medium text-red-700">Por Hacer</span>
						</div>
						<div className="flex flex-col items-center justify-center rounded-lg bg-amber-50 border border-amber-100 p-2">
							<div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 mb-1">
								<span className="text-amber-700 font-bold">{activities.filter((a) => a.status === ActivityStatus.IN_PROGRESS).length}</span>
							</div>
							<span className="font-medium text-amber-700">En Curso</span>
						</div>
						<div className="flex flex-col items-center justify-center rounded-lg bg-green-50 border border-green-100 p-2">
							<div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 mb-1">
								<span className="text-green-700 font-bold">{activities.filter((a) => a.status === ActivityStatus.DONE).length}</span>
							</div>
							<span className="font-medium text-green-700">Completado</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tarjeta de Equipo */}
			<Card className="overflow-hidden border-l-4 border-l-amber-500 shadow-sm hover:shadow transition-shadow">
				<CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 bg-muted/30">
					<CardTitle className="text-sm font-medium">Equipo</CardTitle>
					<div className="rounded-full bg-amber-100 p-1.5">
						<Users className="h-4 w-4 text-amber-600" />
					</div>
				</CardHeader>
				<CardContent className="pt-4">
					<div className="flex items-center mb-3 justify-between">
						<div className="bg-amber-50 text-amber-700 font-medium rounded-full px-2.5 py-1 text-xs border border-amber-200">{project.team.length} miembros</div>
						<div className="flex -space-x-2">
							{project.team.slice(0, 3).map((member, i) => (
								<Avatar key={i} className="h-6 w-6 border-2 border-background">
									<AvatarFallback className="bg-amber-100 text-amber-800 text-xs">
										{member.name[0]}
										{member.lastname[0]}
									</AvatarFallback>
								</Avatar>
							))}
							{project.team.length > 3 && (
								<Avatar className="h-6 w-6 border-2 border-background">
									<AvatarFallback className="bg-muted text-muted-foreground text-xs">+{project.team.length - 3}</AvatarFallback>
								</Avatar>
							)}
						</div>
					</div>
					<div className="space-y-2">
						<div className="flex items-center bg-muted/30 p-1.5 rounded-lg">
							<Avatar className="h-8 w-8 mr-2">
								<AvatarFallback className="bg-amber-200 text-amber-800">{managerInitials}</AvatarFallback>
							</Avatar>
							<div className="text-sm">
								<div className="font-medium">{project.managerUserName}</div>
								<div className="text-xs text-muted-foreground">Manager del proyecto</div>
							</div>
						</div>
						<div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-muted">
							{project.team.map((member, i) => (
								<span key={i} className="inline-block bg-muted text-xs rounded-full px-2.5 py-1">
									{member.name} {member.lastname}
								</span>
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

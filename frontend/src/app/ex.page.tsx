"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProjectsService } from "@/services/project.service";
import { getTagColorClass } from "@/lib/colors";
import type { ExtendedProject } from "@/app/types/project.type";
import { Activity, AlertCircle, ArrowRight, CalendarClock, CheckCircle2, Clock, ListChecks, PieChart, Plus, Tag, Timer, Hourglass, Users } from "lucide-react";

// Componente para mostrar datos de ejemplo en gráficos
const SimpleBarChart = ({ data }: { data: { name: string; value: number; color: string }[] }) => {
	const max = Math.max(...data.map((d) => d.value));

	return (
		<div className="w-full space-y-2">
			{data.map((item, index) => (
				<div key={index} className="space-y-1">
					<div className="flex justify-between text-sm">
						<span>{item.name}</span>
						<span className="font-medium">{item.value}</span>
					</div>
					<div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
						<div className={`h-full ${item.color}`} style={{ width: `${(item.value / max) * 100}%` }} />
					</div>
				</div>
			))}
		</div>
	);
};

// Componente para mostrar gráfico de donut
const DonutChart = ({ percentage }: { percentage: number }) => {
	// SVG para un simple gráfico donut
	const radius = 40;
	const circumference = 2 * Math.PI * radius;
	const dashOffset = circumference * (1 - percentage / 100);

	return (
		<div className="relative flex items-center justify-center">
			<svg width="120" height="120" viewBox="0 0 120 120">
				<circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth="12" />
				<circle
					cx="60"
					cy="60"
					r={radius}
					fill="none"
					stroke="hsl(var(--primary))"
					strokeWidth="12"
					strokeDasharray={circumference}
					strokeDashoffset={dashOffset}
					strokeLinecap="round"
					transform="rotate(-90 60 60)"
				/>
			</svg>
			<div className="absolute text-2xl font-bold">{percentage}%</div>
		</div>
	);
};

export default function Dashboard() {
	const [projects, setProjects] = useState<ExtendedProject[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [timeFrame, setTimeFrame] = useState("this-month");

	useEffect(() => {
		const loadDashboardData = async () => {
			setIsLoading(true);
			const response = await ProjectsService.getProjects();
			if (response.success && response.data) {
				setProjects(response.data);
			}
			setIsLoading(false);
		};

		loadDashboardData();
	}, []);

	// Datos calculados para el dashboard
	const totalProjects = projects.length;
	const activeProjects = projects.filter((p) => (p.progressPercentage || 0) < 100).length;
	const completedProjects = projects.filter((p) => p.progressPercentage === 100).length;
	const averageProgress = projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + (p.progressPercentage || 0), 0) / projects.length) : 0;

	// Actividades totales (sumamos las actividades de todos los proyectos)
	const totalActivities = projects.reduce((acc, p) => acc + (p.activitiesCount || 0), 0);

	// Proyectos recientes (últimos 5)
	const recentProjects = [...projects].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).slice(0, 5);

	// Distribución por categoría para gráfico
	const categoriesData = projects.reduce((acc: any, project) => {
		const category = project.categoryName || "Sin categoría";
		if (!acc[category]) {
			acc[category] = {
				name: category,
				value: 0,
				color: getTagColorClass(project.categoryColor || "gray").replace("border-", "bg-"),
			};
		}
		acc[category].value++;
		return acc;
	}, {});

	const categoryData = Object.values(categoriesData);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-96">
				<div className="text-center">
					<div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-4 mx-auto"></div>
					<p className="text-muted-foreground">Cargando datos del dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
				<div className="flex items-center gap-2">
					<Select value={timeFrame} onValueChange={setTimeFrame}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Seleccionar período" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="today">Hoy</SelectItem>
							<SelectItem value="this-week">Esta semana</SelectItem>
							<SelectItem value="this-month">Este mes</SelectItem>
							<SelectItem value="this-year">Este año</SelectItem>
							<SelectItem value="all-time">Todo el tiempo</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Tarjetas de KPIs principales */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Total proyectos</CardTitle>
						<PieChart className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalProjects}</div>
						<p className="text-xs text-muted-foreground mt-1">
							{activeProjects} activos, {completedProjects} completados
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Progreso promedio</CardTitle>
						<Timer className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{averageProgress}%</div>
						<Progress className="mt-2" value={averageProgress} />
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Total actividades</CardTitle>
						<ListChecks className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{totalActivities}</div>
						<p className="text-xs text-muted-foreground mt-1">En {totalProjects} proyectos</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium">Próximos vencimientos</CardTitle>
						<CalendarClock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">3</div>
						<p className="text-xs text-muted-foreground mt-1">En los próximos 7 días</p>
					</CardContent>
				</Card>
			</div>

			{/* Secciones principales del dashboard */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Panel izquierdo - Progreso y estadísticas */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Estado global de proyectos</CardTitle>
							<CardDescription>Progreso general de todos los proyectos</CardDescription>
						</CardHeader>
						<CardContent className="flex justify-center py-4">
							<DonutChart percentage={averageProgress} />
						</CardContent>
						<CardFooter className="flex justify-between">
							<div className="flex items-center">
								<div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
								<span className="text-sm">Completado ({averageProgress}%)</span>
							</div>
							<div className="flex items-center">
								<div className="w-3 h-3 rounded-full bg-secondary mr-2"></div>
								<span className="text-sm">Pendiente ({100 - averageProgress}%)</span>
							</div>
						</CardFooter>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Distribución por categoría</CardTitle>
							<CardDescription>Proyectos agrupados por categoría</CardDescription>
						</CardHeader>
						<CardContent className="pb-4">
							{categoryData.length > 0 ? <SimpleBarChart data={categoryData as any} /> : <p className="text-center text-muted-foreground py-4">No hay datos de categorías disponibles</p>}
						</CardContent>
					</Card>

					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{activeProjects > 0 ? `Tienes ${activeProjects} proyectos activos que requieren atención.` : "No tienes proyectos activos en este momento."}</AlertDescription>
					</Alert>
				</div>

				{/* Panel derecho - Proyectos recientes y actividades */}
				<div className="space-y-6">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>Proyectos recientes</CardTitle>
								<CardDescription>Los últimos proyectos creados o actualizados</CardDescription>
							</div>
							<Link href="/projects">
								<Button variant="ghost" size="sm" className="gap-1">
									Ver todo <ArrowRight className="h-4 w-4" />
								</Button>
							</Link>
						</CardHeader>
						<CardContent className="pb-1">
							<div className="space-y-4">
								{recentProjects.length > 0 ? (
									recentProjects.map((project) => (
										<div key={project.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
											<div className="bg-primary/10 rounded-md p-2">
												<Activity className="h-4 w-4" />
											</div>
											<div className="flex-1 space-y-1">
												<Link href={`/projects/${project.id}`} className="font-medium hover:underline">
													{project.name}
												</Link>
												<div className="flex items-center gap-3 text-sm text-muted-foreground">
													<div className="flex items-center gap-1">
														<Clock className="h-3 w-3" />
														<span>{project.progressPercentage}%</span>
													</div>
													{project.categoryName && (
														<div className="flex items-center gap-1">
															<Tag className="h-3 w-3" />
															<span>{project.categoryName}</span>
														</div>
													)}
												</div>
											</div>
											<Badge variant={project.progressPercentage === 100 ? "default" : "outline"}>{project.progressPercentage === 100 ? "Completado" : "En progreso"}</Badge>
										</div>
									))
								) : (
									<p className="text-center text-muted-foreground py-4">No hay proyectos recientes</p>
								)}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Actividades pendientes</CardTitle>
							<CardDescription>Tareas cercanas al vencimiento</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
									<div className="flex items-center gap-3">
										<div className="bg-yellow-500/20 rounded-md p-2">
											<Hourglass className="h-4 w-4 text-yellow-500" />
										</div>
										<div>
											<p className="font-medium">Revisión de diseño</p>
											<p className="text-sm text-muted-foreground">Proyecto: Rediseño web</p>
										</div>
									</div>
									<Badge variant="outline" className="text-yellow-500 border-yellow-500">
										Vence hoy
									</Badge>
								</div>

								<div className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
									<div className="flex items-center gap-3">
										<div className="bg-red-500/20 rounded-md p-2">
											<AlertCircle className="h-4 w-4 text-red-500" />
										</div>
										<div>
											<p className="font-medium">Pruebas unitarias</p>
											<p className="text-sm text-muted-foreground">Proyecto: API Backend</p>
										</div>
									</div>
									<Badge variant="outline" className="text-red-500 border-red-500">
										Vencido
									</Badge>
								</div>

								<div className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
									<div className="flex items-center gap-3">
										<div className="bg-blue-500/20 rounded-md p-2">
											<Clock className="h-4 w-4 text-blue-500" />
										</div>
										<div>
											<p className="font-medium">Entrega de informe</p>
											<p className="text-sm text-muted-foreground">Proyecto: Análisis de datos</p>
										</div>
									</div>
									<Badge variant="outline" className="text-blue-500 border-blue-500">
										En 3 días
									</Badge>
								</div>
							</div>
						</CardContent>
						<CardFooter>
							<Button className="w-full" variant="outline">
								<Plus className="mr-2 h-4 w-4" /> Crear nueva actividad
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>

			{/* Sección inferior - Información adicional */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle>Equipo</CardTitle>
						<CardDescription>Miembros activos en proyectos</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<div className="bg-primary/10 rounded-full p-2">
									<Users className="h-4 w-4" />
								</div>
								<div>
									<p className="font-medium">8 miembros</p>
									<p className="text-sm text-muted-foreground">Participando en proyectos activos</p>
								</div>
							</div>
							<Separator />
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Asignados a tareas</span>
								<span className="font-medium">87%</span>
							</div>
							<Progress value={87} />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle>Rendimiento</CardTitle>
						<CardDescription>Velocidad de completado de tareas</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="text-center space-y-2">
							<div className="text-2xl font-bold">94%</div>
							<p className="text-sm text-muted-foreground">Tareas completadas a tiempo</p>

							<div className="flex justify-between mt-4">
								<div>
									<div className="text-lg font-medium">32</div>
									<p className="text-xs text-muted-foreground">Completadas</p>
								</div>
								<div>
									<div className="text-lg font-medium">2</div>
									<p className="text-xs text-muted-foreground">Retrasadas</p>
								</div>
								<div>
									<div className="text-lg font-medium">12</div>
									<p className="text-xs text-muted-foreground">Pendientes</p>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle>Estado de etapas</CardTitle>
						<CardDescription>Distribución por etapas de proyecto</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 rounded-full bg-green-500"></div>
									<span>Completadas</span>
								</div>
								<span className="font-medium">8</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 rounded-full bg-yellow-500"></div>
									<span>En progreso</span>
								</div>
								<span className="font-medium">5</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 rounded-full bg-blue-500"></div>
									<span>No iniciadas</span>
								</div>
								<span className="font-medium">12</span>
							</div>

							<Separator className="my-2" />

							<Button variant="outline" className="w-full">
								<CheckCircle2 className="mr-2 h-4 w-4" /> Ver detalles de etapas
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

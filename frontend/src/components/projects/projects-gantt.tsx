"use client";

import { Project } from "@/types/new/project.type";
import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { addDays, differenceInDays, format, startOfDay } from "date-fns";
import { CalendarIcon, Users2Icon, ClockIcon, AlertTriangleIcon } from "lucide-react";
import { es } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getStageColorValue, STATUS_COLORS } from "@/lib/colors";
import { ProjectStatusLabels } from "@/types/enums";
import { useRouter } from "next/navigation";
import { ProjectsLegend, FilterState, FilterGroup } from "./components/projects-legend";
import { ProjectBarTooltip } from "./components/project-bar-tooltip";

interface ProjectsGanttProps {
	projects: Project[];
}

export default function ProjectsGantt({ projects }: ProjectsGanttProps) {
	const router = useRouter();
	const [dateRange, setDateRange] = useState<Date[]>([]);
	const [chartWidth, setChartWidth] = useState(0);
	const [showLegend, setShowLegend] = useState(true);
	const [filters, setFilters] = useState<FilterState>({
		lateStart: false,
		inProgressLate: false,
		completedLate: false,
	});

	const handleFilterChange = (group: FilterGroup, value: boolean) => {
		console.log(`Filtro ${group} ${value ? "activado" : "desactivado"}`);
		setFilters((prev) => ({ ...prev, [group]: value }));
	};

	// Filtrar proyectos basado en los filtros activos
	const filteredProjects = useMemo(() => {
		if (!filters.lateStart && !filters.inProgressLate && !filters.completedLate) {
			return projects;
		}

		const now = new Date();
		now.setHours(0, 0, 0, 0);

		return projects.filter((project) => {
			// Convertir fechas a inicio del día para comparación
			const startDate = new Date(project.startDate);
			startDate.setHours(0, 0, 0, 0);
			const endDate = new Date(project.endDate);
			endDate.setHours(0, 0, 0, 0);
			const realStartDate = project.realStartDate ? new Date(project.realStartDate) : null;
			if (realStartDate) realStartDate.setHours(0, 0, 0, 0);
			const realEndDate = project.realEndDate ? new Date(project.realEndDate) : null;
			if (realEndDate) realEndDate.setHours(0, 0, 0, 0);

			// Determinar el estado más avanzado del proyecto
			let projectStatus: "lateStart" | "inProgressLate" | "completedLate" | null = null;

			// 1. Verificar si está completado con retraso (estado más avanzado)
			if (realEndDate && realEndDate > endDate) {
				projectStatus = "completedLate";
			}
			// 2. Si no está completado con retraso, verificar si está en progreso con retraso
			else if (realStartDate && !realEndDate && now > endDate) {
				projectStatus = "inProgressLate";
			}
			// 3. Si no está en ninguno de los anteriores, verificar si tiene inicio tardío
			else if ((!realStartDate && now > startDate) || (realStartDate && realStartDate > startDate)) {
				projectStatus = "lateStart";
			}

			// Si el proyecto tiene un estado y el filtro correspondiente está activo, incluirlo
			if (projectStatus && filters[projectStatus]) {
				console.log(`Proyecto "${project.name}" clasificado como ${projectStatus}:`, {
					planificado: {
						inicio: startDate.toLocaleDateString(),
						fin: endDate.toLocaleDateString(),
					},
					real: {
						inicio: realStartDate?.toLocaleDateString() || "No iniciado",
						fin: realEndDate?.toLocaleDateString() || "No finalizado",
					},
					actual: now.toLocaleDateString(),
				});
				return true;
			}

			return false;
		});
	}, [projects, filters]);

	// Log de resumen de filtrado
	useEffect(() => {
		if (filters.lateStart || filters.inProgressLate || filters.completedLate) {
			console.log("Resumen de filtrado:", {
				totalProyectos: projects.length,
				proyectosFiltrados: filteredProjects.length,
				filtrosActivos: Object.entries(filters)
					.filter(([_, value]) => value)
					.map(([key]) => key),
			});
		}
	}, [filters, filteredProjects.length, projects.length]);

	// Find the earliest start date and latest end date
	useEffect(() => {
		if (projects.length === 0) return;

		let earliestDate = new Date(projects[0].startDate);
		let latestDate = new Date(projects[0].endDate);

		projects.forEach((project) => {
			const startDate = new Date(project.startDate);
			const endDate = new Date(project.endDate);

			if (startDate < earliestDate) {
				earliestDate = startDate;
			}

			if (endDate > latestDate) {
				latestDate = endDate;
			}

			// También considerar fechas reales si existen
			if (project.realStartDate) {
				const realStartDate = new Date(project.realStartDate);
				if (realStartDate < earliestDate) {
					earliestDate = realStartDate;
				}
			}

			if (project.realEndDate) {
				const realEndDate = new Date(project.realEndDate);
				if (realEndDate > latestDate) {
					latestDate = realEndDate;
				}
			}
		});

		// Add some padding weeks
		earliestDate = addDays(earliestDate, -7);
		latestDate = addDays(latestDate, 7);

		// Generate array of weeks
		const range: Date[] = [];
		let currentDate = startOfDay(earliestDate);

		while (currentDate <= latestDate) {
			range.push(currentDate);
			currentDate = addDays(currentDate, 7);
		}

		setDateRange(range);
	}, [projects]);

	// Update chart width based on window size and date range
	useEffect(() => {
		const updateWidth = () => {
			const width = Math.max(dateRange.length * 100, 800);
			setChartWidth(width);
		};

		updateWidth();
		window.addEventListener("resize", updateWidth);

		return () => {
			window.removeEventListener("resize", updateWidth);
		};
	}, [dateRange]);

	// Función para calcular posición y ancho de las barras de proyecto
	const getBarPosition = (project: Project) => {
		if (dateRange.length === 0) return { left: 0, width: 0 };

		const startDate = new Date(project.startDate);
		const endDate = new Date(project.endDate);
		const firstDate = dateRange[0];

		// Calcular días desde el inicio del rango
		const startDays = differenceInDays(startDate, firstDate);
		const endDays = differenceInDays(endDate, firstDate);

		// Cada día ocupa 100px/7 ≈ 14.29px
		const pixelsPerDay = 100 / 7;

		const left = startDays * pixelsPerDay;
		const width = Math.max((endDays - startDays + 1) * pixelsPerDay, pixelsPerDay); // Mínimo 1 día

		return { left, width };
	};

	// Función para calcular posición y ancho de las barras reales
	const getRealBarPosition = (project: Project) => {
		if (dateRange.length === 0 || !project.realStartDate) return null;

		const realStartDate = new Date(project.realStartDate);
		const realEndDate = project.realEndDate ? new Date(project.realEndDate) : new Date(); // Si no tiene fecha de fin, usar hoy
		const firstDate = dateRange[0];

		// Calcular días desde el inicio del rango
		const startDays = differenceInDays(realStartDate, firstDate);
		const endDays = differenceInDays(realEndDate, firstDate);

		// Cada día ocupa 100px/7 ≈ 14.29px
		const pixelsPerDay = 100 / 7;

		const left = startDays * pixelsPerDay;
		const width = Math.max((endDays - startDays + 1) * pixelsPerDay, pixelsPerDay); // Mínimo 1 día

		return { left, width };
	};

	const isWeekend = (date: Date) => {
		const day = date.getDay();
		return day === 0 || day === 6;
	};

	const isCurrentWeek = (date: Date) => {
		const today = new Date();
		const weekStart = startOfDay(addDays(today, -today.getDay()));
		const weekEnd = addDays(weekStart, 6);
		return date >= weekStart && date <= weekEnd;
	};

	const isPast = (date: Date) => {
		const today = new Date();
		return date < startOfDay(today);
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((part) => part[0])
			.join("")
			.toUpperCase();
	};

	const isShortBar = (project: Project): boolean => {
		// Si la barra es menor a 120px (aproximadamente 3 días), considerarla corta
		const { width } = getBarPosition(project);
		return width < 120;
	};

	// Función para determinar si mostrar alerta de retraso en inicio
	const shouldShowDelayIcon = (project: Project): boolean => {
		const now = new Date();
		const startDate = new Date(project.startDate);

		// Mostrar ícono de retraso en barra planificada si:
		// 1. Ya pasó la fecha de inicio planificada
		// 2. No tiene fecha de inicio real
		return now > startDate && !project.realStartDate;
	};

	// Función para determinar si mostrar alerta de retraso en finalización
	const shouldShowExecutionDelayIcon = (project: Project): boolean => {
		const now = new Date();
		const endDate = new Date(project.endDate);

		// Mostrar ícono de retraso en barra ejecutada si:
		// 1. Ya pasó la fecha de fin planificada
		// 2. Tiene fecha de inicio real (está en progreso)
		// 3. No tiene fecha de fin real
		return now > endDate && !!project.realStartDate && !project.realEndDate;
	};

	// Función para determinar si se terminó tarde
	const isLateCompletion = (project: Project): boolean => {
		// Verificar si se terminó tarde (la fecha de fin real es posterior a la planificada)
		if (!project.realEndDate) return false;

		const plannedEndDate = new Date(project.endDate);
		const actualEndDate = new Date(project.realEndDate);

		return actualEndDate > plannedEndDate;
	};

	if (projects.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center p-12 text-center border rounded-md bg-secondary/20">
				<CalendarIcon className="h-12 w-12 mb-2 text-muted-foreground" />
				<h3 className="text-lg font-medium">No hay proyectos disponibles</h3>
				<p className="text-sm text-muted-foreground mt-1">Añade algunos proyectos para visualizarlos en el diagrama Gantt</p>
			</div>
		);
	}

	return (
		<TooltipProvider>
			<div className="space-y-3">
				{showLegend && (
					<div className="flex-shrink-0">
						<ProjectsLegend showLegend={showLegend} setShowLegend={setShowLegend} filters={filters} onFilterChange={handleFilterChange} />
					</div>
				)}

				{!showLegend && (
					<div className="flex-shrink-0">
						<button onClick={() => setShowLegend(true)} className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md border border-dashed transition-colors">
							Mostrar leyenda
						</button>
					</div>
				)}

				{/* Mostrar contador de proyectos filtrados si hay filtros activos */}
				{(filters.lateStart || filters.inProgressLate || filters.completedLate) && (
					<div className="text-sm text-muted-foreground">
						Mostrando {filteredProjects.length} de {projects.length} proyectos
					</div>
				)}

				<div className="overflow-x-auto border rounded-md shadow">
					<div style={{ minWidth: `${chartWidth}px` }} className="relative">
						{/* Header with dates */}
						<div className="sticky top-0 bg-background z-10 border-b">
							{/* Fila de meses */}
							<div className="flex border-b">
								<div className="w-72 min-w-72 p-2 border-r font-medium sticky left-0 z-15 bg-background shadow-md text-sm">Cronograma</div>
								<div className="flex-1 flex">
									{(() => {
										if (dateRange.length === 0) return null;

										const monthGroups: { month: string; year: number; startIndex: number; count: number }[] = [];
										let currentMonth = format(dateRange[0], "MMM yyyy", { locale: es });
										let currentYear = dateRange[0].getFullYear();
										let startIndex = 0;
										let count = 1;

										for (let i = 1; i < dateRange.length; i++) {
											const monthYear = format(dateRange[i], "MMM yyyy", { locale: es });
											if (monthYear === currentMonth) {
												count++;
											} else {
												monthGroups.push({ month: currentMonth, year: currentYear, startIndex, count });
												currentMonth = monthYear;
												currentYear = dateRange[i].getFullYear();
												startIndex = i;
												count = 1;
											}
										}
										monthGroups.push({ month: currentMonth, year: currentYear, startIndex, count });

										return monthGroups.map((group, index) => (
											<div key={index} className="flex-shrink-0 text-center text-sm py-2 border-r font-medium bg-secondary/20" style={{ width: `${group.count * 100}px` }}>
												{group.month}
											</div>
										));
									})()}
								</div>
							</div>

							{/* Fila de semanas */}
							<div className="flex">
								<div className="w-72 min-w-72 p-3 border-r font-medium sticky left-0 z-15 bg-background">Proyectos</div>
								<div className="flex-1 flex">
									{dateRange.map((date, index) => (
										<div
											key={index}
											className={`w-[100px] flex-shrink-0 text-center text-xs py-2 border-r
		                    ${isWeekend(date) ? "bg-secondary/40" : ""}
		                    ${isPast(date) ? "bg-secondary/10" : ""}
		                    ${isCurrentWeek(date) ? "bg-primary/20 font-bold" : ""}`}
										>
											<div className="font-medium">Sem {format(date, "w")}</div>
											<div>{format(date, "dd", { locale: es })}</div>
											{isCurrentWeek(date) && <div className="h-1 w-full bg-primary mt-1"></div>}
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Project rows */}
						<div>
							{filteredProjects.map((project) => {
								const barPosition = getBarPosition(project);
								const realBarPosition = getRealBarPosition(project);
								const categoryColor = project.categoryColor ? getStageColorValue(project.categoryColor) : "#6366f1";

								// Calcular alertas para este proyecto
								const showDelayInPlanned = shouldShowDelayIcon(project);
								const showExecutionDelay = shouldShowExecutionDelayIcon(project);
								const showLateCompletion = isLateCompletion(project);

								return (
									<div key={project.id} className="flex border-b hover:bg-secondary/20">
										<div className="w-72 min-w-72 p-3 border-r border-l-4 sticky left-0 z-5 bg-background shadow-md" style={{ borderLeftColor: categoryColor }}>
											<div className="font-medium line-clamp-1">{project.name}</div>
											<div className="flex items-center space-x-2 mt-2">
												{project.status && (
													<Badge variant="outline" className={`text-xs px-1.5 py-0 font-medium shadow-sm ${STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]}`}>
														{ProjectStatusLabels[project.status as keyof typeof ProjectStatusLabels] || project.status || ""}
													</Badge>
												)}
												<div className="flex-grow"></div>
												<Avatar className="h-6 w-6">
													<AvatarImage src="/placeholder-user.jpg" alt={project.managerUserName} />
													<AvatarFallback>{getInitials(project.manager?.name + "" + project.manager?.lastname)}</AvatarFallback>
												</Avatar>
											</div>

											{/* Fechas planificadas */}
											<div className="text-xs flex items-center gap-1 mt-2">
												<ClockIcon className="h-3 w-3" />
												<div className="text-muted-foreground">
													Plan: {format(new Date(project.startDate), "dd MMM", { locale: es })} - {format(new Date(project.endDate), "dd MMM", { locale: es })}
												</div>
											</div>

											{/* Fechas reales */}
											<div className="text-xs flex items-center gap-1 mt-1">
												<ClockIcon className="h-3 w-3" />
												{(project.realStartDate && (
													<span className="text-green-600">
														Real: {format(new Date(project.realStartDate), "dd MMM", { locale: es })}
														{(project.realEndDate && ` - ${format(new Date(project.realEndDate), "dd MMM", { locale: es })}`) || " - hoy"}
													</span>
												)) || <span className="text-muted-foreground">No se ha ejecutado</span>}
											</div>
										</div>
										<div className="flex-1 relative" style={{ height: "120px" }}>
											{dateRange.map((date, dateIndex) => (
												<div
													key={dateIndex}
													className={`absolute top-0 bottom-0 w-[100px] border-r
                          ${isWeekend(date) ? "bg-secondary/40" : ""}
                          ${isPast(date) ? "bg-secondary/10" : ""}
                          ${isCurrentWeek(date) ? "bg-primary/20" : ""}`}
													style={{ left: dateIndex * 100 }}
												/>
											))}

											{/* Contenedor de barras centrado verticalmente */}
											<div
												className="absolute flex flex-col justify-center gap-1"
												style={{
													left: `${barPosition.left}px`,
													width: `${barPosition.width}px`,
													height: "120px",
													top: 0,
												}}
											>
												{/* Barra planificada (azul, más delgada) */}
												<Tooltip>
													<TooltipTrigger asChild>
														<div
															className="rounded-md shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group bg-blue-500 hover:bg-blue-600 relative"
															style={{
																width: "100%",
																height: "32px",
															}}
															onClick={() => router.push(`/projects/${project.id}`)}
														>
															{!isShortBar(project) && (
																<div className="h-full px-2 py-1 text-white flex items-center justify-between">
																	<div className="font-medium truncate text-xs flex-1">{project.name}</div>
																	{project.team && project.team.length > 0 && (
																		<div className="ml-1 flex items-center">
																			<Users2Icon className="h-3.5 w-3.5" />
																			<span className="ml-1 text-xs">{project.team.length}</span>
																		</div>
																	)}
																</div>
															)}

															{/* Íconos de alerta en la esquina superior derecha */}
															<div className="absolute top-1 right-1 flex items-center space-x-1">
																{/* Ícono de retraso en inicio si no se ha iniciado a tiempo */}
																{showDelayInPlanned && (
																	<div className="bg-red-500 rounded-full p-0.5">
																		<ClockIcon className="h-3 w-3 text-white" />
																	</div>
																)}
															</div>
														</div>
													</TooltipTrigger>
													<ProjectBarTooltip project={project} type="planned" showDelayInPlanned={showDelayInPlanned} />
												</Tooltip>

												{/* Barra ejecutada (verde) */}
												{realBarPosition && (
													<Tooltip>
														<TooltipTrigger asChild>
															<div
																className="relative rounded-md overflow-hidden cursor-pointer transition-shadow flex items-center"
																style={{
																	width: `${(realBarPosition.width / barPosition.width) * 100}%`,
																	backgroundColor: "rgba(34, 197, 94, 0.8)",
																	height: "32px",
																	marginLeft: `${((realBarPosition.left - barPosition.left) / barPosition.width) * 100}%`,
																}}
																onClick={() => router.push(`/projects/${project.id}`)}
															>
																{!isShortBar(project) && (
																	<div className="h-full px-2 py-1 text-white flex items-center">
																		<div className="font-medium truncate text-xs">{project.progressPercentage}%</div>
																	</div>
																)}

																{/* Íconos de alerta en la esquina superior derecha */}
																<div className="absolute top-1 right-1 flex items-center space-x-1">
																	{/* Ícono de retraso en finalización (no ha cerrado a tiempo) */}
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
																</div>
															</div>
														</TooltipTrigger>
														<ProjectBarTooltip project={project} type="real" showExecutionDelay={showExecutionDelay} showLateCompletion={showLateCompletion} />
													</Tooltip>
												)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</TooltipProvider>
	);
}

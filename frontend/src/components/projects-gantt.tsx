"use client";

import { BaseProject } from "@/app/types/project.type";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { addDays, differenceInDays, format, startOfDay } from "date-fns";
import { CalendarIcon, Users2Icon } from "lucide-react";
import { es } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getTagColorClass, getStageColorValue, STATUS_COLORS } from "@/lib/colors";
import { ProjectStatusLabels } from "@/app/types/enums";
import { useRouter } from "next/navigation";

interface ProjectsGanttProps {
	projects: BaseProject[];
}

export default function ProjectsGantt({ projects }: ProjectsGanttProps) {
	const router = useRouter();
	const [dateRange, setDateRange] = useState<Date[]>([]);
	const [chartWidth, setChartWidth] = useState(0);

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
	const getBarPosition = (project: BaseProject) => {
		if (dateRange.length === 0) return { left: 0, width: 0 };

		const startDate = new Date(project.startDate);
		const endDate = new Date(project.endDate);
		const firstDate = dateRange[0];

		const startOffset = Math.floor(differenceInDays(startDate, firstDate) / 7);
		const duration = Math.ceil(differenceInDays(endDate, startDate) / 7) + 1;

		const left = startOffset * 100;
		const width = duration * 100;

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

	const isShortBar = (project: BaseProject): boolean => {
		// Si la barra es menor a 120px (aproximadamente 3 días), considerarla corta
		const { width } = getBarPosition(project);
		return width < 120;
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
				<div className="overflow-x-auto border rounded-md shadow">
					<div style={{ minWidth: `${chartWidth}px` }} className="relative">
						{/* Header with dates */}
						<div className="flex border-b sticky top-0 bg-background z-20">
							<div className="w-72 min-w-72 p-3 border-r font-medium sticky left-0 z-30 bg-background shadow-md">Proyecto</div>
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
										<div>{format(date, "MMM", { locale: es })}</div>
										{isCurrentWeek(date) && <div className="h-1 w-full bg-primary mt-1"></div>}
									</div>
								))}
							</div>
						</div>

						{/* Project rows */}
						<div>
							{projects.map((project) => {
								const barPosition = getBarPosition(project);
								const categoryColor = project.categoryColor ? getStageColorValue(project.categoryColor) : "#6366f1";

								return (
									<div key={project.id} className="flex border-b hover:bg-secondary/20">
										<div className="w-72 min-w-72 p-3 border-r border-l-4 sticky left-0 z-20 bg-background shadow-md" style={{ borderLeftColor: categoryColor }}>
											<div className="font-medium line-clamp-1">{project.name}</div>
											<div className="flex items-center space-x-2 mt-2">
												{/* {project.categoryName && (
													<Badge variant="outline" className="text-xs px-1.5 py-0 font-medium shadow-sm">
														{project.categoryName}
													</Badge>
												)} */}
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
											<div className="text-xs text-muted-foreground mt-2">
												{format(new Date(project.startDate), "dd MMM yyyy", { locale: es })} - {format(new Date(project.endDate), "dd MMM yyyy", { locale: es })}
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

											{/* Barra principal del proyecto */}
											<Tooltip>
												<TooltipTrigger asChild>
													<div
														className="absolute top-3 rounded-md shadow-md hover:shadow-lg transition-shadow z-10 cursor-pointer overflow-hidden group"
														style={{
															left: `${barPosition.left}px`,
															width: `${barPosition.width}px`,
															backgroundColor: categoryColor,
															height: "60px",
															border: `1px solid ${isPast(new Date(project.endDate)) ? "#d1d5db" : "transparent"}`,
														}}
														onClick={() => router.push(`/projects/${project.id}`)}
													>
														{!isShortBar(project) && (
															<div className="h-full p-2 text-white">
																<div className="flex items-center justify-between">
																	<div className="font-medium truncate text-sm">{project.name}</div>
																	{project.team && project.team.length > 0 && (
																		<div className="ml-1 flex items-center">
																			<Users2Icon className="h-3.5 w-3.5" />
																			<span className="ml-1 text-xs">{project.team.length}</span>
																		</div>
																	)}
																</div>
																<div className="mt-2 text-xs">
																	{/* <span className="bg-white/20 px-1.5 py-0.5 rounded-sm">{project.status || "Activo"}</span> */}
																	{project.activitiesCount !== undefined && <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-sm">{project.activitiesCount} actividades</span>}
																</div>
															</div>
														)}
													</div>
												</TooltipTrigger>
												<TooltipContent>
													<div className="text-sm">
														<p className="font-medium">{project.name}</p>
														{project.description && <p className="text-xs mt-1 max-w-[300px] opacity-90">{project.description}</p>}
														<p className="text-xs mt-2">Categoría: {project.categoryName || "Sin categoría"}</p>
														<p className="text-xs">Estado: {project.status || "No definido"}</p>
														<p className="text-xs">Responsable: {project.managerUserName}</p>
														{project.team && <p className="text-xs">Equipo: {project.team.length} miembros</p>}
														{project.activitiesCount !== undefined && <p className="text-xs">Actividades: {project.activitiesCount}</p>}
														<div className="border-t border-border mt-2 pt-1">
															<p className="text-xs">
																{format(new Date(project.startDate), "dd MMM yyyy", { locale: es })} - {format(new Date(project.endDate), "dd MMM yyyy", { locale: es })}
															</p>
														</div>
													</div>
												</TooltipContent>
											</Tooltip>
										</div>
									</div>
								);
							})}
						</div>

						{/* Today indicator */}
						{dateRange.length > 0 && (
							<div
								className="absolute w-0.5 bg-primary z-10"
								style={{
									left: `${(Math.floor(differenceInDays(new Date(), dateRange[0]) / 7) + 0.5) * 100}px`,
									display: differenceInDays(new Date(), dateRange[0]) >= 0 && differenceInDays(new Date(), dateRange[dateRange.length - 1]) <= 0 ? "block" : "none",
									top: "36px", // Altura del encabezado
									bottom: "0",
								}}
							/>
						)}
					</div>
				</div>
			</div>
		</TooltipProvider>
	);
}

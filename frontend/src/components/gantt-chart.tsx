"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { addDays, differenceInDays, format, startOfDay } from "date-fns";
import { BaseActivity } from "@/app/types/activity.type";
import { BaseStage } from "@/app/types/stage.type";
import { CalendarIcon, AlertTriangleIcon, CheckIcon, ArrowRightIcon } from "lucide-react";
import { es } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getStageColorValue, getPriorityBgColor, getPriorityColor, getStatusColor } from "@/lib/colors";

type GanttChartProps = {
	activities: BaseActivity[];
	stages: BaseStage[];
};

export default function GanttChart({ activities, stages }: GanttChartProps) {
	const [dateRange, setDateRange] = useState<Date[]>([]);
	const [chartWidth, setChartWidth] = useState(0);

	// Find the earliest start date and latest end date
	useEffect(() => {
		if (activities.length === 0) return;

		let earliestDate = new Date(activities[0].startDate);
		let latestDate = new Date(activities[0].endDate);

		activities.forEach((activity) => {
			const startDate = new Date(activity.startDate);
			const dueDate = new Date(activity.endDate);

			if (startDate < earliestDate) {
				earliestDate = startDate;
			}

			if (dueDate > latestDate) {
				latestDate = dueDate;
			}
		});

		// Add some padding days
		earliestDate = addDays(earliestDate, -2);
		latestDate = addDays(latestDate, 2);

		// Generate array of dates
		const range: Date[] = [];
		let currentDate = startOfDay(earliestDate);

		while (currentDate <= latestDate) {
			range.push(currentDate);
			currentDate = addDays(currentDate, 1);
		}

		setDateRange(range);
	}, [activities]);

	// Update chart width based on window size
	useEffect(() => {
		const updateWidth = () => {
			const width = Math.max(dateRange.length * 40, 800);
			setChartWidth(width);
		};

		updateWidth();
		window.addEventListener("resize", updateWidth);

		return () => {
			window.removeEventListener("resize", updateWidth);
		};
	}, [dateRange]);

	const getBarPosition = (activity: BaseActivity) => {
		if (dateRange.length === 0) return { left: 0, width: 0 };

		const startDate = new Date(activity.startDate);
		const dueDate = new Date(activity.endDate);
		const firstDate = dateRange[0];

		const startOffset = differenceInDays(startDate, firstDate);
		const duration = differenceInDays(dueDate, startDate) + 1;

		const left = startOffset * 40;
		const width = duration * 40;

		return { left, width };
	};

	const isWeekend = (date: Date) => {
		const day = date.getDay();
		return day === 0 || day === 6;
	};

	const isToday = (date: Date) => {
		const today = new Date();
		return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
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

	const getPriorityIcon = (priority: string) => {
		switch (priority) {
			case "critical":
				return <AlertTriangleIcon className="h-4 w-4" />;
			case "high":
				return <AlertTriangleIcon className="h-3 w-3" />;
			case "medium":
				return <ArrowRightIcon className="h-3 w-3" />;
			case "low":
				return <CheckIcon className="h-3 w-3" />;
			default:
				return null;
		}
	};

	const isShortBar = (activity: BaseActivity): boolean => {
		// Si la barra es menor a 120px (aproximadamente 3 días), considerarla corta
		const { width } = getBarPosition(activity);
		return width < 120;
	};

	if (activities.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center p-12 text-center border rounded-md bg-secondary/20">
				<CalendarIcon className="h-12 w-12 mb-2 text-muted-foreground" />
				<h3 className="text-lg font-medium">No hay actividades disponibles</h3>
				<p className="text-sm text-muted-foreground mt-1">Añade algunas actividades para visualizarlas en el diagrama Gantt</p>
			</div>
		);
	}

	return (
		<TooltipProvider>
			<div className="overflow-x-auto border rounded-md shadow">
				<div style={{ minWidth: `${chartWidth}px` }} className="relative">
					{/* Header with dates */}
					<div className="flex border-b sticky top-0 bg-background z-10">
						<div className="w-64 min-w-64 p-3 border-r font-medium bg-secondary/30">Actividad</div>
						<div className="flex-1 flex">
							{dateRange.map((date, index) => (
								<div
									key={index}
									className={`w-10 flex-shrink-0 text-center text-xs py-2 border-r
									${isWeekend(date) ? "bg-secondary/40" : ""}
									${isPast(date) ? "bg-secondary/10" : ""}
									${isToday(date) ? "bg-primary/20 font-bold" : ""}`}
								>
									<div className="font-medium">{format(date, "d")}</div>
									<div>{format(date, "MMM", { locale: es })}</div>
									{isToday(date) && <div className="h-1 w-full bg-primary mt-1"></div>}
								</div>
							))}
						</div>
					</div>

					{/* Activity rows */}
					<div>
						{activities.map((activity) => (
							<div key={activity.id} className="flex border-b hover:bg-secondary/20">
								<div className={`w-64 min-w-64 p-3 border-r ${getStatusColor(activity.status)}`}>
									<div className="font-medium">{activity.title}</div>
									<div className="flex items-center justify-between mt-2">
										<Badge variant="outline" className={`text-xs px-1.5 py-0 font-medium shadow-sm border bg-white ${getPriorityColor(activity.priority)}`}>
											{activity.priority}
										</Badge>
										<Avatar className="h-6 w-6">
											<AvatarImage src="/placeholder-user.jpg" alt={activity.assignedToUser.name} />
											<AvatarFallback>{getInitials(activity.assignedToUser.name)}</AvatarFallback>
										</Avatar>
									</div>
									<div className="text-xs text-muted-foreground mt-2">
										{format(new Date(activity.startDate), "dd MMM", { locale: es })} - {format(new Date(activity.endDate), "dd MMM", { locale: es })}
									</div>
								</div>
								<div className="flex-1 relative" style={{ height: "90px" }}>
									{dateRange.map((date, dateIndex) => (
										<div
											key={dateIndex}
											className={`absolute top-0 bottom-0 w-10 border-r
											${isWeekend(date) ? "bg-secondary/40" : ""}
											${isPast(date) ? "bg-secondary/10" : ""}
											${isToday(date) ? "bg-primary/20" : ""}`}
											style={{ left: dateIndex * 40 }}
										/>
									))}
									<Tooltip>
										<TooltipTrigger asChild>
											<div
												className="absolute top-3 rounded-md shadow-md hover:shadow-lg transition-shadow z-10 cursor-pointer overflow-hidden group"
												style={{
													left: `${getBarPosition(activity).left}px`,
													width: `${getBarPosition(activity).width}px`,
													backgroundColor: getStageColorValue(activity.stageId),
													height: "60px",
													border: `1px solid ${isPast(new Date(activity.endDate)) ? "#d1d5db" : "transparent"}`,
												}}
											>
												{!isShortBar(activity) && (
													<div className="h-full p-2 text-white">
														<div className="flex items-center justify-between">
															<div className="font-medium truncate text-sm">{activity.title}</div>
															<div className="ml-1">{getPriorityIcon(activity.priority)}</div>
														</div>
														<div className="text-xs mt-1 opacity-90 group-hover:opacity-100">
															{format(new Date(activity.startDate), "dd MMM", { locale: es })} - {format(new Date(activity.endDate), "dd MMM", { locale: es })}
														</div>
													</div>
												)}
												<div className={`h-1 w-full absolute bottom-0 ${getPriorityBgColor(activity.priority)}`}></div>
											</div>
										</TooltipTrigger>
										<TooltipContent>
											<div className="text-sm">
												<p className="font-medium">{activity.title}</p>
												<p className="text-xs mt-1">Prioridad: {activity.priority}</p>
												<p className="text-xs">Estado: {activity.status}</p>
												<p className="text-xs">Asignado a: {activity.assignedToUser.name}</p>
											</div>
										</TooltipContent>
									</Tooltip>
								</div>
							</div>
						))}
					</div>

					{/* Today indicator */}
					{dateRange.length > 0 && (
						<div
							className="absolute top-0 bottom-0 w-0.5 bg-primary z-20"
							style={{
								left: `${(differenceInDays(new Date(), dateRange[0]) + 0.5) * 40}px`,
								display: differenceInDays(new Date(), dateRange[0]) >= 0 && differenceInDays(new Date(), dateRange[dateRange.length - 1]) <= 0 ? "block" : "none",
							}}
						/>
					)}
				</div>
			</div>
		</TooltipProvider>
	);
}

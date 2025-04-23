"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { addDays, differenceInDays, format, startOfDay } from "date-fns";
import { BaseActivity } from "@/app/types/activity.type";
import { BaseStage } from "@/app/types/stage.type";

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

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "low":
				return "bg-green-500";
			case "medium":
				return "bg-blue-500";
			case "high":
				return "bg-orange-500";
			case "critical":
				return "bg-red-500";
			default:
				return "bg-gray-500";
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "todo":
				return "border-l-4 border-l-slate-400";
			case "in-progress":
				return "border-l-4 border-l-blue-500";
			case "review":
				return "border-l-4 border-l-purple-500";
			case "done":
				return "border-l-4 border-l-green-500";
			default:
				return "";
		}
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((part) => part[0])
			.join("")
			.toUpperCase();
	};

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

	return (
		<div className="overflow-x-auto">
			<div style={{ minWidth: `${chartWidth}px` }} className="relative">
				{/* Header with dates */}
				<div className="flex border-b sticky top-0 bg-background z-10">
					<div className="w-64 min-w-64 p-2 border-r font-medium">Activity</div>
					<div className="flex-1 flex">
						{dateRange.map((date, index) => (
							<div key={index} className={`w-10 flex-shrink-0 text-center text-xs py-2 ${isWeekend(date) ? "bg-secondary/50" : ""} ${isToday(date) ? "bg-primary/10 font-bold" : ""}`}>
								<div>{format(date, "d")}</div>
								<div>{format(date, "MMM")}</div>
							</div>
						))}
					</div>
				</div>

				{/* Activity rows */}
				<div>
					{activities.map((activity, index) => (
						<div key={activity.id} className="flex border-b hover:bg-secondary/20">
							<div className={`w-64 min-w-64 p-2 border-r ${getStatusColor(activity.status)}`}>
								<div className="font-medium">{activity.title}</div>
								<div className="flex items-center justify-between mt-1">
									<Badge variant="outline" className={`${getPriorityColor(activity.priority)} text-white`}>
										{activity.priority}
									</Badge>
									<Avatar className="h-6 w-6">
										<AvatarImage src="/placeholder-user.jpg" alt={activity.assignedToUser.name} />
										<AvatarFallback>{getInitials(activity.assignedToUser.name)}</AvatarFallback>
									</Avatar>
								</div>
							</div>
							<div className="flex-1 relative" style={{ height: "70px" }}>
								{dateRange.map((date, dateIndex) => (
									<div
										key={dateIndex}
										className={`absolute top-0 bottom-0 w-10 border-r ${isWeekend(date) ? "bg-secondary/50" : ""} ${isToday(date) ? "bg-primary/10" : ""}`}
										style={{ left: dateIndex * 40 }}
									/>
								))}
								<div
									className={`absolute top-3 h-8 rounded-md ${getPriorityColor(activity.priority)} z-10 flex items-center justify-center text-white text-xs font-medium`}
									style={{
										left: `${getBarPosition(activity).left}px`,
										width: `${getBarPosition(activity).width}px`,
									}}
								>
									{activity.title}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

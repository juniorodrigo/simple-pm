"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { BaseStage } from "@/app/types/stage.type";
import { BaseActivity } from "@/app/types/activity.type";
import { ActivityPriority, ActivityStatus } from "@/app/types/enums";

const formSchema = z.object({
	title: z.string().min(2, {
		message: "Title must be at least 2 characters.",
	}),
	description: z.string().optional(),
	status: z.nativeEnum(ActivityStatus),
	assignedToUser: z.object({
		id: z.string(),
		name: z.string(),
		lastname: z.string(),
		projectRole: z.string().optional(),
	}),
	startDate: z.date(),
	endDate: z.date(),
	priority: z.nativeEnum(ActivityPriority),
	stageId: z.string(),
});

type CreateActivityModalProps = {
	projectId?: number;
	stages?: BaseStage[];
	onClose: () => void;
	onSuccess: (activity: BaseActivity) => void;
};

export default function CreateActivityModal({ projectId, stages: providedStages, onClose, onSuccess }: CreateActivityModalProps) {
	const { toast } = useToast();
	const [selectedTags, setSelectedTags] = useState<string[]>([]);

	// Use provided stages or fallback to default stages
	const stages = providedStages || [
		{ id: "1", name: "Planning", description: "Initial planning", color: "blue", order: 1 },
		{ id: "2", name: "Architecture", description: "System architecture", color: "purple", order: 2 },
		{ id: "3", name: "Backend", description: "Backend development", color: "green", order: 3 },
		{ id: "4", name: "Frontend", description: "Frontend development", color: "pink", order: 4 },
		{ id: "5", name: "Testing", description: "QA and testing", color: "yellow", order: 5 },
		{ id: "6", name: "Deployment", description: "Deployment", color: "red", order: 6 },
	];

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
			description: "",
			status: ActivityStatus.TODO,
			assignedToUser: {
				id: "",
				name: "",
				lastname: "",
				projectRole: "",
			},
			startDate: new Date(),
			endDate: new Date(),
			priority: ActivityPriority.MEDIUM,
			stageId: stages[0]?.id || "",
		},
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		const newActivity: BaseActivity = {
			id: `a${Math.floor(Math.random() * 1000)}`,
			...values,
		};

		onSuccess(newActivity);

		toast({
			title: "Activity created",
			description: "The activity has been created successfully.",
		});

		onClose();
	};

	const addTag = (tagId: string) => {
		if (!selectedTags.includes(tagId)) {
			setSelectedTags([...selectedTags, tagId]);
		}
	};

	const removeTag = (tagId: string) => {
		setSelectedTags(selectedTags.filter((id) => id !== tagId));
	};

	const getStageColorClass = (color: string) => {
		switch (color) {
			case "red":
				return "bg-red-100 text-red-800 border-red-200";
			case "green":
				return "bg-green-100 text-green-800 border-green-200";
			case "blue":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "yellow":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "purple":
				return "bg-purple-100 text-purple-800 border-purple-200";
			case "pink":
				return "bg-pink-100 text-pink-800 border-pink-200";
			case "gray":
				return "bg-gray-100 text-gray-800 border-gray-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	return (
		<div className="space-y-4 p-4">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="title"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Title</FormLabel>
								<FormControl>
									<Input placeholder="Activity title" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Textarea placeholder="Describe the activity" className="resize-none" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="stageId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Stage</FormLabel>
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select stage" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{stages
											.filter((stage) => stage.id)
											.map((stage) => (
												<SelectItem key={stage.id} value={stage.id!}>
													<div className="flex items-center">
														<Badge variant="outline" className={getStageColorClass(stage.color)}>
															{stage.name}
														</Badge>
													</div>
												</SelectItem>
											))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="status"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Status</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select status" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value={ActivityStatus.TODO}>To Do</SelectItem>
											<SelectItem value={ActivityStatus.IN_PROGRESS}>In Progress</SelectItem>
											<SelectItem value={ActivityStatus.REVIEW}>Review</SelectItem>
											<SelectItem value={ActivityStatus.DONE}>Done</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="priority"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Priority</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select priority" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value={ActivityPriority.LOW}>Low</SelectItem>
											<SelectItem value={ActivityPriority.MEDIUM}>Medium</SelectItem>
											<SelectItem value={ActivityPriority.HIGH}>High</SelectItem>
											<SelectItem value={ActivityPriority.CRITICAL}>Critical</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<FormField
						control={form.control}
						name="assignedToUser"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Assignee</FormLabel>
								<Select
									onValueChange={(value) => {
										const selectedUser = {
											id: value,
											name: value === "user1" ? "John" : value === "user2" ? "Jane" : "Robert",
											lastname: value === "user1" ? "Doe" : value === "user2" ? "Smith" : "Johnson",
											projectRole: "Member",
										};
										field.onChange(selectedUser);
									}}
									value={field.value.id}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Assign to" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="user1">John Doe</SelectItem>
										<SelectItem value="user2">Jane Smith</SelectItem>
										<SelectItem value="user3">Robert Johnson</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="startDate"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Start Date</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
													{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
													<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="endDate"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Due Date</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
													{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
													<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="flex justify-end space-x-2 pt-4">
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit">Create Activity</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

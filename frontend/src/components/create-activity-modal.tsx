"use client";

import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import type { BaseStage } from "@/app/types/stage.type";
import { BaseActivity } from "@/app/types/activity.type";
import { ActivityPriority, ActivityStatus } from "@/app/types/enums";
import { UsersService } from "@/services/users.service";
import type { BaseUser } from "@/app/types/user.type";
import { ActivitysService } from "@/services/activity.service";
import { getTagColorClass } from "@/lib/colors";

const formSchema = z.object({
	title: z.string().min(2, {
		message: "El título debe tener al menos 2 caracteres.",
	}),
	description: z.string().min(1, {
		message: "La descripción es obligatoria.",
	}),
	status: z.nativeEnum(ActivityStatus),
	assignedToUser: z
		.object({
			id: z.string(),
			name: z.string(),
			lastname: z.string(),
			projectRole: z.string().optional(),
		})
		.refine((data) => data.id !== "", {
			message: "Debe asignar la actividad a un usuario",
			path: ["id"],
		}),
	startDate: z.date(),
	endDate: z.date(),
	priority: z.nativeEnum(ActivityPriority),
	stageId: z.string(),
});

type CreateActivityModalProps = {
	projectId: number;
	stages?: BaseStage[];
	onClose: () => void;
	onSuccess: (activity: BaseActivity) => void;
};

export default function CreateActivityModal({ projectId, stages: providedStages, onClose, onSuccess }: CreateActivityModalProps) {
	const { toast } = useToast();
	const [users, setUsers] = useState<BaseUser[]>([]);

	useEffect(() => {
		const loadUsers = async () => {
			const response = await UsersService.getUsers();
			if (response.success && response.data) {
				setUsers(response.data);
			}
		};
		loadUsers();
	}, []);

	const stages = providedStages || [];

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

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const newActivity: BaseActivity = {
			id: `a${Math.floor(Math.random() * 1000)}`,
			...values,
		};

		const response = await ActivitysService.createActivity(values.stageId, newActivity);

		if (response.success) {
			onSuccess(newActivity);
			toast({
				title: "Activity created",
				description: "The activity has been created successfully.",
			});
			onClose();
		} else {
			toast({
				title: "Error",
				description: "There was an error creating the activity.",
				variant: "destructive",
			});
		}
	};

	const statusOptions = Object.entries(ActivityStatus).map(([key, value]) => ({
		label: key
			.split("_")
			.map((word) => word.charAt(0) + word.slice(1).toLowerCase())
			.join(" "),
		value: value,
	}));

	const priorityOptions = Object.entries(ActivityPriority).map(([key, value]) => ({
		label: key.charAt(0) + key.slice(1).toLowerCase(),
		value: value,
	}));

	return (
		<div className="space-y-4 p-4">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="title"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Título</FormLabel>
								<FormControl>
									<Input placeholder="Título de la actividad" {...field} />
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
								<FormLabel>Descripción</FormLabel>
								<FormControl>
									<Textarea placeholder="Describe la actividad" className="resize-none" {...field} />
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
								<FormLabel>Etapa</FormLabel>
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Selecciona la etapa" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{stages
											.filter((stage) => stage.id)
											.map((stage) => (
												<SelectItem key={stage.id} value={stage.id!}>
													<div className="flex items-center">
														<Badge variant="outline" className={getTagColorClass(stage.color)}>
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
									<FormLabel>Estado</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select status" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{statusOptions.map(({ label, value }) => (
												<SelectItem key={value} value={value}>
													{label}
												</SelectItem>
											))}
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
									<FormLabel>Prioridad</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select priority" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{priorityOptions.map(({ label, value }) => (
												<SelectItem key={value} value={value}>
													{label}
												</SelectItem>
											))}
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
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel>Asignar a</FormLabel>
								<Select
									onValueChange={(value) => {
										const selectedUser = users.find((user) => user.id === value);
										if (selectedUser) {
											field.onChange({
												id: selectedUser.id || "",
												name: selectedUser.name,
												lastname: selectedUser.lastname,
												projectRole: selectedUser.projectRole,
											});
										}
									}}
									value={field.value.id}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Seleccionar usuario" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{users.map((user) => (
											<SelectItem key={user.id} value={user.id || ""}>
												{user.name} {user.lastname}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage>{fieldState.error?.root?.message || fieldState.error?.message}</FormMessage>
							</FormItem>
						)}
					/>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="startDate"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Fecha de Inicio</FormLabel>
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
									<FormLabel>Fecha de Fin</FormLabel>
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
							Cancelar
						</Button>
						<Button type="submit">Crear Actividad</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

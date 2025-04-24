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
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { BaseStage } from "@/app/types/stage.type";
import { BaseActivity } from "@/app/types/activity.type";
import { ActivityPriority, ActivityStatus, ActivitiesLabels, ActivityPriorityLabels } from "@/app/types/enums";
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
	activity?: BaseActivity | null; // Nueva prop para modo edición
	onClose: () => void;
	onSuccess: (activity: BaseActivity) => void;
};

type DateRange = {
	from: Date;
	to?: Date;
};

export default function CreateActivityModal({ projectId, stages: providedStages, activity, onClose, onSuccess }: CreateActivityModalProps) {
	const { toast } = useToast();
	const [users, setUsers] = useState<BaseUser[]>([]);
	const isEditMode = !!activity;
	const [dateRange, setDateRange] = useState<DateRange>({
		from: new Date(),
		to: addDays(new Date(), 7),
	});

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
		defaultValues: activity
			? {
					title: activity.title,
					description: activity.description,
					status: activity.status,
					assignedToUser: activity.assignedToUser,
					startDate: new Date(activity.startDate),
					endDate: new Date(activity.endDate),
					priority: activity.priority,
					stageId: activity.stageId,
			  }
			: {
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

	// Actualizar formulario cuando cambia la actividad
	useEffect(() => {
		if (activity) {
			form.reset({
				title: activity.title,
				description: activity.description,
				status: activity.status,
				assignedToUser: activity.assignedToUser,
				startDate: new Date(activity.startDate),
				endDate: new Date(activity.endDate),
				priority: activity.priority,
				stageId: activity.stageId,
			});
			setDateRange({
				from: new Date(activity.startDate),
				to: new Date(activity.endDate),
			});
		}
	}, [activity, form]);

	// Sincronizar el rango de fechas con los campos del formulario
	useEffect(() => {
		if (dateRange.from) {
			form.setValue("startDate", dateRange.from);
			// Si no hay fecha final o es la misma que la inicial, usar la fecha inicial para ambos
			form.setValue("endDate", dateRange.to || dateRange.from);
		}
	}, [dateRange, form]);

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		if (isEditMode && activity) {
			// Modo edición - actualizar actividad existente
			const updatedActivity: BaseActivity = {
				...activity,
				...values,
			};

			const response = await ActivitysService.updateActivity(updatedActivity.id, updatedActivity);

			if (response.success) {
				onSuccess(updatedActivity);
				toast({
					title: "Actividad actualizada",
					description: "La actividad ha sido actualizada correctamente.",
				});
				onClose();
			} else {
				toast({
					title: "Error",
					description: "Hubo un error al actualizar la actividad.",
					variant: "destructive",
				});
			}
		} else {
			// Modo creación - crear nueva actividad
			const newActivity: BaseActivity = {
				id: `a${Math.floor(Math.random() * 1000)}`,
				...values,
			};

			const response = await ActivitysService.createActivity(values.stageId, newActivity);

			if (response.success) {
				const createdActivity = response.data?.id ? { ...newActivity, id: response.data.id } : newActivity;
				onSuccess(createdActivity);
				toast({
					title: "Actividad Creada",
					description: "La actividad ha sido creada correctamente.",
				});
				onClose();
			} else {
				toast({
					title: "Error",
					description: "Hubo un error al crear la actividad.",
					variant: "destructive",
				});
			}
		}
	};

	// Reemplazar la generación hardcodeada de opciones por las etiquetas de los enums
	// Usar los objetos de etiquetas para las opciones de los selectores
	const statusOptions = Object.values(ActivityStatus).map((statusValue) => ({
		label: ActivitiesLabels[statusValue],
		value: statusValue,
	}));

	const priorityOptions = Object.values(ActivityPriority).map((priorityValue) => ({
		label: ActivityPriorityLabels[priorityValue],
		value: priorityValue,
	}));

	return (
		<div className="space-y-4 px-4">
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
												<SelectValue placeholder="Seleccionar estado" />
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
												<SelectValue placeholder="Seleccionar prioridad" />
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

					<div className="space-y-2">
						<FormLabel>Rango de fechas</FormLabel>
						<Popover>
							<PopoverTrigger asChild>
								<Button id="date-range" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
									<CalendarIcon className="mr-2 h-4 w-4" />
									{dateRange?.from ? (
										dateRange.to && dateRange.from.getTime() !== dateRange.to.getTime() ? (
											<>
												{format(dateRange.from, "PPP", { locale: es })} - {format(dateRange.to, "PPP", { locale: es })}
											</>
										) : (
											<>Un solo día: {format(dateRange.from, "PPP", { locale: es })}</>
										)
									) : (
										<span>Selecciona fechas</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<div className="p-2 text-xs text-muted-foreground">Puedes seleccionar un solo día o un rango de fechas</div>
								<Calendar
									initialFocus
									mode="range"
									defaultMonth={dateRange?.from}
									selected={dateRange}
									onSelect={(range) => {
										if (range?.from) {
											setDateRange({
												from: range.from,
												to: range.to || range.from,
											});
										}
									}}
									locale={es}
									numberOfMonths={2}
								/>
							</PopoverContent>
						</Popover>
						<div className="flex justify-between text-xs text-muted-foreground">
							<p>Inicio: {dateRange.from ? format(dateRange.from, "PPP", { locale: es }) : "No seleccionada"}</p>
							<p>Fin: {dateRange.to ? format(dateRange.to, "PPP", { locale: es }) : "Igual que inicio"}</p>
						</div>
						{dateRange.from && dateRange.to && dateRange.from.getTime() === dateRange.to.getTime() && <p className="text-xs text-muted-foreground italic">La actividad comenzará y terminará el mismo día</p>}
						{(form.formState.errors.startDate || form.formState.errors.endDate) && <p className="text-sm font-medium text-destructive">Por favor selecciona un rango de fechas válido</p>}
					</div>

					{/* Campos ocultos para mantener la compatibilidad con el esquema */}
					<div className="hidden">
						<FormField control={form.control} name="startDate" render={({ field }) => <input type="hidden" {...field} value={field.value?.toISOString()} />} />
						<FormField control={form.control} name="endDate" render={({ field }) => <input type="hidden" {...field} value={field.value?.toISOString()} />} />
					</div>

					<div className="flex justify-end space-x-2 pt-4">
						<Button type="button" variant="outline" onClick={onClose}>
							Cancelar
						</Button>
						<Button type="submit">{isEditMode ? "Actualizar Actividad" : "Crear Actividad"}</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

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
import type { BaseStage } from "@/types/stage.type";
import { BaseActivity } from "@/types/activity.type";
import { ActivityPriority, ActivityStatus, ActivitiesLabels, ActivityPriorityLabels } from "@/types/enums";
import { UsersService } from "@/services/users.service";
import type { User } from "@/types/new/usuario.type";
import { ActivitysService } from "@/services/activity.service";
import { getTagColorClass } from "@/lib/colors";
import type { ActivityUser } from "@/types/activity.type";

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
	executedStartDate: z.date().optional(),
	executedEndDate: z.date().optional(),
	priority: z.nativeEnum(ActivityPriority),
	stageId: z.string(),
});

type CreateActivityModalProps = {
	projectId: number;
	stages?: BaseStage[];
	activity?: BaseActivity | null; // Nueva prop para modo edición
	isReadOnly?: boolean; // Nueva prop para modo solo lectura
	onClose: () => void;
	onSuccess: (activity: BaseActivity) => void;
};

type DateRange = {
	from: Date;
	to?: Date;
};

export default function CreateActivityModal({ projectId, stages: providedStages, activity, isReadOnly = false, onClose, onSuccess }: CreateActivityModalProps) {
	const { toast } = useToast();
	const [users, setUsers] = useState<User[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false); // Estado para prevenir doble envío
	const isEditMode = !!activity;
	const [dateRange, setDateRange] = useState<DateRange>({
		from: new Date(),
		to: addDays(new Date(), 7),
	});

	// Nuevo estado para las fechas ejecutadas
	const [executedDateRange, setExecutedDateRange] = useState<DateRange | null>(null);

	useEffect(() => {
		const loadUsers = async () => {
			const response = await UsersService.getUsersByProjectId(String(projectId));
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
					executedStartDate: activity.executedStartDate ? new Date(activity.executedStartDate) : undefined,
					executedEndDate: activity.executedEndDate ? new Date(activity.executedEndDate) : undefined,
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
					executedStartDate: undefined,
					executedEndDate: undefined,
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
				executedStartDate: activity.executedStartDate ? new Date(activity.executedStartDate) : undefined,
				executedEndDate: activity.executedEndDate ? new Date(activity.executedEndDate) : undefined,
				priority: activity.priority,
				stageId: activity.stageId,
			});

			setDateRange({
				from: new Date(activity.startDate),
				to: new Date(activity.endDate),
			});

			// Inicializar el rango de fechas ejecutadas si existen
			if (activity.executedStartDate) {
				setExecutedDateRange({
					from: new Date(activity.executedStartDate),
					to: activity.executedEndDate ? new Date(activity.executedEndDate) : undefined,
				});
			}
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

	// Sincronizar el rango de fechas ejecutadas con los campos del formulario
	useEffect(() => {
		if (executedDateRange?.from) {
			form.setValue("executedStartDate", executedDateRange.from);
			form.setValue("executedEndDate", executedDateRange.to || executedDateRange.from);
		} else {
			form.setValue("executedStartDate", undefined);
			form.setValue("executedEndDate", undefined);
		}
	}, [executedDateRange, form]);

	// Limpia las fechas ejecutadas cuando el estado cambia a algo diferente de DONE
	useEffect(() => {
		const status = form.watch("status");
		if (status !== ActivityStatus.DONE && executedDateRange) {
			clearExecutedDates();
		}
	}, [form.watch("status")]);

	// Función para convertir User a ActivityUser
	const convertToActivityUser = (user: User): ActivityUser => ({
		id: user.id,
		name: user.name,
		lastname: user.lastname,
		projectRole: undefined, // Se puede asignar más tarde si es necesario
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		// Prevenir múltiples envíos
		if (isSubmitting) return;

		setIsSubmitting(true);

		try {
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
		} catch (error) {
			toast({
				title: "Error",
				description: "Ocurrió un error inesperado. Por favor, inténtalo nuevamente.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
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

	// Función para limpiar las fechas ejecutadas
	const clearExecutedDates = () => {
		setExecutedDateRange(null);
		form.setValue("executedStartDate", undefined);
		form.setValue("executedEndDate", undefined);
	};

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
									<Input placeholder="Título de la actividad" {...field} disabled={isReadOnly} />
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
									<Textarea placeholder="Describe la actividad" className="resize-none" {...field} disabled={isReadOnly} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="stageId"
						render={({ field }) => {
							const selectedStage = stages.find((stage) => stage.id === field.value);
							return (
								<FormItem>
									<FormLabel>Etapa</FormLabel>
									{isReadOnly ? (
										<div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background items-center">
											{selectedStage && (
												<Badge variant="outline" className={getTagColorClass(selectedStage.color)}>
													{selectedStage.name}
												</Badge>
											)}
										</div>
									) : (
										<Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
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
									)}
									<FormMessage />
								</FormItem>
							);
						}}
					/>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{isEditMode && (
							<FormField
								control={form.control}
								name="status"
								render={({ field }) => {
									const selectedStatus = statusOptions.find((option) => option.value === field.value);
									return (
										<FormItem>
											<FormLabel>Estado</FormLabel>
											{isReadOnly ? (
												<div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background items-center">{selectedStatus?.label}</div>
											) : (
												<Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
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
											)}
											<FormMessage />
										</FormItem>
									);
								}}
							/>
						)}
						<FormField
							control={form.control}
							name="priority"
							render={({ field }) => {
								const selectedPriority = priorityOptions.find((option) => option.value === field.value);
								return (
									<FormItem>
										<FormLabel>Prioridad</FormLabel>
										{isReadOnly ? (
											<div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background items-center">{selectedPriority?.label}</div>
										) : (
											<Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
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
										)}
										<FormMessage />
									</FormItem>
								);
							}}
						/>
					</div>

					<FormField
						control={form.control}
						name="assignedToUser"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel>Asignar a</FormLabel>
								{isReadOnly ? (
									<div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
										{field.value.name} {field.value.lastname}
									</div>
								) : (
									<Select
										onValueChange={(value) => {
											const selectedUser = users.find((user) => user.id === value);
											if (selectedUser) {
												field.onChange(convertToActivityUser(selectedUser));
											}
										}}
										value={field.value.id}
										disabled={isReadOnly}
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
								)}
								<FormMessage>{fieldState.error?.root?.message || fieldState.error?.message}</FormMessage>
							</FormItem>
						)}
					/>

					<div className="space-y-2">
						<FormLabel>Fechas planificadas</FormLabel>
						<Popover>
							<PopoverTrigger asChild disabled={isReadOnly}>
								<Button id="date-range" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")} disabled={isReadOnly}>
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
							{!isReadOnly && (
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
							)}
						</Popover>
						<div className="flex justify-between text-xs text-muted-foreground">
							<p>Inicio: {dateRange.from ? format(dateRange.from, "PPP", { locale: es }) : "No seleccionada"}</p>
							<p>Fin: {dateRange.to ? format(dateRange.to, "PPP", { locale: es }) : "Igual que inicio"}</p>
						</div>
						{dateRange.from && dateRange.to && dateRange.from.getTime() === dateRange.to.getTime() && <p className="text-xs text-muted-foreground italic">La actividad comenzará y terminará el mismo día</p>}
						{(form.formState.errors.startDate || form.formState.errors.endDate) && <p className="text-sm font-medium text-destructive">Por favor selecciona un rango de fechas válido</p>}
					</div>

					{/* Nuevos campos para fechas ejecutadas - solo visibles cuando el estado es DONE */}
					{form.watch("status") === ActivityStatus.DONE && (
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<FormLabel>Fechas reales de ejecución (opcional)</FormLabel>
								{executedDateRange && !isReadOnly && (
									<Button type="button" variant="ghost" size="sm" onClick={clearExecutedDates} className="h-8 text-xs">
										Limpiar fechas
									</Button>
								)}
							</div>
							<Popover>
								<PopoverTrigger asChild disabled={isReadOnly}>
									<Button id="executed-date-range" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !executedDateRange && "text-muted-foreground")} disabled={isReadOnly}>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{executedDateRange?.from ? (
											executedDateRange.to && executedDateRange.from.getTime() !== executedDateRange.to.getTime() ? (
												<>
													{format(executedDateRange.from, "PPP", { locale: es })} - {format(executedDateRange.to, "PPP", { locale: es })}
												</>
											) : (
												<>Un solo día: {format(executedDateRange.from, "PPP", { locale: es })}</>
											)
										) : (
											<span>Selecciona fechas reales de ejecución</span>
										)}
									</Button>
								</PopoverTrigger>
								{!isReadOnly && (
									<PopoverContent className="w-auto p-0" align="start">
										<div className="p-2 text-xs text-muted-foreground">Selecciona las fechas reales en que se ejecutó la actividad</div>
										<Calendar
											initialFocus
											mode="range"
											defaultMonth={executedDateRange?.from || new Date()}
											selected={executedDateRange || undefined}
											onSelect={(range) => {
												if (range?.from) {
													setExecutedDateRange({
														from: range.from,
														to: range.to || range.from,
													});
												} else {
													setExecutedDateRange(null);
												}
											}}
											locale={es}
											numberOfMonths={2}
										/>
									</PopoverContent>
								)}
							</Popover>
							{executedDateRange && (
								<div className="flex justify-between text-xs text-muted-foreground">
									<p>Inicio real: {format(executedDateRange.from, "PPP", { locale: es })}</p>
									<p>Fin real: {executedDateRange.to ? format(executedDateRange.to, "PPP", { locale: es }) : "Igual que inicio"}</p>
								</div>
							)}
						</div>
					)}

					{/* Campos ocultos para mantener la compatibilidad con el esquema */}
					<div className="hidden">
						<FormField control={form.control} name="startDate" render={({ field }) => <input type="hidden" {...field} value={field.value?.toISOString()} />} />
						<FormField control={form.control} name="endDate" render={({ field }) => <input type="hidden" {...field} value={field.value?.toISOString()} />} />
						<FormField control={form.control} name="executedStartDate" render={({ field }) => <>{field.value && <input type="hidden" {...field} value={field.value?.toISOString()} />}</>} />
						<FormField control={form.control} name="executedEndDate" render={({ field }) => <>{field.value && <input type="hidden" {...field} value={field.value?.toISOString()} />}</>} />
					</div>

					<div className="flex justify-end space-x-2 pt-4">
						<Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
							{isReadOnly ? "Cerrar" : "Cancelar"}
						</Button>
						{!isReadOnly && (
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (isEditMode ? "Actualizando..." : "Creando...") : isEditMode ? "Actualizar Actividad" : "Crear Actividad"}
							</Button>
						)}
					</div>
				</form>
			</Form>
		</div>
	);
}

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UsersService } from "@/services/users.service";
import { CategoriaService } from "@/services/new/categoria.service";
import { ProjectsService } from "@/services/project.service";
import { User } from "@/types/new/usuario.type";
import { Tag } from "@/types/new/tag.type";
import { Project, ProjectCreate, ProjectUpdate, ExtendedProject } from "@/types/new/project.type";
import { MultiSelect } from "@/components/ui/multi-select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";

const formSchema = z.object({
	name: z.string().min(2, {
		message: "Debe tener al menos dos caracteres.",
	}),
	description: z
		.string()
		.max(500, {
			message: "La descripción no puede exceder los 500 caracteres.",
		})
		.optional(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
	teamMembers: z.array(z.string()).min(1, "Se requiere al menos un miembro en el equipo"),
	managerUserId: z.string().refine((val) => val.length > 0, {
		message: "Debes seleccionar un Project Manager del equipo",
	}),
	categoryId: z.string().optional(),
	previousProjectId: z.string().optional(),
});

type DateRange = {
	from: Date;
	to?: Date;
};

interface CreateProjectFormProps {
	isEditing?: boolean;
	projectData?: ExtendedProject;
	onSuccess?: () => void;
	onCancel?: () => void;
}

export default function CreateProjectForm({ isEditing = false, projectData, onSuccess, onCancel }: CreateProjectFormProps) {
	const { toast } = useToast();
	const [users, setUsers] = useState<User[]>([]);
	const [availableTags, setAvailableTags] = useState<Tag[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(false);
	const [startDateInput, setStartDateInput] = useState("");
	const [endDateInput, setEndDateInput] = useState("");
	const { user } = useAuth();
	const [dateRange, setDateRange] = useState<DateRange>({
		from: new Date(),
		to: addDays(new Date(), 30),
	});

	// Inicializar el formulario con valores predeterminados o datos del proyecto si está en modo edición
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: isEditing && projectData ? projectData.name : "",
			description: isEditing && projectData ? projectData.description || "" : "",
			startDate: isEditing && projectData && projectData.startDate ? new Date(projectData.startDate) : new Date(),
			endDate: isEditing && projectData && projectData.endDate ? new Date(projectData.endDate) : addDays(new Date(), 30),
			managerUserId: isEditing && projectData ? projectData.managerUserId || "" : user?.id || "",
			teamMembers: isEditing && projectData && projectData.team ? projectData.team.map((member) => member.id || "") : user?.id ? [user.id] : [],
			categoryId: isEditing && projectData ? projectData.categoryId || "" : "",
			previousProjectId: isEditing && projectData ? projectData.previousProjectId || "" : "",
		},
	});

	// Configurar el rango de fechas inicial si estamos editando
	useEffect(() => {
		if (isEditing && projectData) {
			const start = projectData.startDate ? new Date(projectData.startDate) : new Date();
			const end = projectData.endDate ? new Date(projectData.endDate) : addDays(start, 30);

			setDateRange({
				from: start,
				to: end,
			});

			setStartDateInput(format(start, "dd/MM/yyyy"));
			setEndDateInput(format(end, "dd/MM/yyyy"));
		} else {
			// Inicializar con fechas por defecto
			const defaultStart = new Date();
			const defaultEnd = addDays(defaultStart, 30);
			setStartDateInput(format(defaultStart, "dd/MM/yyyy"));
			setEndDateInput(format(defaultEnd, "dd/MM/yyyy"));
		}
	}, [isEditing, projectData]);

	useEffect(() => {
		const loadData = async () => {
			const usersResponse = await UsersService.getUsers();
			const tagsResponse = await CategoriaService.getAll();
			const projectsResponse = await ProjectsService.getProjects(user?.id || null);

			if (usersResponse.success && usersResponse.data) {
				setUsers(usersResponse.data);
			}

			if (tagsResponse.success && tagsResponse.data) {
				setAvailableTags(tagsResponse.data);
			}

			if (projectsResponse.success && projectsResponse.data) {
				setProjects(projectsResponse.data);
			}
		};

		loadData();
	}, []);

	// Efecto para asegurar que el usuario actual esté siempre en el equipo cuando se crea un nuevo proyecto
	useEffect(() => {
		if (!isEditing && user?.id) {
			const currentTeamMembers = form.getValues("teamMembers");
			if (!currentTeamMembers.includes(user.id)) {
				form.setValue("teamMembers", [...currentTeamMembers, user.id]);
			}
		}
	}, [user, isEditing, form]);

	// Sincronizar el rango de fechas con los campos del formulario
	useEffect(() => {
		if (dateRange.from) {
			form.setValue("startDate", dateRange.from);
			setStartDateInput(format(dateRange.from, "dd/MM/yyyy"));
		}
		if (dateRange.to) {
			form.setValue("endDate", dateRange.to || dateRange.from);
			setEndDateInput(format(dateRange.to || dateRange.from, "dd/MM/yyyy"));
		}
	}, [dateRange, form]);

	// Función para validar y parsear fecha en formato DD/MM/YYYY
	const parseDate = (dateString: string): Date | null => {
		if (!dateString || dateString.length !== 10) return null;
		try {
			const parsed = parse(dateString, "dd/MM/yyyy", new Date());
			return isValid(parsed) ? parsed : null;
		} catch {
			return null;
		}
	};

	// Función para formatear automáticamente la fecha con barras
	const formatDateInput = (value: string): string => {
		// Remover todo lo que no sean números
		const numbers = value.replace(/\D/g, "");

		// Aplicar formato DD/MM/YYYY
		if (numbers.length <= 2) {
			return numbers;
		} else if (numbers.length <= 4) {
			return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
		} else {
			return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
		}
	};

	// Manejar cambio en input de fecha de inicio
	const handleStartDateChange = (value: string) => {
		const formattedValue = formatDateInput(value);
		setStartDateInput(formattedValue);
		const parsedDate = parseDate(formattedValue);
		if (parsedDate) {
			const newDateRange = {
				from: parsedDate,
				to: dateRange.to && dateRange.to >= parsedDate ? dateRange.to : parsedDate,
			};
			setDateRange(newDateRange);
		}
	};

	// Manejar cambio en input de fecha de fin
	const handleEndDateChange = (value: string) => {
		const formattedValue = formatDateInput(value);
		setEndDateInput(formattedValue);
		const parsedDate = parseDate(formattedValue);
		if (parsedDate && dateRange.from) {
			if (parsedDate >= dateRange.from) {
				setDateRange({
					from: dateRange.from,
					to: parsedDate,
				});
			}
		}
	};

	const watchTeamMembers = form.watch("teamMembers");
	const availableManagers = users.filter((user) => watchTeamMembers.includes(user.id || ""));

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setLoading(true);
		try {
			const manager = users.find((u) => u.id === values.managerUserId);
			const teamMembers = users.filter((u) => values.teamMembers.includes(u.id || ""));

			// Aseguramos que las fechas siempre sean Date válidos (nunca null)
			const startDate = values.startDate || new Date();
			const endDate = values.endDate || addDays(new Date(), 30);

			let response;

			if (isEditing && projectData) {
				// Actualizar proyecto existente
				const projectToUpdate: ProjectUpdate = {
					id: projectData.id,
					name: values.name,
					description: values.description,
					startDate: startDate,
					endDate: endDate,
					managerUserId: values.managerUserId,
					managerUserName: manager?.name || "",
					team: teamMembers,
					progressPercentage: projectData.progressPercentage || 0,
					categoryId: values.categoryId,
					// Mantener otros campos existentes del proyecto original
					status: projectData.status,
					categoryName: projectData.categoryName,
					categoryColor: projectData.categoryColor,
					activitiesCount: projectData.activitiesCount,
					manager: projectData.manager,
				};

				response = await ProjectsService.updateProject(String(projectData.id), projectToUpdate);

				if (response.success) {
					// Simplificamos esta parte - si hay una función onSuccess, la llamamos directamente
					if (onSuccess) {
						onSuccess();
					} else {
						// Solo mostramos toast aquí si no hay onSuccess (que ya tiene su propio toast)
						toast({
							title: "Proyecto actualizado con éxito",
							variant: "default",
						});
					}
				}
			} else {
				// Crear nuevo proyecto
				const newProject: ProjectCreate = {
					name: values.name,
					description: values.description,
					startDate: startDate,
					endDate: endDate,
					managerUserId: values.managerUserId,
					managerUserName: manager?.name || "",
					team: teamMembers,
					progressPercentage: 0, // Proyectos nuevos inician en 0%
					categoryId: values.categoryId,
					areaId: user?.area.id,
				};

				response = await ProjectsService.createProject(newProject);

				if (response.success) {
					toast({
						title: "Proyecto creado con éxito",
						variant: "default",
					});
					form.reset();
					window.location.reload();
				}
			}
		} catch (error) {
			toast({
				title: isEditing ? "Error al actualizar el proyecto" : "Error al crear el proyecto",
				variant: "destructive",
			});
			console.error(isEditing ? "Error updating project" : "Error creating project");
		}
		setLoading(false);
	};

	return (
		<div className="space-y-4 p-4">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Nombre del proyecto</FormLabel>
								<FormControl>
									<Input placeholder="Ingrese el nombre del proyecto" {...field} />
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
									<div className="relative">
										<Textarea placeholder="Describe el proyecto" className="resize-none" {...field} />
										<div className="absolute bottom-2 right-2 text-xs text-muted-foreground">{field.value?.length || 0}/500</div>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="space-y-4">
						<FormLabel>Duración del Proyecto</FormLabel>

						{/* Inputs manuales para fechas */}
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">Fecha de inicio</label>
								<Input
									type="text"
									placeholder="DD/MM/YYYY"
									value={startDateInput}
									onChange={(e) => handleStartDateChange(e.target.value)}
									className={cn("text-center", !parseDate(startDateInput) && startDateInput.length === 10 && "border-red-500")}
									maxLength={10}
								/>
								{!parseDate(startDateInput) && startDateInput.length === 10 && <p className="text-xs text-red-500">Formato inválido</p>}
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium">Fecha de fin</label>
								<Input
									type="text"
									placeholder="DD/MM/YYYY"
									value={endDateInput}
									onChange={(e) => handleEndDateChange(e.target.value)}
									className={cn("text-center", !parseDate(endDateInput) && endDateInput.length === 10 && "border-red-500")}
									maxLength={10}
								/>
								{!parseDate(endDateInput) && endDateInput.length === 10 && <p className="text-xs text-red-500">Formato inválido</p>}
							</div>
						</div>

						{/* Selector de calendario */}
						<div className="space-y-2">
							<label className="text-sm font-medium">O selecciona desde el calendario</label>
							<Popover>
								<PopoverTrigger asChild>
									<Button id="date-range" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{dateRange?.from ? (
											dateRange.to ? (
												<>
													{format(dateRange.from, "PPP", { locale: es })} - {format(dateRange.to, "PPP", { locale: es })}
												</>
											) : (
												format(dateRange.from, "PPP", { locale: es })
											)
										) : (
											<span>Selecciona un rango de fechas</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
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
						</div>

						<div className="flex justify-between text-xs text-muted-foreground">
							<p>Inicio: {dateRange.from ? format(dateRange.from, "PPP", { locale: es }) : "No seleccionada"}</p>
							<p>Fin: {dateRange.to ? format(dateRange.to, "PPP", { locale: es }) : "No seleccionada"}</p>
						</div>
						{(form.formState.errors.startDate || form.formState.errors.endDate) && <p className="text-sm font-medium text-destructive">Por favor selecciona un rango de fechas válido</p>}
					</div>

					{/* Campos ocultos para mantener la compatibilidad con el esquema */}
					<div className="hidden">
						<FormField control={form.control} name="startDate" render={({ field }) => <input type="hidden" {...field} value={field.value?.toISOString()} />} />
						<FormField control={form.control} name="endDate" render={({ field }) => <input type="hidden" {...field} value={field.value?.toISOString()} />} />
					</div>

					<FormField
						control={form.control}
						name="teamMembers"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Miembros del Equipo</FormLabel>
								<MultiSelect
									options={users.map((userOption) => ({
										value: userOption.id || "",
										label: `${userOption.name} ${userOption.lastname}${!isEditing && userOption.id === user?.id ? " (Tú - Manager)" : ""}`,
									}))}
									selected={field.value}
									onChange={(value) => {
										// En modo creación, asegurar que el usuario actual siempre esté incluido
										let newValue = value;
										if (!isEditing && user?.id && !value.includes(user.id)) {
											newValue = [...value, user.id];
										}

										field.onChange(newValue);
										// Reset manager if not in team anymore (solo en modo edición)
										const currentManager = form.getValues("managerUserId");
										if (isEditing && currentManager && !newValue.includes(currentManager)) {
											form.setValue("managerUserId", "");
										}
									}}
									placeholder={!isEditing ? "Selecciona miembros adicionales del equipo" : "Primero selecciona los miembros del equipo"}
								/>
								{!isEditing && <p className="text-xs text-muted-foreground">Nota: Como creador del proyecto, serás automáticamente el Project Manager y no puedes removerte del equipo.</p>}
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="managerUserId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Project Manager</FormLabel>
								{!isEditing ? (
									// En modo creación, mostrar solo el usuario actual como manager (no editable)
									<div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background">
										<span>{user ? `${user.name} ${user.lastname} (Tú)` : "Usuario actual"}</span>
									</div>
								) : (
									// En modo edición, permitir cambiar el manager
									<Select onValueChange={field.onChange} value={field.value} disabled={watchTeamMembers.length === 0}>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder={watchTeamMembers.length === 0 ? "Primero selecciona el equipo" : "Selecciona el Project Manager"} />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{availableManagers.map((user) => (
												<SelectItem key={user.id} value={user.id || ""}>
													{`${user.name} ${user.lastname}`}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="categoryId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Categoría</FormLabel>
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Seleccionar categoría" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{availableTags.map((tag) => (
											<SelectItem key={tag.id} value={tag.id}>
												{tag.name}
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
						name="previousProjectId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Proyecto previo</FormLabel>
								<Select onValueChange={field.onChange} value={field.value || ""}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Seleccionar proyecto previo" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="null">Sin proyecto previo</SelectItem>
										{projects.map((project) => (
											<SelectItem key={project.id} value={String(project.id)}>
												{project.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="flex justify-end space-x-2 pt-4">
						<Button type="button" variant="outline" onClick={onCancel}>
							Cancelar
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? (isEditing ? "Actualizando..." : "Creando...") : isEditing ? "Actualizar Proyecto" : "Crear Proyecto"}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

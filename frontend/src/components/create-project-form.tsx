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
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UsersService } from "@/services/users.service";
import { TagsService } from "@/services/tags.service";
import { ProjectsService } from "@/services/project.service";
import { User } from "@/app/types/user.type";
import { Tag } from "@/app/types/tag.type";
import { BaseProject } from "@/app/types/project.type";
import { MultiSelect } from "@/components/ui/multi-select";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
	name: z.string().min(2, {
		message: "Debe tener al menos dos caracteres.",
	}),
	description: z.string().optional(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
	teamMembers: z.array(z.string()).min(1, "Se requiere al menos un miembro en el equipo"),
	managerUserId: z.string().refine((val) => val.length > 0, {
		message: "Debes seleccionar un Project Manager del equipo",
	}),
	categoryId: z.string().optional(),
});

type DateRange = {
	from: Date;
	to?: Date;
};

export default function CreateProjectForm() {
	const { toast } = useToast();
	const [users, setUsers] = useState<User[]>([]);
	const [availableTags, setAvailableTags] = useState<Tag[]>([]);
	const [loading, setLoading] = useState(false);
	const [dateRange, setDateRange] = useState<DateRange>({
		from: new Date(),
		to: addDays(new Date(), 30), // Por defecto, un mes de duración
	});

	useEffect(() => {
		const loadData = async () => {
			const usersResponse = await UsersService.getUsers();
			const tagsResponse = await TagsService.getTags();

			if (usersResponse.success && usersResponse.data) {
				setUsers(usersResponse.data);
			}

			if (tagsResponse.success && tagsResponse.data) {
				setAvailableTags(tagsResponse.data);
			}
		};

		loadData();
	}, []);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
			startDate: new Date(),
			endDate: new Date(),
			managerUserId: "",
			teamMembers: [],
			categoryId: "",
		},
	});

	// Sincronizar el rango de fechas con los campos del formulario
	useEffect(() => {
		if (dateRange.from) {
			form.setValue("startDate", dateRange.from);
		}
		if (dateRange.to) {
			form.setValue("endDate", dateRange.to || dateRange.from);
		}
	}, [dateRange, form]);

	const watchTeamMembers = form.watch("teamMembers");
	const availableManagers = users.filter((user) => watchTeamMembers.includes(user.id || ""));

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		setLoading(true);
		try {
			const manager = users.find((u) => u.id === values.managerUserId);
			const teamMembers = users.filter((u) => values.teamMembers.includes(u.id || ""));

			const projectData = {
				...values,
				startDate: values.startDate || null,
				endDate: values.endDate || null,
				managerUserName: manager?.name,
				team: teamMembers,
			};

			// @ts-expect-error: lujan
			const response = await ProjectsService.createProject(projectData as BaseProject);

			if (response.success) {
				toast({
					title: "Proyecto creado con éxito",
					variant: "default",
				});
				form.reset();
				window.location.reload();
			}
		} catch (error) {
			toast({
				title: "Error al crear el proyecto",
				variant: "destructive",
			});
			console.error("Error creating project");
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
									<Textarea placeholder="Describe el proyecto" className="resize-none" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="space-y-2">
						<FormLabel>Duración del Proyecto</FormLabel>
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
									options={users.map((user) => ({
										value: user.id || "",
										label: `${user.name} ${user.lastname}`,
									}))}
									selected={field.value}
									onChange={(value) => {
										field.onChange(value);
										// Reset manager if not in team anymore
										const currentManager = form.getValues("managerUserId");
										if (currentManager && !value.includes(currentManager)) {
											form.setValue("managerUserId", "");
										}
									}}
									placeholder="Primero selecciona los miembros del equipo"
								/>
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

					<div className="flex justify-end space-x-2 pt-4">
						<Button type="button" variant="outline">
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? "Creando..." : "Crear Proyecto"}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

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
import { format } from "date-fns";
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
		message: "Project name must be at least 2 characters.",
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

export default function CreateProjectForm() {
	const { toast } = useToast();
	const [users, setUsers] = useState<User[]>([]);
	const [availableTags, setAvailableTags] = useState<Tag[]>([]);
	const [loading, setLoading] = useState(false);

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
								<FormLabel>Project Name</FormLabel>
								<FormControl>
									<Input placeholder="Enter project name" {...field} />
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
									<Textarea placeholder="Describe the project" className="resize-none" {...field} />
								</FormControl>
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
									<FormLabel>End Date</FormLabel>
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

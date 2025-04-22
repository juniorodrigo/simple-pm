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

const formSchema = z.object({
	name: z.string().min(2, {
		message: "Project name must be at least 2 characters.",
	}),
	description: z.string().optional(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
	managerUserId: z.string().optional(),
	categoryId: z.string().optional(),
});

export default function CreateProjectForm() {
	const [users, setUsers] = useState<User[]>([]);
	const [availableTags, setAvailableTags] = useState<Tag[]>([]);

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
			categoryId: "",
		},
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const projectData = {
			...values,
			startDate: values.startDate || null,
			endDate: values.endDate || null,
		};

		const response = await ProjectsService.createProject(projectData as BaseProject);

		if (response.success) {
			// Reset form and close dialog
			form.reset();
			// Aquí podrías añadir una notificación de éxito
			window.location.reload(); // Recargar para ver el nuevo proyecto
		} else {
			// Aquí podrías añadir una notificación de error
			console.error("Error creating project");
		}
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
						name="managerUserId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Project Manager</FormLabel>
								<Select onValueChange={field.onChange} defaultValue={field.value}>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select project manager" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{users.map((user) => (
											<SelectItem key={user.id} value={user.id}>
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
						<Button type="submit">Create Project</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

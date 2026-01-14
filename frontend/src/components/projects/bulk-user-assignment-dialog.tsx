"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Users, Loader2, UserPlus } from "lucide-react";
import { UsersService } from "@/services/users.service";
import { ProjectsService } from "@/services/project.service";
import { User } from "@/types/new/usuario.type";
import { Project } from "@/types/new/project.type";
import { useToast } from "@/hooks/use-toast";
import { Role } from "@/types/enums";

interface BulkUserAssignmentDialogProps {
	onSuccess?: () => void;
	projects: Project[];
}

export default function BulkUserAssignmentDialog({ onSuccess, projects }: BulkUserAssignmentDialogProps) {
	const [open, setOpen] = useState(false);
	const [users, setUsers] = useState<User[]>([]);
	const [selectedUserId, setSelectedUserId] = useState<string>("");
	const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
	const [addToAllActivities, setAddToAllActivities] = useState(false);
	const [userSearch, setUserSearch] = useState("");
	const [projectSearch, setProjectSearch] = useState("");
	const [loading, setLoading] = useState(false);
	const [dataLoading, setDataLoading] = useState(false);
	const { toast } = useToast();

	// Cargar usuarios y proyectos al abrir el diálogo
	useEffect(() => {
		if (open) {
			loadData();
		}
	}, [open]);

	const loadData = async () => {
		setDataLoading(true);
		try {
			const usersResponse = await UsersService.getUsers();

			if (usersResponse.success && usersResponse.data) {
				// Filtrar usuarios activos que no sean visualizadores
				const activeUsers = usersResponse.data.filter((user: User) => user.role !== Role.VIEWER && user.isActive);
				setUsers(activeUsers);
			}
		} catch (error) {
			toast({
				title: "Error al cargar datos",
				description: "No se pudieron cargar los usuarios y proyectos",
				variant: "destructive",
			});
		} finally {
			setDataLoading(false);
		}
	};

	// Filtrar usuarios por búsqueda
	const filteredUsers = useMemo(() => {
		if (!userSearch) return users;
		const searchLower = userSearch.toLowerCase();
		return users.filter((user) => user.name.toLowerCase().includes(searchLower) || user.lastname.toLowerCase().includes(searchLower) || user.email.toLowerCase().includes(searchLower));
	}, [users, userSearch]);

	// Filtrar proyectos activos por búsqueda
	const filteredProjects = useMemo(() => {
		const activeProjects = projects.filter((project) => !project.archived);
		if (!projectSearch) return activeProjects;
		const searchLower = projectSearch.toLowerCase();
		return activeProjects.filter(
			(project) => project.name.toLowerCase().includes(searchLower) || project.categoryName?.toLowerCase().includes(searchLower) || project.description?.toLowerCase().includes(searchLower)
		);
	}, [projects, projectSearch]);

	// Alternar selección de proyecto
	const toggleProjectSelection = (projectId: number) => {
		setSelectedProjectIds((prev) => (prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]));
	};

	// Seleccionar/deseleccionar todos los proyectos filtrados
	const toggleAllProjects = () => {
		if (selectedProjectIds.length === filteredProjects.length) {
			setSelectedProjectIds([]);
		} else {
			setSelectedProjectIds(filteredProjects.map((p) => p.id));
		}
	};

	// Añadir usuario a proyectos seleccionados
	const handleAddToProjects = async () => {
		if (!selectedUserId) {
			toast({
				title: "Selecciona un usuario",
				description: "Debes seleccionar un usuario antes de continuar",
				variant: "destructive",
			});
			return;
		}

		if (selectedProjectIds.length === 0) {
			toast({
				title: "Selecciona al menos un proyecto",
				description: "Debes seleccionar al menos un proyecto para asignar el usuario",
				variant: "destructive",
			});
			return;
		}

		setLoading(true);
		try {
			const response = await ProjectsService.addUserToProjects(selectedUserId, selectedProjectIds, addToAllActivities);

			if (response.success && response.data) {
				const { results, addedToActivities } = response.data;

				// Contar proyectos añadidos exitosamente
				const addedCount = results.filter((r: any) => r.added).length;
				const failedCount = results.filter((r: any) => !r.added).length;

				// Construir mensaje descriptivo
				let description = `Se añadió el usuario a ${addedCount} de ${selectedProjectIds.length} proyecto(s)`;

				if (addedToActivities) {
					description += " y todas sus actividades";
				}

				if (failedCount > 0) {
					const failedProjects = results.filter((r: any) => !r.added);
					const reasons = failedProjects.map((p: any) => `${p.projectName}: ${p.message || "Error desconocido"}`).join(", ");
					description += `\n\nNo añadidos (${failedCount}): ${reasons}`;
				}

				toast({
					title: addedCount > 0 ? "Operación completada" : "No se pudo añadir el usuario",
					description: description,
					variant: addedCount > 0 ? "default" : "destructive",
				});

				if (addedCount > 0) {
					handleClose();
					onSuccess?.();
				}
			} else {
				toast({
					title: "Error al añadir usuario",
					description: response.message || "No se pudo completar la operación",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Ocurrió un error al procesar la solicitud",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	// Cerrar y limpiar el diálogo
	const handleClose = () => {
		setOpen(false);
		setSelectedUserId("");
		setSelectedProjectIds([]);
		setAddToAllActivities(false);
		setUserSearch("");
		setProjectSearch("");
	};

	const selectedUser = users.find((u) => u.id === selectedUserId);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" className="gap-2">
					<UserPlus className="h-4 w-4" />
					Asignar Usuario a Proyectos
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[90vh]">
				<DialogHeader>
					<DialogTitle>Asignación Masiva de Usuario</DialogTitle>
					<DialogDescription>Selecciona un usuario y los proyectos a los que deseas añadirlo. Se excluyen usuarios con rol "Visualizador".</DialogDescription>
				</DialogHeader>

				{dataLoading ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : (
					<div className="grid grid-cols-2 gap-6">
						{/* Sección de Usuarios */}
						<div className="space-y-4">
							<div>
								<Label htmlFor="user-search" className="text-base font-semibold">
									1. Selecciona un Usuario
								</Label>
								<div className="relative mt-2">
									<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input id="user-search" placeholder="Buscar por nombre o email..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-8" />
								</div>
							</div>

							<ScrollArea className="h-[350px] rounded-md border p-4">
								{filteredUsers.length === 0 ? (
									<p className="text-sm text-muted-foreground text-center py-8">No se encontraron usuarios</p>
								) : (
									<div className="space-y-2">
										{filteredUsers.map((user) => (
											<div
												key={user.id}
												onClick={() => setSelectedUserId(user.id)}
												className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedUserId === user.id ? "bg-primary/10 border-primary" : "hover:bg-muted"}`}
											>
												<div className="font-medium">
													{user.name} {user.lastname}
												</div>
												<div className="text-sm text-muted-foreground">{user.email}</div>
											</div>
										))}
									</div>
								)}
							</ScrollArea>

							{selectedUser && (
								<div className="p-3 rounded-lg bg-muted">
									<div className="text-sm font-medium">Usuario seleccionado:</div>
									<div className="text-sm">
										{selectedUser.name} {selectedUser.lastname}
									</div>
								</div>
							)}
						</div>

						{/* Sección de Proyectos */}
						<div className="space-y-4">
							<div>
								<Label htmlFor="project-search" className="text-base font-semibold">
									2. Selecciona los Proyectos
								</Label>
								<div className="relative mt-2">
									<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
									<Input id="project-search" placeholder="Buscar proyectos..." value={projectSearch} onChange={(e) => setProjectSearch(e.target.value)} className="pl-8" />
								</div>
							</div>

							{filteredProjects.length > 0 && (
								<div className="flex items-center space-x-2">
									<Checkbox id="select-all" checked={selectedProjectIds.length === filteredProjects.length} onCheckedChange={toggleAllProjects} />
									<Label htmlFor="select-all" className="text-sm font-normal cursor-pointer">
										Seleccionar todos ({filteredProjects.length})
									</Label>
								</div>
							)}

							<ScrollArea className="h-[300px] rounded-md border p-4">
								{filteredProjects.length === 0 ? (
									<p className="text-sm text-muted-foreground text-center py-8">No se encontraron proyectos</p>
								) : (
									<div className="space-y-2">
										{filteredProjects.map((project) => (
											<div key={project.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted transition-colors">
												<Checkbox id={`project-${project.id}`} checked={selectedProjectIds.includes(project.id)} onCheckedChange={() => toggleProjectSelection(project.id)} />
												<Label htmlFor={`project-${project.id}`} className="flex-1 cursor-pointer space-y-1">
													<div className="font-medium">{project.name}</div>
													{project.categoryName && <div className="text-xs text-muted-foreground">{project.categoryName}</div>}
													{project.description && <div className="text-xs text-muted-foreground line-clamp-1">{project.description}</div>}
												</Label>
											</div>
										))}
									</div>
								)}
							</ScrollArea>

							<div className="p-3 rounded-lg bg-muted">
								<div className="text-sm">
									<span className="font-medium">{selectedProjectIds.length}</span> proyecto(s) seleccionado(s)
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Botones de Acción */}
				<div className="flex justify-between items-center pt-4 border-t">
					<div className="flex items-center gap-4">
						<Button variant="outline" onClick={handleClose} disabled={loading}>
							Cancelar
						</Button>
						<div className="flex items-center space-x-2">
							<Checkbox id="add-to-activities" checked={addToAllActivities} onCheckedChange={(checked) => setAddToAllActivities(checked as boolean)} disabled={loading} />
							<Label htmlFor="add-to-activities" className="text-sm font-normal cursor-pointer">
								Añadir a todas las actividades
							</Label>
						</div>
					</div>
					<Button onClick={handleAddToProjects} disabled={loading || !selectedUserId || selectedProjectIds.length === 0}>
						{loading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Procesando...
							</>
						) : (
							<>
								<Users className="mr-2 h-4 w-4" />
								Añadir a Proyectos
							</>
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}

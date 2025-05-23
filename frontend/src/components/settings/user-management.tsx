"use client";

import { useEffect, useState } from "react";
import { User } from "@/app/types/user.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Edit, Check, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UsersService } from "@/services/users.service";
import { useToast } from "@/hooks/use-toast";
import { Role } from "@/app/types/enums";
import { RoleManagement } from "./role-management";
import { UserFormModal } from "./modals/user-form-modal";

// Define user type
type DisplayUser = {
	id: string;
	name: string;
	lastname: string;
	username: string;
	email: string;
	role: Role;
	status: "active" | "inactive";
	lastActive?: Date;
};

// Define role type with descriptions
type RoleDefinition = {
	id: Role;
	name: string;
	description: string;
	permissions: string[];
};

export default function UserManagement() {
	const [users, setUsers] = useState<DisplayUser[]>([]);
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [userToDelete, setUserToDelete] = useState<DisplayUser | null>(null);

	useEffect(() => {
		const fetchUsers = async () => {
			const response = await UsersService.getUsers();
			const mappedUsers: DisplayUser[] = response.data.map((user: User) => ({
				id: user.id,
				name: user.name,
				lastname: user.lastname,
				username: user.username,
				email: user.email,
				role: user.role.toLowerCase() as Role,
				status: user.isActive ? "active" : "inactive",
				lastActive: user.lastActive || undefined,
			}));
			setUsers(mappedUsers);
		};

		fetchUsers();
	}, []);

	// Role definitions with permissions
	const roles: RoleDefinition[] = [
		{
			id: Role.ADMIN,
			name: "Administrador",
			description: "Acceso completo a todas las funciones y configuraciones",
			permissions: [
				"Gestionar usuarios y roles",
				"Crear y gestionar proyectos",
				"Crear y gestionar actividades",
				"Ver todos los proyectos y actividades",
				"Gestionar etiquetas",
				"Acceder a configuraciones del sistema",
			],
		},
		{
			id: Role.EDITOR,
			name: "Editor",
			description: "Puede crear y editar proyectos y actividades",
			permissions: ["Crear y gestionar proyectos", "Crear y gestionar actividades", "Ver todos los proyectos y actividades", "Gestionar etiquetas"],
		},
		{
			id: Role.VIEWER,
			name: "Visualizador",
			description: "Acceso de solo lectura a proyectos y actividades",
			permissions: ["Ver todos los proyectos y actividades"],
		},
	];

	const [searchQuery, setSearchQuery] = useState("");
	const [editingUser, setEditingUser] = useState<DisplayUser | null>(null);
	const [newUser, setNewUser] = useState({
		name: "",
		lastname: "",
		username: "",
		email: "",
		role: Role.EDITOR,
		status: "active" as "active" | "inactive",
	});
	const [isAddingUser, setIsAddingUser] = useState(false);

	// Filter users based on search query
	const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()));

	const isValidEmail = (email: string) => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	};

	// Handle adding a new user
	const handleAddUser = async () => {
		if (!newUser.name || !newUser.email) {
			toast({
				variant: "destructive",
				description: "Por favor complete todos los campos requeridos",
			});
			return;
		}

		if (!isValidEmail(newUser.email)) {
			toast({
				variant: "destructive",
				description: "Por favor ingrese un correo electrónico válido",
			});
			return;
		}

		setIsLoading(true);

		try {
			const response = await UsersService.createUser(newUser.username, newUser.name, newUser.lastname, newUser.email, newUser.role, newUser.status === "active");

			if (response.success) {
				const createdUser: DisplayUser = {
					id: response.data.id,
					name: `${response.data.name}`,
					lastname: response.data.lastname,
					username: response.data.username,
					email: response.data.email,
					role: response.data.role.toLowerCase() as Role,
					status: response.data.isActive ? "active" : "inactive",
					lastActive: new Date(),
				};

				setUsers([...users, createdUser]);
				setNewUser({
					name: "",
					email: "",
					lastname: "",
					username: "",
					role: Role.VIEWER,
					status: "active",
				});
				setIsAddingUser(false);
				toast({ description: "Usuario creado correctamente" });
			} else {
				toast({
					variant: "destructive",
					title: "Error al crear usuario",
					description: response.error,
				});
			}
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Ocurrió un error al crear el usuario",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Handle updating a user
	const handleUpdateUser = async () => {
		if (!editingUser) return;

		setIsLoading(true);
		try {
			const userToUpdate = {
				id: editingUser.id,
				name: editingUser.name,
				lastname: editingUser.lastname,
				username: editingUser.username,
				email: editingUser.email,
				role: editingUser.role,
				isActive: editingUser.status === "active",
				createdAt: null,
				updatedAt: null,
				deletedAt: null,
				lastActive: null,
				ProjectMember: undefined,
			};

			const response = await UsersService.updateUser(editingUser.id, userToUpdate);

			if (response.success) {
				setUsers(
					users.map((user) =>
						user.id === editingUser.id
							? {
									...editingUser,
									lastActive: new Date(),
							  }
							: user
					)
				);
				setEditingUser(null); // Esto cerrará automáticamente el modal debido al onOpenChange
				toast({ description: "Usuario actualizado correctamente" });
			} else {
				toast({
					variant: "destructive",
					title: "Error al actualizar usuario",
					description: response.error || "No se pudo actualizar el usuario",
				});
			}
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Ocurrió un error al actualizar el usuario",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Handle deleting a user
	const handleDeleteUser = async (user: DisplayUser) => {
		const response = await UsersService.deleteUser(user.id);
		if (response.success) {
			setUsers(users.filter((u) => u.id !== user.id));
			toast({ description: "Usuario eliminado correctamente" });
			setUserToDelete(null);
		} else {
			toast({
				variant: "destructive",
				title: "Error al eliminar usuario",
				description: response.error,
			});
		}
	};

	// Get role badge color
	const getRoleBadgeColor = (role: string) => {
		switch (role) {
			case "admin":
				return "bg-purple-100 text-purple-800 border-purple-200";
			case "editor":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "viewer":
				return "bg-green-100 text-green-800 border-green-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	// Get status badge color
	const getStatusBadgeColor = (status: string) => {
		switch (status) {
			case "active":
				return "bg-green-100 text-green-800 border-green-200";
			case "inactive":
				return "bg-gray-100 text-gray-800 border-gray-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	// Get initials from name
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((part) => part[0])
			.join("")
			.toUpperCase();
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Gestión de Usuarios</CardTitle>
					<CardDescription>Gestionar usuarios y sus roles en el sistema</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
						<div className="relative w-full md:w-64">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input type="search" placeholder="Buscar usuarios..." className="w-full pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
						</div>
						<Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
							<DialogTrigger asChild>
								<Button>
									<UserPlus className="mr-2 h-4 w-4" />
									Añadir Usuario
								</Button>
							</DialogTrigger>
							<UserFormModal open={isAddingUser} onOpenChange={setIsAddingUser} roles={roles} user={newUser} onUserChange={setNewUser} onSubmit={handleAddUser} isLoading={isLoading} mode="create" />
						</Dialog>
					</div>

					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Usuario</TableHead>
									<TableHead>Rol</TableHead>
									<TableHead>Estado</TableHead>
									<TableHead>Última Actividad</TableHead>
									<TableHead className="text-right">Acciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredUsers.map((user) => (
									<TableRow key={user.id}>
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="h-8 w-8">
													<AvatarImage src="/placeholder-user.jpg" alt={user.name} />
													<AvatarFallback>{getInitials(user.name)}</AvatarFallback>
												</Avatar>
												<div>
													<div className="font-medium">{user.name + " " + user.lastname}</div>
													<div className="text-sm text-muted-foreground">{user.email}</div>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="outline" className={getRoleBadgeColor(user.role)}>
												{roles.find((r) => r.id === user.role)?.name || user.role}
											</Badge>
										</TableCell>
										<TableCell>
											<Badge variant="outline" className={getStatusBadgeColor(user.status)}>
												{user.status}
											</Badge>
										</TableCell>
										<TableCell>{user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Nunca"}</TableCell>
										<TableCell className="text-right">
											<Dialog>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon">
															<Edit className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Acciones</DropdownMenuLabel>
														<DropdownMenuSeparator />
														<DialogTrigger asChild>
															<DropdownMenuItem
																onClick={() => {
																	setEditingUser({
																		...user,
																		name: user.name,
																		lastname: user.lastname,
																		username: user.username,
																	});
																}}
															>
																Editar Usuario
															</DropdownMenuItem>
														</DialogTrigger>
														<DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setUserToDelete(user)}>
															Eliminar Usuario
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
												<UserFormModal
													open={!!editingUser}
													onOpenChange={(open) => !open && setEditingUser(null)}
													roles={roles}
													user={editingUser || newUser}
													onUserChange={setEditingUser}
													onSubmit={handleUpdateUser}
													isLoading={isLoading}
													mode="edit"
												/>
											</Dialog>
										</TableCell>
									</TableRow>
								))}
								{filteredUsers.length === 0 && (
									<TableRow>
										<TableCell colSpan={5} className="text-center py-6">
											No se encontraron usuarios
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			<RoleManagement
				roles={roles}
				userCounts={Object.values(Role).reduce(
					(acc, role) => ({
						...acc,
						[role]: users.filter((user) => user.role === role).length,
					}),
					{} as Record<Role, number>
				)}
				getRoleBadgeColor={getRoleBadgeColor}
			/>

			<Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirmar eliminación</DialogTitle>
						<DialogDescription>¿Está seguro que desea eliminar al usuario {userToDelete?.name}? Esta acción no se puede deshacer.</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setUserToDelete(null)}>
							Cancelar
						</Button>
						<Button variant="destructive" onClick={() => userToDelete && handleDeleteUser(userToDelete)}>
							Eliminar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

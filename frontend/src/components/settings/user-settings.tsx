"use client";

import { useEffect, useState } from "react";
import { User, UserCreate } from "@/types/user.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Edit, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserService } from "@/services/user.service";
import { useToast } from "@/hooks/use-toast";
import { Role } from "@/types/base";
import { UserFormModal } from "./modals/user";
import type { UserFormData } from "./modals/user";

interface DisplayUser {
	id: string;
	name: string;
	lastname: string;
	email: string;
	role: Role;
	isActive: boolean;
	area: {
		id: string;
		name: string;
	};
	lastActive?: Date;
}

interface RoleDefinition {
	id: Role;
	name: string;
	description: string;
	permissions: string[];
}

export default function UserManagement() {
	const [users, setUsers] = useState<DisplayUser[]>([]);
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [userToDelete, setUserToDelete] = useState<DisplayUser | null>(null);

	useEffect(() => {
		const fetchUsers = async () => {
			const response = await UserService.getAll();
			if (response.success && response.data) {
				const mappedUsers: DisplayUser[] = response.data.map((user: User) => ({
					id: user.id,
					name: user.name,
					lastname: user.lastname,
					email: user.email,
					role: user.role,
					isActive: user.isActive,
					area: user.area,
					lastActive: undefined,
				}));
				setUsers(mappedUsers);
			} else {
				toast({
					variant: "destructive",
					description: "Error al cargar usuarios",
				});
			}
		};

		fetchUsers();
	}, [toast]);

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
			id: Role.USER,
			name: "Usuario",
			description: "Acceso de solo lectura a proyectos y actividades",
			permissions: ["Ver todos los proyectos y actividades"],
		},
	];

	const [searchQuery, setSearchQuery] = useState("");
	const [editingUser, setEditingUser] = useState<DisplayUser | null>(null);
	const [newUser, setNewUser] = useState<UserFormData>({
		name: "",
		lastname: "",
		email: "",
		role: Role.USER,
		isActive: true,
		areaId: "",
		area: {
			id: "",
			name: "",
		},
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
			const userCreateData: UserCreate = {
				name: newUser.name,
				lastname: newUser.lastname,
				email: newUser.email,
				role: newUser.role,
				isActive: newUser.isActive,
				areaId: newUser.areaId,
			};

			const response = await UserService.createUser(userCreateData);

			if (response.success && response.data) {
				const createdUser: DisplayUser = {
					id: response.data.id,
					name: response.data.name,
					lastname: response.data.lastname,
					email: response.data.email,
					role: response.data.role,
					isActive: response.data.isActive,
					area: response.data.area,
					lastActive: undefined,
				};

				setUsers([...users, createdUser]);
				setNewUser({
					name: "",
					lastname: "",
					email: "",
					role: Role.USER,
					isActive: true,
					areaId: "",
					area: {
						id: "",
						name: "",
					},
				});
				setIsAddingUser(false);
				toast({ description: "Usuario creado correctamente" });
			} else {
				toast({
					variant: "destructive",
					title: "Error al crear usuario",
					description: response.message,
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
			const userUpdateData: UserCreate = {
				name: editingUser.name,
				lastname: editingUser.lastname,
				email: editingUser.email,
				role: editingUser.role,
				isActive: editingUser.isActive,
				areaId: editingUser.area.id,
			};

			const response = await UserService.updateUser(editingUser.id, userUpdateData);

			if (response.success && response.data) {
				setUsers(
					users.map((user) =>
						user.id === editingUser.id
							? {
									id: editingUser.id,
									name: editingUser.name,
									lastname: editingUser.lastname,
									email: editingUser.email,
									role: editingUser.role,
									isActive: editingUser.isActive,
									area: editingUser.area,
									lastActive: undefined,
							  }
							: user
					)
				);
				setEditingUser(null);
				toast({ description: "Usuario actualizado correctamente" });
			} else {
				toast({
					variant: "destructive",
					title: "Error al actualizar usuario",
					description: response.message || "No se pudo actualizar el usuario",
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
		const response = await UserService.deleteUser(user.id);
		if (response.success) {
			setUsers(users.filter((u) => u.id !== user.id));
			toast({ description: "Usuario eliminado correctamente" });
			setUserToDelete(null);
		} else {
			toast({
				variant: "destructive",
				title: "Error al eliminar usuario",
				description: response.message,
			});
		}
	};

	// Get role badge color
	const getRoleBadgeColor = (role: Role) => {
		switch (role) {
			case Role.ADMIN:
				return "bg-purple-100 text-purple-800 border-purple-200";
			case Role.EDITOR:
				return "bg-blue-100 text-blue-800 border-blue-200";
			case Role.USER:
				return "bg-green-100 text-green-800 border-green-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	// Get status badge color
	const getStatusBadgeColor = (isActive: boolean) => {
		return isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200";
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
											<Badge variant="outline" className={getStatusBadgeColor(user.isActive)}>
												{user.isActive ? "Activo" : "Inactivo"}
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
																	setEditingUser(user);
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
													user={{
														name: editingUser?.name || "",
														lastname: editingUser?.lastname || "",
														email: editingUser?.email || "",
														role: editingUser?.role || Role.USER,
														isActive: editingUser?.isActive || true,
														areaId: editingUser?.area.id || "",
														area: editingUser?.area || { id: "", name: "" },
													}}
													onUserChange={(user: UserFormData) => {
														if (editingUser) {
															setEditingUser({
																id: editingUser.id,
																name: user.name,
																lastname: user.lastname,
																email: user.email,
																role: user.role,
																isActive: user.isActive,
																area: user.area,
																lastActive: editingUser.lastActive,
															});
														}
													}}
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

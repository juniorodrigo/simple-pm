"use client";

import { useState } from "react";
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

// Define user type
type User = {
	id: string;
	name: string;
	email: string;
	role: "admin" | "editor" | "viewer";
	status: "active" | "inactive";
	lastActive?: string;
};

// Define role type with descriptions
type Role = {
	id: "admin" | "editor" | "viewer";
	name: string;
	description: string;
	permissions: string[];
};

export default function UserManagement() {
	// Mock data for users
	const [users, setUsers] = useState<User[]>([
		{
			id: "1",
			name: "John Doe",
			email: "john.doe@example.com",
			role: "admin",
			status: "active",
			lastActive: "2023-11-15T10:30:00",
		},
		{
			id: "2",
			name: "Jane Smith",
			email: "jane.smith@example.com",
			role: "editor",
			status: "active",
			lastActive: "2023-11-14T15:45:00",
		},
		{
			id: "3",
			name: "Robert Johnson",
			email: "robert.johnson@example.com",
			role: "viewer",
			status: "active",
			lastActive: "2023-11-10T09:15:00",
		},
		{
			id: "4",
			name: "Emily Davis",
			email: "emily.davis@example.com",
			role: "editor",
			status: "inactive",
			lastActive: "2023-10-25T11:20:00",
		},
	]);

	// Role definitions with permissions
	const roles: Role[] = [
		{
			id: "admin",
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
			id: "editor",
			name: "Editor",
			description: "Puede crear y editar proyectos y actividades",
			permissions: ["Crear y gestionar proyectos", "Crear y gestionar actividades", "Ver todos los proyectos y actividades", "Gestionar etiquetas"],
		},
		{
			id: "viewer",
			name: "Visualizador",
			description: "Acceso de solo lectura a proyectos y actividades",
			permissions: ["Ver todos los proyectos y actividades"],
		},
	];

	const [searchQuery, setSearchQuery] = useState("");
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [newUser, setNewUser] = useState<Partial<User>>({
		name: "",
		email: "",
		role: "viewer",
		status: "active",
	});
	const [isAddingUser, setIsAddingUser] = useState(false);

	// Filter users based on search query
	const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()));

	// Handle adding a new user
	const handleAddUser = () => {
		if (!newUser.name || !newUser.email) return;

		const user: User = {
			id: `${users.length + 1}`,
			name: newUser.name,
			email: newUser.email,
			role: newUser.role as "admin" | "editor" | "viewer",
			status: newUser.status as "active" | "inactive",
			lastActive: new Date().toISOString(),
		};

		setUsers([...users, user]);
		setNewUser({
			name: "",
			email: "",
			role: "viewer",
			status: "active",
		});
		setIsAddingUser(false);
	};

	// Handle updating a user
	const handleUpdateUser = () => {
		if (!editingUser) return;

		setUsers(users.map((user) => (user.id === editingUser.id ? editingUser : user)));
		setEditingUser(null);
	};

	// Handle deleting a user
	const handleDeleteUser = (id: string) => {
		setUsers(users.filter((user) => user.id !== id));
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
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Añadir Nuevo Usuario</DialogTitle>
									<DialogDescription>Añade un nuevo usuario al sistema y asígnale un rol</DialogDescription>
								</DialogHeader>
								<div className="space-y-4 py-4">
									<div className="space-y-2">
										<Label htmlFor="name">Nombre</Label>
										<Input id="name" placeholder="Ingresa nombre de usuario" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
									</div>
									<div className="space-y-2">
										<Label htmlFor="email">Correo electrónico</Label>
										<Input id="email" type="email" placeholder="Ingresa correo electrónico" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
									</div>
									<div className="space-y-2">
										<Label htmlFor="role">Rol</Label>
										<Select
											value={newUser.role}
											onValueChange={(value) =>
												setNewUser({
													...newUser,
													role: value as "admin" | "editor" | "viewer",
												})
											}
										>
											<SelectTrigger id="role">
												<SelectValue placeholder="Seleccionar rol" />
											</SelectTrigger>
											<SelectContent>
												{roles.map((role) => (
													<SelectItem key={role.id} value={role.id}>
														{role.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label htmlFor="status">Estado</Label>
										<Select
											value={newUser.status}
											onValueChange={(value) =>
												setNewUser({
													...newUser,
													status: value as "active" | "inactive",
												})
											}
										>
											<SelectTrigger id="status">
												<SelectValue placeholder="Seleccionar estado" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="active">Activo</SelectItem>
												<SelectItem value="inactive">Inactivo</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
								<DialogFooter>
									<Button variant="outline" onClick={() => setIsAddingUser(false)}>
										Cancelar
									</Button>
									<Button onClick={handleAddUser}>Añadir Usuario</Button>
								</DialogFooter>
							</DialogContent>
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
													<div className="font-medium">{user.name}</div>
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
															<DropdownMenuItem onClick={() => setEditingUser({ ...user })}>Editar Usuario</DropdownMenuItem>
														</DialogTrigger>
														<DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteUser(user.id)}>
															Eliminar Usuario
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>Editar Usuario</DialogTitle>
														<DialogDescription>Actualizar información y rol del usuario</DialogDescription>
													</DialogHeader>
													{editingUser && (
														<div className="space-y-4 py-4">
															<div className="space-y-2">
																<Label htmlFor="edit-name">Nombre</Label>
																<Input
																	id="edit-name"
																	value={editingUser.name}
																	onChange={(e) =>
																		setEditingUser({
																			...editingUser,
																			name: e.target.value,
																		})
																	}
																/>
															</div>
															<div className="space-y-2">
																<Label htmlFor="edit-email">Correo electrónico</Label>
																<Input
																	id="edit-email"
																	type="email"
																	value={editingUser.email}
																	onChange={(e) =>
																		setEditingUser({
																			...editingUser,
																			email: e.target.value,
																		})
																	}
																/>
															</div>
															<div className="space-y-2">
																<Label htmlFor="edit-role">Rol</Label>
																<Select
																	value={editingUser.role}
																	onValueChange={(value) =>
																		setEditingUser({
																			...editingUser,
																			role: value as "admin" | "editor" | "viewer",
																		})
																	}
																>
																	<SelectTrigger id="edit-role">
																		<SelectValue placeholder="Seleccionar rol" />
																	</SelectTrigger>
																	<SelectContent>
																		{roles.map((role) => (
																			<SelectItem key={role.id} value={role.id}>
																				{role.name}
																			</SelectItem>
																		))}
																	</SelectContent>
																</Select>
															</div>
															<div className="space-y-2">
																<Label htmlFor="edit-status">Estado</Label>
																<Select
																	value={editingUser.status}
																	onValueChange={(value) =>
																		setEditingUser({
																			...editingUser,
																			status: value as "active" | "inactive",
																		})
																	}
																>
																	<SelectTrigger id="edit-status">
																		<SelectValue placeholder="Seleccionar estado" />
																	</SelectTrigger>
																	<SelectContent>
																		<SelectItem value="active">Activo</SelectItem>
																		<SelectItem value="inactive">Inactivo</SelectItem>
																	</SelectContent>
																</Select>
															</div>
														</div>
													)}
													<DialogFooter>
														<Button variant="outline" onClick={() => setEditingUser(null)}>
															Cancelar
														</Button>
														<Button onClick={handleUpdateUser}>Guardar Cambios</Button>
													</DialogFooter>
												</DialogContent>
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

			<Card>
				<CardHeader>
					<CardTitle>Gestión de Roles</CardTitle>
					<CardDescription>Ver y entender los diferentes roles y sus permisos</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						{roles.map((role) => (
							<div key={role.id} className="border rounded-lg p-4">
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2">
										<Badge variant="outline" className={getRoleBadgeColor(role.id)}>
											{role.name}
										</Badge>
										<span className="text-sm text-muted-foreground">{role.description}</span>
									</div>
									<Badge variant="outline">{users.filter((user) => user.role === role.id).length} usuarios</Badge>
								</div>
								<div className="mt-4">
									<h4 className="text-sm font-medium mb-2">Permisos:</h4>
									<ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
										{role.permissions.map((permission, index) => (
											<li key={index} className="flex items-center text-sm">
												<Check className="h-4 w-4 mr-2 text-green-500" />
												{permission}
											</li>
										))}
									</ul>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

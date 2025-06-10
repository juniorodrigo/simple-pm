"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Edit, Plus, Trash2, Loader2, Users, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserService } from "@/services/new/user.service";
import { SelectService } from "@/services/select.service";
import { useToast } from "@/hooks/use-toast";
import { Role } from "@/types/base";
import { UserFormModal } from "./usuario.modal";
import { User, UserCreate, DisplayUser, RoleDefinition, UserFormData } from "@/types/new/usuario.type";

export default function UserManagement() {
	const { toast } = useToast();
	const [users, setUsers] = useState<DisplayUser[]>([]);
	const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [editingUser, setEditingUser] = useState<DisplayUser | null>(null);
	const [userToDelete, setUserToDelete] = useState<DisplayUser | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [formData, setFormData] = useState<UserFormData>({
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
	const [validationError, setValidationError] = useState<string>("");

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
		{
			id: Role.GERENTE_AREA,
			name: "Gerente de Área",
			description: "Puede gestionar proyectos y actividades de su área",
			permissions: ["Crear y gestionar proyectos", "Crear y gestionar actividades", "Ver todos los proyectos y actividades", "Gestionar etiquetas"],
		},
		{
			id: Role.GERENTE_GENERAL,
			name: "Gerente General",
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
	];

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			setIsLoading(true);
			const [usersResponse, areasResponse] = await Promise.all([UserService.getAll(), SelectService.getAreas()]);

			if (usersResponse.success && usersResponse.data) {
				const mappedUsers: DisplayUser[] = usersResponse.data.map((user: User) => ({
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
				throw new Error(usersResponse.message || "Error al cargar usuarios");
			}

			if (areasResponse.success && areasResponse.data) {
				setAreas(areasResponse.data);
			}
		} catch (error) {
			console.error("Error cargando datos:", error);
			toast({
				title: "Error al cargar",
				description: "No se pudieron cargar los datos. Por favor, intenta de nuevo.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const validateForm = (): boolean => {
		setValidationError("");

		if (!formData.name.trim()) {
			setValidationError("El nombre es obligatorio");
			return false;
		}

		if (!formData.lastname.trim()) {
			setValidationError("El apellido es obligatorio");
			return false;
		}

		if (!formData.email.trim()) {
			setValidationError("El correo electrónico es obligatorio");
			return false;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) {
			setValidationError("Por favor ingrese un correo electrónico válido");
			return false;
		}

		if (!formData.areaId) {
			setValidationError("Debe seleccionar un área");
			return false;
		}

		// Verificar si ya existe un usuario con ese email
		const existingUser = users.find((user) => user.email.toLowerCase().trim() === formData.email.toLowerCase().trim() && user.id !== editingUser?.id);

		if (existingUser) {
			setValidationError("Ya existe un usuario con ese correo electrónico");
			return false;
		}

		return true;
	};

	const handleOpenModal = (user?: DisplayUser) => {
		if (user) {
			setEditingUser(user);
			setFormData({
				name: user.name,
				lastname: user.lastname,
				email: user.email,
				role: user.role,
				isActive: user.isActive,
				areaId: user.area.id,
				area: user.area,
			});
		} else {
			setEditingUser(null);
			setFormData({
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
		}
		setValidationError("");
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingUser(null);
		setFormData({
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
		setValidationError("");
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		try {
			setIsSubmitting(true);

			const userCreateData: UserCreate = {
				name: formData.name.trim(),
				lastname: formData.lastname.trim(),
				email: formData.email.trim(),
				role: formData.role,
				isActive: formData.isActive,
				areaId: formData.areaId,
			};

			if (editingUser) {
				// Actualizar usuario
				const response = await UserService.updateUser(editingUser.id, userCreateData);

				if (response.success && response.data) {
					setUsers(
						users.map((user) =>
							user.id === editingUser.id
								? {
										id: editingUser.id,
										name: formData.name,
										lastname: formData.lastname,
										email: formData.email,
										role: formData.role,
										isActive: formData.isActive,
										area: formData.area,
										lastActive: undefined,
								  }
								: user
						)
					);
					toast({
						title: "¡Usuario actualizado!",
						description: `El usuario "${formData.name} ${formData.lastname}" se ha actualizado exitosamente.`,
					});
					handleCloseModal();
				} else {
					throw new Error(response.message || "Error al actualizar el usuario");
				}
			} else {
				// Crear nuevo usuario
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
					toast({
						title: "¡Usuario creado!",
						description: `El usuario "${formData.name} ${formData.lastname}" se ha creado exitosamente.`,
					});
					handleCloseModal();
				} else {
					throw new Error(response.message || "Error al crear el usuario");
				}
			}
		} catch (error) {
			console.error("Error en submit:", error);
			toast({
				title: editingUser ? "Error al actualizar" : "Error al crear",
				description: "No se pudo completar la operación. Por favor, intenta de nuevo.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteUser = async (user: DisplayUser) => {
		try {
			setIsSubmitting(true);
			const response = await UserService.deleteUser(user.id);

			if (response.success) {
				setUsers(users.filter((u) => u.id !== user.id));
				toast({
					title: "Usuario eliminado",
					description: `El usuario "${user.name} ${user.lastname}" ha sido eliminado exitosamente.`,
				});
				setUserToDelete(null);
			} else {
				throw new Error(response.message || "Error al eliminar el usuario");
			}
		} catch (error) {
			console.error("Error eliminando usuario:", error);
			toast({
				title: "Error al eliminar",
				description: "No se pudo eliminar el usuario. Por favor, intenta de nuevo.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Utility functions
	const getRoleBadgeColor = (role: Role) => {
		switch (role) {
			case Role.ADMIN:
				return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200";
			case Role.EDITOR:
				return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";
			case Role.USER:
				return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
		}
	};

	const getStatusBadgeColor = (isActive: boolean) => {
		return isActive ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200" : "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
	};

	const getInitials = (name: string, lastname: string) => {
		console.log(name, lastname);
		const initials = `${name[0]}${lastname[0]}`.toUpperCase();
		return initials;
	};

	const filteredUsers = users.filter(
		(user) =>
			user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
			user.area.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="flex flex-col items-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					<p className="text-muted-foreground">Cargando usuarios...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8 max-w-7xl mx-auto">
			{/* Formulario de creación rápida */}
			<Card className="shadow-sm">
				<CardHeader className="pb-4">
					<CardTitle className="text-lg flex items-center space-x-2">
						<Plus className="h-5 w-5" />
						<span>Nuevo Usuario</span>
					</CardTitle>
					<CardDescription>Crea un nuevo usuario en el sistema</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{validationError && (
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>{validationError}</AlertDescription>
						</Alert>
					)}

					<div className="grid grid-cols-1 md:grid-cols-6 gap-4">
						<div>
							<Label htmlFor="quick-user-name" className="text-sm font-medium">
								Nombre
							</Label>
							<Input id="quick-user-name" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} placeholder="Nombre" className="mt-1" maxLength={50} />
						</div>

						<div>
							<Label htmlFor="quick-user-lastname" className="text-sm font-medium">
								Apellido
							</Label>
							<Input
								id="quick-user-lastname"
								value={formData.lastname}
								onChange={(e) => setFormData((prev) => ({ ...prev, lastname: e.target.value }))}
								placeholder="Apellido"
								className="mt-1"
								maxLength={50}
							/>
						</div>

						<div>
							<Label htmlFor="quick-user-email" className="text-sm font-medium">
								Email
							</Label>
							<Input
								id="quick-user-email"
								type="email"
								value={formData.email}
								onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
								placeholder="usuario@ejemplo.com"
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="quick-user-area" className="text-sm font-medium">
								Área
							</Label>
							<Select
								value={formData.areaId}
								onValueChange={(value) =>
									setFormData((prev) => ({
										...prev,
										areaId: value,
										area: {
											id: value,
											name: areas.find((area) => area.id === value)?.name || "",
										},
									}))
								}
							>
								<SelectTrigger className="mt-1">
									<SelectValue placeholder="Seleccionar..." />
								</SelectTrigger>
								<SelectContent>
									{areas.map((area) => (
										<SelectItem key={area.id} value={area.id}>
											{area.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="quick-user-role" className="text-sm font-medium">
								Rol
							</Label>
							<Select value={formData.role} onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value as Role }))}>
								<SelectTrigger className="mt-1">
									<SelectValue />
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

						<div className="flex items-end">
							<Button onClick={handleSubmit} disabled={isSubmitting || !formData.name.trim() || !formData.email.trim()} className="w-full">
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Creando...
									</>
								) : (
									<>
										<Plus className="mr-2 h-4 w-4" />
										Crear Usuario
									</>
								)}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Lista de usuarios */}
			<Card className="shadow-sm">
				<CardHeader className="pb-4">
					<div className="flex flex-col md:flex-row justify-between gap-4">
						<div>
							<CardTitle className="text-lg flex items-center space-x-2">
								<Users className="h-5 w-5" />
								<span>Usuarios Existentes</span>
							</CardTitle>
							<CardDescription>
								{users.length > 0 ? `Tienes ${users.length} ${users.length === 1 ? "usuario" : "usuarios"} registrado${users.length === 1 ? "" : "s"}` : "No tienes usuarios registrados aún"}
							</CardDescription>
						</div>

						<div className="flex gap-2">
							<div className="relative">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input type="search" placeholder="Buscar usuarios..." className="w-full md:w-64 pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{users.length === 0 ? (
						<div className="text-center py-12 space-y-4">
							<Users className="h-12 w-12 text-muted-foreground/50 mx-auto" />
							<div className="space-y-2">
								<p className="text-muted-foreground font-medium">No hay usuarios aún</p>
								<p className="text-sm text-muted-foreground">Crea tu primer usuario usando el formulario de arriba</p>
							</div>
						</div>
					) : (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Usuario</TableHead>
										<TableHead>Área</TableHead>
										<TableHead>Rol</TableHead>
										<TableHead>Estado</TableHead>
										<TableHead>Última Actividad</TableHead>
										<TableHead className="text-right">Acciones</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredUsers.length === 0 ? (
										<TableRow>
											<TableCell colSpan={6} className="text-center py-8">
												<div className="space-y-2">
													<p className="text-muted-foreground">No se encontraron usuarios</p>
													<p className="text-sm text-muted-foreground">Intenta con otros términos de búsqueda</p>
												</div>
											</TableCell>
										</TableRow>
									) : (
										filteredUsers.map((user) => (
											<TableRow key={user.id} className="hover:bg-muted/50">
												<TableCell>
													<div className="flex items-center gap-3">
														<Avatar className="h-9 w-9">
															<AvatarImage src="/placeholder-user.jpg" alt={user.name} />
															<AvatarFallback className="bg-primary text-primary-foreground font-medium">{getInitials(user.name, user.lastname)}</AvatarFallback>
														</Avatar>
														<div>
															<div className="font-medium">
																{user.name} {user.lastname}
															</div>
															<div className="text-sm text-muted-foreground">{user.email}</div>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<span className="font-medium">{user.area.name}</span>
												</TableCell>
												<TableCell>
													<Badge variant="outline" className={`${getRoleBadgeColor(user.role)} transition-colors`}>
														{roles.find((r) => r.id === user.role)?.name || user.role}
													</Badge>
												</TableCell>
												<TableCell>
													<Badge variant="outline" className={`${getStatusBadgeColor(user.isActive)} transition-colors`}>
														{user.isActive ? "Activo" : "Inactivo"}
													</Badge>
												</TableCell>
												<TableCell>{user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Nunca"}</TableCell>
												<TableCell className="text-right">
													<div className="flex items-center justify-end gap-1">
														<Button variant="ghost" size="icon" onClick={() => handleOpenModal(user)} disabled={isSubmitting}>
															<Edit className="h-4 w-4" />
														</Button>
														<Dialog>
															<DialogTrigger asChild>
																<Button variant="ghost" size="icon" disabled={isSubmitting}>
																	<Trash2 className="h-4 w-4 text-destructive" />
																</Button>
															</DialogTrigger>
															<DialogContent>
																<DialogHeader>
																	<DialogTitle>Confirmar eliminación</DialogTitle>
																	<DialogDescription className="space-y-2">
																		<p>
																			¿Estás seguro de que quieres eliminar al usuario{" "}
																			<strong>
																				&quot;{user.name} {user.lastname}&quot;
																			</strong>
																			?
																		</p>
																		<p className="text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
																	</DialogDescription>
																</DialogHeader>
																<DialogFooter>
																	<Button variant="outline">Cancelar</Button>
																	<Button variant="destructive" onClick={() => handleDeleteUser(user)} disabled={isSubmitting}>
																		{isSubmitting ? (
																			<>
																				<Loader2 className="mr-2 h-4 w-4 animate-spin" />
																				Eliminando...
																			</>
																		) : (
																			"Eliminar"
																		)}
																	</Button>
																</DialogFooter>
															</DialogContent>
														</Dialog>
													</div>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Modal para crear/editar usuario */}
			<UserFormModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				roles={roles}
				user={formData}
				onUserChange={setFormData}
				onSubmit={handleSubmit}
				isLoading={isSubmitting}
				mode={editingUser ? "edit" : "create"}
			/>
		</div>
	);
}

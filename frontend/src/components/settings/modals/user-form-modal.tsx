import { Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Role } from "@/app/types/enums";

interface RoleDefinition {
	id: Role;
	name: string;
	description: string;
	permissions: string[];
}

interface UserModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	roles: RoleDefinition[];
	user: {
		name: string;
		lastname: string;
		username: string;
		email: string;
		role: Role;
		status: "active" | "inactive";
	};
	onUserChange: (user: any) => void;
	onSubmit: () => void;
	isLoading: boolean;
	mode: "create" | "edit";
}

export function UserFormModal({ open, onOpenChange, roles, user, onUserChange, onSubmit, isLoading, mode }: UserModalProps) {
	console.log(user, "_______________XXXXXXXXXXX");

	return (
		<DialogContent>
			<DialogHeader>
				<DialogTitle>{mode === "create" ? "Añadir Usuario" : "Editar Usuario"}</DialogTitle>
				<DialogDescription>{mode === "create" ? "Crear un nuevo usuario en el sistema" : "Actualizar información del usuario"}</DialogDescription>
			</DialogHeader>
			<div className="space-y-4 py-4">
				<div className="space-y-2">
					<Label htmlFor="username">Username</Label>
					<Input id="username" placeholder="Identificador único del usuario" value={user.username} onChange={(e) => onUserChange({ ...user, username: e.target.value })} />
				</div>
				<div className="space-y-2">
					<Label htmlFor="name">Nombre</Label>
					<Input id="name" placeholder="Ingresa nombre de usuario" value={user.name} onChange={(e) => onUserChange({ ...user, name: e.target.value })} />
				</div>
				<div className="space-y-2">
					<Label htmlFor="lastname">Apellido</Label>
					<Input id="lastname" placeholder="Ingresa apellido de usuario" value={user.lastname} onChange={(e) => onUserChange({ ...user, lastname: e.target.value })} />
				</div>

				<div className="space-y-2">
					<Label htmlFor="email">Correo electrónico</Label>
					<Input id="email" type="email" placeholder="Ingresa correo electrónico" value={user.email} onChange={(e) => onUserChange({ ...user, email: e.target.value })} />
				</div>
				<div className="space-y-2">
					<Label htmlFor="role">Rol</Label>
					<Select value={user.role} onValueChange={(value) => onUserChange({ ...user, role: value as Role })}>
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
					<Select value={user.status} onValueChange={(value) => onUserChange({ ...user, status: value as "active" | "inactive" })}>
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
				<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
					Cancelar
				</Button>
				<Button onClick={onSubmit} disabled={isLoading}>
					{isLoading ? (mode === "create" ? "Creando..." : "Actualizando...") : mode === "create" ? "Crear Usuario" : "Guardar Cambios"}
				</Button>
			</DialogFooter>
		</DialogContent>
	);
}

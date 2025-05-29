import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Role } from "@/types/base";
import { SelectService } from "@/services/select.service";
import { useToast } from "@/hooks/use-toast";
import { UserCreate } from "@/types/user.type";

interface RoleDefinition {
	id: Role;
	name: string;
	description: string;
	permissions: string[];
}

export type UserFormData = {
	name: string;
	lastname: string;
	email: string;
	role: Role;
	isActive: boolean;
	areaId: string;
	area: {
		id: string;
		name: string;
	};
};

interface UserModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	roles: RoleDefinition[];
	user: UserFormData;
	onUserChange: (user: UserFormData) => void;
	onSubmit: () => void;
	isLoading: boolean;
	mode: "create" | "edit";
}

export function UserFormModal({ open, onOpenChange, roles, user, onUserChange, onSubmit, isLoading, mode }: UserModalProps) {
	const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);
	const { toast } = useToast();

	useEffect(() => {
		const fetchAreas = async () => {
			try {
				const { success, data, message } = await SelectService.getAreas();
				if (!success) throw new Error(message);
				setAreas(data || []);
			} catch (error) {
				toast({
					variant: "destructive",
					description: "Error al cargar las áreas",
				});
			}
		};

		fetchAreas();
	}, [toast]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{mode === "create" ? "Añadir Usuario" : "Editar Usuario"}</DialogTitle>
					<DialogDescription>{mode === "create" ? "Crear un nuevo usuario en el sistema" : "Actualizar información del usuario"}</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
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
						<Label htmlFor="area">Área</Label>
						<Select
							value={user.areaId}
							onValueChange={(value) =>
								onUserChange({
									...user,
									areaId: value,
									area: {
										id: value,
										name: areas.find((area) => area.id === value)?.name || "",
									},
								})
							}
						>
							<SelectTrigger id="area">
								<SelectValue placeholder="Seleccionar área" />
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
						<Select value={user.isActive ? "active" : "inactive"} onValueChange={(value) => onUserChange({ ...user, isActive: value === "active" })}>
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
		</Dialog>
	);
}

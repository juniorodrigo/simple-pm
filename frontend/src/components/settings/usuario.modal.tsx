import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";
import { Role } from "@/types/base";
import { SelectService } from "@/services/select.service";
import { useToast } from "@/hooks/use-toast";
import { UserModalProps } from "@/types/new/usuario.type";

export function UserFormModal({ open, onOpenChange, roles, user, onUserChange, onSubmit, isLoading, mode }: UserModalProps) {
	const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);
	const [validationError, setValidationError] = useState<string>("");
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

		if (open) {
			fetchAreas();
		}
	}, [open, toast]);

	// Reset validation error when modal closes
	useEffect(() => {
		if (!open) {
			setValidationError("");
		}
	}, [open]);

	const validateForm = (): boolean => {
		setValidationError("");

		if (!user.name.trim()) {
			setValidationError("El nombre es obligatorio");
			return false;
		}

		if (!user.lastname.trim()) {
			setValidationError("El apellido es obligatorio");
			return false;
		}

		if (!user.email.trim()) {
			setValidationError("El correo electrónico es obligatorio");
			return false;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(user.email)) {
			setValidationError("Por favor ingrese un correo electrónico válido");
			return false;
		}

		if (!user.areaId) {
			setValidationError("Debe seleccionar un área");
			return false;
		}

		if (!user.role) {
			setValidationError("Debe seleccionar un rol");
			return false;
		}

		return true;
	};

	const handleSubmit = () => {
		if (validateForm()) {
			onSubmit();
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center space-x-2">
						<span>{mode === "create" ? "Crear Usuario" : "Editar Usuario"}</span>
					</DialogTitle>
					<DialogDescription>{mode === "create" ? "Ingresa los detalles del nuevo usuario" : "Modifica los detalles del usuario seleccionado"}</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{validationError && (
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>{validationError}</AlertDescription>
						</Alert>
					)}

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="name">Nombre *</Label>
							<Input id="name" placeholder="Ingresa el nombre" value={user.name} onChange={(e) => onUserChange({ ...user, name: e.target.value })} maxLength={50} />
						</div>
						<div className="space-y-2">
							<Label htmlFor="lastname">Apellido *</Label>
							<Input id="lastname" placeholder="Ingresa el apellido" value={user.lastname} onChange={(e) => onUserChange({ ...user, lastname: e.target.value })} maxLength={50} />
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Correo electrónico *</Label>
						<Input id="email" type="email" placeholder="usuario@ejemplo.com" value={user.email} onChange={(e) => onUserChange({ ...user, email: e.target.value })} />
					</div>

					<div className="space-y-2">
						<Label htmlFor="area">Área *</Label>
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
						<Label htmlFor="role">Rol *</Label>
						<Select value={user.role} onValueChange={(value) => onUserChange({ ...user, role: value as Role })}>
							<SelectTrigger id="role">
								<SelectValue placeholder="Seleccionar rol" />
							</SelectTrigger>
							<SelectContent>
								{roles.map((role) => (
									<SelectItem key={role.id} value={role.id}>
										<div className="flex flex-col">
											<span className="font-medium">{role.name}</span>
											<span className="text-xs text-muted-foreground">{role.description}</span>
										</div>
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
								<SelectItem value="active">
									<div className="flex items-center">
										<div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
										Activo
									</div>
								</SelectItem>
								<SelectItem value="inactive">
									<div className="flex items-center">
										<div className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
										Inactivo
									</div>
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
						Cancelar
					</Button>
					<Button onClick={handleSubmit} disabled={isLoading} className="min-w-[120px]">
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								{mode === "create" ? "Creando..." : "Guardando..."}
							</>
						) : mode === "create" ? (
							"Crear Usuario"
						) : (
							"Guardar Cambios"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

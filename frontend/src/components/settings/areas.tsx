"use client";

import { useEffect, useState } from "react";
import { Area } from "@/types/new/area.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Edit, Plus, Trash2, Loader2, Building2, AlertTriangle, Save, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AreaService } from "@/services/new/area.service";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface FormData {
	name: string;
	isActive: boolean;
}

export default function AreasSettings() {
	const { toast } = useToast();
	const [areas, setAreas] = useState<Area[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [editingArea, setEditingArea] = useState<Area | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [formData, setFormData] = useState<FormData>({
		name: "",
		isActive: true,
	});
	const [validationError, setValidationError] = useState<string>("");

	useEffect(() => {
		fetchAreas();
	}, []);

	const fetchAreas = async () => {
		try {
			setIsLoading(true);
			const response = await AreaService.getAll();

			if (response.success && response.data) {
				setAreas(response.data);
			} else {
				throw new Error(response.message || "Error al cargar áreas");
			}
		} catch (error) {
			console.error("Error cargando áreas:", error);
			toast({
				title: "Error al cargar",
				description: "No se pudieron cargar las áreas. Por favor, intenta de nuevo.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const validateForm = (): boolean => {
		setValidationError("");

		if (!formData.name.trim()) {
			setValidationError("El nombre del área es obligatorio");
			return false;
		}

		if (formData.name.trim().length < 2) {
			setValidationError("El nombre debe tener al menos 2 caracteres");
			return false;
		}

		if (formData.name.trim().length > 50) {
			setValidationError("El nombre no puede exceder 50 caracteres");
			return false;
		}

		// Verificar si ya existe un área con ese nombre
		const existingArea = areas.find((area) => area.name.toLowerCase().trim() === formData.name.toLowerCase().trim() && area.id !== editingArea?.id);

		if (existingArea) {
			setValidationError("Ya existe un área con ese nombre");
			return false;
		}

		return true;
	};

	const handleOpenModal = (area?: Area) => {
		if (area) {
			setEditingArea(area);
			setFormData({
				name: area.name,
				isActive: area.isActive,
			});
		} else {
			setEditingArea(null);
			setFormData({
				name: "",
				isActive: true,
			});
		}
		setValidationError("");
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingArea(null);
		setFormData({ name: "", isActive: true });
		setValidationError("");
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		try {
			setIsSubmitting(true);

			if (editingArea) {
				// Actualizar área
				const response = await AreaService.update({
					id: editingArea.id,
					name: formData.name.trim(),
					isActive: formData.isActive,
				});

				if (response.success && response.data) {
					setAreas(areas.map((area) => (area.id === editingArea.id ? (response.data as Area) : area)));
					toast({
						title: "¡Área actualizada!",
						description: `El área "${formData.name}" se ha actualizado exitosamente.`,
					});
					handleCloseModal();
				} else {
					throw new Error(response.message || "Error al actualizar el área");
				}
			} else {
				// Crear nueva área
				const response = await AreaService.create({
					name: formData.name.trim(),
					isActive: formData.isActive,
				});

				if (response.success && response.data) {
					setAreas([...areas, response.data]);
					toast({
						title: "¡Área creada!",
						description: `El área "${formData.name}" se ha creado exitosamente.`,
					});
					handleCloseModal();
				} else {
					throw new Error(response.message || "Error al crear el área");
				}
			}
		} catch (error) {
			console.error("Error en submit:", error);
			toast({
				title: editingArea ? "Error al actualizar" : "Error al crear",
				description: "No se pudo completar la operación. Por favor, intenta de nuevo.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteArea = async (area: Area) => {
		try {
			setIsSubmitting(true);
			const response = await AreaService.delete(area.id);

			if (response.success) {
				setAreas(areas.filter((a) => a.id !== area.id));
				toast({
					title: "Área eliminada",
					description: `El área "${area.name}" ha sido eliminada exitosamente.`,
				});
			} else {
				throw new Error(response.message || "Error al eliminar el área");
			}
		} catch (error) {
			console.error("Error eliminando área:", error);
			toast({
				title: "Error al eliminar",
				description: "No se pudo eliminar el área. Por favor, intenta de nuevo.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const getStatusBadgeColor = (isActive: boolean) => {
		return isActive ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200" : "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
	};

	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((word) => word[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const filteredAreas = areas.filter((area) => area.name.toLowerCase().includes(searchQuery.toLowerCase()));

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="flex flex-col items-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					<p className="text-muted-foreground">Cargando áreas...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8 max-w-6xl mx-auto">
			{/* Formulario de creación rápida */}
			<Card className="shadow-sm">
				<CardHeader className="pb-4">
					<CardTitle className="text-lg flex items-center space-x-2">
						<Plus className="h-5 w-5" />
						<span>Nueva Área</span>
					</CardTitle>
					<CardDescription>Crea una nueva área para organizar tu trabajo</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{validationError && (
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>{validationError}</AlertDescription>
						</Alert>
					)}

					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="md:col-span-2">
							<Label htmlFor="quick-area-name" className="text-sm font-medium">
								Nombre del área
							</Label>
							<Input
								id="quick-area-name"
								value={formData.name}
								onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
								placeholder="Ej: Desarrollo, Ventas, Marketing..."
								className="mt-1"
								maxLength={50}
							/>
							<p className="text-xs text-muted-foreground mt-1">{formData.name.length}/50 caracteres</p>
						</div>

						<div>
							<Label htmlFor="quick-area-status" className="text-sm font-medium">
								Estado
							</Label>
							<Select value={formData.isActive ? "active" : "inactive"} onValueChange={(value) => setFormData((prev) => ({ ...prev, isActive: value === "active" }))}>
								<SelectTrigger className="mt-1">
									<SelectValue />
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

						<div className="flex items-end">
							<Button onClick={handleSubmit} disabled={isSubmitting || !formData.name.trim()} className="w-full">
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Creando...
									</>
								) : (
									<>
										<Plus className="mr-2 h-4 w-4" />
										Crear Área
									</>
								)}
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Lista de áreas */}
			<Card className="shadow-sm">
				<CardHeader className="pb-4">
					<div className="flex flex-col md:flex-row justify-between gap-4">
						<div>
							<CardTitle className="text-lg flex items-center space-x-2">
								<Building2 className="h-5 w-5" />
								<span>Áreas Existentes</span>
							</CardTitle>
							<CardDescription>
								{areas.length > 0 ? `Tienes ${areas.length} ${areas.length === 1 ? "área" : "áreas"} registrada${areas.length === 1 ? "" : "s"}` : "No tienes áreas registradas aún"}
							</CardDescription>
						</div>

						<div className="flex gap-2">
							<div className="relative">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input type="search" placeholder="Buscar áreas..." className="w-full md:w-64 pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{areas.length === 0 ? (
						<div className="text-center py-12 space-y-4">
							<Building2 className="h-12 w-12 text-muted-foreground/50 mx-auto" />
							<div className="space-y-2">
								<p className="text-muted-foreground font-medium">No hay áreas aún</p>
								<p className="text-sm text-muted-foreground">Crea tu primera área usando el formulario de arriba</p>
							</div>
						</div>
					) : (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Área</TableHead>
										<TableHead>Estado</TableHead>
										<TableHead className="text-right">Acciones</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredAreas.length === 0 ? (
										<TableRow>
											<TableCell colSpan={3} className="text-center py-8">
												<div className="space-y-2">
													<p className="text-muted-foreground">No se encontraron áreas</p>
													<p className="text-sm text-muted-foreground">Intenta con otros términos de búsqueda</p>
												</div>
											</TableCell>
										</TableRow>
									) : (
										filteredAreas.map((area) => (
											<TableRow key={area.id} className="hover:bg-muted/50">
												<TableCell>
													<div className="flex items-center gap-3">
														<Avatar className="h-9 w-9 bg-primary">
															<AvatarFallback className="text-primary-foreground font-medium">{getInitials(area.name)}</AvatarFallback>
														</Avatar>
														<span className="font-medium">{area.name}</span>
													</div>
												</TableCell>
												<TableCell>
													<Badge variant="outline" className={`${getStatusBadgeColor(area.isActive)} transition-colors`}>
														{area.isActive ? "Activo" : "Inactivo"}
													</Badge>
												</TableCell>
												<TableCell className="text-right">
													<div className="flex items-center justify-end gap-1">
														<Button variant="ghost" size="icon" onClick={() => handleOpenModal(area)} disabled={isSubmitting}>
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
																		<span>
																			¿Estás seguro de que quieres eliminar el área <strong>&quot;{area.name}&quot;</strong>?
																		</span>
																		<span className="text-sm text-muted-foreground">Esta acción no se puede deshacer.</span>
																	</DialogDescription>
																</DialogHeader>
																<DialogFooter>
																	<DialogClose asChild>
																		<Button variant="outline">Cancelar</Button>
																	</DialogClose>
																	<Button variant="destructive" onClick={() => handleDeleteArea(area)} disabled={isSubmitting}>
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

			{/* Modal para crear/editar área */}
			<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center space-x-2">
							{editingArea ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
							<span>{editingArea ? "Editar Área" : "Crear Nueva Área"}</span>
						</DialogTitle>
						<DialogDescription>{editingArea ? "Modifica los detalles del área seleccionada" : "Ingresa los detalles de la nueva área"}</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						{validationError && (
							<Alert variant="destructive">
								<AlertTriangle className="h-4 w-4" />
								<AlertDescription>{validationError}</AlertDescription>
							</Alert>
						)}

						<div className="space-y-2">
							<Label htmlFor="modal-name">Nombre del Área</Label>
							<Input id="modal-name" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} placeholder="Ingresa el nombre del área" maxLength={50} />
							<p className="text-xs text-muted-foreground">{formData.name.length}/50 caracteres</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="modal-status">Estado</Label>
							<Select value={formData.isActive ? "active" : "inactive"} onValueChange={(value) => setFormData((prev) => ({ ...prev, isActive: value === "active" }))}>
								<SelectTrigger>
									<SelectValue placeholder="Selecciona el estado" />
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
						<Button variant="outline" onClick={handleCloseModal} disabled={isSubmitting}>
							Cancelar
						</Button>
						<Button onClick={handleSubmit} disabled={isSubmitting || !formData.name.trim()} className="min-w-[100px]">
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									{editingArea ? "Guardando..." : "Creando..."}
								</>
							) : (
								<>
									{editingArea ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
									{editingArea ? "Guardar" : "Crear"}
								</>
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

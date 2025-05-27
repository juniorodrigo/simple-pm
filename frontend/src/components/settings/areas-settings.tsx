"use client";

import { useEffect, useState } from "react";
import { Area } from "@/types/area.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Edit, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaService } from "@/services/area.service";
import { useToast } from "@/hooks/use-toast";

export default function AreasSettings() {
	const [areas, setAreas] = useState<Area[]>([]);
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);
	const [editingArea, setEditingArea] = useState<Area | null>(null);
	const [newArea, setNewArea] = useState({ name: "" });
	const [isAddingArea, setIsAddingArea] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		fetchAreas();
	}, []);

	const fetchAreas = async () => {
		try {
			const response = await AreaService.getAll();
			if (response.success && response.data) {
				setAreas(response.data);
			} else {
				toast({
					variant: "destructive",
					description: "Error al cargar las áreas",
				});
			}
		} catch (error) {
			toast({
				variant: "destructive",
				description: "Error al cargar las áreas",
			});
		}
	};

	const filteredAreas = areas.filter((area) => area.name.toLowerCase().includes(searchQuery.toLowerCase()));

	const handleAddArea = async () => {
		if (!newArea.name.trim()) {
			toast({
				variant: "destructive",
				description: "Por favor ingrese un nombre para el área",
			});
			return;
		}

		setIsLoading(true);
		try {
			const response = await AreaService.create({ name: newArea.name });
			if (response.success && response.data) {
				setAreas([...areas, response.data]);
				setNewArea({ name: "" });
				setIsAddingArea(false);
				toast({ description: "Área creada correctamente" });
			} else {
				toast({
					variant: "destructive",
					description: response.message || "Error al crear el área",
				});
			}
		} catch (error) {
			toast({
				variant: "destructive",
				description: "Error al crear el área",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleUpdateArea = async () => {
		if (!editingArea) return;

		setIsLoading(true);
		try {
			const response = await AreaService.update({
				id: editingArea.id,
				name: editingArea.name,
			});
			if (response.success && response.data) {
				const updatedArea: Area = {
					id: response.data.id,
					name: response.data.name,
					isActive: response.data.isActive,
				};

				setAreas(areas.map((area) => (area.id === editingArea.id ? updatedArea : area)));
				setEditingArea(null);
				toast({ description: "Área actualizada correctamente" });
			} else {
				toast({
					variant: "destructive",
					description: response.message || "Error al actualizar el área",
				});
			}
		} catch (error) {
			toast({
				variant: "destructive",
				description: "Error al actualizar el área",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteArea = async (area: Area) => {
		try {
			const response = await AreaService.delete(area.id);
			if (response.success) {
				setAreas(areas.filter((a) => a.id !== area.id));
				toast({ description: "Área eliminada correctamente" });
				setAreaToDelete(null);
			} else {
				toast({
					variant: "destructive",
					description: response.message || "Error al eliminar el área",
				});
			}
		} catch (error) {
			toast({
				variant: "destructive",
				description: "Error al eliminar el área",
			});
		}
	};

	const getStatusBadgeColor = (isActive: boolean) => {
		return isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200";
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Gestión de Áreas</CardTitle>
					<CardDescription>Gestionar las áreas del sistema</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
						<div className="relative w-full md:w-64">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input type="search" placeholder="Buscar áreas..." className="w-full pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
						</div>
						<Dialog open={isAddingArea} onOpenChange={setIsAddingArea}>
							<DialogTrigger asChild>
								<Button>
									<Plus className="mr-2 h-4 w-4" />
									Añadir Área
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Crear Nueva Área</DialogTitle>
									<DialogDescription>Ingrese los detalles de la nueva área</DialogDescription>
								</DialogHeader>
								<div className="grid gap-4 py-4">
									<div className="grid gap-2">
										<label htmlFor="name">Nombre del Área</label>
										<Input id="name" value={newArea.name} onChange={(e) => setNewArea({ name: e.target.value })} />
									</div>
								</div>
								<DialogFooter>
									<Button variant="outline" onClick={() => setIsAddingArea(false)}>
										Cancelar
									</Button>
									<Button onClick={handleAddArea} disabled={isLoading}>
										{isLoading ? "Creando..." : "Crear"}
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>

					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Nombre</TableHead>
									<TableHead>Estado</TableHead>
									<TableHead className="text-right">Acciones</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredAreas.map((area) => (
									<TableRow key={area.id}>
										<TableCell className="font-medium">{area.name}</TableCell>
										<TableCell>
											<Badge variant="outline" className={getStatusBadgeColor(area.isActive)}>
												{area.isActive ? "Activo" : "Inactivo"}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<Dialog>
												<DialogTrigger asChild>
													<Button variant="ghost" size="icon" onClick={() => setEditingArea(area)}>
														<Edit className="h-4 w-4" />
													</Button>
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>Editar Área</DialogTitle>
														<DialogDescription>Modifique los detalles del área</DialogDescription>
													</DialogHeader>
													<div className="grid gap-4 py-4">
														<div className="grid gap-2">
															<label htmlFor="edit-name">Nombre del Área</label>
															<Input
																id="edit-name"
																value={editingArea?.name}
																onChange={(e) =>
																	setEditingArea(
																		editingArea
																			? {
																					...editingArea,
																					name: e.target.value,
																			  }
																			: null
																	)
																}
															/>
														</div>
													</div>
													<DialogFooter>
														<Button variant="outline" onClick={() => setEditingArea(null)}>
															Cancelar
														</Button>
														<Button onClick={handleUpdateArea} disabled={isLoading}>
															{isLoading ? "Guardando..." : "Guardar"}
														</Button>
													</DialogFooter>
												</DialogContent>
											</Dialog>
											<Button variant="ghost" size="icon" onClick={() => setAreaToDelete(area)}>
												<Trash2 className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))}
								{filteredAreas.length === 0 && (
									<TableRow>
										<TableCell colSpan={3} className="text-center py-6">
											No se encontraron áreas
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>

			<Dialog open={!!areaToDelete} onOpenChange={(open) => !open && setAreaToDelete(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirmar eliminación</DialogTitle>
						<DialogDescription>¿Está seguro que desea eliminar el área {areaToDelete?.name}? Esta acción no se puede deshacer.</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setAreaToDelete(null)}>
							Cancelar
						</Button>
						<Button variant="destructive" onClick={() => areaToDelete && handleDeleteArea(areaToDelete)}>
							Eliminar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

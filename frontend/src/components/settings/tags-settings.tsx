"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Save, Trash, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { TagsService } from "@/services/tags.service";
import { Tag } from "@/types/tag.type";
import { Colors } from "@/types/enums";
import { COLORS, getTagColorClass } from "@/lib/colors";

interface TagWithCount extends Tag {
	count: number;
}

export default function TagsSettings() {
	const { toast } = useToast();
	const [tags, setTags] = useState<TagWithCount[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [editingTag, setEditingTag] = useState<string | null>(null);
	const [newTagName, setNewTagName] = useState("");
	const [newTagColor, setNewTagColor] = useState("blue");

	useEffect(() => {
		loadTags();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const loadTags = async () => {
		setIsLoading(true);
		const response = await TagsService.getTags();
		if (response.success && response.data) {
			// Añadir count inicial de 0 a cada tag
			const tagsWithCount = response.data.map((tag: Tag) => ({
				...tag,
				count: 0, // Aquí deberías obtener el count real de tus datos
			}));
			setTags(tagsWithCount);
		} else {
			toast({
				title: "Error",
				description: "No se pudieron cargar las categorías",
				variant: "destructive",
			});
		}
		setIsLoading(false);
	};

	const handleAddTag = async () => {
		if (newTagName.trim() === "") return;

		const response = await TagsService.createTag(newTagName, newTagColor);

		if (response.success && response.data) {
			// Actualizar estado localmente en vez de recargar
			setTags((prevTags) => [...prevTags, { ...response.data, count: 0 }]);
			setNewTagName("");
			setNewTagColor("blue");
			toast({
				title: "Categoría creada",
				description: `La categoría "${newTagName}" ha sido creada exitosamente.`,
			});
		} else {
			toast({
				title: "Error al crear el tag",
				description: response.error,
				variant: "destructive",
			});
		}
	};

	const handleUpdateTag = async (id: string, name: string, color: string) => {
		const response = await TagsService.updateTag(id, { id, name, color } as Tag);

		if (response.success) {
			// Actualizar estado localmente
			setTags((prevTags) => prevTags.map((tag) => (tag.id === id ? { ...tag, name, color: color as Colors } : tag)));
			setEditingTag(null);
			toast({
				title: "Categoría actualizada",
				description: `La categoría "${name}" ha sido actualizada exitosamente.`,
			});
		} else {
			toast({
				title: "Error",
				description: "No se pudo actualizar la categoría",
				variant: "destructive",
			});
		}
	};

	const handleDeleteTag = async (id: string) => {
		const response = await TagsService.deleteTag(id);

		if (response.success) {
			const tagToDelete = tags.find((tag) => tag.id === id);
			// Actualizar estado localmente
			setTags((prevTags) => prevTags.filter((tag) => tag.id !== id));
			toast({
				title: "Categoría eliminada",
				description: tagToDelete ? `La categoría "${tagToDelete.name}" ha sido eliminada.` : "La categoría ha sido eliminada.",
			});
		} else {
			toast({
				title: "Error",
				description: response.error,
				variant: "destructive",
			});
		}
	};

	return (
		<div className="space-y-6">
			{isLoading ? (
				<div className="text-center py-6">Cargando categorías...</div>
			) : (
				<>
					<Card>
						<CardHeader>
							<CardTitle>Crear Nueva Categoría</CardTitle>
							<CardDescription>Crea categorías para categorizar proyectos y actividades</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col md:flex-row gap-4">
								<div className="flex-1">
									<Label htmlFor="tag-name">Nombre de Categoría</Label>
									<Input id="tag-name" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="Ingrese nombre de categoría" />
								</div>
								<div className="w-full md:w-48">
									<Label htmlFor="tag-color">Color</Label>
									<Select value={newTagColor} onValueChange={setNewTagColor}>
										<SelectTrigger id="tag-color">
											<SelectValue placeholder="Seleccionar color" />
										</SelectTrigger>
										<SelectContent>
											{COLORS.map((color) => (
												<SelectItem key={color.value} value={color.value}>
													<div className="flex items-center">
														<div
															className={`w-4 h-4 rounded-full mr-2 ${
																color.value === "red"
																	? "bg-red-500"
																	: color.value === "green"
																	? "bg-green-500"
																	: color.value === "blue"
																	? "bg-blue-500"
																	: color.value === "amber"
																	? "bg-amber-500"
																	: color.value === "violet"
																	? "bg-violet-500"
																	: color.value === "rose"
																	? "bg-rose-500"
																	: "bg-gray-500"
															}`}
														/>
														{color.name}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="flex items-end">
									<Button onClick={handleAddTag}>
										<Plus className="mr-2 h-4 w-4" />
										Añadir Categoría
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Gestionar Categorías</CardTitle>
							<CardDescription>Editar o eliminar categorías existentes</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{tags.map((tag) => (
									<div key={tag.id} className="flex items-center justify-between p-3 border rounded-lg">
										{editingTag === tag.id ? (
											<div className="flex flex-1 items-center gap-4">
												<Input
													value={tag.name}
													onChange={(e) => {
														setTags(tags.map((t) => (t.id === tag.id ? { ...t, name: e.target.value } : t)));
													}}
													className="max-w-xs"
												/>
												<Select
													value={tag.color}
													onValueChange={(value) => {
														setTags(tags.map((t) => (t.id === tag.id ? { ...t, color: value as Colors } : t)));
													}}
												>
													<SelectTrigger className="w-32">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{COLORS.map((color) => (
															<SelectItem key={color.value} value={color.value}>
																<div className="flex items-center">
																	<div
																		className={`w-4 h-4 rounded-full mr-2 ${
																			color.value === "red"
																				? "bg-red-500"
																				: color.value === "green"
																				? "bg-green-500"
																				: color.value === "blue"
																				? "bg-blue-500"
																				: color.value === "amber"
																				? "bg-amber-500"
																				: color.value === "violet"
																				? "bg-violet-500"
																				: color.value === "rose"
																				? "bg-rose-500"
																				: "bg-gray-500"
																		}`}
																	/>
																	{color.name}
																</div>
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												<div className="flex gap-2">
													<Button size="sm" onClick={() => handleUpdateTag(tag.id, tag.name, tag.color)}>
														<Save className="h-4 w-4" />
													</Button>
													<Button size="sm" variant="outline" onClick={() => setEditingTag(null)}>
														<X className="h-4 w-4" />
													</Button>
												</div>
											</div>
										) : (
											<>
												<div className="flex items-center gap-4">
													<Badge variant="outline" className={getTagColorClass(tag.color)}>
														{tag.name}
													</Badge>
													<span className="text-sm text-muted-foreground">
														Usado en {tag.count} {tag.count === 1 ? "actividad" : "actividades"}
													</span>
												</div>
												<div className="flex gap-2">
													<Button size="sm" variant="ghost" onClick={() => setEditingTag(tag.id)}>
														<Edit className="h-4 w-4" />
													</Button>
													<Dialog>
														<DialogTrigger asChild>
															<Button size="sm" variant="ghost">
																<Trash className="h-4 w-4 text-destructive" />
															</Button>
														</DialogTrigger>
														<DialogContent>
															<DialogHeader>
																<DialogTitle>Eliminar Categoría</DialogTitle>
																<DialogDescription>¿Estás seguro de que quieres eliminar la categoría &quot;{tag.name}&quot;? Esta acción no se puede deshacer.</DialogDescription>
															</DialogHeader>
															<DialogFooter>
																<Button variant="outline">Cancelar</Button>
																<Button variant="destructive" onClick={() => handleDeleteTag(tag.id)}>
																	Eliminar
																</Button>
															</DialogFooter>
														</DialogContent>
													</Dialog>
												</div>
											</>
										)}
									</div>
								))}
								{tags.length === 0 && <div className="text-center py-6 text-muted-foreground">No se encontraron categorías. Crea tu primera categoría arriba.</div>}
							</div>
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}

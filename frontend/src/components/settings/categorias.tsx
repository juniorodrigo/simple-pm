"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Plus, Save, Trash, X, Loader2, TagIcon, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CategoriaService } from "@/services/new/categoria.service";
import { Tag } from "@/types/new/tag.type";
import { Colors } from "@/types/enums";
import { COLORS, getTagColorClass } from "@/lib/colors";

interface TagWithCount extends Tag {
	count: number;
}

interface FormData {
	name: string;
	color: Colors;
}

export default function TagsSettings() {
	const { toast } = useToast();
	const [tags, setTags] = useState<TagWithCount[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [editingTag, setEditingTag] = useState<string | null>(null);
	const [formData, setFormData] = useState<FormData>({
		name: "",
		color: "blue" as Colors,
	});
	const [validationError, setValidationError] = useState<string>("");

	useEffect(() => {
		loadTags();
	}, []);

	const loadTags = async () => {
		try {
			setIsLoading(true);
			const response = await CategoriaService.getAll();

			if (response.success && response.data) {
				const tagsWithCount = response.data.map((tag: Tag) => ({
					...tag,
					count: 0, // TODO: Implementar conteo real desde el backend
				}));
				setTags(tagsWithCount);
			} else {
				throw new Error(response.message || "Error al cargar categorías");
			}
		} catch (error) {
			console.error("Error cargando categorías:", error);
			toast({
				title: "Error al cargar",
				description: "No se pudieron cargar las categorías. Por favor, intenta de nuevo.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const validateForm = (): boolean => {
		setValidationError("");

		if (!formData.name.trim()) {
			setValidationError("El nombre de la categoría es obligatorio");
			return false;
		}

		if (formData.name.trim().length < 2) {
			setValidationError("El nombre debe tener al menos 2 caracteres");
			return false;
		}

		if (formData.name.trim().length > 30) {
			setValidationError("El nombre no puede exceder 30 caracteres");
			return false;
		}

		// Verificar si ya existe una categoría con ese nombre
		const existingTag = tags.find((tag) => tag.name.toLowerCase().trim() === formData.name.toLowerCase().trim() && tag.id !== editingTag);

		if (existingTag) {
			setValidationError("Ya existe una categoría con ese nombre");
			return false;
		}

		return true;
	};

	const validateTagForEdit = (tagToValidate: TagWithCount): boolean => {
		setValidationError("");

		if (!tagToValidate.name.trim()) {
			setValidationError("El nombre de la categoría es obligatorio");
			return false;
		}

		if (tagToValidate.name.trim().length < 2) {
			setValidationError("El nombre debe tener al menos 2 caracteres");
			return false;
		}

		if (tagToValidate.name.trim().length > 30) {
			setValidationError("El nombre no puede exceder 30 caracteres");
			return false;
		}

		// Verificar si ya existe una categoría con ese nombre (excluyendo la actual)
		const existingTag = tags.find((tag) => tag.name.toLowerCase().trim() === tagToValidate.name.toLowerCase().trim() && tag.id !== tagToValidate.id);

		if (existingTag) {
			setValidationError("Ya existe una categoría con ese nombre");
			return false;
		}

		return true;
	};

	const handleAddTag = async () => {
		if (!validateForm()) return;

		try {
			setIsSubmitting(true);
			const response = await CategoriaService.create({
				name: formData.name.trim(),
				color: formData.color,
			});

			if (response.success && response.data) {
				setTags((prevTags) => [...prevTags, { ...(response.data as Tag), count: 0 }]);
				setFormData({ name: "", color: "blue" as Colors });
				toast({
					title: "¡Categoría creada!",
					description: `La categoría "${formData.name}" se ha creado exitosamente.`,
				});
			} else {
				throw new Error(response.message || "Error al crear la categoría");
			}
		} catch (error) {
			console.error("Error creando categoría:", error);
			toast({
				title: "Error al crear",
				description: "No se pudo crear la categoría. Por favor, intenta de nuevo.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdateTag = async (id: string) => {
		const tagToUpdate = tags.find((tag) => tag.id === id);
		if (!tagToUpdate) return;

		// Validar directamente con los datos del tag que se está editando
		if (!validateTagForEdit(tagToUpdate)) {
			return;
		}

		try {
			setIsSubmitting(true);
			const response = await CategoriaService.update({
				id,
				name: tagToUpdate.name.trim(),
				color: tagToUpdate.color,
			});

			if (response.success) {
				setEditingTag(null);
				setValidationError(""); // Limpiar errores de validación
				toast({
					title: "¡Categoría actualizada!",
					description: `La categoría "${tagToUpdate.name}" se ha actualizado exitosamente.`,
				});
			} else {
				throw new Error(response.message || "Error al actualizar la categoría");
			}
		} catch (error) {
			console.error("Error actualizando categoría:", error);
			toast({
				title: "Error al actualizar",
				description: "No se pudo actualizar la categoría. Por favor, intenta de nuevo.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteTag = async (id: string) => {
		const tagToDelete = tags.find((tag) => tag.id === id);
		if (!tagToDelete) return;

		try {
			setIsSubmitting(true);
			const response = await CategoriaService.delete(id);

			if (response.success) {
				setTags((prevTags) => prevTags.filter((tag) => tag.id !== id));
				toast({
					title: "Categoría eliminada",
					description: `La categoría "${tagToDelete.name}" ha sido eliminada exitosamente.`,
				});
			} else {
				throw new Error(response.message || "Error al eliminar la categoría");
			}
		} catch (error) {
			console.error("Error eliminando categoría:", error);
			toast({
				title: "Error al eliminar",
				description: "No se pudo eliminar la categoría. Por favor, intenta de nuevo.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEditStart = (tag: TagWithCount) => {
		setEditingTag(tag.id);
		setValidationError("");
	};

	const handleEditCancel = () => {
		setEditingTag(null);
		setValidationError("");
		// Restaurar valores originales
		loadTags();
	};

	const updateTagField = (id: string, field: keyof Tag, value: string) => {
		setTags(tags.map((tag) => (tag.id === id ? { ...tag, [field]: value } : tag)));
	};

	const ColorSelector = ({ value, onChange, className = "" }: { value: string; onChange: (value: string) => void; className?: string }) => (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger className={className}>
				<SelectValue>
					<div className="flex items-center">
						<div
							className={`w-3 h-3 rounded-full mr-2 ${
								getTagColorClass(value as Colors)
									.replace("border-", "bg-")
									.split(" ")[0]
							}`}
						/>
						{COLORS.find((c) => c.value === value)?.name}
					</div>
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{COLORS.map((color) => (
					<SelectItem key={color.value} value={color.value}>
						<div className="flex items-center">
							<div
								className={`w-3 h-3 rounded-full mr-2 ${
									getTagColorClass(color.value as Colors)
										.replace("border-", "bg-")
										.split(" ")[0]
								}`}
							/>
							{color.name}
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="flex flex-col items-center space-y-4">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					<p className="text-muted-foreground">Cargando categorías...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8 max-w-4xl mx-auto">
			{/* Header */}

			{/* Formulario de creación */}
			<Card className="shadow-sm">
				<CardHeader className="pb-4">
					<CardTitle className="text-lg flex items-center space-x-2">
						<Plus className="h-5 w-5" />
						<span>Nueva Categoría</span>
					</CardTitle>
					<CardDescription>Crea una nueva categoría para clasificar tus proyectos y actividades</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{validationError && !editingTag && (
						<Alert variant="destructive">
							<AlertTriangle className="h-4 w-4" />
							<AlertDescription>{validationError}</AlertDescription>
						</Alert>
					)}

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="md:col-span-2">
							<Label htmlFor="new-tag-name" className="text-sm font-medium">
								Nombre de la categoría
							</Label>
							<Input
								id="new-tag-name"
								value={formData.name}
								onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
								placeholder="Ej: Desarrollo, Marketing, Diseño..."
								className="mt-1"
								maxLength={30}
							/>
							<p className="text-xs text-muted-foreground mt-1">{formData.name.length}/30 caracteres</p>
						</div>

						<div>
							<Label htmlFor="new-tag-color" className="text-sm font-medium">
								Color
							</Label>
							<ColorSelector value={formData.color} onChange={(value) => setFormData((prev) => ({ ...prev, color: value as Colors }))} className="mt-1" />
						</div>
					</div>

					<div className="flex justify-end pt-2">
						<Button onClick={handleAddTag} disabled={isSubmitting || !formData.name.trim()} className="min-w-[140px]">
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creando...
								</>
							) : (
								<>
									<Plus className="mr-2 h-4 w-4" />
									Crear Categoría
								</>
							)}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Lista de categorías */}
			<Card className="shadow-sm">
				<CardHeader className="pb-4">
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-lg">Categorías Existentes</CardTitle>
							<CardDescription>
								{tags.length > 0 ? `Tienes ${tags.length} ${tags.length === 1 ? "categoría" : "categorías"} creada${tags.length === 1 ? "" : "s"}` : "No tienes categorías creadas aún"}
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{tags.length === 0 ? (
						<div className="text-center py-12 space-y-4">
							<TagIcon className="h-12 w-12 text-muted-foreground/50 mx-auto" />
							<div className="space-y-2">
								<p className="text-muted-foreground font-medium">No hay categorías aún</p>
								<p className="text-sm text-muted-foreground">Crea tu primera categoría usando el formulario de arriba</p>
							</div>
						</div>
					) : (
						<div className="space-y-3">
							{tags.map((tag, index) => (
								<div key={tag.id}>
									<div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
										{editingTag === tag.id ? (
											<div className="flex flex-1 items-center gap-4">
												{validationError && editingTag === tag.id && (
													<Alert variant="destructive" className="mb-4">
														<AlertTriangle className="h-4 w-4" />
														<AlertDescription>{validationError}</AlertDescription>
													</Alert>
												)}
												<div className="flex-1 max-w-xs">
													<Input value={tag.name} onChange={(e) => updateTagField(tag.id, "name", e.target.value)} placeholder="Nombre de categoría" maxLength={30} />
												</div>
												<ColorSelector value={tag.color} onChange={(value) => updateTagField(tag.id, "color", value)} className="w-40" />
												<div className="flex gap-2">
													<Button size="sm" onClick={() => handleUpdateTag(tag.id)} disabled={isSubmitting} className="min-w-[70px]">
														{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
													</Button>
													<Button size="sm" variant="outline" onClick={handleEditCancel} disabled={isSubmitting}>
														<X className="h-4 w-4" />
													</Button>
												</div>
											</div>
										) : (
											<>
												<div className="flex items-center gap-4 flex-1">
													<Badge variant="outline" className={`${getTagColorClass(tag.color)} font-medium`}>
														{tag.name}
													</Badge>
													<span className="text-sm text-muted-foreground">{tag.count === 0 ? "Sin uso" : `Usado en ${tag.count} ${tag.count === 1 ? "actividad" : "actividades"}`}</span>
												</div>
												<div className="flex gap-2">
													<Button size="sm" variant="ghost" onClick={() => handleEditStart(tag)} disabled={isSubmitting}>
														<Edit className="h-4 w-4" />
													</Button>
													<Dialog>
														<DialogTrigger asChild>
															<Button size="sm" variant="ghost" disabled={isSubmitting}>
																<Trash className="h-4 w-4 text-destructive" />
															</Button>
														</DialogTrigger>
														<DialogContent>
															<DialogHeader>
																<DialogTitle>Confirmar eliminación</DialogTitle>
																<DialogDescription className="space-y-2">
																	<p>
																		¿Estás seguro de que quieres eliminar la categoría <strong>&quot;{tag.name}&quot;</strong>?
																	</p>
																	{tag.count > 0 && (
																		<div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
																			<p className="text-sm text-yellow-800">
																				⚠️ Esta categoría está siendo usada en {tag.count} {tag.count === 1 ? "actividad" : "actividades"}.
																			</p>
																		</div>
																	)}
																	<p className="text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
																</DialogDescription>
															</DialogHeader>
															<DialogFooter>
																<Button variant="outline">Cancelar</Button>
																<Button variant="destructive" onClick={() => handleDeleteTag(tag.id)} disabled={isSubmitting}>
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
											</>
										)}
									</div>
									{index < tags.length - 1 && <Separator className="my-2" />}
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

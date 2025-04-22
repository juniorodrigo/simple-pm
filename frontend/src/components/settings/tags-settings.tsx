"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Save, Trash, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function TagsSettings() {
	const { toast } = useToast();
	// Mock data for tags
	const [tags, setTags] = useState([
		{ id: "1", name: "Infraestructura", color: "blue", count: 8 },
		{ id: "2", name: "Desarrollo", color: "green", count: 12 },
		{ id: "3", name: "Mantenimiento", color: "yellow", count: 5 },
		{ id: "4", name: "Crítico", color: "red", count: 3 },
		{ id: "5", name: "Baja Prioridad", color: "gray", count: 7 },
	]);

	const [editingTag, setEditingTag] = useState<string | null>(null);
	const [newTagName, setNewTagName] = useState("");
	const [newTagColor, setNewTagColor] = useState("blue");

	const colors = [
		{ name: "Rojo", value: "red" },
		{ name: "Verde", value: "green" },
		{ name: "Azul", value: "blue" },
		{ name: "Amarillo", value: "yellow" },
		{ name: "Púrpura", value: "purple" },
		{ name: "Rosa", value: "pink" },
		{ name: "Gris", value: "gray" },
	];

	const handleAddTag = () => {
		if (newTagName.trim() === "") return;

		const newTag = {
			id: `${tags.length + 1}`,
			name: newTagName,
			color: newTagColor,
			count: 0,
		};

		setTags([...tags, newTag]);
		setNewTagName("");
		setNewTagColor("blue");

		toast({
			title: "Etiqueta creada",
			description: `La etiqueta "${newTagName}" ha sido creada exitosamente.`,
		});
	};

	const handleUpdateTag = (id: string, name: string, color: string) => {
		setTags(tags.map((tag) => (tag.id === id ? { ...tag, name, color } : tag)));
		setEditingTag(null);

		toast({
			title: "Etiqueta actualizada",
			description: `La etiqueta "${name}" ha sido actualizada exitosamente.`,
		});
	};

	const handleDeleteTag = (id: string) => {
		const tagToDelete = tags.find((tag) => tag.id === id);
		setTags(tags.filter((tag) => tag.id !== id));

		toast({
			title: "Etiqueta eliminada",
			description: tagToDelete ? `La etiqueta "${tagToDelete.name}" ha sido eliminada.` : "La etiqueta ha sido eliminada.",
		});
	};

	const getTagColorClass = (color: string) => {
		switch (color) {
			case "red":
				return "bg-red-100 text-red-800 border-red-200";
			case "green":
				return "bg-green-100 text-green-800 border-green-200";
			case "blue":
				return "bg-blue-100 text-blue-800 border-blue-200";
			case "yellow":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "purple":
				return "bg-purple-100 text-purple-800 border-purple-200";
			case "pink":
				return "bg-pink-100 text-pink-800 border-pink-200";
			case "gray":
				return "bg-gray-100 text-gray-800 border-gray-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Crear Nueva Etiqueta</CardTitle>
					<CardDescription>Crea etiquetas para categorizar proyectos y actividades</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1">
							<Label htmlFor="tag-name">Nombre de Etiqueta</Label>
							<Input id="tag-name" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="Ingrese nombre de etiqueta" />
						</div>
						<div className="w-full md:w-48">
							<Label htmlFor="tag-color">Color</Label>
							<Select value={newTagColor} onValueChange={setNewTagColor}>
								<SelectTrigger id="tag-color">
									<SelectValue placeholder="Seleccionar color" />
								</SelectTrigger>
								<SelectContent>
									{colors.map((color) => (
										<SelectItem key={color.value} value={color.value}>
											<div className="flex items-center">
												<div className={`w-4 h-4 rounded-full mr-2 bg-${color.value}-500`} />
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
								Añadir Etiqueta
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Gestionar Etiquetas</CardTitle>
					<CardDescription>Editar o eliminar etiquetas existentes</CardDescription>
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
												setTags(tags.map((t) => (t.id === tag.id ? { ...t, color: value } : t)));
											}}
										>
											<SelectTrigger className="w-32">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{colors.map((color) => (
													<SelectItem key={color.value} value={color.value}>
														<div className="flex items-center">
															<div className={`w-4 h-4 rounded-full mr-2 bg-${color.value}-500`} />
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
														<DialogTitle>Eliminar Etiqueta</DialogTitle>
														<DialogDescription>¿Estás seguro de que quieres eliminar la etiqueta &quot;{tag.name}&quot;? Esta acción no se puede deshacer.</DialogDescription>
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
						{tags.length === 0 && <div className="text-center py-6 text-muted-foreground">No se encontraron etiquetas. Crea tu primera etiqueta arriba.</div>}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { BaseStage } from "@/types/stage.type";
import { Edit, Plus, Save, Trash, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StagesService } from "@/services/stages.service";
import { Badge } from "@/components/ui/badge";
import { COLORS, getTagColorClass, getStageColorTailwind, getStageColorValue } from "@/lib/colors";
import { Colors } from "@/types/enums";

const newStageSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().min(1, "Description is required"),
	color: z.nativeEnum(Colors).nullable(),
	colorHex: z.string().optional(),
});

type ProjectStagesModalProps = {
	projectId: number;
	stages: BaseStage[];
	onClose: () => void;
	onSave: (stages: BaseStage[]) => void;
};

export default function ProjectStagesModal({ projectId, stages: initialStages, onClose, onSave }: ProjectStagesModalProps) {
	// Aplanamos el array anidado si es necesario
	let flattenedStages: BaseStage[] = Array.isArray(initialStages) ? (Array.isArray(initialStages[0]) ? initialStages[0] : initialStages) : [];

	// Asignar colorHex predeterminados para stages con color null pero sin colorHex
	flattenedStages = flattenedStages.map((stage) => {
		if (stage.color === null && !stage.colorHex) {
			return { ...stage, colorHex: "#3b82f6" }; // Azul por defecto
		}
		return stage;
	});

	console.log("Stages procesados:", JSON.stringify(flattenedStages));

	const { toast } = useToast();
	const [stages, setStages] = useState<BaseStage[]>(flattenedStages);
	const [editingStage, setEditingStage] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [showForm, setShowForm] = useState<boolean>(false);

	const form = useForm<z.infer<typeof newStageSchema>>({
		resolver: zodResolver(newStageSchema),
		defaultValues: {
			name: "",
			description: "",
			color: null,
			colorHex: "#3b82f6",
		},
	});

	const handleAddStage = async (values: z.infer<typeof newStageSchema>) => {
		setLoading(true);

		const newStageObj: BaseStage = {
			...values,
			id: `temp-${Date.now()}`,
			projectId: projectId,
			ordinalNumber: stages.length + 1,
			color: null,
			colorHex: values.colorHex,
		};

		try {
			const response = await StagesService.createStage(String(projectId), newStageObj);

			if (response.success) {
				const createdStage = response.data;
				setStages([...stages, createdStage]);
				form.reset({
					name: "",
					description: "",
					color: null,
					colorHex: "#3b82f6",
				});
				onSave([...stages, createdStage]);
				setShowForm(false);

				toast({
					title: "Etapa creada",
					description: `La etapa "${values.name}" ha sido creada.`,
				});
			} else {
				toast({
					title: "Error creating stage",
					description: response.message || "An error occurred while creating the stage.",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to create stage. Please try again.",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleUpdateStage = async (id: string) => {
		const stageToUpdate = stages.find((stage) => stage.id === id);
		if (!stageToUpdate) return;

		console.log("Antes de actualizar:", {
			nombre: stageToUpdate.name,
			color: stageToUpdate.color,
			colorHex: stageToUpdate.colorHex,
			colorTipo: typeof stageToUpdate.color,
		});

		setLoading(true);

		try {
			const response = await StagesService.updateStage(id, stageToUpdate);

			if (response.success) {
				console.log("Respuesta de API:", response.data);

				// Preservar el colorHex original si no viene en la respuesta
				if (response.data.color === null && !response.data.colorHex && stageToUpdate.colorHex) {
					console.log("Preservando colorHex original:", stageToUpdate.colorHex);
					response.data.colorHex = stageToUpdate.colorHex;
				}

				const updatedStages = stages.map((stage) => (stage.id === id ? response.data : stage));
				console.log("Después de actualizar:", {
					nombre: response.data.name,
					color: response.data.color,
					colorHex: response.data.colorHex,
					colorTipo: typeof response.data.color,
				});
				setStages(updatedStages);
				setEditingStage(null);
				onSave(updatedStages);

				toast({
					title: "Etapa actualizada",
					description: `La etapa "${stageToUpdate.name}" ha sido actualizada.`,
				});
			} else {
				toast({
					title: "Error updating stage",
					description: response.message || "An error occurred while updating the stage.",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to update stage. Please try again.",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteStage = async (id: string) => {
		const stageToDelete = stages.find((stage) => stage.id === id);
		if (!stageToDelete) return;

		setLoading(true);

		try {
			const response = await StagesService.deleteStage(id);

			if (response.success) {
				const updatedStages = stages.filter((stage) => stage.id !== id);
				setStages(updatedStages);
				onSave(updatedStages);

				toast({
					title: "Etapa eliminada",
					description: `La etapa "${stageToDelete.name}" ha sido eliminada.`,
				});
			} else {
				toast({
					title: "Error deleting stage",
					description: response.message || "An error occurred while deleting the stage.",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to delete stage. Please try again.",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const moveStage = async (id: string, direction: "up" | "down") => {
		const stageIndex = stages.findIndex((stage) => stage.id === id);
		if (stageIndex === -1) return;

		if (direction === "up" && stageIndex === 0) return;
		if (direction === "down" && stageIndex === stages.length - 1) return;

		setLoading(true);

		try {
			// Según las instrucciones:
			// Para "subir" en la interfaz (reducir ordinalNumber) usamos behavior "down"
			// Para "bajar" en la interfaz (aumentar ordinalNumber) usamos behavior "up"
			const toggleBehavior = direction === "up" ? "down" : "up";

			const response = await StagesService.toggleStage(id, toggleBehavior);

			if (response.success) {
				// Actualizamos con los datos devueltos por la API
				if (response.data && Array.isArray(response.data)) {
					setStages(response.data);
					onSave(response.data);
				} else {
					// Actualización manual como fallback
					const newStages = [...stages];
					const targetIndex = direction === "up" ? stageIndex - 1 : stageIndex + 1;

					// Swap the stages
					const temp = newStages[stageIndex];
					newStages[stageIndex] = newStages[targetIndex];
					newStages[targetIndex] = temp;

					// Update order values
					newStages.forEach((stage, index) => {
						stage.ordinalNumber = index + 1;
					});

					setStages(newStages);
					onSave(newStages);
				}
			} else {
				toast({
					title: "Error moving stage",
					description: response.message || "An error occurred while changing stage order.",
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to change stage order. Please try again.",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-end items-center mb-4">
				<Button onClick={() => setShowForm(!showForm)} variant={showForm ? "outline" : "default"} size="sm">
					{showForm ? (
						<>
							<X className="mr-2 h-4 w-4" />
							Cancelar
						</>
					) : (
						<>
							<Plus className="mr-2 h-4 w-4" />
							Añadir Hito
						</>
					)}
				</Button>
			</div>

			{showForm && (
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleAddStage)} className="space-y-4 border p-4 rounded-lg">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nombre</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Ingrese el nombre" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Descripción</FormLabel>
									<FormControl>
										<Textarea {...field} placeholder="Ingrese la descripción" rows={3} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="colorHex"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Color</FormLabel>
									<div className="flex items-center gap-3 mt-1.5">
										<Input type="color" {...field} className="w-12 h-8 p-1 border rounded cursor-pointer" title="Seleccionar color" />
										<div className="flex gap-2">
											{COLORS.map((color) => (
												<button
													key={color.value}
													type="button"
													className={`w-6 h-6 rounded-full border-2 ${field.value === getStageColorValue(color.value) ? "border-primary" : "border-gray-300"} ${getStageColorTailwind(color.value)}`}
													onClick={() => field.onChange(getStageColorValue(color.value))}
													title={color.name}
												/>
											))}
										</div>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end space-x-2 pt-2">
							<Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={loading}>
								Cancelar
							</Button>
							<Button type="submit" disabled={loading}>
								<Plus className="mr-2 h-4 w-4" />
								Crear
							</Button>
						</div>
					</form>
				</Form>
			)}

			<div className="">
				<h3 className="font-medium mb-2">Etapas</h3>
				<div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
					{stages.map((stage) => (
						<div key={stage.id} className="flex items-center justify-between p-3 border rounded-lg">
							{editingStage === stage.id ? (
								<div className="flex-1 space-y-3">
									<Input
										value={stage.name}
										onChange={(e) => {
											setStages(stages.map((s) => (s.id === stage.id ? { ...s, name: e.target.value } : s)));
										}}
										placeholder="Nombre de la etapa"
									/>
									<Textarea
										value={stage.description}
										onChange={(e) => {
											setStages(stages.map((s) => (s.id === stage.id ? { ...s, description: e.target.value } : s)));
										}}
										placeholder="Descripción de la etapa"
										rows={2}
									/>
									<div className="flex items-center gap-3">
										<Input
											type="color"
											value={stage.colorHex || "#3b82f6"}
											onChange={(e) => {
												setStages(stages.map((s) => (s.id === stage.id ? { ...s, colorHex: e.target.value, color: null } : s)));
											}}
											className="w-12 h-8 p-1 border rounded cursor-pointer"
											title="Seleccionar color"
										/>
										<div className="flex gap-2">
											{COLORS.map((color) => (
												<button
													key={color.value}
													type="button"
													className={`w-6 h-6 rounded-full border-2 ${stage.colorHex === getStageColorValue(color.value) ? "border-primary" : "border-gray-300"} ${getStageColorTailwind(color.value)}`}
													onClick={() => {
														setStages(stages.map((s) => (s.id === stage.id ? { ...s, colorHex: getStageColorValue(color.value), color: null } : s)));
													}}
													title={color.name}
												/>
											))}
										</div>
									</div>
									<div className="flex gap-2 pt-2">
										<Button size="sm" onClick={() => handleUpdateStage(stage.id)} disabled={loading}>
											<Save className="h-4 w-4 mr-1" /> Save
										</Button>
										<Button size="sm" variant="outline" onClick={() => setEditingStage(null)} disabled={loading}>
											<X className="h-4 w-4 mr-1" /> Cancel
										</Button>
									</div>
								</div>
							) : (
								<>
									<div className="flex items-center gap-4">
										<div className="flex items-center">
											<span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-secondary-foreground font-medium text-sm mr-2">{stage.ordinalNumber}</span>
											<Badge
												variant="outline"
												className={getTagColorClass(stage.color, stage.colorHex)}
												style={stage.color === null && stage.colorHex ? { backgroundColor: stage.colorHex + "20", borderColor: stage.colorHex, color: stage.colorHex } : {}}
												onClick={() => console.log("Stage color debug:", { name: stage.name, color: stage.color, colorHex: stage.colorHex, colorType: typeof stage.color })}
											>
												{stage.name}
											</Badge>
										</div>
										<span className="text-sm text-muted-foreground line-clamp-1">{stage.description}</span>
									</div>
									<div className="flex gap-1">
										<Button size="sm" variant="ghost" onClick={() => moveStage(stage.id, "up")} disabled={stage.ordinalNumber === 1 || loading}>
											↑
										</Button>
										<Button size="sm" variant="ghost" onClick={() => moveStage(stage.id, "down")} disabled={stage.ordinalNumber === stages.length || loading}>
											↓
										</Button>
										<Button size="sm" variant="ghost" onClick={() => setEditingStage(stage.id)} disabled={loading}>
											<Edit className="h-4 w-4" />
										</Button>
										<Dialog>
											<DialogTrigger asChild>
												<Button size="sm" variant="ghost" disabled={loading}>
													<Trash className="h-4 w-4 text-destructive" />
												</Button>
											</DialogTrigger>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>Eliminar etapa</DialogTitle>
													<DialogDescription>¿Estás seguro de eliminar la etapa &quot;{stage.name}&quot;? Esta acción no se podrá deshacer.</DialogDescription>
												</DialogHeader>
												<DialogFooter>
													<DialogClose asChild>
														<Button variant="outline" disabled={loading}>
															Cancelar
														</Button>
													</DialogClose>
													<Button variant="destructive" onClick={() => handleDeleteStage(stage.id)} disabled={loading}>
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
					{stages.length === 0 && <div className="text-center py-6 text-muted-foreground">No stages found. Create your first stage above.</div>}
				</div>
			</div>

			<div className="flex justify-end space-x-2 pt-2">
				<Button variant="outline" onClick={onClose} disabled={loading}>
					Cerrar
				</Button>
			</div>
		</div>
	);
}

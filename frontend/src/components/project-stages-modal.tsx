"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { BaseStage } from "@/app/types/stage.type";
import { Colors } from "@/app/types/enums";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Save, Trash, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type ProjectStagesModalProps = {
	projectId: number;
	stages: BaseStage[];
	onClose: () => void;
	onSave: (stages: BaseStage[]) => void;
};

export default function ProjectStagesModal({ projectId, stages: initialStages, onClose, onSave }: ProjectStagesModalProps) {
	const { toast } = useToast();
	const [stages, setStages] = useState<BaseStage[]>(initialStages);
	const [editingStage, setEditingStage] = useState<string | null>(null);
	const [newStage, setNewStage] = useState<Omit<BaseStage, "id">>({
		name: "",
		description: "",
		color: Colors.BLUE,
		ordinalNumber: 0,
	});

	const colors = [
		{ name: "Red", value: Colors.RED },
		{ name: "Green", value: Colors.GREEN },
		{ name: "Blue", value: Colors.BLUE },
		{ name: "Yellow", value: Colors.YELLOW },
		{ name: "Purple", value: Colors.PURPLE },
		{ name: "PINK", value: Colors.PINK },
		{ name: "Gray", value: Colors.GRAY },
	];

	const handleAddStage = () => {
		if (newStage.name.trim() === "") return;

		const newStageObj: BaseStage = {
			...newStage,
			id: `s${stages.length + 1}`,
			ordinalNumber: stages.length + 1,
		};

		setStages([...stages, newStageObj]);
		setNewStage({
			name: "",
			description: "",
			color: Colors.BLUE,
			ordinalNumber: 0,
		});

		toast({
			title: "Stage created",
			description: `Stage "${newStage.name}" has been created successfully.`,
		});
	};

	const handleUpdateStage = (id: string) => {
		const stageToUpdate = stages.find((stage) => stage.id === id);
		if (!stageToUpdate) return;

		setStages(stages.map((stage) => (stage.id === id ? { ...stageToUpdate, ordinalNumber: stage.ordinalNumber } : stage)));
		setEditingStage(null);

		toast({
			title: "Stage updated",
			description: `Stage "${stageToUpdate.name}" has been updated successfully.`,
		});
	};

	const handleDeleteStage = (id: string) => {
		const stageToDelete = stages.find((stage) => stage.id === id);
		setStages(stages.filter((stage) => stage.id !== id));

		toast({
			title: "Stage deleted",
			description: stageToDelete ? `Stage "${stageToDelete.name}" has been deleted.` : "Stage has been deleted.",
		});
	};

	const getStageColorClass = (color: string) => {
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

	const moveStage = (id: string, direction: "up" | "down") => {
		const stageIndex = stages.findIndex((stage) => stage.id === id);
		if (stageIndex === -1) return;

		if (direction === "up" && stageIndex === 0) return;
		if (direction === "down" && stageIndex === stages.length - 1) return;

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
	};

	const handleSaveStages = () => {
		onSave(stages);
		onClose();

		toast({
			title: "Stages saved",
			description: "Project stages have been updated successfully.",
		});
	};

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="stage-name">Stage Name</Label>
					<Input id="stage-name" value={newStage.name} onChange={(e) => setNewStage({ ...newStage, name: e.target.value })} placeholder="Enter stage name" />
				</div>

				<div className="space-y-2">
					<Label htmlFor="stage-description">Description</Label>
					<Textarea id="stage-description" value={newStage.description} onChange={(e) => setNewStage({ ...newStage, description: e.target.value })} placeholder="Enter stage description" rows={3} />
				</div>

				<div className="space-y-2">
					<Label htmlFor="stage-color">Color</Label>
					<div className="flex gap-2 mt-1.5">
						{colors.map((color) => (
							<button
								key={color.value}
								type="button"
								className={`w-6 h-6 rounded-full ${newStage.color === color.value ? "ring-2 ring-offset-2 ring-primary" : ""} bg-${color.value}-500`}
								onClick={() => setNewStage({ ...newStage, color: color.value })}
								title={color.name}
							/>
						))}
					</div>
				</div>

				<Button onClick={handleAddStage} className="mt-2">
					<Plus className="mr-2 h-4 w-4" />
					Add Stage
				</Button>
			</div>

			<div className="border-t pt-4">
				<h3 className="font-medium mb-2">Current Stages</h3>
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
										placeholder="Stage name"
									/>
									<Textarea
										value={stage.description}
										onChange={(e) => {
											setStages(stages.map((s) => (s.id === stage.id ? { ...s, description: e.target.value } : s)));
										}}
										placeholder="Stage description"
										rows={2}
									/>
									<div className="flex gap-2">
										{colors.map((color) => (
											<button
												key={color.value}
												type="button"
												className={`w-6 h-6 rounded-full ${stage.color === color.value ? "ring-2 ring-offset-2 ring-primary" : ""} bg-${color.value}-500`}
												onClick={() => {
													setStages(stages.map((s) => (s.id === stage.id ? { ...s, color: color.value } : s)));
												}}
												title={color.name}
											/>
										))}
									</div>
									<div className="flex gap-2 pt-2">
										<Button size="sm" onClick={() => handleUpdateStage(stage.id)}>
											<Save className="h-4 w-4 mr-1" /> Save
										</Button>
										<Button size="sm" variant="outline" onClick={() => setEditingStage(null)}>
											<X className="h-4 w-4 mr-1" /> Cancel
										</Button>
									</div>
								</div>
							) : (
								<>
									<div className="flex items-center gap-4">
										<div className="flex items-center">
											<span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-secondary-foreground font-medium text-sm mr-2">{stage.ordinalNumber}</span>
											<Badge variant="outline" className={getStageColorClass(stage.color)}>
												{stage.name}
											</Badge>
										</div>
										<span className="text-sm text-muted-foreground line-clamp-1">{stage.description}</span>
									</div>
									<div className="flex gap-1">
										<Button size="sm" variant="ghost" onClick={() => moveStage(stage.id, "up")} disabled={stage.ordinalNumber === 1}>
											↑
										</Button>
										<Button size="sm" variant="ghost" onClick={() => moveStage(stage.id, "down")} disabled={stage.ordinalNumber === stages.length}>
											↓
										</Button>
										<Button size="sm" variant="ghost" onClick={() => setEditingStage(stage.id)}>
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
													<DialogTitle>Delete Stage</DialogTitle>
													<DialogDescription>Are you sure you want to delete the stage &quot;{stage.name}&quot;? This action cannot be undone.</DialogDescription>
												</DialogHeader>
												<DialogFooter>
													<Button variant="outline">Cancel</Button>
													<Button variant="destructive" onClick={() => handleDeleteStage(stage.id)}>
														Delete
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

			<div className="flex justify-end space-x-2 pt-2 ">
				<Button variant="outline" onClick={onClose}>
					Cancel
				</Button>
				<Button onClick={handleSaveStages}>Save Stages</Button>
			</div>
		</div>
	);
}

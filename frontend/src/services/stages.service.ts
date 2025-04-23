import { ApiResponse } from "@/app/types/api-response.type";
import { BaseStage } from "../app/types/stage.type";

export type ToggleStageBehavior = "up" | "down";

const getStages = async (projectId: string): Promise<ApiResponse> => {
	try {
		const petition = await fetch(`/api/is/stages/${projectId}`, { method: "GET" });

		console.log(petition);

		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

const deleteStage = async (stageId: string): Promise<ApiResponse> => {
	try {
		const petition = await fetch(`/api/is/stages/${stageId}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
		});
		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

const createStage = async (projectId: string, stage: BaseStage): Promise<ApiResponse> => {
	try {
		const petition = await fetch(`/api/is/stages/${projectId}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(stage),
		});

		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

const updateStage = async (userId: string, Stage: BaseStage): Promise<ApiResponse> => {
	try {
		const petition = await fetch(`/api/is/stages/${userId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(Stage),
		});

		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

const toggleStage = async (stageId: string, toggleBehavior: ToggleStageBehavior): Promise<ApiResponse> => {
	try {
		const petition = await fetch(`/api/is/stages/toggle`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ id: stageId, toggleBehavior }),
		});

		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

export const StagesService = {
	getStages,
	deleteStage,
	createStage,
	updateStage,
	toggleStage,
};

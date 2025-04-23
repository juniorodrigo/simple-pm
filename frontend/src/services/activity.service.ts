import { ApiResponse } from "@/app/types/api-response.type";
import { BaseActivity } from "../app/types/activity.type";

export type ToggleActivityBehavior = "up" | "down";

const getActivitys = async (projectId: string): Promise<ApiResponse> => {
	try {
		const petition = await fetch(`/api/is/activities/${projectId}`, { method: "GET" });

		console.log(petition);

		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

const deleteActivity = async (activityId: string): Promise<ApiResponse> => {
	try {
		const petition = await fetch(`/api/is/activities/${activityId}`, {
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

const createActivity = async (stageId: string, activity: BaseActivity): Promise<ApiResponse> => {
	try {
		console.log("activity____________________", JSON.stringify(activity));

		const petition = await fetch(`/api/is/activities/stage/${stageId}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(activity),
		});

		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

const updateActivity = async (userId: string, Activity: BaseActivity): Promise<ApiResponse> => {
	try {
		const petition = await fetch(`/api/is/activities/${userId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(Activity),
		});

		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

export const ActivitysService = {
	getActivitys,
	deleteActivity,
	createActivity,
	updateActivity,
};

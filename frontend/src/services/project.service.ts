import { ApiResponse } from "@/types/api-response.type";
import { Project, ProjectCreate, ProjectUpdate } from "../types/new/project.type";
import { env } from "@/env.mjs";

const HOST = env.NEXT_PUBLIC_HOST;

const getProjects = async (userId: string | null): Promise<ApiResponse> => {
	try {
		const url = userId ? `/api/is/projects?userId=${userId}` : `/api/is/projects?userId=`;
		const petition = await fetch(url, { method: "GET" });
		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

const getSingleProject = async (projectId: string): Promise<ApiResponse> => {
	try {
		const petition = await fetch(`${HOST}/api/is/projects/${projectId}`, { method: "GET" });

		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

const deleteProject = async (projectId: string): Promise<ApiResponse> => {
	try {
		const petition = await fetch(`/api/is/projects/${projectId}`, {
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

const createProject = async (project: ProjectCreate): Promise<ApiResponse> => {
	try {
		const petition = await fetch(`/api/is/projects`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(project),
		});

		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

const updateProject = async (projectId: string, project: ProjectUpdate): Promise<ApiResponse> => {
	try {
		const petition = await fetch(`/api/is/projects/${projectId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(project),
		});

		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

const addUserToProjects = async (userId: string, projectIds: number[], addToAllActivities: boolean = false): Promise<ApiResponse> => {
	try {
		const petition = await fetch(`/api/is/projects/bulk-add-member`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ userId, projectIds, addToAllActivities }),
		});

		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

const addUserToAllActivities = async (userId: string, projectIds: number[]): Promise<ApiResponse> => {
	try {
		const petition = await fetch(`/api/is/projects/bulk-add-to-activities`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ userId, projectIds }),
		});

		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

export const ProjectsService = {
	getProjects,
	deleteProject,
	createProject,
	updateProject,
	getSingleProject,
	addUserToProjects,
	addUserToAllActivities,
};

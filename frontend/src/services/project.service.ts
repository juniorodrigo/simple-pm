import { ApiResponse } from "@/app/types/api-response.type";
import { BaseProject } from "../app/types/project.type";

const getProjects = async (): Promise<ApiResponse> => {
	try {
		const petition = await fetch("/api/is/projects", { method: "GET" });
		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

const getSingleProject = async (projectId: string): Promise<ApiResponse> => {
	try {
		const petition = await fetch(`/api/is/projects/${projectId}`, { method: "GET" });
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

const createProject = async (project: BaseProject): Promise<ApiResponse> => {
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

const updateProject = async (projectId: string, project: BaseProject): Promise<ApiResponse> => {
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

export const ProjectsService = {
	getProjects,
	deleteProject,
	createProject,
	updateProject,
	getSingleProject,
};

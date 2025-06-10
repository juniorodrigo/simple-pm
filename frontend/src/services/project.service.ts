import { ApiResponse } from "@/types/api-response.type";
import { Project, ProjectCreate, ProjectUpdate } from "../types/new/project.type";
import { env } from "@/env.mjs";

const HOST = env.NEXT_PUBLIC_HOST || "http://localhost:4141";

const getProjects = async (userId: string | null): Promise<ApiResponse> => {
	try {
		const petition = await fetch("/api/is/projects", { method: "GET" });
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

export const ProjectsService = {
	getProjects,
	deleteProject,
	createProject,
	updateProject,
	getSingleProject,
};

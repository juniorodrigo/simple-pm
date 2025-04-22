import { ApiResponse } from "@/app/types/api-response.type";
import { Tag } from "../app/types/tag.type";
import { Role } from "@/app/types/enums";

const getTags = async (): Promise<ApiResponse> => {
	try {
		const petition = await fetch("/api/is/tags", { method: "GET" });
		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

const deleteTag = async (tagId: string): Promise<ApiResponse> => {
	try {
		const petition = await fetch(`/api/is/Tags/${tagId}`, {
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

const createTag = async (name: string, color: string): Promise<ApiResponse> => {
	try {
		const petition = await fetch(`/api/is/Tags`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				name,
				color,
			}),
		});

		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

const updateTag = async (userId: string, Tag: Tag): Promise<ApiResponse> => {
	try {
		const petition = await fetch(`/api/is/Tags/${userId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(Tag),
		});

		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

export const TagsService = {
	getTags,
	deleteTag,
	createTag,
	updateTag,
};

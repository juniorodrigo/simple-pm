import { ApiResponse } from "@/types/api-response.type";
import { User } from "../types/user.type";
import { Role } from "@/types/enums";

const getUsers = async (): Promise<ApiResponse> => {
	try {
		const petition = await fetch("/api/is/users", { method: "GET" });
		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

const deleteUser = async (userId: string): Promise<ApiResponse> => {
	try {
		const petition = await fetch(`/api/is/users/${userId}`, {
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

const createUser = async (username: string, name: string, lastname: string, email: string, role: Role, isActive: boolean): Promise<ApiResponse> => {
	try {
		const petition = await fetch(`/api/is/users`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username,
				name,
				lastname,
				email,
				role,
				isActive,
			}),
		});

		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

const updateUser = async (userId: string, user: User): Promise<ApiResponse> => {
	try {
		const petition = await fetch(`/api/is/users/${userId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(user),
		});

		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

export const UsersService = {
	getUsers,
	deleteUser,
	createUser,
	updateUser,
};

import HOST from "@/lib/host";
import { SResponse } from "@/types/common";
import { User, UserCreate, UserUpdate } from "@/types/user.type";

export class UserService {
	static async createUser(userData: UserCreate): Promise<SResponse<User>> {
		try {
			const response = await fetch(HOST + "/config/users", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(userData),
			});

			if (!response.ok && response.status >= 500) throw new Error("Algo ocurrió mal al crear el usuario");

			const payload = await response.json();
			if (!payload.success) return { success: false, message: payload.message };

			return payload;
		} catch (error) {
			console.log(error);
			return { success: false, message: "Algo ocurrió mal al crear el usuario" };
		}
	}
	static async updateUser(userId: string, userData: UserUpdate): Promise<SResponse<User>> {
		try {
			const response = await fetch(HOST + `/config/users/${userId}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(userData),
			});

			if (!response.ok && response.status >= 500) throw new Error("Algo ocurrió mal al actualizar el usuario");

			const payload = await response.json();
			if (!payload.success) return { success: false, message: payload.message };

			return payload;
		} catch (error) {
			console.log(error);
			return { success: false, message: "Algo ocurrió mal al actualizar el usuario" };
		}
	}
	static async deleteUser(userId: string): Promise<SResponse<any>> {
		try {
			const response = await fetch(HOST + `/config/users/${userId}`, {
				method: "DELETE",
			});

			if (!response.ok && response.status >= 500) throw new Error("Algo ocurrió mal al eliminar el usuario");

			const payload = await response.json();
			if (!payload.success) return { success: false, message: payload.message };

			return payload;
		} catch (error) {
			console.log(error);
			return { success: false, message: "Algo ocurrió mal al eliminar el usuario" };
		}
	}
	static async getAll(): Promise<SResponse<User[]>> {
		try {
			const response = await fetch(HOST + "/config/users");
			if (!response.ok && response.status >= 500) throw new Error("Algo ocurrió mal al obtener los usuarios");

			const payload = await response.json();
			if (!payload.success) return { success: false, message: payload.message };

			return payload;
		} catch (error) {
			console.log(error);
			return { success: false, message: "Algo ocurrió mal al obtener los usuarios" };
		}
	}
}

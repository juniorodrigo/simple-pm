import { Area, AreaCreate, AreaUpdate } from "@/types/area.type";
import HOST from "@/lib/host";
import { SResponse } from "@/types/common";

export class AreaService {
	static async create(area: AreaCreate): Promise<SResponse<Area>> {
		const response = await fetch(HOST + "/areas", {
			method: "POST",
			body: JSON.stringify(area),
		});
		if (!response.ok && response.status >= 500) throw new Error("Algo ocurrió mal al crear el área");

		const payload = await response.json();
		if (!payload.success) return { success: false, message: payload.message };

		return payload;
	}

	static async update(area: AreaUpdate): Promise<SResponse<Area>> {
		const response = await fetch(HOST + "/areas", {
			method: "PUT",
			body: JSON.stringify(area),
		});

		if (!response.ok && response.status >= 500) throw new Error("Algo ocurrió mal al actualizar el área");

		const payload = await response.json();
		if (!payload.success) return { success: false, message: payload.message };

		return payload;
	}

	static async getAll(): Promise<SResponse<Area[]>> {
		const response = await fetch(HOST + "/areas");
		if (!response.ok && response.status >= 500) throw new Error("Algo ocurrió mal al obtener los áreas");

		const payload = await response.json();
		if (!payload.success) return { success: false, message: payload.message };

		return payload;
	}

	static async delete(id: string): Promise<SResponse<any>> {
		const response = await fetch(HOST + `/areas/${id}`, {
			method: "DELETE",
		});

		if (!response.ok && response.status >= 500) throw new Error("Algo ocurrió mal al eliminar el área");

		const payload = await response.json();
		if (!payload.success) return { success: false, message: payload.message };

		return payload;
	}
}

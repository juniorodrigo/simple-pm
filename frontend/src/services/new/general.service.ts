import HOST from "@/lib/host";
import { SResponse } from "@/types/new/common";
import { Organization } from "@/types/organization.type";

export class OrganizationService {
	static async getOrganizationInfo(): Promise<SResponse<Organization>> {
		try {
			const response = await fetch(HOST + "/is/organization", {
				method: "GET",
			});

			if (!response.ok && response.status >= 500) throw new Error("Algo ocurrió mal al obtener la información de la organización");

			const payload = await response.json();
			if (!payload.success) return { success: false, message: payload.message };

			return payload;
		} catch (error) {
			console.log(error);
			return { success: false, message: "Algo ocurrió mal al obtener la información de la organización" };
		}
	}

	static async updateOrganizationInfo(organization: Organization): Promise<SResponse<Organization>> {
		try {
			const response = await fetch(HOST + "/is/organization", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(organization),
			});

			if (!response.ok && response.status >= 500) throw new Error("Algo ocurrió mal al actualizar la información de la organización");

			const payload = await response.json();
			if (!payload.success) return { success: false, message: payload.message };

			return payload;
		} catch (error) {
			console.log(error);
			return { success: false, message: "Algo ocurrió mal al actualizar la información de la organización" };
		}
	}
}

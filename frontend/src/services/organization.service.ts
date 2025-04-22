import { ApiResponse } from "@/app/types/api-response.type";
import { Organization } from "@/app/types/organization.type";

const getOrganizationInfo = async (): Promise<ApiResponse> => {
	try {
		const petition = await fetch("/api/is/organization", {
			method: "GET",
		});

		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

const updateOrganizationInfo = async (organization: Organization): Promise<ApiResponse> => {
	try {
		const petition = await fetch("/api/is/organization", {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(organization),
		});

		return await petition.json();
	} catch (error) {
		return { success: false };
	}
};

export const OrganizationService = {
	getOrganizationInfo,
	updateOrganizationInfo,
};

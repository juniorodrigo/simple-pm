import prisma from '../../services/prisma.service.js';

const createOrganization = async (organization) => {
	const { organizationName } = organization;

	const newOrganization = await prisma.mainSettings.create({
		data: {
			organizationName,
		},
	});

	return { success: true, data: newOrganization };
};

const getOrganizationInfo = async () => {
	const organization = await prisma.mainSettings.findFirst({});
	if (!organization) throw new Error('No se encontró la organización');
	return { success: true, data: organization };
};

const updateOrganizationInfo = async (organization) => {
	const { organizationName } = organization;

	const organizationExists = await prisma.mainSettings.findFirst({});

	if (!organizationExists) throw new Error('No se encontró la organización');

	const updatedOrganization = await prisma.mainSettings.update({
		where: { id: organizationExists.id },
		data: {
			organizationName,
		},
	});
	return { success: true, data: updatedOrganization };
};

export const Service = {
	getOrganizationInfo,
	updateOrganizationInfo,
	createOrganization,
};

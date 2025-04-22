import { Service } from './service.js';

const createOrganization = async (req, res) => {
	const { organizationName } = req.body;
	if (!organizationName) return res.error('El nombre de la organización es requerido');
	try {
		const { data } = await Service.createOrganization({ organizationName });
		res.success(data, 'Organización creada correctamente');
	} catch (error) {
		res.error(error.message);
	}
};

const getOrganizationInfo = async (req, res) => {
	try {
		const { data } = await Service.getOrganizationInfo(req, res);
		res.success(data, 'Información de la organización obtenida correctamente');
	} catch (error) {
		res.error(error.message);
	}
};
const updateOrganizationInfo = async (req, res) => {
	const { organizationName } = req.body;
	if (!organizationName) return res.error('El nombre de la organización es requerido');
	try {
		const { data } = await Service.updateOrganizationInfo({ organizationName });
		res.success(data, 'Información de la organización actualizada correctamente');
	} catch (error) {
		res.error(error.message);
	}
};

export const orgenizationController = {
	getOrganizationInfo,
	updateOrganizationInfo,
	createOrganization,
};

import { Service } from './service.js';

const getProjects = async (req, res) => {
	const { userId } = req.query;
	const { data } = await Service.getProjects(userId);
	res.success(data, 'Proyectos obtenidos correctamente');
};

const getProjectById = async (req, res) => {
	try {
		const projectId = req.params.id;
		const { data } = await Service.getProjectById(projectId);
		res.success(data, 'Proyecto obtenido correctamente');
	} catch (error) {
		console.error(error);
		res.error(`Error al obtener el proyecto: ${error.message}`);
	}
};

const createProject = async (req, res) => {
	try {
		const { name, description, managerUserId, categoryId, areaId } = req.body;

		console.log('Datos del proyecto:', req.body);

		const requiredFields = { name, description, managerUserId, categoryId };

		if (Object.values(requiredFields).some((field) => !field)) {
			return res.error('Faltan campos requeridos para crear el proyecto');
		}

		// Extraer solo los campos permitidos, excluyendo 'id' para evitar conflictos con autoincrement
		const { startDate, endDate, status, team, ...otherFields } = req.body;
		console.log('Datos del proyecto:', req.body);
		const projectData = {
			name,
			description,
			managerUserId,
			categoryId,
			areaId,
			...(startDate && { startDate }),
			...(endDate && { endDate }),
			...(status && { status }),
			...(team && { team }),
		};

		const { success, data } = await Service.createProject(projectData);

		if (success) res.success(data, 'Proyecto creado correctamente');
	} catch (error) {
		console.error(error);
		res.error(`Error al crear el proyecto: ${error.message}`);
	}
};

const updateProject = async (req, res) => {
	try {
		const projectId = req.params.id;
		const projectData = { ...req.body };

		const { success, data } = await Service.updateProject(projectId, projectData);

		if (success) res.success(data, 'Proyecto actualizado correctamente');
	} catch (error) {
		console.error(error);
		res.error(`Error al actualizar el proyecto: ${error.message}`);
	}
};

const deleteProject = async (req, res) => {
	try {
		const projectId = req.params.id;

		const { success } = await Service.deleteProject(projectId);

		if (success) res.success(null, 'Proyecto eliminado correctamente');
	} catch (error) {
		console.error(error);
		res.error(`Error al eliminar el proyecto: ${error.message}`);
	}
};

export const Controller = {
	getProjects,
	createProject,
	updateProject,
	deleteProject,
	getProjectById,
};

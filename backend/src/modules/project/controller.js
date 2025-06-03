import { Service } from './service.js';

const getProjects = async (req, res) => {
	try {
		const { data } = await Service.getProjects();
		res.success(data, 'Proyectos obtenidos correctamente');
	} catch (error) {
		console.error(error);
		res.error(`Error al obtener los proyectos: ${error.message}`);
	}
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
		const { name, description, managerUserId, categoryId } = req.body;
		const requiredFields = { name, description, managerUserId, categoryId };

		if (Object.values(requiredFields).some((field) => !field)) {
			return res.error('Faltan campos requeridos para crear el proyecto');
		}

		// Extraer solo los campos permitidos, excluyendo 'id' para evitar conflictos con autoincrement
		const { startDate, endDate, status, teamMembers, ...otherFields } = req.body;
		const projectData = {
			name,
			description,
			managerUserId,
			categoryId,
			...(startDate && { startDate }),
			...(endDate && { endDate }),
			...(status && { status }),
			...(teamMembers && { teamMembers }),
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

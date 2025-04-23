import { Service } from './service.js';

const getStages = async (req, res) => {
	try {
		const { data } = await Service.getStages();
		res.success(data, 'Proyectos obtenidos correctamente');
	} catch (error) {
		console.error(error);
		res.error(`Error al obtener los proyectos: ${error.message}`);
	}
};

const getStageById = async (req, res) => {
	try {
		const projectId = req.params.id;
		const { data } = await Service.getStageById(projectId);
		res.success(data, 'Proyecto obtenido correctamente');
	} catch (error) {
		console.error(error);
		res.error(`Error al obtener el proyecto: ${error.message}`);
	}
};

const createStage = async (req, res) => {
	try {
		const { name, description, managerUserId, categoryId } = req.body;
		const requiredFields = { name, description, managerUserId, categoryId };

		if (Object.values(requiredFields).some((field) => !field)) {
			return res.error('Faltan campos requeridos para crear el proyecto');
		}

		const projectData = { ...req.body };
		const { success, data } = await Service.createStage(projectData);

		if (success) res.success(data, 'Proyecto creado correctamente');
	} catch (error) {
		console.error(error);
		res.error(`Error al crear el proyecto: ${error.message}`);
	}
};

const updateStage = async (req, res) => {
	try {
		const projectId = req.params.id;
		const projectData = { ...req.body };

		const { success, data } = await Service.updateStage(projectId, projectData);

		if (success) res.success(data, 'Proyecto actualizado correctamente');
	} catch (error) {
		console.error(error);
		res.error(`Error al actualizar el proyecto: ${error.message}`);
	}
};

const deleteStage = async (req, res) => {
	try {
		const projectId = req.params.id;

		const { success } = await Service.deleteStage(projectId);

		if (success) res.success(null, 'Proyecto eliminado correctamente');
	} catch (error) {
		console.error(error);
		res.error(`Error al eliminar el proyecto: ${error.message}`);
	}
};

export const Controller = {
	getStages,
	createStage,
	updateStage,
	deleteStage,
	getStageById,
};

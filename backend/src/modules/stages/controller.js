import { Service } from './service.js';

const getStages = async (req, res) => {
	try {
		const projectId = parseInt(req.params.projectId);
		const { data } = await Service.getStages(projectId);

		res.success(data, 'Stages obtenidos correctamente');
	} catch (error) {
		console.error(error);
		res.error(`Error al obtener los stages: ${error.message}`);
	}
};

const createStage = async (req, res) => {
	try {
		const projectId = parseInt(req.params.projectId);
		const { name, description, color } = req.body;
		const requiredFields = { name, description, color };

		if (Object.values(requiredFields).some((field) => !field)) {
			return res.error('Faltan campos requeridos para crear el stage');
		}

		const stageData = { ...req.body };
		const { success, data } = await Service.createStage(projectId, stageData);

		if (success) res.success(data, 'Stage creado correctamente');
	} catch (error) {
		console.error(error);
		res.error(`Error al crear el stage: ${error.message}`);
	}
};

const updateStage = async (req, res) => {
	try {
		const stageId = req.params.id;
		const { name, description, color } = req.body;
		const requiredFields = { name, description, color };

		if (Object.values(requiredFields).some((field) => !field)) {
			return res.error('Faltan campos requeridos para actualizar el stage');
		}

		const stageData = { ...req.body };
		const { success, data } = await Service.updateStage(stageId, stageData);

		if (success) res.success(data, 'Stage actualizado correctamente');
	} catch (error) {
		console.error(error);
		res.error(`Error al actualizar el stage: ${error.message}`);
	}
};

const toggleStage = async (req, res) => {
	try {
		const { id, toggleBehavior } = req.body;
		const { success, data } = await Service.toggleStage(id, toggleBehavior);

		res.success(data, 'Stage actualizado correctamente');
	} catch (error) {
		res.error(error.message);
	}
};

const deleteStage = async (req, res) => {
	try {
		const stageId = req.params.id;

		const { success } = await Service.deleteStage(stageId);

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
	toggleStage,
};

import { Service } from './service.js';

const getActivities = async (req, res) => {};

const createActivity = async (req, res) => {
	try {
		const { title, description, status, priority, assignedToUserId, startDate, endDate } = req.body;
		const requiredFields = { title, description, status, priority, assignedToUserId, startDate, endDate };
		const stageId = req.params.stageId;

		if (Object.values(requiredFields).some((field) => !field)) {
			res.error('Faltan algunos datos de la actividad');
		}

		const activity = { ...req.body };

		const { data, success } = await Service.createActivity(stageId, activity);

		if (success) res.success(data, 'Actividad creada correctamente');
	} catch (error) {
		console.log(error);
		res.error(`Error al crear la actividad: ${error.message}`);
	}
};

const updateActivity = async (req, res) => {};

const deleteActivity = async (req, res) => {};

export const Controller = {
	getActivities,
	createActivity,
	updateActivity,
	deleteActivity,
};

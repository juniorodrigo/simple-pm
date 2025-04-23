import { Service } from './service.js';

const getActivities = async (req, res) => {};

const createActivity = async (req, res) => {
	try {
		const { title, description, status, priority, assignedToUser, startDate, endDate } = req.body;

		const requiredFields = { title, description, status, priority, assignedToUser, startDate, endDate };
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

const changeStatus = async (req, res) => {
	const activityId = req.params.id;
	const { newStatus } = req.body;

	const { success, data } = await Service.changeStatus(activityId, newStatus);

	if (success) res.success(data, 'Estado de la actividad actualizado correctamente');
	else res.error('Error al actualizar el estado de la actividad');
};

const updateActivity = async (req, res) => {};

const deleteActivity = async (req, res) => {};

export const Controller = {
	getActivities,
	createActivity,
	updateActivity,
	deleteActivity,
	changeStatus,
};

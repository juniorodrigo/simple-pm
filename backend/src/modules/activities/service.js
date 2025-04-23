import prisma from '../../services/prisma.service.js';

const getActivities = async () => {};

const createActivity = async (stageId, activityData) => {
	try {
		const data = await prisma.activity.create({ data: { ...activityData, stageId } });
		return { success: true, data };
	} catch (error) {
		console.log(error);
		return { success: false, message: `Error al crear la actividad: ${error.message}` };
	}
};

const updateActivity = async (stageId, activityData) => {};

const deleteActivity = async (activityId) => {};

export const Service = {
	getActivities,
	createActivity,
	updateActivity,
	deleteActivity,
};

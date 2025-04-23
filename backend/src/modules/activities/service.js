import prisma from '../../services/prisma.service.js';

const getActivities = async () => {};

const createActivity = async (stageId, activityData) => {
	console.log('activityData', activityData);

	const data = await prisma.projectActivity.create({
		data: {
			title: activityData.title,
			description: activityData.description,
			stage: {
				connect: {
					id: stageId,
				},
			},
			status: activityData.status,
			priority: activityData.priority,
			assignedToUser: {
				connect: {
					id: activityData.assignedToUser.id,
				},
			},
			startDate: activityData.startDate,
			endDate: activityData.endDate,
		},
	});
	return { success: true, data };
};

const updateActivity = async (stageId, activityData) => {};

const deleteActivity = async (activityId) => {};

const changeStatus = async (activityId) => {};

export const Service = {
	getActivities,
	createActivity,
	updateActivity,
	deleteActivity,
};

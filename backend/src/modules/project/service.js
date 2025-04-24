import prisma from '../../services/prisma.service.js';

// Función auxiliar para añadir métricas adicionales a un proyecto
const enhanceProject = async (project) => {
	// // Extraer información de categoría
	const categoryColor = project.category?.color || '';
	const categoryName = project.category?.name || '';

	//TODO: Mejorar con include activities
	const stages = await prisma.projectStage.findMany({
		where: { projectId: project.id },
	});
	const activities = await prisma.projectActivity.findMany({
		where: { stageId: { in: stages.map((stage) => stage.id) } },
	});

	if (activities.length === 0)
		return {
			...project,
			activitiesCount: 0,
			progressPercentage: 0,
			categoryColor,
			categoryName,
		};
	else {
		const activitiesCount = activities.length;
		const completedActivities = activities.filter((activity) => activity.status === 'completed').length;
		const progressPercentage = Math.round((completedActivities / activitiesCount) * 100);

		return {
			...project,
			activitiesCount,
			progressPercentage,
			categoryColor,
			categoryName,
		};
	}
};

const getProjects = async () => {
	const projects = await prisma.project.findMany({
		include: {
			category: true,
			manager: {
				select: {
					id: true,
					name: true,
					lastname: true,
					username: true,
					email: true,
					role: true,
					isActive: true,
				},
			},
			ProjectMember: {
				include: {
					user: {
						select: {
							id: true,
							name: true,
							lastname: true,
							username: true,
							email: true,
							role: true,
							isActive: true,
						},
					},
				},
			},
		},
	});

	// Enriquecer cada proyecto con métricas adicionales
	const enhancedProjects = await Promise.all(projects.map((project) => enhanceProject(project)));

	return { success: true, data: enhancedProjects };
};

const getProjectById = async (projectId) => {
	const project = await prisma.project.findUnique({
		where: { id: parseInt(projectId) },
		include: {
			category: true,
			manager: true,
		},
	});

	if (!project) throw new Error('El proyecto no existe');

	const members = await prisma.projectMember.findMany({
		where: { projectId: parseInt(projectId) },
		include: {
			user: true,
		},
	});

	const stages = await prisma.projectStage.findMany({
		where: { projectId: parseInt(projectId) },
		include: {
			ProjectActivity: {
				include: {
					assignedToUser: {
						select: {
							id: true,
							name: true,
							lastname: true,
							role: true,
						},
					},
				},
			},
		},
	});

	const enhancedProject = await enhanceProject(project);

	const { id, name, description, startDate, endDate, progressPercentage, category, manager } = enhancedProject;

	const refinedProject = {
		id,
		name,
		description,
		startDate,
		endDate,
		progressPercentage,
		managerUserId: manager.id,
		managerUserName: manager.name + ' ' + manager.lastname,
		categoryId: category.id,
		categoryName: category.name,
		categoryColor: category.color,
		team: members.map((member) => ({
			id: member.user.id,
			name: member.user.name,
			lastname: member.user.lastname,
			projectRole: member.role,
		})),
		stages: stages.map((stage) => ({
			id: stage.id,
			name: stage.name,
			description: stage.description,
			status: stage.status,
			color: stage.color,
			ordinalNumber: stage.ordinalNumber,
			activities: stage.ProjectActivity,
		})),
	};

	return { success: true, data: refinedProject };
};

const createProject = async (projectData) => {
	const { name, description, startDate, endDate, status, managerUserId, categoryId, teamMembers } = projectData;

	const project = await prisma.project.create({
		data: {
			name,
			description,
			startDate: startDate ? new Date(startDate) : null,
			endDate: endDate ? new Date(endDate) : null,
			status,
			managerUserId,
			categoryId,
		},
		include: {
			category: true,
			manager: {
				select: {
					id: true,
					name: true,
					lastname: true,
					username: true,
					email: true,
					role: true,
					isActive: true,
				},
			},
		},
	});

	const members = teamMembers.map((member) => {
		const newMemberObject = { userId: member, projectId: project.id, role: 'member' };
		if (member == managerUserId) newMemberObject.role = 'manager';
		return newMemberObject;
	});

	const membersCreated = await prisma.projectMember.createMany({
		data: members,
	});

	const stage = await prisma.projectStage.create({
		data: {
			name: 'Inicio',
			description: 'Etapa inicial del proyecto',
			status: 'pending',
			color: 'blue',
			ordinalNumber: 1,
			projectId: project.id,
		},
	});

	if (!stage) throw new Error('Error al crear el stage inicial del proyecto');

	// Enriquecer el proyecto con métricas adicionales
	const enhancedProject = await enhanceProject(project);

	return { success: true, data: enhancedProject };
};

const updateProject = async (projectId, projectData) => {
	const { name, description, startDate, endDate, status, managerUserId, categoryId } = projectData;

	// Verificar si el proyecto existe
	const existingProject = await prisma.project.findUnique({
		where: { id: parseInt(projectId) },
	});

	if (!existingProject) throw new Error('El proyecto no existe');

	// Verificar si existe la categoría
	if (categoryId) {
		const existingCategory = await prisma.projectCategory.findUnique({
			where: { id: categoryId },
		});

		if (!existingCategory) throw new Error('La categoría seleccionada no existe');
	}

	// Verificar si existe el usuario manager
	if (managerUserId) {
		const existingManager = await prisma.user.findUnique({
			where: { id: managerUserId },
		});

		if (!existingManager) throw new Error('El usuario manager no existe');
	}

	const updatedProject = await prisma.project.update({
		where: { id: parseInt(projectId) },
		data: {
			name,
			description,
			startDate: startDate ? new Date(startDate) : undefined,
			endDate: endDate ? new Date(endDate) : undefined,
			status,
			managerUserId,
			categoryId,
		},
		include: {
			category: true,
			manager: {
				select: {
					id: true,
					name: true,
					lastname: true,
					username: true,
					email: true,
					role: true,
					isActive: true,
				},
			},
		},
	});

	// Enriquecer el proyecto actualizado con métricas adicionales
	const enhancedProject = await enhanceProject(updatedProject);

	return { success: true, data: enhancedProject };
};

const deleteProject = async (projectId) => {
	// Verificar si el proyecto existe
	const existingProject = await prisma.project.findUnique({
		where: { id: parseInt(projectId) },
	});

	if (!existingProject) throw new Error('El proyecto no existe');

	// Primero eliminar los miembros del proyecto para evitar restricciones de clave externa
	await prisma.projectMember.deleteMany({
		where: { projectId: parseInt(projectId) },
	});

	// Ahora eliminar el proyecto
	await prisma.project.delete({
		where: { id: parseInt(projectId) },
	});

	return { success: true };
};

export const Service = {
	getProjects,
	createProject,
	updateProject,
	deleteProject,
	getProjectById,
};

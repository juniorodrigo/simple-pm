import prisma from '../../services/prisma.service.js';
import { Role } from '@prisma/client';

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

const getProjects = async (userId) => {
	const user = await prisma.user.findFirst({
		where: { id: userId },
		select: {
			role: true,
			areaId: true,
		},
	});

	let projects = [];

	// En el caso de que pueda ver todo
	if (user.role === Role.admin || user.role === Role.gerente_general) {
		projects = await prisma.project.findMany({
			include: {
				category: true,
				manager: {
					select: {
						id: true,
						name: true,
						lastname: true,
						// username: true,
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
								// username: true,
								email: true,
								role: true,
								isActive: true,
							},
						},
					},
				},
			},
			where: {
				// archived: false, // Solo proyectos activos
			},
		});
	} else if (user.role === Role.gerente_area) {
		console.log('El usuario es gerente de área, obteniendo proyectos de su área', user.areaId);

		projects = await prisma.project.findMany({
			include: {
				category: true,
				manager: {
					select: {
						id: true,
						name: true,
						lastname: true,
						// username: true,
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
								// username: true,
								email: true,
								role: true,
								isActive: true,
							},
						},
					},
				},
			},
			where: {
				areaId: user.areaId,
			},
		});

		console.log('Proyectos obtenidos:', projects.length);
	} else {
		projects = await prisma.project.findMany({
			include: {
				category: true,
				manager: {
					select: {
						id: true,
						name: true,
						lastname: true,
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
								email: true,
								role: true,
								isActive: true,
							},
						},
					},
				},
			},
			where: {
				OR: [{ managerUserId: userId }, { ProjectMember: { some: { userId: userId } } }],
			},
		});
	}

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
		status: project.status,
		archived: project.archived || false, // Asegurarse de que archived sea un booleano
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
	// Extraer los campos necesarios y excluir el 'id' si viene en los datos
	const { name, description, startDate, endDate, status, managerUserId, categoryId, team, areaId } = projectData;

	// console.log('Creando proyecto con datos:', { name, description, managerUserId, categoryId });

	// Construir el objeto data explícitamente sin incluir 'id'
	const projectCreateData = {
		name,
		description,
		startDate: startDate ? new Date(startDate) : null,
		endDate: endDate ? new Date(endDate) : null,
		status: status || 'pending', // valor por defecto
		managerUserId,
		categoryId,
		areaId: areaId || null, // Asegurarse de que areaId sea opcional
	};

	try {
		const project = await prisma.project.create({
			data: projectCreateData,
			include: {
				category: true,
				manager: {
					select: {
						id: true,
						name: true,
						lastname: true,
						email: true,
						role: true,
						isActive: true,
					},
				},
			},
		});

		const members =
			team?.map((member) => {
				const newMemberObject = { userId: member.id, projectId: project.id, role: 'member' };
				if (member == managerUserId) newMemberObject.role = 'manager';
				return newMemberObject;
			}) || [];
		if (members.length > 0) {
			await prisma.projectMember.createMany({
				data: members,
			});
		}

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
	} catch (error) {
		console.error('Error creating project:', error);
		throw new Error(`Error al crear el proyecto: ${error.message}`);
	}
};

const updateProject = async (projectId, projectData) => {
	const { name, description, startDate, endDate, status, managerUserId, categoryId, archived, team } = projectData;

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

	console.log(projectData);
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
			archived: archived || false, // Asegurarse de que archived sea un booleano
		},
		include: {
			category: true,
			manager: {
				select: {
					id: true,
					name: true,
					lastname: true,
					// username: true,
					email: true,
					role: true,
					isActive: true,
				},
			},
		},
	});

	// Actualizar miembros del proyecto si se proporciona el array team
	if (team !== undefined) {
		// Eliminar todos los miembros actuales del proyecto
		await prisma.projectMember.deleteMany({
			where: { projectId: parseInt(projectId) },
		});

		// Crear los nuevos miembros si hay alguno
		const members =
			team?.map((member) => {
				const newMemberObject = { userId: member.id, projectId: parseInt(projectId), role: 'member' };
				if (member.id == managerUserId) newMemberObject.role = 'manager';
				return newMemberObject;
			}) || [];

		if (members.length > 0) {
			await prisma.projectMember.createMany({
				data: members,
			});
		}
	}

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

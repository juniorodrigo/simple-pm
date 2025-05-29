import { Service } from './service.js';
import bcrypt from 'bcrypt';

const saltRounds = 10;

//TODO: No se debe devolver la contraseña en los users o creación o updates

const getUsers = async (req, res) => {
	const { data } = await Service.getUsers(req, res);
	res.success(data, 'Lista de usuarios obtenida correctamente');
};

const createUser = async (req, res) => {
	try {
		const { name, lastname, email, isActive, role } = req.body;
		const requiredFields = { name, lastname, email };

		if (Object.values(requiredFields).some((field) => !field)) {
			res.error('Faltan algunos datos del usuario');
		}

		const password = bcrypt.hash('user', saltRounds);
		const user = { ...req.body, password };

		const { data, success } = await Service.createUser(user);

		if (success) res.success(data, 'Usuario creado correctamente');
	} catch (error) {
		console.log(error);
		res.error(`Error al crear el empleado: ${error.message}`);
	}
};

const updateUser = async (req, res) => {
	try {
		const id = req.params.id;
		const currentUser = { ...req.body };

		const { success, data } = await Service.updateUser(id, currentUser);

		if (success) res.success(data, 'Usuario actualizado correctamente');
	} catch (error) {
		res.error(error.message);
	}
};

const deleteUser = async (req, res) => {
	try {
		const userId = req.params.id;

		const { success } = await Service.deleteUser(userId);

		if (success) res.success(null, 'Usuario eliminado correctamente');
	} catch (error) {
		res.error(error.message);
	}
};

export const Controller = { getUsers, createUser, updateUser, deleteUser };

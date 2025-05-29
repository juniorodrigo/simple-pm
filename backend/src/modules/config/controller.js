import { AreasService, UserService } from '#modules/config/service';
import { NotFoundError, ValidationError } from '#middlewares/errors';
import bcrypt from 'bcrypt';

// This controller handles area management operations such as retrieving, creating, updating, and deleting areas.
const getAreas = async (req, res) => {
	const { data, message } = await AreasService.getAreas();
	if (!data) throw new NotFoundError(message);

	res.success(data, message);
};
const createArea = async (req, res) => {
	const { name } = req.body;
	if (!name) throw new ValidationError('Area name is required');

	const { data, message } = await AreasService.createArea(name);
	if (!data) throw new NotFoundError(message);

	res.success(data, message);
};
const updateArea = async (req, res) => {
	const { id } = req.params;
	const { name, isActive } = req.body;

	if (!id) throw new ValidationError('Area ID is required');
	if (!name) throw new ValidationError('Area name is required');

	const { data, message } = await AreasService.updateArea(id, name, isActive);
	if (!data) throw new NotFoundError(message);

	res.success(data, message);
};
const deleteArea = async (req, res) => {
	const { id } = req.params;

	if (!id) throw new ValidationError('Area ID is required');
	const { data, message } = await AreasService.deleteArea(id);

	res.success(data, message);
};

const getUsers = async (req, res) => {
	const { data, message } = await UserService.getUsers();
	if (!data) throw new NotFoundError(message);

	res.success(data, message);
};
const createUser = async (req, res) => {
	console.log('Creating user with body:', req.body);

	const { name, lastname, email, areaId, role, isActive } = req.body;
	if (!name || !email || !lastname || !areaId || !role || isActive === undefined)
		throw new ValidationError('User name and email are required');

	const userData = req.body;

	userData.password = await bcrypt.hash(userData.name.toLowerCase().replace(/\s+/g, '') + '123', 10);

	const { data, message } = await UserService.createUser(req.body);
	if (!data) throw new NotFoundError(message);

	res.success(data, message);
};
const updateUser = async (req, res) => {
	const { id } = req.params;
	const { name, lastname, email, areaId, role, isActive } = req.body;

	if (!id) throw new ValidationError('User ID is required');
	if (!name && !email && !lastname && !areaId && !role && isActive === undefined)
		throw new ValidationError('User name and email are required');

	const { data, message } = await UserService.updateUser(id, name, lastname, email, areaId, role, isActive);
	if (!data) throw new NotFoundError(message);

	res.success(data, message);
};
const deleteUser = async (req, res) => {
	const { id } = req.params;

	if (!id) throw new ValidationError('User ID is required');
	const { data, message } = await UserService.deleteUser(id);

	res.success(data, message);
};

export const AreaController = {
	getAreas,
	createArea,
	updateArea,
	deleteArea,
};

export const UserController = {
	getUsers,
	createUser,
	updateUser,
	deleteUser,
};

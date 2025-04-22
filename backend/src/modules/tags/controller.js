import { Service } from './service.js';
import bcrypt from 'bcrypt';

const saltRounds = 10;

//TODO: No se debe devolver la contraseña en los users o creación o updates

const getTags = async (req, res) => {
	const { data } = await Service.getTags(req, res);
	res.success(data, 'Lista de tags obtenida correctamente');
};

const createTag = async (req, res) => {
	try {
		const { name, color } = req.body;
		const requiredFields = { name, color };

		if (Object.values(requiredFields).some((field) => !field)) {
			res.error('Faltan algunos datos del tag');
		}

		const tag = { ...req.body };

		const { data, success } = await Service.createTag(tag);

		if (success) res.success(data, 'Tag creado correctamente');
	} catch (error) {
		console.log(error);
		res.error(`Error al crear el tag: ${error.message}`);
	}
};

const updateTag = async (req, res) => {
	try {
		const id = req.params.id;
		const currentTag = { ...req.body };

		const { success, data } = await Service.updateTag(id, currentTag);

		if (success) res.success(data, 'Tag actualizado correctamente');
	} catch (error) {
		res.error(error.message);
	}
};

const deleteTag = async (req, res) => {
	try {
		const tagId = req.params.id;

		const { success } = await Service.deleteTag(tagId);

		if (success) res.success(null, 'Tag eliminado correctamente');
	} catch (error) {
		res.error(error.message);
	}
};

export const Controller = { getTags, createTag, updateTag, deleteTag };

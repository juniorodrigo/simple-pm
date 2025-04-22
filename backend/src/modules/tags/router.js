import express from 'express';
import { Controller } from './controller.js';

const router = express.Router();

router.get('/', Controller.getTags);
router.post('/', Controller.createTag);
router.put('/:id', Controller.updateTag);
router.delete('/:id', Controller.deleteTag);

export default router;

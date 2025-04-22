import express from 'express';
import usersRouter from './modules/users/router.js';
import projectsRouter from './modules/project/router.js';

const router = express.Router();

router.use('/users', usersRouter);
router.use('/projects', projectsRouter);

export default router;

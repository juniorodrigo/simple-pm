import express from 'express';
import usersRouter from './modules/users/router.js';
import projectsRouter from './modules/project/router.js';
import tagsRouter from './modules/tags/router.js';
import organizationRouter from './modules/organization/router.js';

const router = express.Router();

router.use('/users', usersRouter);
router.use('/projects', projectsRouter);
router.use('/tags', tagsRouter);
router.use('/organization', organizationRouter);

export default router;

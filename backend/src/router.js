import express from 'express';
import usersRouter from './modules/users/router.js';
import tagsRouter from './modules/tags/router.js';
import organizationRouter from './modules/organization/router.js';
import projectRouter from './modules/project/router.js';
import stagesRouter from './modules/stages/router.js';
import activitiesRouter from './modules/activities/router.js';

const router = express.Router();

router.use('/users', usersRouter);
router.use('/tags', tagsRouter);
router.use('/organization', organizationRouter);
router.use('/projects', projectRouter);
router.use('/stages', stagesRouter);
router.use('/activities', activitiesRouter);

export default router;

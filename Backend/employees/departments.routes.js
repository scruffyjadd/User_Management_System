const router = require('express').Router();
const departmentsController = require('./departments.controller');
const { authorize } = require('_middleware/authorization');
const Role = require('_helpers/role');

// Routes for departments
router.get('/', authorize(), departmentsController.getAll);
router.get('/:id', authorize(), departmentsController.getById);
router.post('/', authorize(Role.Admin), departmentsController.create);
router.put('/:id', authorize(Role.Admin), departmentsController.update);
router.delete('/:id', authorize(Role.Admin), departmentsController.delete);

module.exports = router;

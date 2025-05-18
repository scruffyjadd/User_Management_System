const router = require('express').Router();
const employeesController = require('./employees.controller');
const { authorize } = require('_middleware/authorization');
const Role = require('_helpers/role');

// Routes for employees
router.get('/', authorize(), employeesController.getAll);
router.get('/:id', authorize(), employeesController.getById);
router.post('/', authorize(Role.Admin), employeesController.create);
router.put('/:id', authorize(), employeesController.update);
router.delete('/:id', authorize(Role.Admin), employeesController.delete);
router.post('/:id/transfer-department', authorize(Role.Admin), employeesController.transferDepartment);

module.exports = router;

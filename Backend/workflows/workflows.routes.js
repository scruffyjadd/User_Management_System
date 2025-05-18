const router = require('express').Router();
const workflowsController = require('./workflows.controller');
const { authorize } = require('_middleware/authorization');
const Role = require('_helpers/role');

// Routes for workflows
router.get('/', authorize(), workflowsController.getAll);
router.get('/:id', authorize(), workflowsController.getById);
router.get('/employee/:employeeId', authorize(), workflowsController.getByEmployee);
router.post('/', authorize(), workflowsController.create);
router.put('/:id/status', authorize(Role.Admin), workflowsController.updateStatus);
router.delete('/:id', authorize(Role.Admin), workflowsController.delete);

module.exports = router;

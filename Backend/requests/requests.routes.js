const router = require('express').Router();
const requestsController = require('./requests.controller');
const { authorize } = require('_middleware/authorization');
const Role = require('_helpers/role');

// Routes for requests
router.get('/', authorize(), requestsController.getAll);
router.get('/employee/:employeeId', authorize(), requestsController.getByEmployee);
router.get('/:id', authorize(), requestsController.getById);
router.post('/', authorize(), requestsController.create);
router.put('/:id', authorize(), requestsController.update);
router.put('/:id/status', authorize(Role.Admin), requestsController.updateStatus);
router.delete('/:id', authorize(), requestsController.delete);

module.exports = router;

const db = require('_helpers/db');
const { Op } = require('sequelize');

module.exports = {
    getAll,
    getById,
    getByEmployee,
    create: createWorkflow,
    updateStatus,
    delete: _delete
};

async function getAll() {
    return await db.Workflow.findAll({
        include: [
            { 
                model: db.Employee,
                include: [
                    { model: db.Account, attributes: ['id', 'firstName', 'lastName'] },
                    { model: db.Department, attributes: ['id', 'name'] }
                ]
            },
            { model: db.Account, as: 'initiatedBy', attributes: ['id', 'firstName', 'lastName'] },
            { model: db.Account, as: 'approvedBy', attributes: ['id', 'firstName', 'lastName'] }
        ],
        order: [['created', 'DESC']]
    });
}

async function getById(id) {
    const workflow = await db.Workflow.findByPk(id, {
        include: [
            { 
                model: db.Employee,
                include: [
                    { model: db.Account, attributes: { exclude: ['passwordHash'] } },
                    { model: db.Department }
                ]
            },
            { model: db.Account, as: 'initiatedBy', attributes: { exclude: ['passwordHash'] } },
            { model: db.Account, as: 'approvedBy', attributes: { exclude: ['passwordHash'] } }
        ]
    });
    if (!workflow) throw 'Workflow not found';
    return workflow;
}

async function getByEmployee(employeeId) {
    return await db.Workflow.findAll({
        where: { employeeId },
        include: [
            { model: db.Account, as: 'initiatedBy', attributes: ['id', 'firstName', 'lastName'] },
            { model: db.Account, as: 'approvedBy', attributes: ['id', 'firstName', 'lastName'] }
        ],
        order: [['created', 'DESC']]
    });
}

async function createWorkflow(params) {
    // Validate employee exists
    const employee = await db.Employee.findByPk(params.employeeId);
    if (!employee) throw 'Employee not found';
    
    // Validate initiator exists
    const initiator = await db.Account.findByPk(params.initiatedById);
    if (!initiator) throw 'Initiator account not found';
    
    // Create workflow
    const workflow = new db.Workflow(params);
    await workflow.save();
    
    return workflow;
}

async function updateStatus(id, status, approvedById) {
    const workflow = await getWorkflow(id);
    
    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
        throw 'Invalid status';
    }
    
    // Validate approver exists if provided
    if (approvedById) {
        const approver = await db.Account.findByPk(approvedById);
        if (!approver) throw 'Approver account not found';
    }
    
    // Update workflow status
    workflow.status = status;
    workflow.approvedById = approvedById || null;
    workflow.completedAt = status !== 'pending' ? new Date() : null;
    workflow.updated = new Date();
    
    await workflow.save();
    
    // If this is a department transfer that was approved, update the employee's department
    if (status === 'approved' && workflow.type === 'department_transfer') {
        const employee = await db.Employee.findByPk(workflow.employeeId);
        if (employee && workflow.details && workflow.details.toDepartmentId) {
            employee.departmentId = workflow.details.toDepartmentId;
            await employee.save();
        }
    }
    
    return workflow;
}

async function _delete(id) {
    const workflow = await getWorkflow(id);
    await workflow.destroy();
}

// Helper function to get workflow by id with error handling
async function getWorkflow(id) {
    const workflow = await db.Workflow.findByPk(id);
    if (!workflow) throw 'Workflow not found';
    return workflow;
}

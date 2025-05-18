const db = require('_helpers/db');
const { Op } = require('sequelize');
const { createWorkflow } = require('../workflows/workflows.controller');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    transferDepartment
};

async function getAll() {
    return await db.Employee.findAll({
        include: [
            { model: db.Account, attributes: ['id', 'firstName', 'lastName', 'email'] },
            { model: db.Department, attributes: ['id', 'name'] }
        ]
    });
}

async function getById(id) {
    const employee = await db.Employee.findByPk(id, {
        include: [
            { model: db.Account, attributes: { exclude: ['passwordHash'] } },
            { model: db.Department }
        ]
    });
    if (!employee) throw 'Employee not found';
    return employee;
}

async function create(params) {
    // Validate account exists
    const account = await db.Account.findByPk(params.accountId);
    if (!account) throw 'Account not found';
    
    // Check if account already has an employee record
    if (await db.Employee.findOne({ where: { accountId: params.accountId } })) {
        throw 'Account already has an employee record';
    }

    // Validate department exists
    if (params.departmentId) {
        const department = await db.Department.findByPk(params.departmentId);
        if (!department) throw 'Department not found';
    }

    // Create employee
    const employee = new db.Employee(params);
    await employee.save();

    // Create workflow for onboarding
    await createWorkflow({
        type: 'onboarding',
        status: 'approved',
        employeeId: employee.id,
        initiatedById: params.initiatedById,
        details: {
            message: 'Employee onboarded',
            position: employee.position,
            departmentId: employee.departmentId
        }
    });

    return employee;
}

async function update(id, params) {
    const employee = await getEmployee(id);
    
    // Validate department exists if being updated
    if (params.departmentId && params.departmentId !== employee.departmentId) {
        const department = await db.Department.findByPk(params.departmentId);
        if (!department) throw 'Department not found';
    }

    // Copy params to employee and save
    Object.assign(employee, params);
    employee.updated = new Date();
    await employee.save();

    return employee;
}

async function _delete(id) {
    const employee = await getEmployee(id);
    
    // Create workflow for offboarding
    await createWorkflow({
        type: 'offboarding',
        status: 'approved',
        employeeId: employee.id,
        initiatedById: employee.accountId, // or admin ID if available
        details: {
            message: 'Employee offboarded',
            lastPosition: employee.position,
            lastDepartmentId: employee.departmentId
        }
    });
    
    // Delete employee record
    await employee.destroy();
}

async function transferDepartment(employeeId, departmentId, initiatedById, reason = '') {
    const employee = await getEmployee(employeeId);
    const fromDepartmentId = employee.departmentId;
    
    // Validate new department exists
    const department = await db.Department.findByPk(departmentId);
    if (!department) throw 'Department not found';
    
    // Update employee department
    employee.departmentId = departmentId;
    employee.updated = new Date();
    await employee.save();
    
    // Create workflow for department transfer
    await createWorkflow({
        type: 'department_transfer',
        status: 'approved',
        employeeId: employee.id,
        initiatedById,
        details: {
            reason,
            fromDepartmentId,
            toDepartmentId: departmentId
        }
    });
    
    return employee;
}

// Helper function to get employee by id with error handling
async function getEmployee(id) {
    const employee = await db.Employee.findByPk(id);
    if (!employee) throw 'Employee not found';
    return employee;
}

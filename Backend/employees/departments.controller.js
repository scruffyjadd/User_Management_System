const db = require('_helpers/db');
const { Op } = require('sequelize');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function getAll() {
    return await db.Department.findAll();
}

async function getById(id) {
    const department = await db.Department.findByPk(id);
    if (!department) throw 'Department not found';
    return department;
}

async function create(params) {
    // Validate department name is unique
    if (await db.Department.findOne({ where: { name: params.name } })) {
        throw 'Department name "' + params.name + '" is already taken';
    }

    // Save department
    return await db.Department.create(params);
}

async function update(id, params) {
    const department = await getDepartment(id);

    // Validate name is unique if changed
    if (params.name && department.name !== params.name && 
        await db.Department.findOne({ where: { name: params.name } })) {
        throw 'Department name "' + params.name + '" is already taken';
    }

    // Copy params to department and save
    Object.assign(department, params);
    department.updated = Date.now();
    await department.save();

    return department;
}

async function _delete(id) {
    // Check if department has employees
    const employeeCount = await db.Employee.count({ where: { departmentId: id } });
    if (employeeCount > 0) {
        throw 'Cannot delete department with assigned employees';
    }

    const department = await getDepartment(id);
    await department.destroy();
}

// Helper function to get department by id with error handling
async function getDepartment(id) {
    const department = await db.Department.findByPk(id);
    if (!department) throw 'Department not found';
    return department;
}

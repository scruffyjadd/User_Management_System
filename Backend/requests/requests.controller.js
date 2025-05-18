const db = require('_helpers/db');
const { Op } = require('sequelize');

module.exports = {
    getAll,
    getById,
    getByEmployee,
    create,
    update,
    updateStatus,
    delete: _delete
};

async function getAll() {
    return await db.Request.findAll({
        include: [
            { 
                model: db.Employee,
                include: [
                    { model: db.Account, attributes: ['id', 'firstName', 'lastName'] },
                    { model: db.Department, attributes: ['id', 'name'] }
                ]
            },
            { model: db.Account, as: 'approvedBy', attributes: ['id', 'firstName', 'lastName'] },
            { model: db.RequestItem }
        ],
        order: [['createdAt', 'DESC']]
    });
}

async function getById(id) {
    const request = await db.Request.findByPk(id, {
        include: [
            { 
                model: db.Employee,
                include: [
                    { model: db.Account, attributes: { exclude: ['passwordHash'] } },
                    { model: db.Department }
                ]
            },
            { model: db.Account, as: 'approvedBy', attributes: { exclude: ['passwordHash'] } },
            { model: db.RequestItem }
        ]
    });
    if (!request) throw 'Request not found';
    return request;
}

async function getByEmployee(employeeId) {
    return await db.Request.findAll({
        where: { requestedById: employeeId },
        include: [
            { model: db.RequestItem },
            { model: db.Account, as: 'approvedBy', attributes: ['id', 'firstName', 'lastName'] }
        ],
        order: [['createdAt', 'DESC']]
    });
}

async function create(params) {
    // Validate employee exists
    const employee = await db.Employee.findByPk(params.requestedById);
    if (!employee) throw 'Employee not found';
    
    // Start transaction
    const transaction = await db.sequelize.transaction();
    
    try {
        // Create request
        const request = new db.Request({
            type: params.type,
            description: params.description,
            requestedById: params.requestedById,
            status: 'pending'
        }, { transaction });
        
        await request.save({ transaction });
        
        // Create request items
        if (params.items && params.items.length > 0) {
            const items = params.items.map(item => ({
                ...item,
                requestId: request.id
            }));
            await db.RequestItem.bulkCreate(items, { transaction });
        }
        
        // Commit transaction
        await transaction.commit();
        
        // Reload request with relationships
        return await getById(request.id);
        
    } catch (error) {
        // Rollback transaction on error
        await transaction.rollback();
        throw error;
    }
}

async function update(id, params) {
    const request = await getRequest(id);
    
    // Only allow updates to description and items for pending requests
    if (request.status !== 'pending') {
        throw 'Only pending requests can be updated';
    }
    
    // Start transaction
    const transaction = await db.sequelize.transaction();
    
    try {
        // Update request
        request.description = params.description || request.description;
        await request.save({ transaction });
        
        // Update or create items
        if (params.items && params.items.length > 0) {
            // Delete existing items
            await db.RequestItem.destroy({ 
                where: { requestId: request.id },
                transaction 
            });
            
            // Create new items
            const items = params.items.map(item => ({
                ...item,
                requestId: request.id
            }));
            await db.RequestItem.bulkCreate(items, { transaction });
        }
        
        // Commit transaction
        await transaction.commit();
        
        // Reload request with relationships
        return await getById(request.id);
        
    } catch (error) {
        // Rollback transaction on error
        await transaction.rollback();
        throw error;
    }
}

async function updateStatus(id, status, approvedById) {
    const request = await getRequest(id);
    
    // Validate status
    if (!['pending', 'approved', 'rejected', 'fulfilled'].includes(status)) {
        throw 'Invalid status';
    }
    
    // Validate approver exists if provided
    if (approvedById) {
        const approver = await db.Account.findByPk(approvedById);
        if (!approver) throw 'Approver account not found';
    }
    
    // Update request status
    request.status = status;
    request.approvedById = approvedById || null;
    request.updatedAt = new Date();
    
    if (status === 'fulfilled') {
        request.completedAt = new Date();
    }
    
    await request.save();
    
    return request;
}

async function _delete(id) {
    const request = await getRequest(id);
    
    // Only allow deletion of pending requests
    if (request.status !== 'pending') {
        throw 'Only pending requests can be deleted';
    }
    
    // Start transaction
    const transaction = await db.sequelize.transaction();
    
    try {
        // Delete request items
        await db.RequestItem.destroy({ 
            where: { requestId: request.id },
            transaction 
        });
        
        // Delete request
        await request.destroy({ transaction });
        
        // Commit transaction
        await transaction.commit();
        
    } catch (error) {
        // Rollback transaction on error
        await transaction.rollback();
        throw error;
    }
}

// Helper function to get request by id with error handling
async function getRequest(id) {
    const request = await db.Request.findByPk(id);
    if (!request) throw 'Request not found';
    return request;
}

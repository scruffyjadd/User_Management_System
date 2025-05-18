const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    // Request Header Model
    const requestAttributes = {
        type: {
            type: DataTypes.ENUM(
                'equipment',
                'leave',
                'resource',
                'other'
            ),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected', 'fulfilled'),
            defaultValue: 'pending'
        },
        description: {
            type: DataTypes.TEXT
        },
        createdAt: { 
            type: DataTypes.DATE, 
            allowNull: false, 
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        updatedAt: { 
            type: DataTypes.DATE,
            field: 'updated_at'
        },
        completedAt: {
            type: DataTypes.DATE,
            field: 'completed_at'
        }
    };

    const requestOptions = {
        timestamps: false,
        defaultScope: {
            include: ['requestedBy', 'approvedBy', 'items']
        },
        scopes: {
            withItems: {
                include: ['items']
            },
            byEmployee: function(employeeId) {
                return {
                    where: { requestedById: employeeId }
                };
            }
        }
    };

    // Request Item Model
    const requestItemAttributes = {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected', 'fulfilled'),
            defaultValue: 'pending'
        },
        notes: {
            type: DataTypes.TEXT
        },
        createdAt: { 
            type: DataTypes.DATE, 
            allowNull: false, 
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        updatedAt: { 
            type: DataTypes.DATE,
            field: 'updated_at'
        }
    };

    const requestItemOptions = {
        timestamps: false
    };

    // Define models
    const Request = sequelize.define('Request', requestAttributes, requestOptions);
    const RequestItem = sequelize.define('RequestItem', requestItemAttributes, requestItemOptions);

    // Define associations
    Request.associate = function(models) {
        Request.belongsTo(models.Employee, {
            foreignKey: 'requestedById',
            as: 'requestedBy',
            onDelete: 'CASCADE'
        });
        
        Request.belongsTo(models.Account, {
            foreignKey: 'approvedById',
            as: 'approvedBy'
        });
        
        Request.hasMany(models.RequestItem, {
            foreignKey: 'requestId',
            as: 'items',
            onDelete: 'CASCADE'
        });
    };

    RequestItem.associate = function(models) {
        RequestItem.belongsTo(models.Request, {
            foreignKey: 'requestId',
            as: 'request',
            onDelete: 'CASCADE'
        });
    };

    return { Request, RequestItem };
}

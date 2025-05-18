const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        type: {
            type: DataTypes.ENUM(
                'department_transfer',
                'onboarding',
                'offboarding',
                'promotion',
                'status_change',
                'other'
            ),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending'
        },
        details: {
            type: DataTypes.JSON,
            allowNull: true
        },
        created: { 
            type: DataTypes.DATE, 
            allowNull: false, 
            defaultValue: DataTypes.NOW 
        },
        updated: { 
            type: DataTypes.DATE 
        },
        completedAt: {
            type: DataTypes.DATE,
            field: 'completed_at'
        }
    };

    const options = {
        timestamps: false,
        defaultScope: {
            include: ['employee', 'initiatedBy', 'approvedBy']
        }
    };

    const Workflow = sequelize.define('Workflow', attributes, options);

    Workflow.associate = function(models) {
        Workflow.belongsTo(models.Employee, {
            foreignKey: 'employeeId',
            as: 'employee',
            onDelete: 'CASCADE'
        });
        Workflow.belongsTo(models.Account, {
            foreignKey: 'initiatedById',
            as: 'initiatedBy'
        });
        Workflow.belongsTo(models.Account, {
            foreignKey: 'approvedById',
            as: 'approvedBy'
        });
    };

    return Workflow;
}

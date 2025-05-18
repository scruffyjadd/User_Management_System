const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        employeeId: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'employee_id'
        },
        position: {
            type: DataTypes.STRING,
            allowNull: false
        },
        hireDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: 'hire_date'
        },
        status: {
            type: DataTypes.ENUM('active', 'on_leave', 'terminated'),
            defaultValue: 'active'
        },
        created: { 
            type: DataTypes.DATE, 
            allowNull: false, 
            defaultValue: DataTypes.NOW 
        },
        updated: { 
            type: DataTypes.DATE 
        }
    };

    const options = {
        timestamps: false,
        defaultScope: {
            include: ['account', 'department']
        },
        scopes: {
            withDetails: {
                include: ['account', 'department']
            }
        }
    };

    const Employee = sequelize.define('Employee', attributes, options);

    Employee.associate = function(models) {
        Employee.belongsTo(models.Account, {
            foreignKey: 'accountId',
            as: 'account'
        });
        Employee.belongsTo(models.Department, {
            foreignKey: 'departmentId',
            as: 'department'
        });
    };

    return Employee;
}

const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
        name: { 
            type: DataTypes.STRING, 
            allowNull: false
        },
        description: { 
            type: DataTypes.TEXT 
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
        timestamps: false
    };

    return sequelize.define('Department', attributes, options);
}

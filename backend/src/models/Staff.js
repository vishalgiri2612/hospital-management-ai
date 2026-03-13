const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Staff = sequelize.define(
  'Staff',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    staff_id: {
      type: DataTypes.STRING,
      unique: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    shift: {
      type: DataTypes.ENUM('morning', 'afternoon', 'night', 'rotating'),
    },
    hire_date: {
      type: DataTypes.DATEONLY,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'staff',
    indexes: [{ fields: ['staff_id'] }, { fields: ['department'] }],
  }
);

module.exports = Staff;

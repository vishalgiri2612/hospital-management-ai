const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Doctor = sequelize.define(
  'Doctor',
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
    doctor_id: {
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
    specialization: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING,
    },
    license_number: {
      type: DataTypes.STRING,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
    },
    years_of_experience: {
      type: DataTypes.INTEGER,
    },
    education: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    availability_schedule: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    consultation_fee: {
      type: DataTypes.DECIMAL(10, 2),
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    total_patients: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'doctors',
    indexes: [
      { fields: ['doctor_id'] },
      { fields: ['specialization'] },
      { fields: ['department'] },
    ],
  }
);

module.exports = Doctor;

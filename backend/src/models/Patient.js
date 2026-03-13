const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         patient_id:
 *           type: string
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         date_of_birth:
 *           type: string
 *           format: date
 *         gender:
 *           type: string
 *         blood_type:
 *           type: string
 */
const Patient = sequelize.define(
  'Patient',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    patient_id: {
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
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: false,
    },
    blood_type: {
      type: DataTypes.ENUM(
        'A+',
        'A-',
        'B+',
        'B-',
        'AB+',
        'AB-',
        'O+',
        'O-',
        'unknown'
      ),
      defaultValue: 'unknown',
    },
    phone: {
      type: DataTypes.STRING,
    },
    emergency_phone: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.TEXT,
    },
    city: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    zip_code: {
      type: DataTypes.STRING,
    },
    allergies: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    chronic_conditions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    current_medications: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    insurance_provider: {
      type: DataTypes.STRING,
    },
    insurance_policy_number: {
      type: DataTypes.STRING,
    },
    emergency_contact_name: {
      type: DataTypes.STRING,
    },
    emergency_contact_relation: {
      type: DataTypes.STRING,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    risk_score: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    risk_level: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'low',
    },
  },
  {
    tableName: 'patients',
    indexes: [
      { fields: ['patient_id'] },
      { fields: ['last_name', 'first_name'] },
      { fields: ['risk_level'] },
    ],
  }
);

module.exports = Patient;

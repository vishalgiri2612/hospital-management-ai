const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MedicalRecord = sequelize.define(
  'MedicalRecord',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    record_id: {
      type: DataTypes.STRING,
      unique: true,
    },
    patient_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    doctor_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    appointment_id: {
      type: DataTypes.UUID,
    },
    record_type: {
      type: DataTypes.ENUM(
        'diagnosis',
        'lab_result',
        'imaging',
        'prescription',
        'procedure',
        'vaccination',
        'vital_signs',
        'discharge_summary',
        'referral'
      ),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    diagnosis_codes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    vital_signs: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    lab_results: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    medications: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    attachments: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    is_confidential: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    record_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    tableName: 'medical_records',
    indexes: [
      { fields: ['patient_id'] },
      { fields: ['doctor_id'] },
      { fields: ['record_type'] },
      { fields: ['record_date'] },
    ],
  }
);

module.exports = MedicalRecord;

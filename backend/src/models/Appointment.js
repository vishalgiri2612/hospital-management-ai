const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Appointment = sequelize.define(
  'Appointment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    appointment_id: {
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
    appointment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    appointment_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
    },
    type: {
      type: DataTypes.ENUM(
        'consultation',
        'follow_up',
        'emergency',
        'routine_checkup',
        'specialist',
        'telemedicine'
      ),
      defaultValue: 'consultation',
    },
    status: {
      type: DataTypes.ENUM(
        'scheduled',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
        'no_show'
      ),
      defaultValue: 'scheduled',
    },
    reason: {
      type: DataTypes.TEXT,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    diagnosis: {
      type: DataTypes.TEXT,
    },
    prescription: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    follow_up_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    follow_up_date: {
      type: DataTypes.DATEONLY,
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
    },
    room_number: {
      type: DataTypes.STRING,
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      defaultValue: 'normal',
    },
    ai_risk_assessment: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    tableName: 'appointments',
    indexes: [
      { fields: ['patient_id'] },
      { fields: ['doctor_id'] },
      { fields: ['appointment_date'] },
      { fields: ['status'] },
      { fields: ['appointment_date', 'doctor_id'] },
    ],
  }
);

module.exports = Appointment;

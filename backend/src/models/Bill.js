const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Bill = sequelize.define(
  'Bill',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bill_number: {
      type: DataTypes.STRING,
      unique: true,
    },
    patient_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    appointment_id: {
      type: DataTypes.UUID,
    },
    bill_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATEONLY,
    },
    items: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    tax_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    paid_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'partial',
        'paid',
        'overdue',
        'cancelled',
        'refunded'
      ),
      defaultValue: 'pending',
    },
    payment_method: {
      type: DataTypes.ENUM(
        'cash',
        'credit_card',
        'debit_card',
        'insurance',
        'bank_transfer',
        'other'
      ),
    },
    insurance_claim_id: {
      type: DataTypes.STRING,
    },
    insurance_coverage_amount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: 'bills',
    indexes: [
      { fields: ['patient_id'] },
      { fields: ['status'] },
      { fields: ['bill_date'] },
    ],
  }
);

module.exports = Bill;

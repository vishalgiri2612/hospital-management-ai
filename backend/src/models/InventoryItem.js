const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InventoryItem = sequelize.define(
  'InventoryItem',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    item_code: {
      type: DataTypes.STRING,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(
        'medication',
        'equipment',
        'supplies',
        'lab_reagent',
        'ppe',
        'other'
      ),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity_in_stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    minimum_stock_level: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
    maximum_stock_level: {
      type: DataTypes.INTEGER,
    },
    unit_cost: {
      type: DataTypes.DECIMAL(10, 2),
    },
    supplier: {
      type: DataTypes.STRING,
    },
    supplier_contact: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    expiry_date: {
      type: DataTypes.DATEONLY,
    },
    last_restocked: {
      type: DataTypes.DATE,
    },
    is_critical: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM(
        'in_stock',
        'low_stock',
        'out_of_stock',
        'discontinued'
      ),
      defaultValue: 'in_stock',
    },
    predicted_demand: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    tableName: 'inventory_items',
    indexes: [
      { fields: ['item_code'] },
      { fields: ['category'] },
      { fields: ['status'] },
    ],
  }
);

module.exports = InventoryItem;

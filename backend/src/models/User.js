const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *         role:
 *           type: string
 *           enum: [admin, doctor, nurse, receptionist, patient]
 *         is_active:
 *           type: boolean
 */
const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(
        'admin',
        'doctor',
        'nurse',
        'receptionist',
        'patient'
      ),
      allowNull: false,
      defaultValue: 'patient',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_login: {
      type: DataTypes.DATE,
    },
    refresh_token: {
      type: DataTypes.TEXT,
    },
    password_reset_token: {
      type: DataTypes.STRING,
    },
    password_reset_expires: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: 'users',
    indexes: [{ fields: ['email'] }, { fields: ['role'] }],
  }
);

module.exports = User;

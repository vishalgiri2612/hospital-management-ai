const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_SSL,
  NODE_ENV,
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST || 'localhost',
  port: parseInt(DB_PORT) || 5432,
  dialect: 'postgres',
  logging: NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions:
    DB_SSL === 'true'
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
  define: {
    timestamps: true,
    underscored: true,
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    if (NODE_ENV !== 'test') {
      await sequelize.sync({ alter: NODE_ENV === 'development' });
      logger.info('Database models synchronized.');
    }
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

/**
 * Seed script: creates a default admin account if one does not already exist.
 *
 * Usage:
 *   node scripts/seedAdmin.js
 *   # or
 *   npm run seed:admin
 *
 * Default credentials created:
 *   Email:    admin@hospital.com
 *   Password: Admin@12345
 *   Role:     admin
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/database');
const { User } = require('../src/models');

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@hospital.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: false });

    const existing = await User.findOne({ where: { email: ADMIN_EMAIL } });
    if (existing) {
      console.log(`ℹ️  Admin account already exists: ${ADMIN_EMAIL}`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.create({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      is_active: true,
    });

    console.log('✅ Admin account created successfully.');
    console.log(`   Email   : ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('   ⚠️  Change this password after your first login!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seedAdmin();

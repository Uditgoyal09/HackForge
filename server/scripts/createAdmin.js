require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    await connectDB();

    const email = process.env.ADMIN_EMAIL || 'admin@hackforge.io';
    const password = process.env.ADMIN_PASSWORD || 'Admin@HackForge2026';
    const name = process.env.ADMIN_NAME || 'HackForge Super Admin';

    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log(`⚠️ Admin account (${email}) already exists.`);
      process.exit(0);
    }

    const adminUser = await User.create({
      name,
      email,
      password,
      role: 'admin',
    });

    console.log(`✅ Super Admin created successfully!`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role:  ${adminUser.role}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create Admin:', error);
    process.exit(1);
  }
};

createAdmin();

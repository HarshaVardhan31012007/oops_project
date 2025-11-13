const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function createUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create/Update Admin User
    const adminEmail = 'admin@example.com';
    let admin = await User.findOne({ email: adminEmail });
    
    if (admin) {
      console.log('Updating existing admin user...');
      admin.password = 'Password123';
      admin.role = 'admin';
      admin.isEmailVerified = true;
      admin.isActive = true;
      await admin.save();
    } else {
      console.log('Creating new admin user...');
      admin = await User.create({
        name: 'Sarah Anderson',
        email: adminEmail,
        password: 'Password123',
        phone: '+10000000000',
        role: 'admin',
        isEmailVerified: true,
        isActive: true
      });
    }
    console.log('✓ Admin created/updated');
    console.log('  Email: admin@example.com');
    console.log('  Password: Password123');
    console.log('  Role: admin\n');

    // Create/Update Regular User
    const userEmail = 'user@example.com';
    let user = await User.findOne({ email: userEmail });
    
    if (user) {
      console.log('Updating existing user...');
      user.password = 'Password123';
      user.role = 'user';
      user.isEmailVerified = true;
      user.isActive = true;
      await user.save();
    } else {
      console.log('Creating new regular user...');
      user = await User.create({
        name: 'John Traveler',
        email: userEmail,
        password: 'Password123',
        phone: '+11111111111',
        role: 'user',
        isEmailVerified: true,
        isActive: true
      });
    }
    console.log('✓ Regular user created/updated');
    console.log('  Email: user@example.com');
    console.log('  Password: Password123');
    console.log('  Role: user\n');

    await mongoose.disconnect();
    console.log('Database operation complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createUsers();

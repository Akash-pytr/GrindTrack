import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

const seedAdmin = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/studytracker');
    
    const email = 'admin@studytracker.com';
    const password = 'adminpassword';
    
    // Check if exists
    let user = await User.findOne({ email });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      user = await User.create({
        name: 'Admin User',
        email,
        password: hashedPassword,
      });
      console.log('Successfully created admin user!');
    } else {
      console.log('Admin user already exists.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();

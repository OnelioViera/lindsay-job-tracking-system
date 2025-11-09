import { config } from 'dotenv';
import dbConnect from '../src/lib/mongodb';
import { User } from '../src/lib/models/User';

// Load environment variables
config();

async function seed() {
  try {
    console.log('🌱 Starting database seed...');
    
    await dbConnect();
    console.log('✅ Connected to MongoDB');

    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@lindsay.com' });

    if (adminExists) {
      console.log('ℹ️  Admin user already exists. Skipping...');
    } else {
      // Create admin user
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@lindsay.com',
        password: 'admin123', // Will be hashed by mongoose middleware
        role: 'Admin',
        isActive: true,
      });

      console.log('✅ Admin user created successfully');
      console.log('   Email: admin@lindsay.com');
      console.log('   Password: admin123');
    }

    // Create sample users for testing different roles
    const sampleUsers = [
      {
        name: 'John Estimator',
        email: 'john@lindsay.com',
        password: 'Test1234',
        role: 'Estimator',
      },
      {
        name: 'Sarah Drafter',
        email: 'sarah@lindsay.com',
        password: 'Test1234',
        role: 'Drafter',
      },
      {
        name: 'Mike Manager',
        email: 'mike@lindsay.com',
        password: 'Test1234',
        role: 'Project Manager',
      },
    ];

    for (const userData of sampleUsers) {
      const userExists = await User.findOne({ email: userData.email });

      if (!userExists) {
        await User.create({
          ...userData,
          isActive: true,
        });
        console.log(`✅ Created ${userData.role}: ${userData.email}`);
      } else {
        console.log(`ℹ️  ${userData.role} already exists: ${userData.email}`);
      }
    }

    console.log('\n✨ Database seed completed successfully!');
    console.log('\n📝 Available test accounts:');
    console.log('   1. Admin: admin@lindsay.com / admin123');
    console.log('   2. Estimator: john@lindsay.com / Test1234');
    console.log('   3. Drafter: sarah@lindsay.com / Test1234');
    console.log('   4. Project Manager: mike@lindsay.com / Test1234');
    console.log('\n🎯 Visit http://localhost:3000/login to try signing in');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();


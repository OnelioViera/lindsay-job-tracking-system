const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// IMPORTANT: This script seeds your PRODUCTION database
// Make sure you have your production MONGODB_URI ready

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get MongoDB URI from command line argument or prompt
async function getMongoURI() {
  if (process.argv[2]) {
    return process.argv[2];
  }
  
  return new Promise((resolve) => {
    rl.question('Enter your production MongoDB URI: ', (uri) => {
      rl.close();
      resolve(uri);
    });
  });
}

// Define User schema (must match our actual User model)
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['Admin', 'Estimator', 'Drafter', 'Project Manager', 'Production', 'Inventory Manager', 'Viewer'],
      default: 'Viewer',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);

async function seedProduction() {
  try {
    console.log('🌱 Starting PRODUCTION database seed...');
    console.log('⚠️  This will seed your PRODUCTION MongoDB database\n');

    const MONGODB_URI = await getMongoURI();

    if (!MONGODB_URI || !MONGODB_URI.includes('mongodb')) {
      console.error('❌ Invalid MongoDB URI');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to PRODUCTION MongoDB');

    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@lindsay.com' });

    if (adminExists) {
      console.log('ℹ️  Admin user already exists. Skipping...');
    } else {
      // Create admin user
      await User.create({
        name: 'Admin User',
        email: 'admin@lindsay.com',
        password: 'admin123',
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

    console.log('\n✨ PRODUCTION database seed completed successfully!');
    console.log('\n📝 Available accounts:');
    console.log('   1. Admin: admin@lindsay.com / admin123');
    console.log('   2. Estimator: john@lindsay.com / Test1234');
    console.log('   3. Drafter: sarah@lindsay.com / Test1234');
    console.log('   4. Project Manager: mike@lindsay.com / Test1234');
    console.log('\n🎯 You can now log in to your Vercel deployment!');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedProduction();


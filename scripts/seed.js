const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  let currentKey = '';
  let currentValue = '';
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    
    if (line.includes('=')) {
      if (currentKey) {
        process.env[currentKey] = currentValue;
      }
      const [key, ...valueParts] = line.split('=');
      currentKey = key.trim();
      currentValue = valueParts.join('=').trim();
    } else {
      // Continuation of previous value
      currentValue += line;
    }
  });
  
  if (currentKey) {
    process.env[currentKey] = currentValue;
  }
}

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not defined');
  process.exit(1);
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

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
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


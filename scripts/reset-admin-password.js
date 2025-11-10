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
      currentValue += line;
    }
  });
  
  if (currentKey) {
    process.env[currentKey] = currentValue;
  }
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found');
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

const User = mongoose.model('User', userSchema);

async function resetAdminPassword() {
  try {
    console.log('🔐 Resetting admin password...\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the admin user
    const adminUser = await User.findOne({ email: 'admin@lindsay.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      console.log('   Creating a new admin user...\n');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = await User.create({
        name: 'Admin User',
        email: 'admin@lindsay.com',
        password: hashedPassword,
        role: 'Admin',
        isActive: true,
      });
      
      console.log('✅ Admin user created!');
      console.log('   Email: admin@lindsay.com');
      console.log('   Password: admin123');
      console.log('   ID:', newAdmin._id);
    } else {
      console.log('📋 Admin user found:');
      console.log('   Name:', adminUser.name);
      console.log('   Email:', adminUser.email);
      console.log('   Role:', adminUser.role);
      console.log('   Active:', adminUser.isActive);
      console.log('   ID:', adminUser._id);
      console.log();
      
      // Reset password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser.password = hashedPassword;
      await adminUser.save();
      
      console.log('✅ Password reset successfully!');
      console.log('   Email: admin@lindsay.com');
      console.log('   New Password: admin123');
    }

    console.log('\n💡 You can now login with these credentials');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetAdminPassword();


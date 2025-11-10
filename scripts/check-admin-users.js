const mongoose = require('mongoose');
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

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  isActive: Boolean,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function checkAdmins() {
  try {
    console.log('🔍 Checking database for admin users...\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all users
    const allUsers = await User.find({}).select('name email role isActive');
    console.log(`📊 Total users in database: ${allUsers.length}\n`);
    
    console.log('All users:');
    allUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}, Active: ${user.isActive}`);
    });

    // Find admin users
    const adminUsers = await User.find({ role: 'Admin', isActive: true });
    console.log(`\n👑 Active Admin users: ${adminUsers.length}`);
    
    if (adminUsers.length === 0) {
      console.log('⚠️  NO ACTIVE ADMIN USERS FOUND!');
      console.log('   This is why notifications are not being created.');
      console.log('   Run: npm run seed to create an admin user');
    } else {
      adminUsers.forEach(admin => {
        console.log(`  ✓ ${admin.name} (${admin.email})`);
      });
    }

    // Find PM users
    const pmUsers = await User.find({ role: 'Project Manager', isActive: true });
    console.log(`\n📋 Active Project Manager users: ${pmUsers.length}`);
    pmUsers.forEach(pm => {
      console.log(`  ✓ ${pm.name} (${pm.email})`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Check complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAdmins();


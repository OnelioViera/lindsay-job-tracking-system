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

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function resetPMPassword() {
  try {
    console.log('🔐 Resetting Project Manager passwords...\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const pmUsers = await User.find({ role: 'Project Manager' });
    
    console.log(`📋 Found ${pmUsers.length} Project Manager(s):\n`);
    
    const newPassword = 'pm123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    for (const pm of pmUsers) {
      pm.password = hashedPassword;
      await pm.save();
      console.log(`✅ ${pm.name}`);
      console.log(`   Email: ${pm.email}`);
      console.log(`   Password: ${newPassword}`);
      console.log(`   ID: ${pm._id}\n`);
    }

    console.log('💡 You can now login as any Project Manager with:');
    console.log('   Password: pm123\n');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPMPassword();


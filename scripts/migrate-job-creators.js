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

// Define schemas
const jobSchema = new mongoose.Schema({}, { strict: false });
const Job = mongoose.model('Job', jobSchema);

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function migrate() {
  try {
    console.log('🔄 Starting job creator migration...');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all jobs without createdBy field
    const jobsWithoutCreator = await Job.find({ 
      $or: [
        { createdBy: null },
        { createdBy: { $exists: false } }
      ]
    });

    console.log(`\n📊 Found ${jobsWithoutCreator.length} jobs without a creator`);

    if (jobsWithoutCreator.length === 0) {
      console.log('✨ All jobs already have a creator assigned!');
      process.exit(0);
    }

    // Find the admin user
    const adminUser = await User.findOne({ role: 'Admin' });

    if (!adminUser) {
      console.error('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log(`\n👤 Found admin user: ${adminUser.name} (${adminUser.email})`);
    console.log('\n🤔 What would you like to do with existing jobs?');
    console.log('   1. Assign all to admin (recommended)');
    console.log('   2. Leave without creator (only admins can edit them)');
    console.log('\nType 1 or 2 and press Enter:');

    // Read user input
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('', async (answer) => {
      readline.close();

      if (answer === '1') {
        // Assign all to admin
        const result = await Job.updateMany(
          { 
            $or: [
              { createdBy: null },
              { createdBy: { $exists: false } }
            ]
          },
          { $set: { createdBy: adminUser._id } }
        );

        console.log(`\n✅ Updated ${result.modifiedCount} jobs`);
        console.log(`   All jobs are now assigned to: ${adminUser.name}`);
      } else if (answer === '2') {
        console.log('\n✅ Existing jobs will remain without a creator');
        console.log('   Only admins will be able to edit them');
      } else {
        console.log('\n❌ Invalid option. No changes made.');
      }

      console.log('\n✨ Migration complete!');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();


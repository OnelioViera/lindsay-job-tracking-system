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

async function fixJobs() {
  try {
    console.log('🔄 Fixing job creators...');

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

    // Find the estimator user (john@lindsay.com)
    const estimator = await User.findOne({ email: 'john@lindsay.com' });

    if (!estimator) {
      console.error('❌ Estimator user not found.');
      process.exit(1);
    }

    console.log(`\n👤 Assigning jobs to: ${estimator.name} (${estimator.email})`);

    // Assign all jobs without creator to the estimator
    const result = await Job.updateMany(
      { 
        $or: [
          { createdBy: null },
          { createdBy: { $exists: false } }
        ]
      },
      { $set: { createdBy: estimator._id } }
    );

    console.log(`\n✅ Updated ${result.modifiedCount} jobs`);
    console.log(`   All existing jobs are now assigned to: ${estimator.name}`);
    console.log('\n✨ Done! Refresh your browser to see Edit and Delete buttons.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

fixJobs();


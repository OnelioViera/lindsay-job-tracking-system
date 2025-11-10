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

async function fixJobs() {
  try {
    console.log('🔄 Fixing job ownership...');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // The user ID from your console logs
    const correctEstimatorId = '6910e4058fced36a3df9b2d0';

    console.log(`\n👤 Assigning all jobs to user ID: ${correctEstimatorId}`);

    // Update ALL jobs to be owned by the correct estimator
    const result = await Job.updateMany(
      {},
      { $set: { createdBy: new mongoose.Types.ObjectId(correctEstimatorId) } }
    );

    console.log(`\n✅ Updated ${result.modifiedCount} jobs`);
    console.log(`   All jobs are now assigned to the correct estimator`);
    console.log('\n✨ Done! Refresh your browser to see Edit and Delete buttons.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

fixJobs();


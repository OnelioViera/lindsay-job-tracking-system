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

async function cleanup() {
  try {
    console.log('🗑️  Cleaning up deleted jobs...');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all soft-deleted jobs
    const deletedJobs = await Job.find({ 
      deletedAt: { $ne: null, $exists: true }
    });

    console.log(`\n📊 Found ${deletedJobs.length} soft-deleted jobs`);

    if (deletedJobs.length === 0) {
      console.log('✨ No deleted jobs to clean up!');
      process.exit(0);
    }

    console.log('\n📝 Jobs to be permanently deleted:');
    deletedJobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.jobNumber} - ${job.jobName}`);
    });

    // Permanently delete them
    const result = await Job.deleteMany({ 
      deletedAt: { $ne: null, $exists: true }
    });

    console.log(`\n✅ Permanently deleted ${result.deletedCount} jobs`);
    console.log('   These job numbers are now available for reuse.');
    console.log('\n✨ Done! You can now create jobs with those numbers again.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

cleanup();


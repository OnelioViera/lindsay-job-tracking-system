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

async function migrateNotifications() {
  try {
    console.log('🔄 Migrating Notification schema...\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if notifications collection exists
    const collections = await mongoose.connection.db.listCollections({ name: 'notifications' }).toArray();
    
    if (collections.length > 0) {
      console.log('📊 Notifications collection exists');
      
      // Count existing notifications
      const count = await mongoose.connection.db.collection('notifications').countDocuments();
      console.log(`   Found ${count} existing notification(s)\n`);
      
      if (count > 0) {
        console.log('⚠️  WARNING: This will delete all existing notifications!');
        console.log('   If you want to keep them, press Ctrl+C now.\n');
        
        // Give user 3 seconds to cancel
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Drop the collection
      console.log('🗑️  Dropping notifications collection...');
      await mongoose.connection.db.collection('notifications').drop();
      console.log('✅ Collection dropped\n');
    } else {
      console.log('ℹ️  Notifications collection does not exist yet\n');
    }

    // Define the NEW notification schema with updated enum values
    const notificationSchema = new mongoose.Schema({
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
      },
      type: {
        type: String,
        required: true,
        enum: ['job_assigned', 'job_updated', 'job_deleted', 'job_completed', 'customer_created', 'job_created'],
      },
      title: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        index: true,
      },
      customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        index: true,
      },
      read: {
        type: Boolean,
        default: false,
        index: true,
      },
    }, {
      timestamps: true,
    });

    // Create indexes
    notificationSchema.index({ userId: 1, createdAt: -1 });
    notificationSchema.index({ userId: 1, read: 1 });

    // Create the model (this will create the collection with the new schema)
    const Notification = mongoose.model('Notification', notificationSchema);

    // Create a test notification to initialize the collection
    const userSchema = new mongoose.Schema({ name: String, email: String, role: String });
    const User = mongoose.model('User', userSchema);
    
    const adminUser = await User.findOne({ role: 'Admin' });
    
    if (adminUser) {
      await Notification.create({
        userId: adminUser._id,
        type: 'job_created',
        title: 'Welcome to Notifications!',
        message: 'The notification system has been updated with support for customer and job creation alerts.',
        read: false,
      });
      console.log('✅ Created welcome notification for admin\n');
    }

    console.log('✅ Notification schema migration complete!\n');
    console.log('📝 Updated notification types:');
    console.log('   - job_assigned');
    console.log('   - job_updated');
    console.log('   - job_deleted');
    console.log('   - job_completed');
    console.log('   - customer_created ⭐ NEW');
    console.log('   - job_created ⭐ NEW\n');

    await mongoose.connection.close();
    console.log('✅ Migration complete!');
    console.log('\n💡 Now restart your development server (npm run dev)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

migrateNotifications();


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

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String,
  title: String,
  message: String,
  jobId: mongoose.Schema.Types.ObjectId,
  customerId: mongoose.Schema.Types.ObjectId,
  read: Boolean,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Notification = mongoose.model('Notification', notificationSchema);

async function testNotificationFlow() {
  try {
    console.log('🧪 Testing notification creation flow...\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Find a PM user (simulating logged-in PM)
    const pmUser = await User.findOne({ role: 'Project Manager', isActive: true });
    if (!pmUser) {
      console.error('❌ No PM user found!');
      process.exit(1);
    }
    console.log(`👤 Simulating PM user: ${pmUser.name} (${pmUser.email})`);
    console.log(`   User ID: ${pmUser._id}\n`);

    // Step 2: Find admin users (who should get notifications)
    const adminUsers = await User.find({ role: 'Admin', isActive: true });
    console.log(`👑 Found ${adminUsers.length} admin user(s):`);
    adminUsers.forEach(admin => {
      console.log(`   - ${admin.name} (${admin.email}) - ID: ${admin._id}`);
    });
    console.log();

    // Step 3: Create a test notification
    console.log('📬 Creating test notification...');
    const testNotification = await Notification.create({
      userId: adminUsers[0]._id,
      type: 'customer_created',
      title: 'TEST: New Customer Added',
      message: `${pmUser.name} (Project Manager) added a test customer`,
      read: false,
    });
    console.log(`✅ Test notification created with ID: ${testNotification._id}\n`);

    // Step 4: Verify notification was created
    const savedNotification = await Notification.findById(testNotification._id);
    if (savedNotification) {
      console.log('✅ Notification successfully saved to database');
      console.log('   Details:', {
        id: savedNotification._id,
        type: savedNotification.type,
        title: savedNotification.title,
        userId: savedNotification.userId,
        read: savedNotification.read,
      });
    } else {
      console.log('❌ Notification NOT found in database!');
    }
    console.log();

    // Step 5: Check all notifications for admin
    const adminNotifications = await Notification.find({ 
      userId: adminUsers[0]._id 
    }).sort({ createdAt: -1 });
    
    console.log(`📬 Total notifications for admin: ${adminNotifications.length}`);
    if (adminNotifications.length > 0) {
      console.log('   Recent notifications:');
      adminNotifications.slice(0, 5).forEach(n => {
        console.log(`   - [${n.type}] ${n.title} - ${n.read ? '✓ Read' : '● Unread'}`);
      });
    }
    console.log();

    // Step 6: Cleanup test notification
    await Notification.findByIdAndDelete(testNotification._id);
    console.log('🗑️  Test notification cleaned up\n');

    await mongoose.connection.close();
    console.log('✅ Test complete - Notification system is working!');
    console.log('\n💡 If you\'re not seeing notifications in the UI:');
    console.log('   1. Check that you\'re logged in as an ADMIN (not PM)');
    console.log('   2. Check the server console when a PM creates a customer');
    console.log('   3. Look for [Customer API] logs in your server terminal');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testNotificationFlow();


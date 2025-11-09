const mongoose = require('mongoose');

// Get MongoDB URI from command line
const MONGODB_URI = process.argv[2] || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Please provide MongoDB URI as argument');
  console.log('Usage: node scripts/check-notifications.js "mongodb://..."');
  process.exit(1);
}

// Define Notification schema
const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['job_assigned', 'job_updated', 'job_deleted'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);

// Define User schema (for reference)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String },
});

const User = mongoose.model('User', userSchema);

async function checkNotifications() {
  try {
    console.log('🔍 Checking notifications...\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all notifications with user info
    const notifications = await Notification.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    if (notifications.length === 0) {
      console.log('❌ No notifications found in the database');
    } else {
      console.log(`📬 Found ${notifications.length} notifications:\n`);
      
      notifications.forEach((notif, index) => {
        const user = notif.userId;
        console.log(`${index + 1}. ${notif.isRead ? '✓' : '○'} [${notif.type}]`);
        console.log(`   To: ${user?.name || 'Unknown'} (${user?.email || 'N/A'})`);
        console.log(`   Title: ${notif.title}`);
        console.log(`   Message: ${notif.message}`);
        console.log(`   Created: ${notif.createdAt}`);
        console.log(`   Read: ${notif.isRead ? 'Yes' : 'No'}`);
        console.log('');
      });
    }

    // Count by user
    console.log('\n📊 Notifications by user:');
    const users = await User.find();
    
    for (const user of users) {
      const count = await Notification.countDocuments({ userId: user._id });
      const unreadCount = await Notification.countDocuments({ userId: user._id, read: false });
      
      if (count > 0) {
        console.log(`   ${user.name} (${user.email}): ${count} total, ${unreadCount} unread`);
      }
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

checkNotifications();


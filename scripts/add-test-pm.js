const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Get MongoDB URI from command line
const MONGODB_URI = process.argv[2] || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Please provide MongoDB URI as argument');
  console.log('Usage: node scripts/add-test-pm.js "mongodb://..."');
  process.exit(1);
}

// Define User schema
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

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);

async function addTestPM() {
  try {
    console.log('🔧 Adding test Project Manager...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if test PM already exists
    const existing = await User.findOne({ email: 'testpm@lindsay.com' });
    
    if (existing) {
      console.log('⚠️  Test PM already exists, deleting...');
      await User.deleteOne({ email: 'testpm@lindsay.com' });
    }

    // Create test PM
    const pm = await User.create({
      name: 'Test PM',
      email: 'testpm@lindsay.com',
      password: 'Test1234',
      role: 'Project Manager',
      isActive: true,
    });

    console.log('\n✅ Test PM created successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Email: testpm@lindsay.com');
    console.log('   Password: Test1234');
    console.log('\n🔐 Password was hashed:', pm.password.startsWith('$2'));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

addTestPM();


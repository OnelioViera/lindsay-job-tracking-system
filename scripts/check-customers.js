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
const customerSchema = new mongoose.Schema({}, { strict: false });
const Customer = mongoose.model('Customer', customerSchema);

async function checkCustomers() {
  try {
    console.log('🔍 Checking customers...');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const customers = await Customer.find({});

    console.log(`\n📊 Found ${customers.length} customers in database`);
    
    if (customers.length === 0) {
      console.log('\n⚠️  No customers found!');
      console.log('   You need to create a customer before creating a job.');
      console.log('   Go to: http://localhost:3000/customers');
      console.log('   Click "New Customer" and create at least one customer.');
    } else {
      console.log('\n✅ Customers available:');
      customers.forEach((customer, index) => {
        console.log(`   ${index + 1}. ${customer.companyName} - ${customer.name} (${customer.email})`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

checkCustomers();


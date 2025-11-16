require('dotenv').config();
const admin = require('./config/firebase');

async function testFirebase() {
  try {
	console.log('Testing Firebase Admin SDK...');
	// Test 1: Check if initialized
	if (admin.apps.length > 0) {
	  console.log('✓ Firebase Admin SDK initialized');
	}
	// Test 2: Create test user
	const testUser = await admin.auth().createUser({
	  email: 'test@example.com',
	  password: 'TestPassword123!',
	  displayName: 'Test User'
	});
	console.log('✓ Test user created:', testUser.uid);
	// Test 3: Get user
	const user = await admin.auth().getUser(testUser.uid);
	console.log('✓ Retrieved user:', user.email);
	// Test 4: Delete test user
	await admin.auth().deleteUser(testUser.uid);
	console.log('✓ Test user deleted');
	console.log('\n✓ All Firebase tests passed!');
	process.exit(0);
  } catch (error) {
	console.error('✗ Firebase test failed:', error.message);
	process.exit(1);
  }
}

testFirebase();
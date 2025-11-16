require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = require('./config/db');
async function testModels() {
try {
await connectDB();
const models = ['Users', 'Team', 'Project', 'Task', 'Message'];
models.forEach(model => {
const schema = require(`./models/${model}`);
console.log(`✓ ${model} model loaded successfully`);
});
console.log('\n✓ All models loaded successfully!');
process.exit(0);
} catch (error) {
console.error('Error:', error);
process.exit(1);
}
}
testModels();

const mongoose = require('mongoose');
require('dotenv').config();

async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is missing');
  mongoose.set('strictQuery', true);
  
  // Extract database name from URI, default to 'quizapp'
  const dbName = process.env.MONGODB_DB_NAME || 'quizapp';
  
  // Connect with explicit database name to avoid issues
  await mongoose.connect(uri, { dbName });
  // eslint-disable-next-line no-console
  console.log('MongoDB connected');
}

module.exports = { connectDb };
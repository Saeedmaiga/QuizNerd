const mongoose = require('mongoose');
require('dotenv').config();

async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is missing');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { dbName: uri.split('/').pop() });
  // eslint-disable-next-line no-console
  console.log('MongoDB connected');
}

module.exports = { connectDb };
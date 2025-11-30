/**
 * Script to fix auth0Sub unique index issue
 * Run this once: node fix-auth0sub-index.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function fixAuth0SubIndex() {
  try {
    // Connect to MongoDB using the same logic as the app
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is missing from .env file');
    }
    
    const dbName = process.env.MONGODB_DB_NAME || 'quizapp';
    await mongoose.connect(uri, { dbName });
    console.log(`Connected to MongoDB database: ${dbName}`);

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Get all indexes
    const indexes = await collection.indexes();
    console.log('\nCurrent indexes on users collection:');
    indexes.forEach(index => {
      console.log('  -', JSON.stringify(index, null, 2));
    });

    // Check if auth0Sub has a unique index
    const auth0SubUniqueIndex = indexes.find(index => 
      index.key && index.key.auth0Sub && index.unique === true
    );

    if (auth0SubUniqueIndex) {
      console.log('\n⚠️  Found unique index on auth0Sub - this needs to be removed!');
      console.log('Dropping unique index on auth0Sub...');
      
      // Drop the unique index
      await collection.dropIndex('auth0Sub_1');
      console.log('✅ Successfully dropped unique index on auth0Sub');
    } else {
      console.log('\n✅ No unique index found on auth0Sub - database is correct');
    }

    // Verify indexes again
    const updatedIndexes = await collection.indexes();
    console.log('\nUpdated indexes:');
    updatedIndexes.forEach(index => {
      console.log('  -', JSON.stringify(index, null, 2));
    });

    await mongoose.disconnect();
    console.log('\n✅ Done! You can now register multiple users.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAuth0SubIndex();


import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Import models to ensure they are registered with Mongoose
import '../models/user.model';
import '../models/token.model';

/**
 * Initializes the MongoDB connection and creates the database if it doesn't exist
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI as string;
    
    // Connect to MongoDB
    await mongoose.connect(uri);
    console.log('Connected to MongoDB successfully');
    
    // Get all registered models
    const modelNames = Object.keys(mongoose.models);
    
    // Check if collections exist, if not create them
    const db = mongoose.connection.db;
    
    if (db) {
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name.toLowerCase());
      
      // Create collections for each model if they don't exist
      for (const modelName of modelNames) {
        const collectionName = mongoose.models[modelName].collection.name.toLowerCase();
        
        if (!collectionNames.includes(collectionName)) {
          console.log(`Creating ${collectionName} collection...`);
          await db.createCollection(collectionName);
        }
      }
      
      console.log('Database initialization completed');
    } else {
      throw new Error('Database instance is undefined');
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

/**
 * Closes the MongoDB connection
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}; 
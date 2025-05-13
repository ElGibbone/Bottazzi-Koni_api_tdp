"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabase = exports.initializeDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Import models to ensure they are registered with Mongoose
require("../models/user.model");
require("../models/token.model");
/**
 * Initializes the MongoDB connection and creates the database if it doesn't exist
 */
const initializeDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const uri = process.env.MONGODB_URI;
        // Connect to MongoDB
        yield mongoose_1.default.connect(uri);
        console.log('Connected to MongoDB successfully');
        // Get all registered models
        const modelNames = Object.keys(mongoose_1.default.models);
        // Check if collections exist, if not create them
        const db = mongoose_1.default.connection.db;
        if (db) {
            const collections = yield db.listCollections().toArray();
            const collectionNames = collections.map(c => c.name.toLowerCase());
            // Create collections for each model if they don't exist
            for (const modelName of modelNames) {
                const collectionName = mongoose_1.default.models[modelName].collection.name.toLowerCase();
                if (!collectionNames.includes(collectionName)) {
                    console.log(`Creating ${collectionName} collection...`);
                    yield db.createCollection(collectionName);
                }
            }
            console.log('Database initialization completed');
        }
        else {
            throw new Error('Database instance is undefined');
        }
    }
    catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
});
exports.initializeDatabase = initializeDatabase;
/**
 * Closes the MongoDB connection
 */
const closeDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connection.close();
        console.log('Database connection closed');
    }
    catch (error) {
        console.error('Error closing database connection:', error);
    }
});
exports.closeDatabase = closeDatabase;

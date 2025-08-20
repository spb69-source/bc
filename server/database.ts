import mongoose from 'mongoose';
import { BankConfig } from './models/index';

// MongoDB connection setup
export async function connectToMongoDB() {
  try {
    // Use environment variable or default to local MongoDB
    const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/bank-sync-app';
    
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
    
    // Initialize bank configurations if they don't exist
    await initializeBankConfigs();
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // In development, continue with in-memory storage as fallback
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Continuing with in-memory storage...');
    } else {
      process.exit(1);
    }
  }
}

// Initialize bank configurations in MongoDB
async function initializeBankConfigs() {
  try {
    const existingConfigs = await BankConfig.countDocuments();
    
    if (existingConfigs === 0) {
      const bankConfigs = [
        { bankId: 'chase', name: 'JPMorgan Chase & Co.', requires2FA: true, hasSecurityQuestion: false },
        { bankId: 'bofa', name: 'Bank of America', requires2FA: true, hasSecurityQuestion: true },
        { bankId: 'citi', name: 'Citibank (Citigroup)', requires2FA: true, hasSecurityQuestion: false },
        { bankId: 'wells', name: 'Wells Fargo', requires2FA: true, hasSecurityQuestion: true },
        { bankId: 'usbank', name: 'U.S. Bank', requires2FA: false, hasSecurityQuestion: false },
        { bankId: 'pnc', name: 'PNC Bank', requires2FA: true, hasSecurityQuestion: false },
        { bankId: 'truist', name: 'Truist Financial', requires2FA: true, hasSecurityQuestion: false },
        { bankId: 'capital', name: 'Capital One', requires2FA: true, hasSecurityQuestion: false },
        { bankId: 'hsbc', name: 'HSBC Bank USA', requires2FA: true, hasSecurityQuestion: true },
        { bankId: 'amex', name: 'American Express Bank', requires2FA: true, hasSecurityQuestion: false },
        { bankId: 'paypal', name: 'PayPal', requires2FA: true, hasSecurityQuestion: false },
      ];
      
      await BankConfig.insertMany(bankConfigs);
      console.log('✅ Bank configurations initialized');
    }
  } catch (error) {
    console.error('❌ Error initializing bank configs:', error);
  }
}

export default connectToMongoDB;
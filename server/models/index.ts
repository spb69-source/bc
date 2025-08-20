import mongoose from 'mongoose';

// User Schema for storing user accounts
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // In production, this should be hashed
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date }
});

// Bank Connection Schema for storing connected bank accounts
const bankConnectionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  bankId: { type: String, required: true },
  bankName: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  connectedAt: { type: Date, default: Date.now },
  lastSyncAt: { type: Date }
});

// Bank Account Schema for storing individual accounts
const bankAccountSchema = new mongoose.Schema({
  connectionId: { type: String, required: true },
  accountType: { type: String, required: true },
  accountNumber: { type: String, required: true },
  balance: { type: String, required: true }, // Stored as string to avoid precision issues
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Authentication Session Schema for storing session tokens
const authSessionSchema = new mongoose.Schema({
  sessionToken: { type: String, required: true, unique: true },
  bankId: { type: String, required: true },
  userId: { type: String, required: true },
  bankCredentials: {
    username: { type: String, required: true },
    // Note: In production, encrypt this data
    password: { type: String, required: true },
    securityAnswer: { type: String }
  },
  authStage: { 
    type: String, 
    enum: ['authenticated', 'awaiting_otp', 'otp_verified'], 
    default: 'authenticated' 
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 60 * 1000) } // 30 minutes
});

// OTP Records Schema for storing two-factor authentication data
const otpRecordSchema = new mongoose.Schema({
  sessionToken: { type: String, required: true },
  otpCode: { type: String, required: true },
  phoneNumber: { type: String, default: '***-**-1234' }, // Masked phone number for display
  sentAt: { type: Date, default: Date.now },
  verifiedAt: { type: Date },
  isVerified: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 5 * 60 * 1000) } // 5 minutes
});

// Bank Configuration Schema for storing supported banks
const bankConfigSchema = new mongoose.Schema({
  bankId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  requires2FA: { type: Boolean, default: true },
  hasSecurityQuestion: { type: Boolean, default: false },
  logo: { type: String },
  isActive: { type: Boolean, default: true }
});

// Create and export models
export const User = mongoose.model('User', userSchema);
export const BankConnection = mongoose.model('BankConnection', bankConnectionSchema);
export const BankAccount = mongoose.model('BankAccount', bankAccountSchema);
export const AuthSession = mongoose.model('AuthSession', authSessionSchema);
export const OTPRecord = mongoose.model('OTPRecord', otpRecordSchema);
export const BankConfig = mongoose.model('BankConfig', bankConfigSchema);
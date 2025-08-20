import { type User, type InsertUser, type BankConnection, type InsertBankConnection, type BankAccount, type InsertBankAccount } from "@shared/schema";
import { randomUUID } from "crypto";
import mongoose from 'mongoose';
import * as Models from './models/index';

export interface BankConfig {
  id: string;
  name: string;
  requires2FA: boolean;
  hasSecurityQuestion: boolean;
  logo?: string;
}

export interface MockBankAccount {
  id: string;
  type: string;
  accountNumber: string;
  balance: number;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getBankConfig(bankId: string): Promise<BankConfig | undefined>;
  getAllBankConfigs(): Promise<BankConfig[]>;
  getMockBankAccounts(bankId: string): Promise<MockBankAccount[]>;
  createBankConnection(connection: InsertBankConnection): Promise<BankConnection>;
  createBankAccount(account: InsertBankAccount): Promise<BankAccount>;
  // New authentication methods
  createAuthSession?(sessionData: {
    sessionToken: string;
    bankId: string;
    userId: string;
    bankCredentials: {
      username: string;
      password: string;
      securityAnswer?: string;
    };
  }): Promise<any>;
  getAuthSession?(sessionToken: string): Promise<any>;
  updateAuthSession?(sessionToken: string, updates: any): Promise<any>;
  createOTPRecord?(otpData: {
    sessionToken: string;
    otpCode: string;
    phoneNumber?: string;
  }): Promise<any>;
  getOTPRecord?(sessionToken: string): Promise<any>;
  verifyOTP?(sessionToken: string, code: string): Promise<boolean>;
}

export class MongoStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    try {
      const user = await Models.User.findById(id).lean();
      return user ? { ...user, id: user._id.toString() } : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await Models.User.findOne({ username }).lean();
      return user ? { ...user, id: user._id.toString() } : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = new Models.User(insertUser);
    const savedUser = await user.save();
    return { ...savedUser.toObject(), id: savedUser._id.toString() };
  }

  async getBankConfig(bankId: string): Promise<BankConfig | undefined> {
    try {
      const config = await Models.BankConfig.findOne({ bankId }).lean();
      return config ? {
        id: config.bankId,
        name: config.name,
        requires2FA: config.requires2FA,
        hasSecurityQuestion: config.hasSecurityQuestion,
        logo: config.logo || undefined
      } : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async getAllBankConfigs(): Promise<BankConfig[]> {
    try {
      const configs = await Models.BankConfig.find({ isActive: true }).lean();
      return configs.map(config => ({
        id: config.bankId,
        name: config.name,
        requires2FA: config.requires2FA,
        hasSecurityQuestion: config.hasSecurityQuestion,
        logo: config.logo || undefined
      }));
    } catch (error) {
      return [];
    }
  }

  async getMockBankAccounts(bankId: string): Promise<MockBankAccount[]> {
    // Return mock account data based on bank
    const baseAccounts: MockBankAccount[] = [
      {
        id: 'acc_1',
        type: 'Checking Account',
        accountNumber: '****-****-****-1234',
        balance: 0
      },
      {
        id: 'acc_2',
        type: 'Savings Account',
        accountNumber: '****-****-****-5678',
        balance: 0
      }
    ];

    // Some banks might have additional account types
    if (bankId === 'chase' || bankId === 'bofa') {
      baseAccounts.push({
        id: 'acc_3',
        type: 'Credit Card',
        accountNumber: '****-****-****-9012',
        balance: 0
      });
    }

    return baseAccounts;
  }

  async createBankConnection(insertConnection: InsertBankConnection): Promise<BankConnection> {
    const connection = new Models.BankConnection({
      ...insertConnection,
      connectedAt: new Date(),
      lastSyncAt: null,
      isActive: true,
    });
    const savedConnection = await connection.save();
    return {
      ...savedConnection.toObject(),
      id: savedConnection._id.toString(),
      connectedAt: savedConnection.connectedAt,
      lastSyncAt: savedConnection.lastSyncAt || null
    };
  }

  async createBankAccount(insertAccount: InsertBankAccount): Promise<BankAccount> {
    const account = new Models.BankAccount({
      ...insertAccount,
      isActive: true,
    });
    const savedAccount = await account.save();
    return {
      ...savedAccount.toObject(),
      id: savedAccount._id.toString()
    };
  }

  // New methods for authentication and OTP storage
  async createAuthSession(sessionData: {
    sessionToken: string;
    bankId: string;
    userId: string;
    bankCredentials: {
      username: string;
      password: string;
      securityAnswer?: string;
    };
  }) {
    const session = new Models.AuthSession(sessionData);
    return await session.save();
  }

  async getAuthSession(sessionToken: string) {
    return await Models.AuthSession.findOne({ 
      sessionToken, 
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).lean();
  }

  async updateAuthSession(sessionToken: string, updates: any) {
    return await Models.AuthSession.findOneAndUpdate(
      { sessionToken },
      updates,
      { new: true }
    );
  }

  async createOTPRecord(otpData: {
    sessionToken: string;
    otpCode: string;
    phoneNumber?: string;
  }) {
    const otp = new Models.OTPRecord(otpData);
    return await otp.save();
  }

  async getOTPRecord(sessionToken: string) {
    return await Models.OTPRecord.findOne({
      sessionToken,
      expiresAt: { $gt: new Date() }
    }).lean();
  }

  async verifyOTP(sessionToken: string, code: string) {
    const otpRecord = await Models.OTPRecord.findOne({
      sessionToken,
      otpCode: code,
      isVerified: false,
      expiresAt: { $gt: new Date() }
    });

    if (otpRecord) {
      otpRecord.isVerified = true;
      otpRecord.verifiedAt = new Date();
      await otpRecord.save();
      return true;
    }
    
    // Increment attempts for failed verification
    await Models.OTPRecord.findOneAndUpdate(
      { sessionToken, expiresAt: { $gt: new Date() } },
      { $inc: { attempts: 1 } }
    );
    
    return false;
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private bankConnections: Map<string, BankConnection>;
  private bankAccounts: Map<string, BankAccount>;
  private bankConfigs: Map<string, BankConfig>;

  constructor() {
    this.users = new Map();
    this.bankConnections = new Map();
    this.bankAccounts = new Map();
    this.bankConfigs = new Map();
    
    // Initialize bank configurations
    this.initializeBankConfigs();
  }

  private initializeBankConfigs() {
    const configs: BankConfig[] = [
      { id: 'chase', name: 'JPMorgan Chase & Co.', requires2FA: true, hasSecurityQuestion: false },
      { id: 'bofa', name: 'Bank of America', requires2FA: true, hasSecurityQuestion: true },
      { id: 'citi', name: 'Citibank (Citigroup)', requires2FA: true, hasSecurityQuestion: false },
      { id: 'wells', name: 'Wells Fargo', requires2FA: true, hasSecurityQuestion: true },
      { id: 'usbank', name: 'U.S. Bank', requires2FA: false, hasSecurityQuestion: false },
      { id: 'pnc', name: 'PNC Bank', requires2FA: true, hasSecurityQuestion: false },
      { id: 'truist', name: 'Truist Financial', requires2FA: true, hasSecurityQuestion: false },
      { id: 'capital', name: 'Capital One', requires2FA: true, hasSecurityQuestion: false },
      { id: 'hsbc', name: 'HSBC Bank USA', requires2FA: true, hasSecurityQuestion: true },
      { id: 'amex', name: 'American Express Bank', requires2FA: true, hasSecurityQuestion: false },
      { id: 'paypal', name: 'PayPal', requires2FA: true, hasSecurityQuestion: false },
    ];
    
    configs.forEach(config => {
      this.bankConfigs.set(config.id, config);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getBankConfig(bankId: string): Promise<BankConfig | undefined> {
    return this.bankConfigs.get(bankId);
  }

  async getAllBankConfigs(): Promise<BankConfig[]> {
    return Array.from(this.bankConfigs.values());
  }

  async getMockBankAccounts(bankId: string): Promise<MockBankAccount[]> {
    // Return mock account data based on bank
    const baseAccounts: MockBankAccount[] = [
      {
        id: 'acc_1',
        type: 'Checking Account',
        accountNumber: '****-****-****-1234',
        balance: 0
      },
      {
        id: 'acc_2',
        type: 'Savings Account',
        accountNumber: '****-****-****-5678',
        balance: 0
      }
    ];

    // Some banks might have additional account types
    if (bankId === 'chase' || bankId === 'bofa') {
      baseAccounts.push({
        id: 'acc_3',
        type: 'Credit Card',
        accountNumber: '****-****-****-9012',
        balance: 0
      });
    }

    return baseAccounts;
  }

  async createBankConnection(insertConnection: InsertBankConnection): Promise<BankConnection> {
    const id = randomUUID();
    const connection: BankConnection = {
      ...insertConnection,
      id,
      connectedAt: new Date(),
      lastSyncAt: null,
      isActive: true,
    };
    this.bankConnections.set(id, connection);
    return connection;
  }

  async createBankAccount(insertAccount: InsertBankAccount): Promise<BankAccount> {
    const id = randomUUID();
    const account: BankAccount = {
      ...insertAccount,
      id,
      isActive: true,
    };
    this.bankAccounts.set(id, account);
    return account;
  }
}

// Always use MongoStorage - it will handle MongoDB connection checks internally
class MongoStorageWrapper implements IStorage {
  private mongoStorage: MongoStorage;
  private memStorage: MemStorage;
  
  constructor() {
    this.mongoStorage = new MongoStorage();
    this.memStorage = new MemStorage();
  }
  
  private isMongoConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }
  
  async getUser(id: string): Promise<User | undefined> {
    if (this.isMongoConnected()) {
      return await this.mongoStorage.getUser(id);
    }
    return await this.memStorage.getUser(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    if (this.isMongoConnected()) {
      return await this.mongoStorage.getUserByUsername(username);
    }
    return await this.memStorage.getUserByUsername(username);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    if (this.isMongoConnected()) {
      return await this.mongoStorage.createUser(user);
    }
    return await this.memStorage.createUser(user);
  }
  
  async getBankConfig(bankId: string): Promise<BankConfig | undefined> {
    if (this.isMongoConnected()) {
      return await this.mongoStorage.getBankConfig(bankId);
    }
    return await this.memStorage.getBankConfig(bankId);
  }
  
  async getAllBankConfigs(): Promise<BankConfig[]> {
    if (this.isMongoConnected()) {
      return await this.mongoStorage.getAllBankConfigs();
    }
    return await this.memStorage.getAllBankConfigs();
  }
  
  async getMockBankAccounts(bankId: string): Promise<MockBankAccount[]> {
    // This can use either storage as it returns mock data
    return await this.mongoStorage.getMockBankAccounts(bankId);
  }
  
  async createBankConnection(connection: InsertBankConnection): Promise<BankConnection> {
    if (this.isMongoConnected()) {
      console.log('💾 Storing bank connection in MongoDB');
      return await this.mongoStorage.createBankConnection(connection);
    }
    return await this.memStorage.createBankConnection(connection);
  }
  
  async createBankAccount(account: InsertBankAccount): Promise<BankAccount> {
    if (this.isMongoConnected()) {
      console.log('💾 Storing bank account in MongoDB');
      return await this.mongoStorage.createBankAccount(account);
    }
    return await this.memStorage.createBankAccount(account);
  }
  
  // MongoDB-specific methods (only work when MongoDB is connected)
  async createAuthSession(sessionData: any): Promise<any> {
    if (this.isMongoConnected() && this.mongoStorage.createAuthSession) {
      console.log('💾 Storing auth session in MongoDB');
      return await this.mongoStorage.createAuthSession(sessionData);
    }
    return null; // Fallback to no storage for auth sessions
  }
  
  async getAuthSession(sessionToken: string): Promise<any> {
    if (this.isMongoConnected() && this.mongoStorage.getAuthSession) {
      return await this.mongoStorage.getAuthSession(sessionToken);
    }
    return null;
  }
  
  async updateAuthSession(sessionToken: string, updates: any): Promise<any> {
    if (this.isMongoConnected() && this.mongoStorage.updateAuthSession) {
      return await this.mongoStorage.updateAuthSession(sessionToken, updates);
    }
    return null;
  }
  
  async createOTPRecord(otpData: any): Promise<any> {
    if (this.isMongoConnected() && this.mongoStorage.createOTPRecord) {
      console.log('💾 Storing OTP record in MongoDB');
      return await this.mongoStorage.createOTPRecord(otpData);
    }
    return null;
  }
  
  async getOTPRecord(sessionToken: string): Promise<any> {
    if (this.isMongoConnected() && this.mongoStorage.getOTPRecord) {
      return await this.mongoStorage.getOTPRecord(sessionToken);
    }
    return null;
  }
  
  async verifyOTP(sessionToken: string, code: string): Promise<boolean> {
    if (this.isMongoConnected() && this.mongoStorage.verifyOTP) {
      console.log('✅ Verifying OTP from MongoDB');
      return await this.mongoStorage.verifyOTP(sessionToken, code);
    }
    return false; // Fallback to rejection
  }
}

export const storage = new MongoStorageWrapper();

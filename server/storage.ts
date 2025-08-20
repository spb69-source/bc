import { type User, type InsertUser, type BankConnection, type InsertBankConnection, type BankAccount, type InsertBankAccount } from "@shared/schema";
import { randomUUID } from "crypto";

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
        balance: 2450.75
      },
      {
        id: 'acc_2',
        type: 'Savings Account',
        accountNumber: '****-****-****-5678',
        balance: 15832.20
      }
    ];

    // Some banks might have additional account types
    if (bankId === 'chase' || bankId === 'bofa') {
      baseAccounts.push({
        id: 'acc_3',
        type: 'Credit Card',
        accountNumber: '****-****-****-9012',
        balance: -1250.30
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

export const storage = new MemStorage();

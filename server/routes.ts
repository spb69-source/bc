import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authCredentialsSchema, otpVerificationSchema, syncAccountsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Bank authentication endpoint
  app.post("/api/banks/:bankId/auth", async (req, res) => {
    try {
      const { bankId } = req.params;
      const credentials = authCredentialsSchema.parse(req.body);
      
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random authentication failure (30% chance)
      if (Math.random() < 0.3) {
        return res.status(401).json({ 
          message: "Invalid credentials. Please check your username and password and try again." 
        });
      }
      
      // Get bank configuration to determine if 2FA is required
      const bankConfig = await storage.getBankConfig(bankId);
      if (!bankConfig) {
        return res.status(404).json({ message: "Bank not found" });
      }
      
      // Create session token for this authentication attempt
      const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      res.json({
        success: true,
        requires2FA: bankConfig.requires2FA,
        sessionToken,
        message: "Authentication successful"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // OTP verification endpoint
  app.post("/api/banks/:bankId/verify-otp", async (req, res) => {
    try {
      const { bankId } = req.params;
      const { sessionToken } = req.headers;
      const otpData = otpVerificationSchema.parse(req.body);
      
      if (!sessionToken) {
        return res.status(401).json({ message: "Session token required" });
      }
      
      // Simulate OTP verification delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate random OTP failure (20% chance)
      if (Math.random() < 0.2) {
        return res.status(401).json({ 
          message: "Invalid verification code. Please try again." 
        });
      }
      
      res.json({
        success: true,
        message: "OTP verification successful"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid OTP format" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get bank accounts endpoint
  app.get("/api/banks/:bankId/accounts", async (req, res) => {
    try {
      const { bankId } = req.params;
      const { sessionToken } = req.headers;
      
      if (!sessionToken) {
        return res.status(401).json({ message: "Session token required" });
      }
      
      // Simulate account fetching delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return mock account data
      const accounts = await storage.getMockBankAccounts(bankId);
      
      res.json({
        success: true,
        accounts
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  // Sync accounts endpoint
  app.post("/api/banks/:bankId/sync", async (req, res) => {
    try {
      const { bankId } = req.params;
      const { sessionToken } = req.headers;
      const syncData = syncAccountsSchema.parse(req.body);
      
      if (!sessionToken) {
        return res.status(401).json({ message: "Session token required" });
      }
      
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create bank connection and accounts
      const connection = await storage.createBankConnection({
        userId: "demo-user", // In real app, get from session
        bankId,
        bankName: (await storage.getBankConfig(bankId))?.name || "Unknown Bank",
      });
      
      // Create selected accounts
      for (const accountId of syncData.accountIds) {
        const mockAccount = (await storage.getMockBankAccounts(bankId))
          .find(acc => acc.id === accountId);
        
        if (mockAccount) {
          await storage.createBankAccount({
            connectionId: connection.id,
            accountType: mockAccount.type,
            accountNumber: mockAccount.accountNumber,
            balance: mockAccount.balance.toString(),
          });
        }
      }
      
      res.json({
        success: true,
        connectionId: connection.id,
        message: "Accounts synchronized successfully"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sync data" });
      }
      res.status(500).json({ message: "Failed to sync accounts" });
    }
  });

  // Get bank configurations
  app.get("/api/banks", async (req, res) => {
    try {
      const banks = await storage.getAllBankConfigs();
      res.json({ banks });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch banks" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

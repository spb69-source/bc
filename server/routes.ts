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
      
      // Store authentication session in MongoDB (if available)
      if (storage.createAuthSession) {
        await storage.createAuthSession({
          sessionToken,
          bankId,
          userId: "demo-user", // In real app, get from user session
          bankCredentials: {
            username: credentials.username,
            password: credentials.password, // In production, hash this
            securityAnswer: credentials.securityAnswer
          }
        });
      }
      
      // If 2FA is required, generate and store OTP
      if (bankConfig.requires2FA && storage.createOTPRecord) {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await storage.createOTPRecord({
          sessionToken,
          otpCode,
          phoneNumber: "***-**-1234"
        });
        console.log(`📱 OTP Code for testing: ${otpCode}`);
      }
      
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
      const sessionToken = req.headers.sessiontoken || req.headers.sessionToken || req.headers['session-token'];
      const otpData = otpVerificationSchema.parse(req.body);
      
      if (!sessionToken) {
        return res.status(401).json({ message: "Session token required" });
      }
      
      // Verify session exists
      if (storage.getAuthSession) {
        const session = await storage.getAuthSession(sessionToken as string);
        if (!session) {
          return res.status(401).json({ message: "Invalid or expired session" });
        }
      }
      
      // Simulate OTP verification delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Verify OTP using MongoDB (if available)
      let otpVerified = false;
      if (storage.verifyOTP) {
        otpVerified = await storage.verifyOTP(sessionToken as string, otpData.code);
      } else {
        // Fallback: Simulate random OTP failure (20% chance)
        otpVerified = Math.random() >= 0.2;
      }
      
      if (!otpVerified) {
        return res.status(401).json({ 
          message: "Invalid verification code. Please try again." 
        });
      }
      
      // Update session to mark OTP as verified
      if (storage.updateAuthSession) {
        await storage.updateAuthSession(sessionToken as string, {
          authStage: 'otp_verified'
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
      const sessionToken = req.headers.sessiontoken || req.headers.sessionToken || req.headers['session-token'];
      
      if (!sessionToken) {
        return res.status(401).json({ message: "Session token required" });
      }
      
      // Verify session exists and is authenticated
      if (storage.getAuthSession) {
        const session = await storage.getAuthSession(sessionToken as string);
        if (!session) {
          return res.status(401).json({ message: "Invalid or expired session" });
        }
        
        // Check if OTP verification is required and completed
        const bankConfig = await storage.getBankConfig(bankId);
        if (bankConfig?.requires2FA && session.authStage !== 'otp_verified') {
          return res.status(401).json({ message: "OTP verification required" });
        }
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
      const sessionToken = req.headers.sessiontoken || req.headers.sessionToken || req.headers['session-token'];
      const syncData = syncAccountsSchema.parse(req.body);
      
      if (!sessionToken) {
        return res.status(401).json({ message: "Session token required" });
      }
      
      // Verify session exists and is fully authenticated
      let userId = "demo-user";
      if (storage.getAuthSession) {
        const session = await storage.getAuthSession(sessionToken as string);
        if (!session) {
          return res.status(401).json({ message: "Invalid or expired session" });
        }
        
        // Check if OTP verification is required and completed for 2FA banks
        const bankConfig = await storage.getBankConfig(bankId);
        if (bankConfig?.requires2FA && session.authStage !== 'otp_verified') {
          return res.status(401).json({ message: "Authentication not complete" });
        }
        
        userId = session.userId;
      }
      
      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Create bank connection and accounts
      const connection = await storage.createBankConnection({
        userId,
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

# Bank Account Synchronization Application

## Overview

This is a full-stack web application designed for securely connecting and synchronizing bank accounts. Built as a modern React SPA with an Express.js backend, the app guides users through a multi-step process to authenticate with their banks and sync account data. The application features a comprehensive bank connection workflow with support for two-factor authentication, account selection, and real-time synchronization status updates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Radix UI primitives with shadcn/ui components for accessible, customizable interfaces
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful endpoints with proper HTTP status codes and error handling
- **Session Management**: Express sessions with PostgreSQL storage for authentication state
- **Data Validation**: Zod schemas for runtime type checking and validation

### Component Architecture
The frontend follows a modular component structure:
- **Page Components**: Main application views (BankSync, NotFound)
- **Feature Components**: Bank sync workflow components (BankSelector, LoginForm, TwoFactorAuth, etc.)
- **UI Components**: Reusable design system components based on Radix UI
- **Hooks**: Custom React hooks for mobile detection and toast notifications

### Multi-Step Workflow Design
The bank synchronization process implements a wizard-style interface:
1. **Bank Selection**: Users choose from a predefined list of supported banks
2. **Authentication**: Secure credential input with validation
3. **Two-Factor Authentication**: OTP verification when required by the bank
4. **Account Selection**: Users can choose which accounts to sync
5. **Success Confirmation**: Final status and next steps

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle migrations for version-controlled database changes
- **In-Memory Storage**: Development fallback using Map-based storage for rapid prototyping
- **Session Storage**: PostgreSQL-backed session store for authentication persistence

### Authentication and Authorization
- **Bank Authentication**: Simulated bank login with credential validation
- **Two-Factor Authentication**: OTP-based verification system
- **Session Management**: Secure session tokens for maintaining authentication state
- **Error Handling**: Comprehensive error states with user-friendly messaging

### Development and Build Pipeline
- **Development Server**: Vite dev server with HMR for fast iteration
- **Production Build**: Optimized bundling with code splitting
- **TypeScript**: Strict type checking across frontend, backend, and shared code
- **Code Organization**: Monorepo structure with shared types and schemas

## External Dependencies

### Database and ORM
- **Neon Database**: Serverless PostgreSQL for cloud deployment
- **Drizzle ORM**: Type-safe database operations with schema validation
- **connect-pg-simple**: PostgreSQL session store for Express

### UI and Styling
- **Radix UI**: Accessible component primitives for complex UI patterns
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Consistent icon library for interface elements
- **class-variance-authority**: Type-safe variant handling for component styling

### Form Handling and Validation
- **React Hook Form**: Performant forms with minimal re-renders
- **Hookform Resolvers**: Integration between React Hook Form and validation libraries
- **Zod**: Schema validation for both client and server-side data validation

### Development Tools
- **Replit Integrations**: Development environment optimizations and error overlays
- **TypeScript**: Static type checking and enhanced developer experience
- **ESLint/Prettier**: Code formatting and quality enforcement (implied by project structure)

### State Management
- **TanStack Query**: Server state management with caching, background updates, and optimistic updates
- **React Context**: Local state management for UI components and user preferences
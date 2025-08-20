export interface BankConfig {
  id: string;
  name: string;
  requires2FA: boolean;
  hasSecurityQuestion: boolean;
  logo?: string;
}

export interface BankAccount {
  id: string;
  type: string;
  accountNumber: string;
  balance: number;
  selected: boolean;
}

export interface AuthCredentials {
  username: string;
  password: string;
  securityAnswer?: string;
}

export interface SyncStep {
  id: 'bank-selector' | 'login' | 'two-factor' | 'sync-confirmation' | 'success';
  name: string;
  stepNumber: number;
}

export interface SyncState {
  currentStep: SyncStep['id'];
  selectedBank: BankConfig | null;
  accounts: BankAccount[];
  isLoading: boolean;
  error: string | null;
}

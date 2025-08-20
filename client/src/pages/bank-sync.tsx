import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock } from 'lucide-react';
import { ProgressIndicator } from '@/components/bank-sync/ProgressIndicator';
import { BankSelector } from '@/components/bank-sync/BankSelector';
import { LoginForm } from '@/components/bank-sync/LoginForm';
import { TwoFactorAuth } from '@/components/bank-sync/TwoFactorAuth';
import { SyncConfirmation } from '@/components/bank-sync/SyncConfirmation';
import { SuccessMessage } from '@/components/bank-sync/SuccessMessage';
import { LoadingOverlay } from '@/components/bank-sync/LoadingOverlay';
import { BankConfig, SyncState } from '@/types/bank';
import { AuthCredentials } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export default function BankSync() {
  const { toast } = useToast();
  const [syncState, setSyncState] = useState<SyncState>({
    currentStep: 'bank-selector',
    selectedBank: null,
    accounts: [],
    isLoading: false,
    error: null,
  });
  const [sessionToken, setSessionToken] = useState<string>('');

  // Fetch available banks
  const { data: banksData } = useQuery({
    queryKey: ['/api/banks'],
    select: (data: any) => data.banks as BankConfig[],
  });

  // Bank authentication mutation
  const authMutation = useMutation({
    mutationFn: async (credentials: AuthCredentials) => {
      const response = await apiRequest(
        'POST',
        `/api/banks/${syncState.selectedBank?.id}/auth`,
        credentials
      );
      return response.json();
    },
    onSuccess: (data) => {
      setSessionToken(data.sessionToken);
      if (data.requires2FA) {
        setSyncState(prev => ({ ...prev, currentStep: 'two-factor', error: null }));
      } else {
        fetchAccounts();
      }
    },
    onError: (error: any) => {
      setSyncState(prev => ({ ...prev, error: error.message }));
    },
  });

  // OTP verification mutation
  const otpMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch(`/api/banks/${syncState.selectedBank?.id}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'sessionToken': sessionToken,
        },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      fetchAccounts();
    },
    onError: (error: any) => {
      toast({
        title: 'Verification Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Fetch accounts after authentication
  const fetchAccounts = async () => {
    try {
      setSyncState(prev => ({ ...prev, isLoading: true }));
      const response = await fetch(`/api/banks/${syncState.selectedBank?.id}/accounts`, {
        headers: { 
          'sessionToken': sessionToken,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setSyncState(prev => ({
          ...prev,
          accounts: data.accounts,
          currentStep: 'sync-confirmation',
          isLoading: false,
        }));
      } else {
        setSyncState(prev => ({ ...prev, error: data.message || 'Failed to fetch accounts', isLoading: false }));
      }
    } catch (error: any) {
      setSyncState(prev => ({ ...prev, error: error.message, isLoading: false }));
    }
  };

  // Sync accounts mutation
  const syncMutation = useMutation({
    mutationFn: async (accountIds: string[]) => {
      const response = await fetch(`/api/banks/${syncState.selectedBank?.id}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'sessionToken': sessionToken,
        },
        body: JSON.stringify({ bankId: syncState.selectedBank?.id, accountIds }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: () => {
      setSyncState(prev => ({ ...prev, currentStep: 'success' }));
      toast({
        title: 'Sync Complete',
        description: 'Your bank accounts have been successfully connected.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Sync Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleBankSelect = (bank: BankConfig) => {
    setSyncState(prev => ({
      ...prev,
      selectedBank: bank,
      currentStep: 'login',
      error: null,
    }));
  };

  const handleLogin = async (credentials: AuthCredentials) => {
    setSyncState(prev => ({ ...prev, error: null }));
    authMutation.mutate(credentials);
  };

  const handleOTPVerify = async (code: string) => {
    otpMutation.mutate(code);
  };

  const handleResendOTP = () => {
    toast({
      title: 'Code Sent',
      description: 'A new verification code has been sent to your registered mobile number.',
    });
  };

  const handleSyncConfirm = async (accountIds: string[]) => {
    syncMutation.mutate(accountIds);
  };

  const handleViewDashboard = () => {
    // Navigate to dashboard
    window.location.href = '/dashboard';
  };

  const handleAddAnotherBank = () => {
    setSyncState({
      currentStep: 'bank-selector',
      selectedBank: null,
      accounts: [],
      isLoading: false,
      error: null,
    });
    setSessionToken('');
  };

  return (
    <div className="min-h-screen bg-background-page">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="text-primary h-8 w-8 mr-3" />
              <h1 className="text-xl font-semibold text-secondary">SecureSync</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">SSL Secured</span>
              <Lock className="text-success h-5 w-5" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProgressIndicator currentStep={syncState.currentStep} />

        {syncState.currentStep === 'bank-selector' && (
          <BankSelector
            banks={banksData || []}
            onBankSelect={handleBankSelect}
          />
        )}

        {syncState.currentStep === 'login' && syncState.selectedBank && (
          <LoginForm
            bank={syncState.selectedBank}
            onSubmit={handleLogin}
            error={syncState.error}
            isLoading={authMutation.isPending}
          />
        )}

        {syncState.currentStep === 'two-factor' && (
          <TwoFactorAuth
            onSubmit={handleOTPVerify}
            onResendOTP={handleResendOTP}
            isLoading={otpMutation.isPending}
          />
        )}

        {syncState.currentStep === 'sync-confirmation' && (
          <SyncConfirmation
            accounts={syncState.accounts}
            onConfirm={handleSyncConfirm}
            isLoading={syncMutation.isPending}
          />
        )}

        {syncState.currentStep === 'success' && syncState.selectedBank && (
          <SuccessMessage
            bankName={syncState.selectedBank.name}
            onViewDashboard={handleViewDashboard}
            onAddAnotherBank={handleAddAnotherBank}
          />
        )}
      </div>

      <LoadingOverlay isVisible={syncMutation.isPending} />
    </div>
  );
}

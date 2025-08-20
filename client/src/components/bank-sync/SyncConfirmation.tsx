import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Loader2 } from 'lucide-react';

interface BankAccount {
  id: string;
  type: string;
  accountNumber: string;
  balance: number;
}

interface SyncConfirmationProps {
  accounts: BankAccount[];
  onConfirm: (selectedAccountIds: string[]) => Promise<void>;
  isLoading: boolean;
}

export function SyncConfirmation({ accounts, onConfirm, isLoading }: SyncConfirmationProps) {
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(
    new Set(accounts.map(acc => acc.id))
  );

  const toggleAccount = (accountId: string) => {
    const newSelected = new Set(selectedAccounts);
    if (newSelected.has(accountId)) {
      newSelected.delete(accountId);
    } else {
      newSelected.add(accountId);
    }
    setSelectedAccounts(newSelected);
  };

  const handleConfirm = async () => {
    await onConfirm(Array.from(selectedAccounts));
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(balance);
  };

  return (
    <Card className="bg-surface shadow-md mb-6">
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-secondary mb-2">Account Synchronization</h2>
          <p className="text-gray-600">Review the accounts we found and confirm which ones you'd like to sync.</p>
        </div>

        <div className="space-y-4 mb-6">
          {accounts.map((account) => (
            <div 
              key={account.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox
                    id={`account-${account.id}`}
                    checked={selectedAccounts.has(account.id)}
                    onCheckedChange={() => toggleAccount(account.id)}
                    disabled={isLoading}
                  />
                  <div className="ml-4">
                    <h3 className="font-medium text-secondary">{account.type}</h3>
                    <p className="text-sm text-gray-500">{account.accountNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-medium text-secondary">{formatBalance(account.balance)}</span>
                  <p className="text-sm text-gray-500">Available Balance</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Shield className="text-warning mr-3 mt-0.5 h-5 w-5" />
            <div>
              <h3 className="text-sm font-medium text-warning mb-1">Data Security</h3>
              <p className="text-sm text-yellow-700">
                Your account data will be encrypted and securely stored. You can disconnect your accounts at any time.
              </p>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleConfirm}
          className="w-full bg-primary hover:bg-primary-dark"
          disabled={isLoading || selectedAccounts.size === 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing Accounts...
            </>
          ) : (
            'Confirm & Sync Accounts'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

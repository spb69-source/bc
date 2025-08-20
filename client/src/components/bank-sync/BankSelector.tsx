import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Info } from 'lucide-react';
import { BankConfig } from '@/types/bank';

interface BankSelectorProps {
  banks: BankConfig[];
  onBankSelect: (bank: BankConfig) => void;
}

export function BankSelector({ banks, onBankSelect }: BankSelectorProps) {
  const [selectedBankId, setSelectedBankId] = useState<string>('');

  const handleBankChange = (bankId: string) => {
    setSelectedBankId(bankId);
    const selectedBank = banks.find(bank => bank.id === bankId);
    if (selectedBank) {
      onBankSelect(selectedBank);
    }
  };

  return (
    <Card className="bg-surface shadow-md mb-6">
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-secondary mb-2">Connect Your Bank Account</h2>
          <p className="text-gray-600">Select your bank from the list below to securely link your account.</p>
        </div>

        <div className="mb-6">
          <label htmlFor="bank-select" className="block text-sm font-medium text-secondary mb-2">
            Choose Your Bank
          </label>
          <Select value={selectedBankId} onValueChange={handleBankChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a bank..." />
            </SelectTrigger>
            <SelectContent>
              {banks.map((bank) => (
                <SelectItem key={bank.id} value={bank.id}>
                  {bank.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="text-primary mr-3 mt-0.5 h-5 w-5" />
            <div>
              <h3 className="text-sm font-medium text-primary mb-1">Security Notice</h3>
              <p className="text-sm text-blue-700">
                Your banking credentials are encrypted using bank-level security. We never store your login information.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

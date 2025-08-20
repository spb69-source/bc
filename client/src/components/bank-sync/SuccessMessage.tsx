import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, RotateCcw } from 'lucide-react';

interface SuccessMessageProps {
  bankName: string;
  onViewDashboard: () => void;
  onAddAnotherBank: () => void;
}

export function SuccessMessage({ bankName, onViewDashboard, onAddAnotherBank }: SuccessMessageProps) {
  return (
    <Card className="bg-surface shadow-md text-center">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-success rounded-full flex items-center justify-center mb-4">
            <Check className="text-white h-8 w-8" />
          </div>
          <h2 className="text-2xl font-semibold text-secondary mb-2">Account Successfully Connected!</h2>
          <p className="text-gray-600">
            Your {bankName} accounts have been securely linked and synchronized.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center">
            <RotateCcw className="text-success mr-3 h-5 w-5" />
            <div>
              <h3 className="text-sm font-medium text-success mb-1">Sync Status: Active</h3>
              <p className="text-sm text-green-700">
                Your account data will be updated automatically every 24 hours.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <Button 
            onClick={onViewDashboard}
            className="flex-1 bg-primary hover:bg-primary-dark"
          >
            View Dashboard
          </Button>
          <Button 
            onClick={onAddAnotherBank}
            variant="outline"
            className="flex-1"
          >
            Add Another Bank
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

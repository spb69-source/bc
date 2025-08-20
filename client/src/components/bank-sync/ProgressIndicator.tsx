import { SyncStep } from '@/types/bank';

interface ProgressIndicatorProps {
  currentStep: SyncStep['id'];
}

const steps: SyncStep[] = [
  { id: 'bank-selector', name: 'Select Bank', stepNumber: 1 },
  { id: 'login', name: 'Authenticate', stepNumber: 2 },
  { id: 'two-factor', name: 'Authenticate', stepNumber: 2 },
  { id: 'sync-confirmation', name: 'Authenticate', stepNumber: 2 },
  { id: 'success', name: 'Sync Complete', stepNumber: 3 },
];

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const currentStepNumber = steps.find(step => step.id === currentStep)?.stepNumber || 1;
  const progressPercentage = (currentStepNumber / 3) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            currentStepNumber >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            1
          </div>
          <span className={`ml-2 text-sm font-medium ${
            currentStepNumber >= 1 ? 'text-primary' : 'text-gray-500'
          }`}>
            Select Bank
          </span>
        </div>
        
        <div className="flex-1 mx-4">
          <div className="h-1 bg-gray-200 rounded">
            <div 
              className="h-1 bg-primary rounded transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 66)}%` }}
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            currentStepNumber >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            2
          </div>
          <span className={`ml-2 text-sm font-medium ${
            currentStepNumber >= 2 ? 'text-primary' : 'text-gray-500'
          }`}>
            Authenticate
          </span>
        </div>
        
        <div className="flex-1 mx-4">
          <div className="h-1 bg-gray-200 rounded">
            <div 
              className="h-1 bg-primary rounded transition-all duration-300"
              style={{ width: `${currentStepNumber >= 3 ? '100%' : '0%'}` }}
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            currentStepNumber >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            3
          </div>
          <span className={`ml-2 text-sm font-medium ${
            currentStepNumber >= 3 ? 'text-primary' : 'text-gray-500'
          }`}>
            Sync Complete
          </span>
        </div>
      </div>
    </div>
  );
}

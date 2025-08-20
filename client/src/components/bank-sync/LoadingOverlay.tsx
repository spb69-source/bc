import { RotateCcw } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
}

export function LoadingOverlay({ isVisible }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg p-8 max-w-sm mx-4 text-center">
        <div className="mb-4">
          <RotateCcw className="animate-spin text-primary h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-secondary mb-2">Connecting to Your Bank</h3>
        <p className="text-gray-600 text-sm">Please wait while we securely establish the connection...</p>
      </div>
    </div>
  );
}

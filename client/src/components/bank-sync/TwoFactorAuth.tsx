import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { otpVerificationSchema, type OTPVerification } from '@shared/schema';

interface TwoFactorAuthProps {
  onSubmit: (otp: string) => Promise<void>;
  onResendOTP: () => void;
  isLoading: boolean;
}

export function TwoFactorAuth({ onSubmit, onResendOTP, isLoading }: TwoFactorAuthProps) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  const form = useForm<OTPVerification>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      code: '',
    },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (data: OTPVerification) => {
    await onSubmit(data.code);
  };

  const handleResend = () => {
    onResendOTP();
    setTimeLeft(300); // Reset timer
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-surface shadow-md mb-6">
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-secondary mb-2">Two-Factor Authentication</h2>
          <p className="text-gray-600">
            We've sent a verification code to your registered mobile number.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="000000"
                      maxLength={6}
                      className="text-center text-2xl font-mono tracking-widest"
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        field.onChange(value.slice(0, 6));
                      }}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Didn't receive the code?</span>
              <Button 
                type="button" 
                variant="link" 
                className="text-sm text-primary hover:text-primary-dark font-medium p-0"
                onClick={handleResend}
                disabled={isLoading}
              >
                Resend Code
              </Button>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dark"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Continue'
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center">
          <span className={`text-sm ${timeLeft <= 0 ? 'text-error' : 'text-gray-500'}`}>
            {timeLeft <= 0 ? 'Code expired' : `Code expires in ${formatTime(timeLeft)}`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

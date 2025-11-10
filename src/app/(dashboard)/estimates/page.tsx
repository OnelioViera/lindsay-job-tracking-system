'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, RefreshCw, Calculator, DollarSign, FileText, Users, Package } from 'lucide-react';
import Link from 'next/link';

interface Estimate {
  _id: string;
  jobId: {
    _id: string;
    jobNumber: string;
    jobName: string;
    status: string;
  };
  version: number;
  estimatorId: {
    name: string;
    email: string;
  };
  assignedPMId?: {
    name: string;
    email: string;
  };
  status: 'draft' | 'submitted' | 'approved' | 'revised';
  quotedPrice: number;
  totalCost: number;
  profitMargin: number;
  createdAt: string;
  updatedAt: string;
}

export default function EstimatesPage() {
  const { data: session } = useSession();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const isEstimator = (session?.user as any)?.role === 'Estimator';
  const isAdmin = (session?.user as any)?.role === 'Admin';

  const fetchEstimates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/estimates');
      if (response.ok) {
        const data = await response.json();
        setEstimates(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch estimates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, []);

  const filteredEstimates = estimates.filter((estimate) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      estimate.jobId?.jobNumber?.toLowerCase().includes(searchLower) ||
      estimate.jobId?.jobName?.toLowerCase().includes(searchLower) ||
      estimate.estimatorId?.name?.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || estimate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-slate-100 text-slate-800',
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      revised: 'bg-yellow-100 text-yellow-800',
    };
    return styles[status as keyof typeof styles] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Estimations</h1>
          <p className="text-slate-600 mt-1">
            {isEstimator 
              ? 'Create and manage your estimates and quotes'
              : 'View and manage all estimates'
            }
          </p>
        </div>
        {(isEstimator || isAdmin) && (
          <Link href="/estimates/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Estimate
            </Button>
          </Link>
        )}
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="estimates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="estimates" className="gap-2">
            <Calculator className="h-4 w-4" />
            Estimations
          </TabsTrigger>
          <TabsTrigger value="customers" className="gap-2">
            <Users className="h-4 w-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2">
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
        </TabsList>

        {/* Estimates Tab */}
        <TabsContent value="estimates" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6 border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Estimates</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {estimates.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Draft</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {estimates.filter(e => e.status === 'draft').length}
                  </p>
                </div>
                <div className="p-3 bg-slate-100 rounded-lg">
                  <Calculator className="h-6 w-6 text-slate-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Submitted</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {estimates.filter(e => e.status === 'submitted').length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-slate-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Approved</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {estimates.filter(e => e.status === 'approved').length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="border-slate-200 p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by job number, job name, or estimator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-md"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="revised">Revised</option>
              </select>
              <Button
                variant="outline"
                onClick={fetchEstimates}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </Card>

          {/* Estimates Table */}
          <Card className="border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 font-medium text-slate-900">Job</th>
                    <th className="text-left p-4 font-medium text-slate-900">Version</th>
                    <th className="text-left p-4 font-medium text-slate-900">Estimator</th>
                    <th className="text-left p-4 font-medium text-slate-900">Status</th>
                    <th className="text-left p-4 font-medium text-slate-900">Quoted Price</th>
                    <th className="text-left p-4 font-medium text-slate-900">Assigned PM</th>
                    <th className="text-left p-4 font-medium text-slate-900">Created</th>
                    <th className="text-left p-4 font-medium text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center p-8 text-slate-500">
                        Loading estimates...
                      </td>
                    </tr>
                  ) : filteredEstimates.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center p-8 text-slate-500">
                        No estimates found
                      </td>
                    </tr>
                  ) : (
                    filteredEstimates.map((estimate) => (
                      <tr key={estimate._id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-slate-900">
                              {estimate.jobId?.jobName || 'N/A'}
                            </p>
                            <p className="text-sm text-slate-500">
                              {estimate.jobId?.jobNumber || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-slate-900">v{estimate.version}</td>
                        <td className="p-4 text-slate-900">{estimate.estimatorId?.name || 'N/A'}</td>
                        <td className="p-4">
                          <Badge className={getStatusBadge(estimate.status)}>
                            {estimate.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-slate-900 font-semibold">
                          ${estimate.quotedPrice?.toFixed(2) || '0.00'}
                        </td>
                        <td className="p-4 text-slate-900">
                          {estimate.assignedPMId?.name || (
                            <span className="text-slate-400 text-sm">Not assigned</span>
                          )}
                        </td>
                        <td className="p-4 text-slate-600">
                          {new Date(estimate.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <Link href={`/estimates/${estimate._id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Customers Tab - Embedded view */}
        <TabsContent value="customers">
          <Card className="border-slate-200 p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900">Customers</h2>
              <p className="text-slate-600 mt-1">View customer information for your estimates</p>
            </div>
            <div className="text-center py-8">
              <p className="text-slate-600 mb-4">Access the full customer management page</p>
              <Link href="/customers">
                <Button>Go to Customers</Button>
              </Link>
            </div>
          </Card>
        </TabsContent>

        {/* Inventory Tab - Embedded view */}
        <TabsContent value="inventory">
          <Card className="border-slate-200 p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-900">Inventory</h2>
              <p className="text-slate-600 mt-1">View inventory for your estimates</p>
            </div>
            <div className="text-center py-8">
              <p className="text-slate-600 mb-4">Access the full inventory management page</p>
              <Link href="/inventory">
                <Button>Go to Inventory</Button>
              </Link>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


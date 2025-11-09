'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreateCustomerDialog } from '@/components/customers/CreateCustomerDialog';
import { Plus, Search, RefreshCw } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        // Handle both array and {success: true, data: [...]} formats
        const customersList = Array.isArray(data) ? data : (data.data || []);
        setCustomers(customersList);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = (Array.isArray(customers) ? customers : []).filter((customer) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.companyName?.toLowerCase().includes(searchLower) ||
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleCustomerCreated = (customer: any) => {
    setCustomers((prev) => {
      const prevArray = Array.isArray(prev) ? prev : [];
      return [customer, ...prevArray];
    });
    fetchCustomers();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-600 mt-1">
            Manage and track all your customers
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Customer
        </Button>
      </div>

      {/* Create Customer Dialog */}
      <CreateCustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleCustomerCreated}
      />

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by company name, contact, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => fetchCustomers()}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-600">Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-slate-600">
              {customers.length === 0 ? 'No customers yet' : 'No matches found'}
            </p>
            {customers.length === 0 && (
              <Button
                onClick={() => setDialogOpen(true)}
                variant="outline"
                className="mt-4 gap-2"
              >
                <Plus className="h-4 w-4" />
                Create First Customer
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  City, State
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer._id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-slate-900">
                      {customer.companyName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    <a href={`mailto:${customer.email}`} className="hover:text-blue-600">
                      {customer.email}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    {customer.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    {customer.address?.city && customer.address?.state
                      ? `${customer.address.city}, ${customer.address.state}`
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* Results Counter */}
      <div className="text-sm text-slate-600">
        Showing {filteredCustomers.length} of {customers.length} customers
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle } from 'lucide-react';

export interface CreateCustomerFormProps {
  onSuccess?: (customer: any) => void;
  onCancel?: () => void;
}

export function CreateCustomerForm({
  onSuccess,
  onCancel,
}: CreateCustomerFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    notes: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!formData.companyName.trim()) {
        throw new Error('Company Name is required');
      }

      // Build request body with only non-empty fields
      const requestBody: any = {
        companyName: formData.companyName,
      };

      if (formData.contactPerson?.trim()) {
        requestBody.name = formData.contactPerson;
      }
      if (formData.email?.trim()) {
        requestBody.email = formData.email;
      }
      if (formData.phone?.trim()) {
        requestBody.phone = formData.phone;
      }
      if (formData.street?.trim() || formData.city?.trim() || formData.state?.trim() || formData.zip?.trim()) {
        requestBody.address = {
          street: formData.street?.trim() || undefined,
          city: formData.city?.trim() || undefined,
          state: formData.state?.trim() || undefined,
          zip: formData.zip?.trim() || undefined,
        };
      }
      if (formData.notes?.trim()) {
        requestBody.notes = formData.notes;
      }

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create customer');
      }

      const customer = await response.json();
      setSuccess(true);
      setFormData({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        notes: '',
      });

      // Call onSuccess callback after 1.5 seconds
      setTimeout(() => {
        onSuccess?.(customer);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <CheckCircle className="h-12 w-12 text-green-600" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            Customer Created Successfully!
          </h3>
          <p className="text-sm text-slate-600 mt-2">
            {formData.companyName} has been added to your system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Company Information Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 mb-4">Company Information</h3>

        <div>
          <Label htmlFor="companyName" className="mb-2 block">Company Name *</Label>
          <Input
            id="companyName"
            name="companyName"
            type="text"
            placeholder="e.g., ABC Construction"
            value={formData.companyName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="contactPerson" className="mb-2 block">Contact Person</Label>
          <Input
            id="contactPerson"
            name="contactPerson"
            type="text"
            placeholder="e.g., John Smith"
            value={formData.contactPerson}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email" className="mb-2 block">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="e.g., john@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="phone" className="mb-2 block">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="e.g., (555) 123-4567"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 mb-4">Address</h3>

        <div>
          <Label htmlFor="street" className="mb-2 block">Street Address</Label>
          <Input
            id="street"
            name="street"
            type="text"
            placeholder="e.g., 123 Main Street"
            value={formData.street}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city" className="mb-2 block">City</Label>
            <Input
              id="city"
              name="city"
              type="text"
              placeholder="e.g., Springfield"
              value={formData.city}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="state" className="mb-2 block">State</Label>
            <Input
              id="state"
              name="state"
              type="text"
              placeholder="e.g., IL or Illinois"
              value={formData.state}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="zip" className="mb-2 block">ZIP Code</Label>
          <Input
            id="zip"
            name="zip"
            type="text"
            placeholder="e.g., 62701"
            value={formData.zip}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Notes Section */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="notes" className="mb-2 block">Notes (Optional)</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Any additional information about this customer..."
            value={formData.notes}
            onChange={handleChange}
            rows={3}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Creating...' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
}


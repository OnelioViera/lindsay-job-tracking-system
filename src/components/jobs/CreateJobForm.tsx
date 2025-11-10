'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle } from 'lucide-react';

export interface CreateJobFormProps {
  onSuccess?: (job: any) => void;
  onCancel?: () => void;
  initialData?: any;
  onSubmit?: (formData: any) => Promise<void>;
  submitButtonText?: string;
}

export function CreateJobForm({ 
  onSuccess, 
  onCancel, 
  initialData,
  onSubmit,
  submitButtonText = 'Create Job'
}: CreateJobFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [formData, setFormData] = useState({
    companyName: initialData?.customerId?.companyName || '',
    jobName: initialData?.jobName || '',
    jobNumber: initialData?.jobNumber || '',
    customerId: initialData?.customerId?._id || '',
    quotedAmount: initialData?.quotedAmount?.toString() || '',
    notes: initialData?.notes || '',
    projectManagerId: initialData?.projectManagerId?._id || '',
    estimateDue: initialData?.estimateDueDate ? new Date(initialData.estimateDueDate).toISOString().slice(0,10) : '',
  });
  const [quoteFile, setQuoteFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Ref for debounce timeout
  const duplicateCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch customers on mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers');
        if (response.ok) {
          const data = await response.json();
          // Handle both array and {success: true, data: [...]} formats
          const customersList = Array.isArray(data) ? data : (data.data || []);
          setCustomers(customersList);
        }
      } catch (err) {
        console.error('Failed to fetch customers:', err);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();

    // Fetch project managers for optional assignment
    const fetchProjectManagers = async () => {
      try {
        const response = await fetch('/api/users?role=Project Manager');
        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data) ? data : (data.data || []);
          setProjectManagers(list);
        }
      } catch (err) {
        console.error('Failed to fetch project managers:', err);
      }
    };

    fetchProjectManagers();

    // Cleanup timeout on unmount
    return () => {
      if (duplicateCheckTimeoutRef.current) {
        clearTimeout(duplicateCheckTimeoutRef.current);
      }
    };
  }, []);

  const [projectManagers, setProjectManagers] = useState<any[]>([]);

  const handleCompanySelect = (customerId: string) => {
    const customer = customers.find((c) => c._id === customerId);
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        customerId,
        companyName: customer.companyName,
      }));
      setShowCompanyDropdown(false);
    }
  };

  const handleJobNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const jobNumber = e.target.value;
    setFormData((prev) => ({
      ...prev,
      jobNumber,
    }));
    setShowDuplicateWarning(false);

    // Clear previous timeout
    if (duplicateCheckTimeoutRef.current) {
      clearTimeout(duplicateCheckTimeoutRef.current);
    }

    // Check for duplicate job number after user stops typing (500ms debounce)
    if (jobNumber.trim()) {
      setCheckingDuplicate(true);
      duplicateCheckTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/jobs?jobNumber=${encodeURIComponent(jobNumber)}`);
          if (response.ok) {
            const data = await response.json();
            const jobsList = Array.isArray(data) ? data : (data.data || []);
            // Only show warning if a job with this exact number exists
            if (jobsList.length > 0) {
              setShowDuplicateWarning(true);
            } else {
              setShowDuplicateWarning(false);
            }
          }
        } catch (err) {
          console.error('Failed to check job number:', err);
        } finally {
          setCheckingDuplicate(false);
        }
      }, 500);
    } else {
      setShowDuplicateWarning(false);
      setCheckingDuplicate(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        setQuoteFile(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        setQuoteFile(null);
        return;
      }
      setQuoteFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!formData.customerId) {
        throw new Error('Please select a company');
      }
      if (!formData.jobName.trim()) {
        throw new Error('Please enter a job name');
      }
      if (!formData.jobNumber.trim()) {
        throw new Error('Please enter a job number');
      }
      if (showDuplicateWarning && !initialData) {
        throw new Error('This job number is already in use. Please use a different number.');
      }

      // If custom onSubmit is provided (edit mode), use it
      if (onSubmit) {
        const submitData = {
          jobName: formData.jobName,
          jobNumber: formData.jobNumber,
          customerId: formData.customerId,
          quotedAmount: formData.quotedAmount ? parseFloat(formData.quotedAmount) : undefined,
          notes: formData.notes,
            projectManagerId: formData.projectManagerId || undefined,
            estimateDue: formData.estimateDue || undefined,
        };
        
        await onSubmit(submitData);
        setSuccess(true);
        
        // Call onSuccess callback after 1.5 seconds
        setTimeout(() => {
          onSuccess?.(submitData);
        }, 1500);
      } else {
        // Default create mode
        const formPayload = new FormData();
        formPayload.append('jobName', formData.jobName);
        formPayload.append('jobNumber', formData.jobNumber);
        formPayload.append('customerId', formData.customerId);
        if (formData.quotedAmount) {
          formPayload.append('quotedAmount', parseFloat(formData.quotedAmount).toString());
        }
        if (formData.notes) {
          formPayload.append('notes', formData.notes);
        }
        if (formData.projectManagerId) {
          formPayload.append('projectManagerId', formData.projectManagerId);
        }
        if (formData.estimateDue) {
          formPayload.append('estimateDue', formData.estimateDue);
        }
        if (quoteFile) {
          formPayload.append('quoteFile', quoteFile);
        }

        const response = await fetch('/api/jobs', {
          method: 'POST',
          body: formPayload,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create job');
        }

        const job = await response.json();
        setSuccess(true);
        setFormData({
          companyName: '',
          jobName: '',
          jobNumber: '',
          customerId: '',
          quotedAmount: '',
          notes: '',
          projectManagerId: '',
          estimateDue: '',
        });
        setQuoteFile(null);
        setShowCompanyDropdown(false);

        // Call onSuccess callback after 1.5 seconds
        setTimeout(() => {
          onSuccess?.(job);
        }, 1500);
      }
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
            {initialData ? 'Job Updated Successfully!' : 'Job Created Successfully!'}
          </h3>
          <p className="text-sm text-slate-600 mt-2">
            {formData.jobName} has been {initialData ? 'updated' : 'added to your system'}.
          </p>
        </div>
      </div>
    );
  }

  if (loadingCustomers) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-slate-600">Loading customers...</p>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8">
        <AlertCircle className="h-12 w-12 text-amber-600" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            No Customers Found
          </h3>
          <p className="text-sm text-slate-600 mt-2">
            Please create a customer first before creating a job.
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

      {/* Duplicate Warning */}
      {showDuplicateWarning && (
        <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-700">
            ⚠️ This job number is already in use. Please use a different number.
          </p>
        </div>
      )}

      {/* Job Information Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 mb-4">Job Information</h3>

        {/* Company Name Dropdown */}
        <div>
          <Label htmlFor="companyDropdown" className="mb-2 block">Company Name *</Label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
              className={`w-full px-3 py-2 text-left border rounded-lg transition ${
                formData.companyName
                  ? 'bg-blue-50 border-blue-300'
                  : 'border-slate-300 bg-white'
              } hover:border-slate-400`}
            >
              <div className="flex items-center justify-between">
                <span className={formData.companyName ? 'font-medium text-slate-900' : 'text-slate-600'}>
                  {formData.companyName || 'Select a company...'}
                </span>
                <span className="text-slate-400">▼</span>
              </div>
            </button>

            {showCompanyDropdown && (
              <div className="absolute z-10 w-full mt-1 border border-slate-200 rounded-lg bg-white shadow-lg max-h-48 overflow-y-auto">
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <button
                      key={customer._id}
                      type="button"
                      onClick={() => handleCompanySelect(customer._id)}
                      className={`w-full text-left px-3 py-3 border-b border-slate-100 last:border-b-0 transition ${
                        formData.customerId === customer._id
                          ? 'bg-blue-100 hover:bg-blue-150'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <p className={formData.customerId === customer._id ? 'font-semibold text-slate-900' : 'font-medium text-slate-900'}>
                        {customer.companyName}
                      </p>
                      <p className="text-xs text-slate-600">{customer.name}</p>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-slate-600">
                    No companies available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

               {/* Job Name */}
               <div>
                 <Label htmlFor="jobName" className="mb-2 block">Job Name *</Label>
                 <Input
            id="jobName"
            name="jobName"
            type="text"
            placeholder="e.g., Downtown Parking Complex"
            value={formData.jobName}
            onChange={handleChange}
            required
          />
        </div>

               {/* Job Number */}
               <div>
                 <Label htmlFor="jobNumber" className="mb-2 block">Job Number *</Label>
                 <Input
            id="jobNumber"
            name="jobNumber"
            type="text"
            placeholder="e.g., LP-2025-001"
            value={formData.jobNumber}
            onChange={handleJobNumberChange}
            required
            className={showDuplicateWarning ? 'border-yellow-500 focus:ring-yellow-200' : ''}
          />
        </div>

               {/* Quoted Amount */}
               <div>
                 <Label htmlFor="quotedAmount" className="mb-2 block">Quoted Amount (Optional)</Label>
                 <div className="flex items-center">
                   <span className="text-slate-600 font-semibold mr-2">$</span>
                   <Input
                     id="quotedAmount"
                     name="quotedAmount"
                     type="number"
                     placeholder="0.00"
                     value={formData.quotedAmount}
                     onChange={handleChange}
                     step="0.01"
                     min="0"
                     className="flex-1"
                   />
                 </div>
               </div>

              {/* Project Manager Selection */}
              <div>
                <Label htmlFor="projectManagerId" className="mb-2 block">Project Manager (Optional)</Label>
                <select
                  id="projectManagerId"
                  name="projectManagerId"
                  value={formData.projectManagerId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">-- None --</option>
                  {projectManagers.map((pm) => (
                    <option key={pm._id} value={pm._id}>{pm.name} {pm.email ? `(${pm.email})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Estimate Due Date */}
              <div>
                <Label htmlFor="estimateDue" className="mb-2 block">Estimate Due (Optional)</Label>
                <Input
                  id="estimateDue"
                  name="estimateDue"
                  type="date"
                  value={formData.estimateDue}
                  onChange={handleChange}
                />
              </div>

               {/* Quote PDF Upload */}
               <div>
                 <label htmlFor="quoteFileInput" style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px', color: '#1e293b' }}>
                   Quote PDF (Optional)
                 </label>
                 {/* Native file input - styled to match form */}
                 <input
                   ref={fileInputRef}
                   type="file"
                   accept=".pdf,application/pdf"
                   onChange={handleFileChange}
                   id="quoteFileInput"
                   style={{
                     display: 'block',
                     width: '100%',
                     padding: '8px 12px',
                     border: '1px solid #cbd5e1',
                     borderRadius: '8px',
                     fontSize: '14px',
                     backgroundColor: '#fff',
                     boxSizing: 'border-box',
                     cursor: 'pointer',
                   }}
                 />
                 {quoteFile && (
                   <p style={{ fontSize: '12px', marginTop: '8px', color: '#16a34a' }}>
                     ✓ PDF selected ({(quoteFile.size / 1024 / 1024).toFixed(2)} MB)
                   </p>
                 )}
                 {!quoteFile && (
                   <p style={{ fontSize: '12px', marginTop: '8px', color: '#64748b' }}>
                     PDF file up to 10MB
                   </p>
                 )}
                 {quoteFile && (
                   <button
                     type="button"
                     onClick={() => {
                       setQuoteFile(null);
                       if (fileInputRef.current) {
                         fileInputRef.current.value = '';
                       }
                     }}
                     style={{
                       marginTop: '8px',
                       padding: '6px 12px',
                       fontSize: '12px',
                       fontWeight: 500,
                       color: '#dc2626',
                       backgroundColor: 'transparent',
                       border: 'none',
                       cursor: 'pointer',
                    }}
                   >
                     Clear File
                   </button>
                 )}
               </div>
      </div>

             {/* Notes Section */}
             <div className="space-y-4">
               <h3 className="font-semibold text-slate-900 mb-4">Additional Information</h3>
               <div>
                 <Label htmlFor="notes" className="mb-2 block">Notes (Optional)</Label>
                 <Textarea
            id="notes"
            name="notes"
            placeholder="Any additional information about this job..."
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
        <Button type="submit" disabled={loading || showDuplicateWarning} className="flex-1">
          {loading ? (initialData ? 'Updating...' : 'Creating...') : submitButtonText}
        </Button>
      </div>
    </form>
  );
}


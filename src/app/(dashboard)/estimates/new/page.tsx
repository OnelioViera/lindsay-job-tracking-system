'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, X, Save, Send } from 'lucide-react';
import Link from 'next/link';

interface Job {
  _id: string;
  jobNumber: string;
  jobName: string;
  status: string;
}

interface Structure {
  structureType: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface ItemToPurchase {
  itemName: string;
  category: string;
  supplier?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export default function NewEstimatePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [projectManagers, setProjectManagers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    jobId: '',
    laborCost: 0,
    materialCost: 0,
    equipmentCost: 0,
    overheadCost: 0,
    profitMargin: 30,
    notes: '',
    assignedPMId: '',
  });

  const [structures, setStructures] = useState<Structure[]>([]);
  const [itemsToPurchase, setItemsToPurchase] = useState<ItemToPurchase[]>([]);

  useEffect(() => {
    fetchJobs();
    fetchProjectManagers();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const fetchProjectManagers = async () => {
    try {
      const response = await fetch('/api/users?role=Project Manager');
      if (response.ok) {
        const data = await response.json();
        // API returns array directly, not wrapped
        setProjectManagers(Array.isArray(data) ? data : (data.data || []));
      }
    } catch (error) {
      console.error('Failed to fetch project managers:', error);
    }
  };

  const addStructure = () => {
    setStructures([
      ...structures,
      {
        structureType: '',
        description: '',
        quantity: 1,
        unitCost: 0,
        totalCost: 0,
      },
    ]);
  };

  const removeStructure = (index: number) => {
    setStructures(structures.filter((_, i) => i !== index));
  };

  const updateStructure = (index: number, field: keyof Structure, value: any) => {
    const updated = [...structures];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    
    // Auto-calculate total cost
    if (field === 'quantity' || field === 'unitCost') {
      updated[index].totalCost = updated[index].quantity * updated[index].unitCost;
    }
    
    setStructures(updated);
  };

  const addItem = () => {
    setItemsToPurchase([
      ...itemsToPurchase,
      {
        itemName: '',
        category: '',
        supplier: '',
        quantity: 1,
        unitCost: 0,
        totalCost: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItemsToPurchase(itemsToPurchase.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ItemToPurchase, value: any) => {
    const updated = [...itemsToPurchase];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    
    // Auto-calculate total cost
    if (field === 'quantity' || field === 'unitCost') {
      updated[index].totalCost = updated[index].quantity * updated[index].unitCost;
    }
    
    setItemsToPurchase(updated);
  };

  const calculateTotals = () => {
    const totalCost = 
      formData.laborCost + 
      formData.materialCost + 
      formData.equipmentCost + 
      formData.overheadCost;
    
    const quotedPrice = totalCost * (1 + formData.profitMargin / 100);
    
    return { totalCost, quotedPrice };
  };

  const handleSubmit = async (status: 'draft' | 'submitted') => {
    if (!formData.jobId) {
      alert('Please select a job');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/estimates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          structures,
          itemsToPurchase,
          status,
        }),
      });

      if (response.ok) {
        router.push('/estimates');
      } else {
        const error = await response.json();
        alert(`Failed to create estimate: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating estimate:', error);
      alert('Failed to create estimate');
    } finally {
      setLoading(false);
    }
  };

  const { totalCost, quotedPrice } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/estimates">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">New Estimate</h1>
          <p className="text-slate-600 mt-1">Create a new estimate for a job</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="p-6 border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="jobId">Job *</Label>
                <select
                  id="jobId"
                  value={formData.jobId}
                  onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  required
                >
                  <option value="">Select a job</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.jobNumber} - {job.jobName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="assignedPMId">Assign to Project Manager (Optional)</Label>
                <select
                  id="assignedPMId"
                  value={formData.assignedPMId}
                  onChange={(e) => setFormData({ ...formData, assignedPMId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="">Not assigned</option>
                  {projectManagers.map((pm) => (
                    <option key={pm._id} value={pm._id}>
                      {pm.name} ({pm.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Structures */}
          <Card className="p-6 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Structures</h2>
              <Button onClick={addStructure} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Structure
              </Button>
            </div>

            <div className="space-y-4">
              {structures.map((structure, index) => (
                <Card key={index} className="p-4 border-slate-200 bg-slate-50">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-slate-900">Structure #{index + 1}</h3>
                    <Button
                      onClick={() => removeStructure(index)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Type</Label>
                      <Input
                        value={structure.structureType}
                        onChange={(e) => updateStructure(index, 'structureType', e.target.value)}
                        placeholder="e.g., Manhole"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={structure.description}
                        onChange={(e) => updateStructure(index, 'description', e.target.value)}
                        placeholder="Description"
                      />
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={structure.quantity}
                        onChange={(e) => updateStructure(index, 'quantity', Number(e.target.value))}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label>Unit Cost ($)</Label>
                      <Input
                        type="number"
                        value={structure.unitCost}
                        onChange={(e) => updateStructure(index, 'unitCost', Number(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Total Cost</Label>
                      <Input
                        value={`$${structure.totalCost.toFixed(2)}`}
                        disabled
                        className="bg-slate-100"
                      />
                    </div>
                  </div>
                </Card>
              ))}
              
              {structures.length === 0 && (
                <p className="text-center text-slate-500 py-4">
                  No structures added yet. Click "Add Structure" to begin.
                </p>
              )}
            </div>
          </Card>

          {/* Items to Purchase */}
          <Card className="p-6 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Items to Purchase</h2>
              <Button onClick={addItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {itemsToPurchase.map((item, index) => (
                <Card key={index} className="p-4 border-slate-200 bg-slate-50">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-slate-900">Item #{index + 1}</h3>
                    <Button
                      onClick={() => removeItem(index)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Item Name</Label>
                      <Input
                        value={item.itemName}
                        onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                        placeholder="e.g., Rebar"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Input
                        value={item.category}
                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                        placeholder="e.g., Materials"
                      />
                    </div>
                    <div>
                      <Label>Supplier</Label>
                      <Input
                        value={item.supplier}
                        onChange={(e) => updateItem(index, 'supplier', e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label>Unit Cost ($)</Label>
                      <Input
                        type="number"
                        value={item.unitCost}
                        onChange={(e) => updateItem(index, 'unitCost', Number(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <Label>Total Cost</Label>
                      <Input
                        value={`$${item.totalCost.toFixed(2)}`}
                        disabled
                        className="bg-slate-100"
                      />
                    </div>
                  </div>
                </Card>
              ))}
              
              {itemsToPurchase.length === 0 && (
                <p className="text-center text-slate-500 py-4">
                  No items added yet. Click "Add Item" to begin.
                </p>
              )}
            </div>
          </Card>

          {/* Notes */}
          <Card className="p-6 border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Notes</h2>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes or comments..."
              rows={4}
            />
          </Card>
        </div>

        {/* Cost Summary Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 border-slate-200 sticky top-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Cost Summary</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="laborCost">Labor Cost ($)</Label>
                <Input
                  id="laborCost"
                  type="number"
                  value={formData.laborCost}
                  onChange={(e) => setFormData({ ...formData, laborCost: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="materialCost">Material Cost ($)</Label>
                <Input
                  id="materialCost"
                  type="number"
                  value={formData.materialCost}
                  onChange={(e) => setFormData({ ...formData, materialCost: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="equipmentCost">Equipment Cost ($)</Label>
                <Input
                  id="equipmentCost"
                  type="number"
                  value={formData.equipmentCost}
                  onChange={(e) => setFormData({ ...formData, equipmentCost: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="overheadCost">Overhead Cost ($)</Label>
                <Input
                  id="overheadCost"
                  type="number"
                  value={formData.overheadCost}
                  onChange={(e) => setFormData({ ...formData, overheadCost: Number(e.target.value) })}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="profitMargin">Profit Margin (%)</Label>
                <Input
                  id="profitMargin"
                  type="number"
                  value={formData.profitMargin}
                  onChange={(e) => setFormData({ ...formData, profitMargin: Number(e.target.value) })}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div className="border-t border-slate-200 pt-4 mt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600">Total Cost:</span>
                  <span className="font-bold text-slate-900">${totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Quoted Price:</span>
                  <span className="font-bold text-green-600 text-xl">${quotedPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Button
                  onClick={() => handleSubmit('draft')}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
                <Button
                  onClick={() => handleSubmit('submitted')}
                  disabled={loading}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Estimate
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


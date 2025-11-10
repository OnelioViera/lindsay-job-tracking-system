'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Edit, Save, Send, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function EstimateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projectManagers, setProjectManagers] = useState<any[]>([]);
  const [selectedPMId, setSelectedPMId] = useState('');

  const isEstimator = (session?.user as any)?.role === 'Estimator';
  const isAdmin = (session?.user as any)?.role === 'Admin';
  const canEdit = isEstimator || isAdmin;

  useEffect(() => {
    if (params.id) {
      fetchEstimate();
      fetchProjectManagers();
    }
  }, [params.id]);

  const fetchEstimate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/estimates/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setEstimate(data.data);
        setSelectedPMId(data.data.assignedPMId?._id || '');
      }
    } catch (error) {
      console.error('Failed to fetch estimate:', error);
    } finally {
      setLoading(false);
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

  const handleAssignPM = async () => {
    if (!selectedPMId) {
      alert('Please select a project manager');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/estimates/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignedPMId: selectedPMId,
        }),
      });

      if (response.ok) {
        alert('Project manager assigned successfully!');
        fetchEstimate();
      } else {
        const error = await response.json();
        alert(`Failed to assign PM: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error assigning PM:', error);
      alert('Failed to assign project manager');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/estimates/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'submitted',
        }),
      });

      if (response.ok) {
        alert('Estimate submitted successfully!');
        fetchEstimate();
      } else {
        const error = await response.json();
        alert(`Failed to submit estimate: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting estimate:', error);
      alert('Failed to submit estimate');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-slate-100 text-slate-800',
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      revised: 'bg-yellow-100 text-yellow-800',
    };
    return styles[status as keyof typeof styles] || 'bg-slate-100 text-slate-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-600">Loading estimate...</p>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-600">Estimate not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/estimates">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Estimate v{estimate.version}
            </h1>
            <p className="text-slate-600 mt-1">
              {estimate.jobId?.jobNumber} - {estimate.jobId?.jobName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusBadge(estimate.status)}>
            {estimate.status}
          </Badge>
          {estimate.status === 'draft' && canEdit && (
            <Button onClick={handleSubmit} disabled={saving}>
              <Send className="h-4 w-4 mr-2" />
              Submit Estimate
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Estimate Information */}
          <Card className="p-6 border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Estimate Information</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-600">Estimator</Label>
                <p className="text-slate-900 font-medium">{estimate.estimatorId?.name || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-slate-600">Created</Label>
                <p className="text-slate-900 font-medium">
                  {new Date(estimate.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Label className="text-slate-600">Last Updated</Label>
                <p className="text-slate-900 font-medium">
                  {new Date(estimate.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Label className="text-slate-600">Assigned PM</Label>
                <p className="text-slate-900 font-medium">
                  {estimate.assignedPMId?.name || 'Not assigned'}
                </p>
              </div>
            </div>
          </Card>

          {/* Cost Breakdown */}
          <Card className="p-6 border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Cost Breakdown</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Labor Cost:</span>
                <span className="text-slate-900 font-medium">
                  ${estimate.laborCost?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Material Cost:</span>
                <span className="text-slate-900 font-medium">
                  ${estimate.materialCost?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Equipment Cost:</span>
                <span className="text-slate-900 font-medium">
                  ${estimate.equipmentCost?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Overhead Cost:</span>
                <span className="text-slate-900 font-medium">
                  ${estimate.overheadCost?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-slate-300">
                <span className="text-slate-900 font-semibold">Total Cost:</span>
                <span className="text-slate-900 font-bold">
                  ${estimate.totalCost?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Profit Margin:</span>
                <span className="text-slate-900 font-medium">{estimate.profitMargin}%</span>
              </div>
              <div className="flex justify-between py-3 bg-green-50 px-4 rounded-lg border-2 border-green-200">
                <span className="text-green-900 font-bold text-lg">Quoted Price:</span>
                <span className="text-green-700 font-bold text-xl">
                  ${estimate.quotedPrice?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </Card>

          {/* Structures */}
          {estimate.structures && estimate.structures.length > 0 && (
            <Card className="p-6 border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Structures</h2>
              
              <div className="space-y-3">
                {estimate.structures.map((structure: any, index: number) => (
                  <Card key={index} className="p-4 bg-slate-50 border-slate-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-slate-600 text-sm">Type</Label>
                        <p className="text-slate-900">{structure.structureType}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600 text-sm">Description</Label>
                        <p className="text-slate-900">{structure.description}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600 text-sm">Quantity</Label>
                        <p className="text-slate-900">{structure.quantity}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600 text-sm">Unit Cost</Label>
                        <p className="text-slate-900">${structure.unitCost?.toFixed(2)}</p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-slate-600 text-sm">Total</Label>
                        <p className="text-slate-900 font-semibold">
                          ${structure.totalCost?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {/* Items to Purchase */}
          {estimate.itemsToPurchase && estimate.itemsToPurchase.length > 0 && (
            <Card className="p-6 border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Items to Purchase</h2>
              
              <div className="space-y-3">
                {estimate.itemsToPurchase.map((item: any, index: number) => (
                  <Card key={index} className="p-4 bg-slate-50 border-slate-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-slate-600 text-sm">Item Name</Label>
                        <p className="text-slate-900">{item.itemName}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600 text-sm">Category</Label>
                        <p className="text-slate-900">{item.category}</p>
                      </div>
                      {item.supplier && (
                        <div>
                          <Label className="text-slate-600 text-sm">Supplier</Label>
                          <p className="text-slate-900">{item.supplier}</p>
                        </div>
                      )}
                      <div>
                        <Label className="text-slate-600 text-sm">Quantity</Label>
                        <p className="text-slate-900">{item.quantity}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600 text-sm">Unit Cost</Label>
                        <p className="text-slate-900">${item.unitCost?.toFixed(2)}</p>
                      </div>
                      <div>
                        <Label className="text-slate-600 text-sm">Total</Label>
                        <p className="text-slate-900 font-semibold">
                          ${item.totalCost?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {/* Notes */}
          {estimate.notes && (
            <Card className="p-6 border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Notes</h2>
              <p className="text-slate-700 whitespace-pre-wrap">{estimate.notes}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assign PM */}
          {canEdit && (
            <Card className="p-6 border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Assign Project Manager
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="assignedPMId">Project Manager</Label>
                  <select
                    id="assignedPMId"
                    value={selectedPMId}
                    onChange={(e) => setSelectedPMId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md mt-1"
                  >
                    <option value="">Select a PM</option>
                    {projectManagers.map((pm) => (
                      <option key={pm._id} value={pm._id}>
                        {pm.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Button
                  onClick={handleAssignPM}
                  disabled={saving || !selectedPMId || selectedPMId === estimate.assignedPMId?._id}
                  className="w-full"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {estimate.assignedPMId ? 'Update Assignment' : 'Assign PM'}
                </Button>
              </div>
            </Card>
          )}

          {/* Quick Stats */}
          <Card className="p-6 border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Stats</h2>
            
            <div className="space-y-3">
              <div>
                <Label className="text-slate-600">Version</Label>
                <p className="text-slate-900 font-bold text-2xl">v{estimate.version}</p>
              </div>
              <div>
                <Label className="text-slate-600">Status</Label>
                <Badge className={`${getStatusBadge(estimate.status)} mt-1`}>
                  {estimate.status}
                </Badge>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <Label className="text-slate-600">Job Status</Label>
                <p className="text-slate-900 font-medium">{estimate.jobId?.status || 'N/A'}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


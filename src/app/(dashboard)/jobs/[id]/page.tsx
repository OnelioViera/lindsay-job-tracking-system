'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, AlertCircle, Loader, Edit2, FileText, Download } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  'Estimation': 'bg-blue-100 text-blue-800',
  'Drafting': 'bg-purple-100 text-purple-800',
  'PM Review': 'bg-yellow-100 text-yellow-800',
  'Submitted': 'bg-orange-100 text-orange-800',
  'Under Revision': 'bg-red-100 text-red-800',
  'Accepted': 'bg-green-100 text-green-800',
  'In Production': 'bg-indigo-100 text-indigo-800',
  'Delivered': 'bg-emerald-100 text-emerald-800',
};

const PRIORITY_COLORS: Record<string, string> = {
  'low': 'bg-gray-100 text-gray-800',
  'medium': 'bg-blue-100 text-blue-800',
  'high': 'bg-orange-100 text-orange-800',
  'urgent': 'bg-red-100 text-red-800',
};

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const jobId = params.id as string;
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [showPMSelector, setShowPMSelector] = useState(false);
  const [assigningPM, setAssigningPM] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the job
        const jobResponse = await fetch(`/api/jobs/${jobId}`);
        if (!jobResponse.ok) {
          if (jobResponse.status === 404) {
            throw new Error('Job not found');
          }
          throw new Error('Failed to fetch job');
        }
        const jobData = await jobResponse.json();
        setJob(jobData);

        // Fetch all users to get Project Managers
        const usersResponse = await fetch('/api/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          // Filter for Project Manager role
          const projectManagers = usersData.filter(
            (user: any) => user.role === 'Project Manager'
          );
          setUsers(projectManagers);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchData();
    }
  }, [jobId]);

  const assignProjectManager = async (pmId: string) => {
    setAssigningPM(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectManagerId: pmId }),
      });

      if (response.ok) {
        const updatedJob = await response.json();
        setJob(updatedJob);
        setShowPMSelector(false);
      }
    } catch (err) {
      console.error('Failed to assign project manager:', err);
    } finally {
      setAssigningPM(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-slate-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card className="border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700">{error || 'Job not found'}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  const currentUserId = (session?.user as any)?.id;
  const canAssignPM = session?.user && (((session.user as any).role === 'Admin') || (job.createdBy && ((job.createdBy._id && job.createdBy._id === currentUserId) || job.createdBy === currentUserId)));

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => router.back()}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Button>

      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{job.jobName}</h1>
            <p className="text-slate-600 mt-1">Job #{job.jobNumber}</p>
          </div>
          <div className="flex gap-2">
            <Badge className={STATUS_COLORS[job.status]}>
              {job.status}
            </Badge>
            <Badge className={PRIORITY_COLORS[job.priority]}>
              {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)} Priority
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card className="border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Customer Information
            </h2>
            <div className="space-y-4">
              {job.customerId && (
                <>
                  <div>
                    <p className="text-sm text-slate-600">Company</p>
                    <p className="font-medium text-slate-900">
                      {job.customerId.companyName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Contact Person</p>
                    <p className="font-medium text-slate-900">
                      {job.customerId.name}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Email</p>
                      <a
                        href={`mailto:${job.customerId.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {job.customerId.email}
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Phone</p>
                      <a
                        href={`tel:${job.customerId.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {job.customerId.phone}
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Timeline */}
          <Card className="border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Project Timeline
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex gap-2">
                  <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-slate-600">Created</p>
                    <p className="font-medium text-slate-900">
                      {formatDate(job.createdDate)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-slate-600">Estimate Due</p>
                    <p className="font-medium text-slate-900">
                      {formatDate(job.estimateDueDate)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex gap-2">
                  <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-slate-600">Draft Start</p>
                    <p className="font-medium text-slate-900">
                      {formatDate(job.draftStartDate)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-slate-600">Draft Complete</p>
                    <p className="font-medium text-slate-900">
                      {formatDate(job.draftCompletionDate)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex gap-2">
                  <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-slate-600">Production Start</p>
                    <p className="font-medium text-slate-900">
                      {formatDate(job.productionStartDate)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-slate-600">Delivery Date</p>
                    <p className="font-medium text-slate-900">
                      {formatDate(job.deliveryDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Notes */}
          {job.notes && (
            <Card className="border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Notes
              </h2>
              <p className="text-slate-700 whitespace-pre-wrap">{job.notes}</p>
            </Card>
          )}

          {/* Quote Section */}
          <Card className="border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Quote & Pricing
              </h2>
            </div>
            <div className="space-y-4">
              {job.quotedAmount ? (
                <div>
                  <p className="text-sm text-slate-600">Quoted Amount</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${parseFloat(job.quotedAmount).toFixed(2)}
                  </p>
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  No quote amount set
                </div>
              )}

              {job.quotePdfUrl ? (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-slate-900">Quote PDF</p>
                        <p className="text-sm text-slate-600">Document available for download</p>
                      </div>
                    </div>
                    <a
                      href={job.quotePdfUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  No quote PDF attached
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-3">Status</h3>
            <div className="space-y-2">
              <Badge className={`${STATUS_COLORS[job.status]} w-full justify-center py-2`}>
                {job.status}
              </Badge>
              <p className="text-sm text-slate-600 text-center">
                Current phase of the project
              </p>
            </div>
          </Card>

          {/* Priority Card */}
          <Card className="border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-3">Priority</h3>
            <div className="space-y-2">
              <Badge className={`${PRIORITY_COLORS[job.priority]} w-full justify-center py-2`}>
                {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
              </Badge>
            </div>
          </Card>

          {/* Job Information Card */}
          <Card className="border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-3">Job Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-600">Job Number</p>
                <p className="font-mono font-semibold text-slate-900">
                  {job.jobNumber}
                </p>
              </div>
              {job.tags && job.tags.length > 0 && (
                <div>
                  <p className="text-slate-600 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {job.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Personnel */}
          <Card className="border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">Personnel</h3>
              {canAssignPM && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPMSelector(!showPMSelector)}
                  className="gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Assign PM
                </Button>
              )}
            </div>

            {showPMSelector && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-slate-700 mb-3">Select a Project Manager:</p>
                {users.length === 0 ? (
                  <p className="text-sm text-slate-600">No Project Managers available</p>
                ) : (
                  <div className="space-y-2">
                    {users.map((pm: any) => (
                      <Button
                        key={pm._id}
                        variant="outline"
                        className="w-full justify-start"
                        disabled={assigningPM}
                        onClick={() => assignProjectManager(pm._id)}
                      >
                        {pm.name} ({pm.email})
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              {job.estimatorId && (
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />
                  <div className="text-sm">
                    <p className="text-slate-600">Estimator</p>
                    <p className="font-medium text-slate-900">
                      {job.estimatorId.name}
                    </p>
                  </div>
                </div>
              )}
              {job.drafterId && (
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />
                  <div className="text-sm">
                    <p className="text-slate-600">Drafter</p>
                    <p className="font-medium text-slate-900">
                      {job.drafterId.name}
                    </p>
                  </div>
                </div>
              )}
              {job.projectManagerId ? (
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-green-600 flex-shrink-0 mt-1" />
                  <div className="text-sm">
                    <p className="text-slate-600">Project Manager</p>
                    <p className="font-medium text-slate-900">
                      {job.projectManagerId.name}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-sm p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
                  No Project Manager assigned yet
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


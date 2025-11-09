'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CreateJobForm } from '@/components/jobs/CreateJobForm';
import { toast } from 'sonner';

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [job, setJob] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === 'Admin';

  useEffect(() => {
    // Redirect if not admin
    if (session && !isAdmin) {
      router.push('/jobs');
      return;
    }

    // Fetch job data
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch job');
        }
        const data = await response.json();
        setJob(data);
      } catch (error) {
        console.error('Error fetching job:', error);
        toast.error('Failed to load job data');
        router.push('/jobs');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id && session) {
      fetchJob();
    }
  }, [params.id, session, isAdmin, router]);

  const handleUpdate = async (formData: any) => {
    try {
      const response = await fetch(`/api/jobs/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update job');
      }

      const result = await response.json();
      toast.success('Job updated successfully!');
      router.push(`/jobs/${params.id}`);
    } catch (error: any) {
      console.error('Error updating job:', error);
      toast.error(error.message || 'Failed to update job');
      throw error;
    }
  };

  if (!session || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-500">Access denied. Admin only.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-500">Loading job data...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-500">Job not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Job</h1>
          <p className="text-slate-600 mt-1">
            Update job details for {job.jobNumber}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <Card className="p-6">
        <CreateJobForm 
          initialData={job}
          onSubmit={handleUpdate}
          submitButtonText="Update Job"
        />
      </Card>
    </div>
  );
}


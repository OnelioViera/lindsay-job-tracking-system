'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { CreateJobForm } from '@/components/jobs/CreateJobForm';
import { ArrowLeft } from 'lucide-react';

export default function NewJobPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const role = (session?.user as any)?.role as any;
  const isAdmin = role === 'Admin';
  const canCreateJobs = role ? hasPermission(role, 'canCreateJobs') : false;

  if (!(isAdmin || canCreateJobs)) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
        <p className="text-slate-600 mt-2">You don't have permission to create jobs.</p>
        <Button onClick={() => router.push('/jobs')} className="mt-4">
          Back to Jobs
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Create New Job</h1>
          <p className="text-slate-600 mt-1">
            Add a new job to your system by filling in the details below
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <CreateJobForm
          onSuccess={() => {
            router.push('/jobs');
          }}
          onCancel={() => {
            router.push('/jobs');
          }}
        />
      </div>
    </div>
  );
}


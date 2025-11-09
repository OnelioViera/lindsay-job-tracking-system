'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { JobsTable } from '@/components/jobs/JobsTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function JobsPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const isAdmin = (session?.user as any)?.role === 'Admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Jobs</h1>
          <p className="text-slate-600 mt-1">
            Manage and track all your precast concrete jobs
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => router.push('/jobs/new')}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Plus className="h-4 w-4" />
            New Job
          </Button>
        )}
      </div>

      {/* Jobs Table */}
      <Card className="border-slate-200">
        <div className="p-6">
          <JobsTable session={session} />
        </div>
      </Card>
    </div>
  );
}


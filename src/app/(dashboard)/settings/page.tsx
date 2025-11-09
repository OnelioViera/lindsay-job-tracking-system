'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Settings, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const isAdmin = (session?.user as any)?.role === 'Admin';

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <Card className="border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
            <p className="text-slate-700">
              Only administrators can access settings. Contact your admin for support.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage system settings and team members</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Managers Management */}
        <Card className="border-slate-200 p-6 hover:shadow-lg transition cursor-pointer" onClick={() => router.push('/settings/project-managers')}>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1">Project Managers</h3>
              <p className="text-sm text-slate-600 mb-4">
                Add, edit, and manage project managers in your system
              </p>
              <Button variant="outline" size="sm">
                Manage PMs
              </Button>
            </div>
          </div>
        </Card>

        {/* More Settings Coming */}
        <Card className="border-slate-200 p-6 opacity-50">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-100 rounded-lg">
              <Settings className="h-6 w-6 text-slate-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1">More Settings</h3>
              <p className="text-sm text-slate-600 mb-4">
                Additional settings coming soon
              </p>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


'use client';

import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Bell, Globe, Shield, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();

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
        <p className="text-slate-600 mt-1">Configure system preferences and appearance</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme & Colors */}
        <Card className="border-slate-200 p-6 hover:shadow-lg transition cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Palette className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1">Theme & Colors</h3>
              <p className="text-sm text-slate-600 mb-4">
                Customize the appearance and color scheme of your dashboard
              </p>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="border-slate-200 p-6 hover:shadow-lg transition cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1">Notifications</h3>
              <p className="text-sm text-slate-600 mb-4">
                Manage notification preferences and alert settings
              </p>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </Card>

        {/* Regional Settings */}
        <Card className="border-slate-200 p-6 hover:shadow-lg transition cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Globe className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1">Regional Settings</h3>
              <p className="text-sm text-slate-600 mb-4">
                Configure language, timezone, and date format preferences
              </p>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="border-slate-200 p-6 hover:shadow-lg transition cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1">Security</h3>
              <p className="text-sm text-slate-600 mb-4">
                Manage security settings, password policies, and access controls
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

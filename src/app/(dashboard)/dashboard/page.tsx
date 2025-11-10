'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { JobsTable } from '@/components/jobs/JobsTable';
import { Briefcase, Users, ShoppingCart, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    activeJobs: 0,
    inProduction: 0,
    customers: 0,
    thisMonth: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const isAdmin = (session?.user as any)?.role === 'Admin';
  const isPM = (session?.user as any)?.role === 'Project Manager';

  // Fetch dashboard statistics
  useEffect(() => {
    // Only fetch if session is available with user data
    if (!session?.user) {
      console.log('[Dashboard Component] No session/user available yet, skipping stats fetch');
      return;
    }

    console.log('[Dashboard Component] useEffect running, session email:', session?.user?.email, 'role:', (session?.user as any)?.role, 'id:', (session?.user as any)?.id);
    
    const fetchStats = async (showLoading = true) => {
      if (showLoading) {
        setLoadingStats(true);
      }
      try {
        console.log('[Dashboard Component] About to fetch /api/dashboard/stats for', (session?.user as any)?.role);
        const response = await fetch('/api/dashboard/stats');
        
        if (!response.ok) {
          console.error('[Dashboard Component] Stats API returned error:', response.status, response.statusText);
          return;
        }
        
        const data = await response.json();

        console.log('[Dashboard Component] Fetch completed, response:', data);

        if (data.success && data.data) {
          console.log('[Dashboard Component] Setting stats:', data.data);
          setStats(data.data);
        } else {
          console.warn('[Dashboard Component] Unexpected response format:', data);
        }
      } catch (error) {
        console.error('[Dashboard Component] Fetch error:', error);
      } finally {
        if (showLoading) {
          setLoadingStats(false);
        }
      }
    };

    // Fetch when session becomes available
    fetchStats();

    // Auto-refresh stats every 15 seconds (without showing loading state)
    const interval = setInterval(() => {
      console.log('[Dashboard Component] Auto-refreshing stats...');
      fetchStats(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [session]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">
          {isAdmin 
            ? 'Overview of jobs, customers, and system activity'
            : 'Your jobs, customers, and activity overview'
          }
        </p>
      </div>

      {/* Stats Cards - Dynamic for Admin vs PM */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 - Active Jobs / Your Jobs */}
        <Card className="p-6 border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">
                {isAdmin ? 'Active Jobs' : 'Your Active Jobs'}
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {loadingStats ? '...' : stats.activeJobs}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {isAdmin ? 'Total active' : 'Assigned to you'}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Card 2 - Customers / Associated Customers */}
        <Card className="p-6 border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">
                {isAdmin ? 'Total Customers' : 'Associated Customers'}
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {loadingStats ? '...' : stats.customers}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {isAdmin ? 'All customers' : 'From your jobs'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        {/* Card 3 - In Production */}
        <Card className="p-6 border-slate-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">
                In Production
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {loadingStats ? '...' : stats.inProduction}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {isAdmin ? 'Total' : 'Your jobs'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Card 4 - This Month (Admin only) */}
        {isAdmin && (
          <Card className="p-6 border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">
                  This Month
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  ${loadingStats ? '...' : stats.thisMonth}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Total revenue
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Recent Jobs / Your Jobs */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          {isAdmin ? 'Recent Jobs' : 'Your Jobs'}
        </h2>
        <Card className="border-slate-200">
          <div className="p-6">
            <JobsTable session={session} />
          </div>
        </Card>
      </div>
    </div>
  );
}


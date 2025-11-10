'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Briefcase, Users, ShoppingCart, Settings, Calculator } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAdmin = (session?.user as any)?.role === 'Admin';
  const isEstimator = (session?.user as any)?.role === 'Estimator';
  const isPM = (session?.user as any)?.role === 'Project Manager';

  const links = [
    {
      href: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    // Show Estimations tab for Estimators and Admins
    ...((isEstimator || isAdmin) ? [
      {
        href: '/estimates',
        label: 'Estimations',
        icon: Calculator,
      },
    ] : []),
    // Only show Jobs tab for admins and PMs
    ...((isAdmin || isPM) ? [
      {
        href: '/jobs',
        label: 'Jobs',
        icon: Briefcase,
      },
    ] : []),
    {
      href: '/customers',
      label: 'Customers',
      icon: Users,
    },
    // Only show Users tab for admins
    ...(isAdmin ? [
      {
        href: '/users',
        label: 'Users',
        icon: Users,
      },
    ] : []),
    {
      href: '/inventory',
      label: 'Inventory',
      icon: ShoppingCart,
    },
    // Only show Settings tab for admins
    ...(isAdmin ? [
      {
        href: '/settings',
        label: 'Settings',
        icon: Settings,
      },
    ] : []),
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white">Lindsay Precast</h1>
        <p className="text-xs text-slate-400 mt-1">Job Tracking System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-slate-500">© 2025 Lindsay Precast</p>
      </div>
    </aside>
  );
}


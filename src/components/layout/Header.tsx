'use client';

import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User } from 'lucide-react';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';

export function Header() {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
      {/* Left side - User Role */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          {(session?.user as any)?.role || 'User'}
        </h2>
      </div>

      {/* Right side - User Menu */}
      <div className="flex items-center gap-4">
        {session?.user && (
          <>
            <NotificationPanel />
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full bg-slate-200 text-slate-900 hover:bg-slate-300"
              >
                <span className="flex items-center justify-center w-full h-full text-sm font-medium">
                  {session.user.name?.charAt(0).toUpperCase()}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col space-y-1 normal-font">
                <p className="text-sm font-medium text-slate-900">
                  {session.user.name}
                </p>
                <p className="text-xs text-slate-500">
                  {session.user.email}
                </p>
                <p className="text-xs font-semibold text-blue-600 mt-2">
                  Role: {(session.user as any).role}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </header>
  );
}


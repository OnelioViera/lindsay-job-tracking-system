'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Users, BarChart3, Zap } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // Show nothing while checking authentication status
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="px-6 py-4 border-b border-slate-700">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold">
              LP
            </div>
            <h1 className="text-xl font-bold">Lindsay Precast</h1>
          </div>
          <Button
            onClick={() => router.push('/login')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Streamline Your{' '}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Job Tracking
            </span>
          </h2>
          <p className="text-xl text-slate-400 mb-8 leading-relaxed">
            Manage precast concrete jobs from estimation through delivery. Track progress, coordinate teams, and keep projects on schedule.
          </p>
          <Button
            onClick={() => router.push('/login')}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Sign In
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-16">Why Choose Lindsay Precast Tracking System</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-lg border border-slate-700 bg-slate-800/30 hover:border-slate-600 transition">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold mb-3">Real-Time Tracking</h4>
              <p className="text-slate-400">
                Monitor job status, progress, and timelines in real-time with an intuitive dashboard.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-lg border border-slate-700 bg-slate-800/30 hover:border-slate-600 transition">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold mb-3">Team Collaboration</h4>
              <p className="text-slate-400">
                Assign roles to team members and coordinate tasks across your organization.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-lg border border-slate-700 bg-slate-800/30 hover:border-slate-600 transition">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold mb-3">Streamlined Workflow</h4>
              <p className="text-slate-400">
                From estimation to production, manage every phase of your precast projects efficiently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-blue-600/20 to-blue-700/20 border border-blue-500/50 rounded-lg p-12">
          <CheckCircle className="h-12 w-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-slate-300 mb-8">
            Your admin has already set up your account. Sign in to access the job tracking system.
          </p>
          <Button
            onClick={() => router.push('/login')}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Sign In Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-slate-700">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-slate-400 text-sm">
          <p>© 2025 Lindsay Precast. All rights reserved.</p>
          <p>Professional Job Tracking for Precast Concrete Manufacturers</p>
        </div>
      </footer>
    </div>
  );
}

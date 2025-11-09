'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Job {
  _id: string;
  jobNumber: string;
  jobName: string;
  customerId: any;
  status: string;
  priority: string;
  estimatorId?: any;
  drafterId?: any;
  projectManagerId?: any;
  createdDate: string;
}

const statusColors: Record<string, string> = {
  Estimation: 'bg-blue-100 text-blue-800',
  Drafting: 'bg-purple-100 text-purple-800',
  'PM Review': 'bg-yellow-100 text-yellow-800',
  Submitted: 'bg-orange-100 text-orange-800',
  'Under Revision': 'bg-red-100 text-red-800',
  Accepted: 'bg-green-100 text-green-800',
  'In Production': 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-emerald-100 text-emerald-800',
};

const priorityColors: Record<string, string> = {
  low: 'bg-slate-100 text-slate-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

interface JobsTableProps {
  session?: Session | null;
}

export function JobsTable({ session }: JobsTableProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: freshSession } = useSession();

  // Get user role and ID from session - prefer freshSession
  const userRole = (freshSession?.user as any)?.role || (session?.user as any)?.role;
  const userId = (freshSession?.user as any)?.id || (session?.user as any)?.id;
  const isAdmin = userRole === 'Admin';

  // Fetch jobs when filters change
  useEffect(() => {
    fetchJobs();
  }, [statusFilter, priorityFilter, userRole, userId]);

  // Auto-refresh jobs every 15 seconds (without showing loading spinner)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('[JobsTable] Auto-refreshing jobs...');
      fetchJobs(false); // Don't show loading spinner on auto-refresh
    }, 15000);
    return () => clearInterval(interval);
  }, [statusFilter, priorityFilter, userRole, userId]);

  const fetchJobs = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);

      // For Project Managers, only show jobs assigned to them
      if (userRole === 'Project Manager') {
        params.append('projectManagerId', userId);
      }

      const response = await fetch(`/api/jobs?${params}`);
      const data = await response.json();

      if (data.success) {
        console.log(`[JobsTable] Fetched ${data.data.length} jobs`);
        setJobs(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.jobName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (job: Job) => {
    toast.warning(`Delete job "${job.jobName}" (${job.jobNumber})?`, {
      description: 'This action cannot be undone.',
      action: {
        label: 'Delete',
        onClick: async () => {
          setIsDeleting(true);
          const deletePromise = fetch(`/api/jobs/${job._id}`, {
            method: 'DELETE',
          }).then(async (response) => {
            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || 'Failed to delete job');
            }
            // Remove job from list
            setJobs(jobs.filter(j => j._id !== job._id));
            return response;
          }).finally(() => {
            setIsDeleting(false);
          });

          toast.promise(deletePromise, {
            loading: 'Deleting job...',
            success: 'Job deleted successfully',
            error: (err) => err.message || 'Failed to delete job',
          });
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by job name or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Status
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Estimation">Estimation</SelectItem>
              <SelectItem value="Drafting">Drafting</SelectItem>
              <SelectItem value="PM Review">PM Review</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="Under Revision">Under Revision</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="In Production">In Production</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Priority
          </label>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => fetchJobs(true)} disabled={isLoading}>
          <Filter className="h-4 w-4 mr-2" />
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100">
              <TableHead className="font-semibold text-slate-900">
                Job #
              </TableHead>
              <TableHead className="font-semibold text-slate-900">
                Job Name
              </TableHead>
              <TableHead className="font-semibold text-slate-900">
                Customer
              </TableHead>
              <TableHead className="font-semibold text-slate-900">
                Status
              </TableHead>
              <TableHead className="font-semibold text-slate-900">
                Priority
              </TableHead>
              <TableHead className="font-semibold text-slate-900">
                Created
              </TableHead>
              <TableHead className="font-semibold text-slate-900">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-slate-500">
                    {isLoading ? 'Loading jobs...' : 'No jobs found'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredJobs.map((job) => (
                <TableRow key={job._id} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-sm font-semibold">
                    {job.jobNumber}
                  </TableCell>
                  <TableCell className="font-medium">{job.jobName}</TableCell>
                  <TableCell>
                    {job.customerId?.companyName || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[job.status]}>
                      {job.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={priorityColors[job.priority]}>
                      {job.priority.charAt(0).toUpperCase() +
                        job.priority.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(job.createdDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/jobs/${job._id}`)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      {isAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/jobs/${job._id}/edit`)}
                            className="gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(job)}
                            disabled={isDeleting}
                            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Stats */}
      <div className="text-sm text-slate-600 mt-4">
        Showing {filteredJobs.length} of {jobs.length} jobs
      </div>
    </div>
  );
}




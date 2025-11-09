'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, AlertCircle, Check, Users as UsersIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  Admin: 'Full system access, manage users and all features',
  'Project Manager': 'Manage assigned jobs and team coordination',
  Estimator: 'Create job estimates and initial assessments',
  Drafter: 'Create technical drawings and specifications',
  Production: 'Manage production workflows and inventory',
  'Inventory Manager': 'Track and manage inventory levels',
  Viewer: 'View-only access to reports and dashboards',
};

const ROLE_COLORS: Record<string, string> = {
  Admin: 'bg-purple-100 text-purple-800',
  'Project Manager': 'bg-blue-100 text-blue-800',
  Estimator: 'bg-green-100 text-green-800',
  Drafter: 'bg-indigo-100 text-indigo-800',
  Production: 'bg-orange-100 text-orange-800',
  'Inventory Manager': 'bg-yellow-100 text-yellow-800',
  Viewer: 'bg-slate-100 text-slate-800',
};

const ROLES = [
  'Admin',
  'Project Manager',
  'Estimator',
  'Drafter',
  'Production',
  'Inventory Manager',
  'Viewer',
];

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('Project Manager');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Project Manager',
  });

  const isAdmin = (session?.user as any)?.role === 'Admin';

  useEffect(() => {
    if (isAdmin) {
      fetchAllUsers();
    }
  }, [isAdmin]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      // Fetch all users including inactive ones for admin management
      const response = await fetch('/api/users?includeInactive=true');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('All fields are required');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create user');
      }

      const newUser = await response.json();
      setUsers([...users, newUser.data]);
      setFormData({ name: '', email: '', password: '', role: 'Project Manager' });
      setShowForm(false);
      setSuccess('User created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and email are required');
      return;
    }

    try {
      const updateBody: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (formData.password.trim()) {
        updateBody.password = formData.password;
      }

      const response = await fetch(`/api/users/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateBody),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user');
      }

      const updatedUser = await response.json();
      setUsers(users.map((u) => (u._id === editingId ? updatedUser.data : u)));
      setFormData({ name: '', email: '', password: '', role: 'Project Manager' });
      setEditingId(null);
      setSuccess('User updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    }
  };

  const startEdit = (user: User) => {
    setEditingId(user._id);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setShowForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', role: 'Project Manager' });
  };

  const handleToggleActive = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map((u) => (u._id === user._id ? updatedUser.data : u)));
        setSuccess(`User ${!user.isActive ? 'activated' : 'deactivated'}`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Users</h1>
        <Card className="border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
            <p className="text-slate-700">
              Only administrators can manage users. Contact your admin for support.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-600 mt-1">
            Manage system users, assign roles, and control access
          </p>
        </div>
        {!showForm && !editingId && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {(showForm || editingId) && (
        <Card className="border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {editingId ? 'Edit User' : 'Add New User'}
          </h2>

          <form
            onSubmit={editingId ? handleEditUser : handleAddUser}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name" className="mb-2 block">
                Full Name *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., John Smith"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="email" className="mb-2 block">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., john@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="mb-2 block">
                Password {editingId ? '(leave blank to keep current)' : '*'}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={editingId ? 'Leave blank to keep current password' : 'Enter password'}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!editingId}
              />
            </div>

            <div>
              <Label htmlFor="role" className="mb-2 block">
                Role & Permissions *
              </Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-600 mt-2">
                {ROLE_DESCRIPTIONS[formData.role]}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  cancelEdit();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingId ? 'Update' : 'Add'} User
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Users List */}
      {loading ? (
        <div className="text-center py-8 text-slate-600">Loading users...</div>
      ) : users.length === 0 ? (
        <Card className="border-slate-200 p-12 text-center">
          <UsersIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">No users yet</p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add First User
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user._id} className="border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900">{user.name}</h3>
                    <Badge
                      className={`${ROLE_COLORS[user.role] || 'bg-slate-100 text-slate-800'}`}
                    >
                      {user.role}
                    </Badge>
                    <Badge
                      className={
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-800'
                      }
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">{user.email}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {ROLE_DESCRIPTIONS[user.role]}
                  </p>
                  {user.createdAt && (
                    <p className="text-xs text-slate-500 mt-2">
                      Added {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(user)}
                    className="gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant={user.isActive ? 'outline' : 'default'}
                    onClick={() => handleToggleActive(user)}
                    className={user.isActive ? '' : 'bg-green-600 hover:bg-green-700'}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, X, Check, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ProjectManager {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
}

export default function ProjectManagersPage() {
  const [projectManagers, setProjectManagers] = useState<ProjectManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    fetchProjectManagers();
  }, []);

  const fetchProjectManagers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users?role=Project Manager&includeInactive=true');
      if (response.ok) {
        const data = await response.json();
        setProjectManagers(data);
      }
    } catch (err) {
      console.error('Failed to fetch project managers:', err);
      setError('Failed to load project managers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPM = async (e: React.FormEvent) => {
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
          role: 'Project Manager',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create project manager');
      }

      const newPM = await response.json();
      setProjectManagers([...projectManagers, newPM.data]);
      setFormData({ name: '', email: '', password: '' });
      setShowForm(false);
      setSuccess('Project Manager created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project manager');
    }
  };

  const handleEditPM = async (e: React.FormEvent) => {
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
      };

      // Only include password if it was provided (changed)
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
        throw new Error(data.error || 'Failed to update project manager');
      }

      const updatedPM = await response.json();
      setProjectManagers(
        projectManagers.map((pm) => (pm._id === editingId ? updatedPM.data : pm))
      );
      setFormData({ name: '', email: '', password: '' });
      setEditingId(null);
      setSuccess('Project Manager updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project manager');
    }
  };

  const startEdit = (pm: ProjectManager) => {
    setEditingId(pm._id);
    setFormData({
      name: pm.name,
      email: pm.email,
      password: '',
    });
    setShowForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', password: '' });
  };

  const handleToggleActive = async (pm: ProjectManager) => {
    try {
      const response = await fetch(`/api/users/${pm._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !pm.isActive }),
      });

      if (response.ok) {
        const updatedPM = await response.json();
        setProjectManagers(
          projectManagers.map((p) => (p._id === pm._id ? updatedPM.data : p))
        );
        setSuccess(`Project Manager ${!pm.isActive ? 'activated' : 'deactivated'}`);
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to update project manager status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Project Managers</h1>
          <p className="text-slate-600 mt-1">Add and manage project managers</p>
        </div>
        {!showForm && !editingId && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Project Manager
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
            {editingId ? 'Edit Project Manager' : 'Add New Project Manager'}
          </h2>

          <form
            onSubmit={editingId ? handleEditPM : handleAddPM}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name" className="mb-2 block">
                Full Name *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Mike Johnson"
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
                placeholder="e.g., mike@example.com"
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
                {editingId ? 'Update' : 'Add'} Project Manager
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Project Managers List */}
      {loading ? (
        <div className="text-center py-8 text-slate-600">Loading project managers...</div>
      ) : projectManagers.length === 0 ? (
        <Card className="border-slate-200 p-12 text-center">
          <p className="text-slate-600 mb-4">No project managers yet</p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add First Project Manager
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projectManagers.map((pm) => (
            <Card key={pm._id} className="border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{pm.name}</h3>
                      <p className="text-sm text-slate-600">{pm.email}</p>
                    </div>
                  </div>
                  {pm.createdAt && (
                    <p className="text-xs text-slate-500 mt-2">
                      Added {format(new Date(pm.createdAt), 'MMM dd, yyyy')}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    className={
                      pm.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-800'
                    }
                  >
                    {pm.isActive ? 'Active' : 'Inactive'}
                  </Badge>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(pm)}
                    className="gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant={pm.isActive ? 'outline' : 'default'}
                    onClick={() => handleToggleActive(pm)}
                    className={pm.isActive ? '' : 'bg-green-600 hover:bg-green-700'}
                  >
                    {pm.isActive ? 'Deactivate' : 'Activate'}
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


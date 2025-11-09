import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, Download, Upload, ChevronDown, ChevronRight, MoreVertical, Edit, Trash2, Eye, CheckCircle2, Clock, AlertCircle, Package, Truck, FileText, Users } from 'lucide-react';

// Mock data for demonstration
const mockJobs = [
  {
    id: 1,
    jobNumber: 'LP-2024-001',
    jobName: '72" Wet Well - Downtown Project',
    customer: 'City Public Works',
    status: 'In Production',
    phase: 'production',
    estimator: 'John Smith',
    drafter: 'Maria Garcia',
    pm: 'Robert Johnson',
    priority: 'high',
    createdDate: '2024-10-15',
    targetDelivery: '2024-11-20',
    estimatedCost: 45000,
    quotedPrice: 58500
  },
  {
    id: 2,
    jobNumber: 'LP-2024-002',
    jobName: 'Sanitary Manhole Series',
    customer: 'Metro Construction',
    status: 'Drafting',
    phase: 'drafting',
    estimator: 'Sarah Chen',
    drafter: 'David Lee',
    pm: 'Robert Johnson',
    priority: 'medium',
    createdDate: '2024-10-20',
    targetDelivery: '2024-12-01',
    estimatedCost: 32000,
    quotedPrice: 41600
  },
  {
    id: 3,
    jobNumber: 'LP-2024-003',
    jobName: 'Air Vacuum Vault - Highway 25',
    customer: 'State DOT',
    status: 'Submitted',
    phase: 'submitted',
    estimator: 'John Smith',
    drafter: 'Maria Garcia',
    pm: 'Lisa Anderson',
    priority: 'urgent',
    createdDate: '2024-10-25',
    targetDelivery: '2024-11-15',
    estimatedCost: 28000,
    quotedPrice: 36400
  },
  {
    id: 4,
    jobNumber: 'LP-2024-004',
    jobName: 'Box Space Manholes - Commercial',
    customer: 'BuildRight Inc',
    status: 'Estimation',
    phase: 'estimation',
    estimator: 'Sarah Chen',
    drafter: null,
    pm: null,
    priority: 'low',
    createdDate: '2024-10-28',
    targetDelivery: '2024-12-15',
    estimatedCost: 18500,
    quotedPrice: 24050
  },
  {
    id: 5,
    jobNumber: 'LP-2024-005',
    jobName: 'Miter Pit Assembly',
    customer: 'City Public Works',
    status: 'Delivered',
    phase: 'delivered',
    estimator: 'John Smith',
    drafter: 'David Lee',
    pm: 'Robert Johnson',
    priority: 'medium',
    createdDate: '2024-09-15',
    targetDelivery: '2024-10-30',
    estimatedCost: 22000,
    quotedPrice: 28600
  },
];

const mockInventory = [
  { id: 1, name: 'Rebar #5', category: 'Rebar', currentStock: 2500, unit: 'linear feet', reorderLevel: 1000, status: 'good' },
  { id: 2, name: 'Access Lids 24"', category: 'Lids', currentStock: 45, unit: 'pieces', reorderLevel: 50, status: 'low' },
  { id: 3, name: 'Hatches - Heavy Duty', category: 'Hatches', currentStock: 18, unit: 'pieces', reorderLevel: 25, status: 'critical' },
  { id: 4, name: 'Concrete Mix Type II', category: 'Concrete', currentStock: 850, unit: 'cubic yards', reorderLevel: 500, status: 'good' },
];

const App = () => {
  const [activeView, setActiveView] = useState('jobs');
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPhase, setFilterPhase] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [editingCell, setEditingCell] = useState(null);

  const phaseColors = {
    estimation: 'bg-blue-100 text-blue-800 border-blue-200',
    drafting: 'bg-purple-100 text-purple-800 border-purple-200',
    pm_review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    submitted: 'bg-orange-100 text-orange-800 border-orange-200',
    revision: 'bg-red-100 text-red-800 border-red-200',
    accepted: 'bg-green-100 text-green-800 border-green-200',
    production: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    delivered: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const priorityColors = {
    low: 'bg-slate-100 text-slate-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };

  const filteredJobs = useMemo(() => {
    return mockJobs.filter(job => {
      const matchesSearch = job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.jobName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.customer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPhase = filterPhase === 'all' || job.phase === filterPhase;
      const matchesPriority = filterPriority === 'all' || job.priority === filterPriority;
      return matchesSearch && matchesPhase && matchesPriority;
    });
  }, [searchTerm, filterPhase, filterPriority]);

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const statsCards = [
    { label: 'Active Jobs', value: '12', icon: FileText, color: 'bg-blue-500' },
    { label: 'In Production', value: '4', icon: Package, color: 'bg-indigo-500' },
    { label: 'Pending Delivery', value: '3', icon: Truck, color: 'bg-orange-500' },
    { label: 'Overdue', value: '1', icon: AlertCircle, color: 'bg-red-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Lindsay Precast</h1>
                  <p className="text-xs text-slate-500">Job Tracking System</p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-1 ml-8">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === 'dashboard' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveView('jobs')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === 'jobs' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Jobs
                </button>
                <button
                  onClick={() => setActiveView('inventory')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === 'inventory' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Inventory
                </button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">
                  Reports
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-slate-100 rounded-lg px-3 py-2">
                <Users className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Admin User</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {activeView === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Dashboard Overview</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {statsCards.map((stat, idx) => (
                <div key={idx} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
                  </div>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Phase Pipeline */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Job Pipeline</h3>
              <div className="grid grid-cols-8 gap-2">
                {['Estimation', 'Drafting', 'PM Review', 'Submitted', 'Revision', 'Accepted', 'Production', 'Delivered'].map((phase, idx) => (
                  <div key={idx} className="text-center">
                    <div className={`${Object.values(phaseColors)[idx]} rounded-lg p-4 mb-2 border`}>
                      <div className="text-2xl font-bold">{idx + 1}</div>
                    </div>
                    <p className="text-xs text-slate-600">{phase}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { action: 'Job LP-2024-003 submitted to customer', user: 'Lisa Anderson', time: '2 hours ago', color: 'text-orange-600' },
                  { action: 'Drawing revision completed for LP-2024-001', user: 'Maria Garcia', time: '4 hours ago', color: 'text-purple-600' },
                  { action: 'New job LP-2024-006 created', user: 'John Smith', time: '5 hours ago', color: 'text-blue-600' },
                  { action: 'Inventory alert: Access Lids low stock', user: 'System', time: '6 hours ago', color: 'text-red-600' },
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-start space-x-3 pb-3 border-b border-slate-100 last:border-0">
                    <div className="w-2 h-2 mt-2 rounded-full bg-indigo-600"></div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${activity.color}`}>{activity.action}</p>
                      <p className="text-xs text-slate-500">{activity.user} · {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'jobs' && (
          <div>
            {/* Toolbar */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search jobs, customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterPhase}
                    onChange={(e) => setFilterPhase(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Phases</option>
                    <option value="estimation">Estimation</option>
                    <option value="drafting">Drafting</option>
                    <option value="submitted">Submitted</option>
                    <option value="production">Production</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Export</span>
                  </button>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">New Job</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Jobs Table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="w-10 px-4 py-3"></th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Job #</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Job Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Estimator</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">PM</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Priority</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Target Delivery</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Quote</th>
                      <th className="w-10 px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredJobs.map((job) => (
                      <React.Fragment key={job.id}>
                        <tr className="hover:bg-slate-50 transition-colors cursor-pointer">
                          <td className="px-4 py-3">
                            <button onClick={() => toggleRow(job.id)} className="text-slate-400 hover:text-slate-600">
                              {expandedRows.has(job.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                            {job.jobNumber}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                            {job.jobName}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700">
                            {job.customer}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${phaseColors[job.phase]}`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700">
                            {job.estimator}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700">
                            {job.pm || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${priorityColors[job.priority]}`}>
                              {job.priority.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700">
                            {job.targetDelivery}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900">
                            ${job.quotedPrice.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <button className="text-slate-400 hover:text-slate-600">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                        
                        {expandedRows.has(job.id) && (
                          <tr className="bg-slate-50">
                            <td colSpan="11" className="px-4 py-4">
                              <div className="grid grid-cols-3 gap-6">
                                <div>
                                  <h4 className="text-xs font-semibold text-slate-700 uppercase mb-2">Personnel</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="text-slate-500">Estimator:</span> {job.estimator}</p>
                                    <p><span className="text-slate-500">Drafter:</span> {job.drafter || 'Not assigned'}</p>
                                    <p><span className="text-slate-500">PM:</span> {job.pm || 'Not assigned'}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-xs font-semibold text-slate-700 uppercase mb-2">Dates</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="text-slate-500">Created:</span> {job.createdDate}</p>
                                    <p><span className="text-slate-500">Target Delivery:</span> {job.targetDelivery}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-xs font-semibold text-slate-700 uppercase mb-2">Cost</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="text-slate-500">Estimated Cost:</span> ${job.estimatedCost.toLocaleString()}</p>
                                    <p><span className="text-slate-500">Quoted Price:</span> ${job.quotedPrice.toLocaleString()}</p>
                                    <p><span className="text-slate-500">Margin:</span> {(((job.quotedPrice - job.estimatedCost) / job.estimatedCost) * 100).toFixed(1)}%</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-4">
                                <button className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 flex items-center space-x-1">
                                  <Eye className="w-3 h-3" />
                                  <span>View Details</span>
                                </button>
                                <button className="px-3 py-1.5 border border-slate-300 rounded text-sm hover:bg-slate-50 flex items-center space-x-1">
                                  <Edit className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {filteredJobs.length} of {mockJobs.length} jobs
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 border border-slate-300 rounded text-sm hover:bg-slate-50">Previous</button>
                <button className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">1</button>
                <button className="px-3 py-1.5 border border-slate-300 rounded text-sm hover:bg-slate-50">2</button>
                <button className="px-3 py-1.5 border border-slate-300 rounded text-sm hover:bg-slate-50">Next</button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'inventory' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Inventory Management</h2>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Add Item</span>
              </button>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Item Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Current Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Reorder Level</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {mockInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {item.category}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                          {item.currentStock.toLocaleString()} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {item.reorderLevel.toLocaleString()} {item.unit}
                        </td>
                        <td className="px-4 py-3">
                          {item.status === 'good' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Good Stock
                            </span>
                          )}
                          {item.status === 'low' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Low Stock
                            </span>
                          )}
                          {item.status === 'critical' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Critical
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="px-3 py-1.5 border border-slate-300 rounded text-sm hover:bg-slate-50">
                              Adjust
                            </button>
                            <button className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">
                              Reorder
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

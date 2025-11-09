/**
 * Role-based permission system for the application
 */

export type UserRole = 
  | 'Admin' 
  | 'Estimator' 
  | 'Drafter' 
  | 'Project Manager' 
  | 'Production' 
  | 'Inventory Manager' 
  | 'Viewer';

export interface Permission {
  canViewDashboard: boolean;
  canManageUsers: boolean;
  canCreateJobs: boolean;
  canEditJobs: boolean;
  canDeleteJobs: boolean;
  canCreateEstimates: boolean;
  canApproveEstimates: boolean;
  canUploadDrawings: boolean;
  canApproveDrawings: boolean;
  canCreateSubmittals: boolean;
  canManageProduction: boolean;
  canManageDelivery: boolean;
  canManageInventory: boolean;
  canViewReports: boolean;
  canExportData: boolean;
}

// Define permissions for each role
const rolePermissions: Record<UserRole, Permission> = {
  Admin: {
    canViewDashboard: true,
    canManageUsers: true,
    canCreateJobs: true,
    canEditJobs: true,
    canDeleteJobs: true,
    canCreateEstimates: true,
    canApproveEstimates: true,
    canUploadDrawings: true,
    canApproveDrawings: true,
    canCreateSubmittals: true,
    canManageProduction: true,
    canManageDelivery: true,
    canManageInventory: true,
    canViewReports: true,
    canExportData: true,
  },
  Estimator: {
    canViewDashboard: true,
    canManageUsers: false,
    canCreateJobs: false,
    canEditJobs: false,
    canDeleteJobs: false,
    canCreateEstimates: true,
    canApproveEstimates: false,
    canUploadDrawings: false,
    canApproveDrawings: false,
    canCreateSubmittals: false,
    canManageProduction: false,
    canManageDelivery: false,
    canManageInventory: false,
    canViewReports: true,
    canExportData: false,
  },
  Drafter: {
    canViewDashboard: true,
    canManageUsers: false,
    canCreateJobs: false,
    canEditJobs: false,
    canDeleteJobs: false,
    canCreateEstimates: false,
    canApproveEstimates: false,
    canUploadDrawings: true,
    canApproveDrawings: false,
    canCreateSubmittals: false,
    canManageProduction: false,
    canManageDelivery: false,
    canManageInventory: false,
    canViewReports: true,
    canExportData: false,
  },
  'Project Manager': {
    canViewDashboard: true,
    canManageUsers: false,
    canCreateJobs: true,
    canEditJobs: true,
    canDeleteJobs: false,
    canCreateEstimates: false,
    canApproveEstimates: true,
    canUploadDrawings: false,
    canApproveDrawings: true,
    canCreateSubmittals: true,
    canManageProduction: false,
    canManageDelivery: false,
    canManageInventory: false,
    canViewReports: true,
    canExportData: true,
  },
  Production: {
    canViewDashboard: true,
    canManageUsers: false,
    canCreateJobs: false,
    canEditJobs: false,
    canDeleteJobs: false,
    canCreateEstimates: false,
    canApproveEstimates: false,
    canUploadDrawings: false,
    canApproveDrawings: false,
    canCreateSubmittals: false,
    canManageProduction: true,
    canManageDelivery: true,
    canManageInventory: false,
    canViewReports: true,
    canExportData: false,
  },
  'Inventory Manager': {
    canViewDashboard: true,
    canManageUsers: false,
    canCreateJobs: false,
    canEditJobs: false,
    canDeleteJobs: false,
    canCreateEstimates: false,
    canApproveEstimates: false,
    canUploadDrawings: false,
    canApproveDrawings: false,
    canCreateSubmittals: false,
    canManageProduction: false,
    canManageDelivery: false,
    canManageInventory: true,
    canViewReports: true,
    canExportData: true,
  },
  Viewer: {
    canViewDashboard: true,
    canManageUsers: false,
    canCreateJobs: false,
    canEditJobs: false,
    canDeleteJobs: false,
    canCreateEstimates: false,
    canApproveEstimates: false,
    canUploadDrawings: false,
    canApproveDrawings: false,
    canCreateSubmittals: false,
    canManageProduction: false,
    canManageDelivery: false,
    canManageInventory: false,
    canViewReports: true,
    canExportData: false,
  },
};

/**
 * Get permissions for a given role
 */
export function getPermissions(role: UserRole): Permission {
  return rolePermissions[role];
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: keyof Permission): boolean {
  return rolePermissions[role][permission];
}

/**
 * Check if multiple permissions exist for a role
 */
export function hasPermissions(role: UserRole, permissions: (keyof Permission)[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Check if a role has any of the given permissions
 */
export function hasAnyPermission(role: UserRole, permissions: (keyof Permission)[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}


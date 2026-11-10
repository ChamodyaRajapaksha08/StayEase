import React from 'react';
import { useAuth } from '../context/AuthContext';
import { SuperAdminDashboard } from '../components/dashboard/SuperAdminDashboard';
import { OwnerDashboard } from '../components/dashboard/OwnerDashboard';
import { ManagerDashboard } from '../components/dashboard/ManagerDashboard';
import { TenantDashboard } from '../components/dashboard/TenantDashboard';

export const DashboardPage = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'SUPER_ADMIN':
      return <SuperAdminDashboard />;
    case 'OWNER':
      return <OwnerDashboard />;
    case 'MANAGER':
      return <ManagerDashboard />;
    case 'TENANT':
      return <TenantDashboard />;
    default:
      return <div>Access restricted or role undefined.</div>;
  }
};

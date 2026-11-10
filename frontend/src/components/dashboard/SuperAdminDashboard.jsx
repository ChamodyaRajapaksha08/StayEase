import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../services/api';
import { StatCard } from '../common/StatCard';
import { Users, Building, ShieldCheck, DollarSign, Activity, UserPlus } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#176B55', '#2563EB', '#F59E0B', '#10B981'];

export const SuperAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardApi.getSuperAdmin();
        setData(res.data);
      } catch (err) {
        console.error("Failed to load SuperAdmin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-main">Super Administrator Platform Control</h1>
        <p className="text-xs text-muted mt-1">Platform-wide multi-property oversight and active analytics.</p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Owners"
          value={data?.totalOwners || 0}
          subtitle="Registered Property Owners"
          icon={ShieldCheck}
          color="primary"
        />
        <StatCard
          title="Total Properties"
          value={data?.totalProperties || 0}
          subtitle={`${data?.totalActiveProperties || 0} Active Properties`}
          icon={Building}
          color="success"
        />
        <StatCard
          title="Registered Users"
          value={data?.totalRegisteredUsers || 0}
          subtitle={`${data?.totalTenants || 0} Tenants, ${data?.totalManagers || 0} Managers`}
          icon={Users}
          color="info"
        />
        <StatCard
          title="Platform Revenue"
          value={`$${Number(data?.platformRevenue || 0).toLocaleString()}`}
          subtitle="Total Collected Payments"
          icon={DollarSign}
          color="warning"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Distribution Chart */}
        <div className="bg-surface p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <h3 className="text-sm font-semibold text-main mb-1">User Role Distribution</h3>
          <p className="text-xs text-muted mb-4">Breakdown of accounts across StayEase platform</p>
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.userDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(data?.userDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Trends */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <h3 className="text-sm font-semibold text-main mb-1">Platform Expansion Trends</h3>
          <p className="text-xs text-muted mb-4">Monthly registered properties and users</p>
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthlyRegistrationTrends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" name="New Users" fill="#176B55" radius={[4, 4, 0, 0]} />
                <Bar dataKey="properties" name="New Properties" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

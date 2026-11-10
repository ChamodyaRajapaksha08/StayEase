import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../services/api';
import { StatCard } from '../common/StatCard';
import { Building, Bed, Users, CalendarCheck, DollarSign, AlertCircle, Wrench, Plus, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const OCCUPANCY_COLORS = ['#176B55', '#E2E8F0'];

export const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardApi.getOwner();
        setData(res.data);
      } catch (err) {
        console.error("Failed to load Owner stats:", err);
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
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-main">Property Portfolio Dashboard</h1>
          <p className="text-xs text-muted mt-1">Real-time revenue, occupancy status, and property operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/properties"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Property
          </Link>
          <Link
            to="/rooms"
            className="px-3.5 py-2 text-xs font-semibold text-main bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Bed className="w-4 h-4" /> Manage Rooms
          </Link>
        </div>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Monthly Income"
          value={`$${Number(data?.monthlyIncome || 0).toLocaleString()}`}
          subtitle="Collected Rent this Month"
          icon={DollarSign}
          color="primary"
        />
        <StatCard
          title="Outstanding Rent"
          value={`$${Number(data?.outstandingPayments || 0).toLocaleString()}`}
          subtitle="Pending or Overdue"
          icon={AlertCircle}
          color="danger"
        />
        <StatCard
          title="Properties & Rooms"
          value={`${data?.totalProperties || 0} / ${data?.totalRooms || 0}`}
          subtitle={`${data?.availableRooms || 0} Rooms Available`}
          icon={Building}
          color="info"
        />
        <StatCard
          title="Active Tenants"
          value={data?.activeTenants || 0}
          subtitle={`${data?.pendingBookings || 0} Pending Bookings`}
          icon={Users}
          color="success"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-main">Revenue Collection Trend</h3>
              <p className="text-xs text-muted">Monthly rent collections across all properties</p>
            </div>
            <Link to="/reports" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              Full Reports <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.revenueTrends || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#176B55" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#176B55" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" name="Rent ($)" stroke="#176B55" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Chart */}
        <div className="bg-surface p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <h3 className="text-sm font-semibold text-main mb-1">Occupancy Ratio</h3>
          <p className="text-xs text-muted mb-4">Occupied vs Available Rooms</p>
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.occupancyBreakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  <Cell fill="#176B55" />
                  <Cell fill="#CBD5E1" />
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operational Highlights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/bookings"
          className="bg-surface p-5 rounded-xl border border-slate-200/80 shadow-sm hover:border-primary/50 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted font-medium">Pending Requests</p>
              <h4 className="text-base font-bold text-main">{data?.pendingBookings || 0} New Bookings</h4>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/maintenance"
          className="bg-surface p-5 rounded-xl border border-slate-200/80 shadow-sm hover:border-primary/50 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted font-medium">Maintenance Pending</p>
              <h4 className="text-base font-bold text-main">{data?.pendingMaintenanceRequests || 0} Unresolved</h4>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/rent"
          className="bg-surface p-5 rounded-xl border border-slate-200/80 shadow-sm hover:border-primary/50 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted font-medium">Rent Invoices</p>
              <h4 className="text-base font-bold text-main">Record & Print Receipts</h4>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>
    </div>
  );
};

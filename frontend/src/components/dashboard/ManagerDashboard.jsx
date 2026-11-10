import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../services/api';
import { StatCard } from '../common/StatCard';
import { Building, Users, Bed, CalendarCheck, AlertCircle, Wrench, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export const ManagerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardApi.getManager();
        setData(res.data);
      } catch (err) {
        console.error("Failed to load Manager stats:", err);
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
        <h1 className="text-2xl font-bold text-main">Property Operations Dashboard</h1>
        <p className="text-xs text-muted mt-1">Management oversight for your assigned hostels and residential properties.</p>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Assigned Properties"
          value={data?.assignedPropertiesCount || 0}
          subtitle="Locations in your portfolio"
          icon={Building}
          color="primary"
        />
        <StatCard
          title="Active Tenants"
          value={data?.activeTenants || 0}
          subtitle="Currently residing"
          icon={Users}
          color="success"
        />
        <StatCard
          title="Available Rooms"
          value={data?.availableRooms || 0}
          subtitle={`${data?.occupiedRooms || 0} Occupied Rooms`}
          icon={Bed}
          color="info"
        />
        <StatCard
          title="Pending Bookings"
          value={data?.pendingBookings || 0}
          subtitle="Requires your review"
          icon={CalendarCheck}
          color="warning"
        />
      </div>

      {/* Operational Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupancy across assigned properties */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <h3 className="text-sm font-semibold text-main mb-1">Assigned Properties Capacity</h3>
          <p className="text-xs text-muted mb-4">Occupied vs available room counts per property</p>
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.propertyOccupancy || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="propertyName" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="occupied" name="Occupied Rooms" fill="#176B55" radius={[4, 4, 0, 0]} />
                <Bar dataKey="available" name="Available Rooms" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-surface p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-main mb-1">Attention Required</h3>
            <p className="text-xs text-muted mb-4">Key tasks awaiting operational action</p>

            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-900">Pending Bookings</span>
                  <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    {data?.pendingBookings || 0}
                  </span>
                </div>
                <p className="text-[11px] text-amber-700 mt-1">Review tenant applications and assign rooms</p>
                <Link to="/bookings" className="text-xs text-amber-900 font-semibold mt-2 inline-flex items-center gap-1 hover:underline">
                  Review now <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-900">Maintenance Open</span>
                  <span className="text-xs font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">
                    {data?.pendingMaintenanceRequests || 0}
                  </span>
                </div>
                <p className="text-[11px] text-rose-700 mt-1">Repairs requiring technician dispatch</p>
                <Link to="/maintenance" className="text-xs text-rose-900 font-semibold mt-2 inline-flex items-center gap-1 hover:underline">
                  View tickets <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-main">Unpaid Rent Total</span>
                  <span className="text-xs font-bold text-danger">
                    ${Number(data?.unpaidRent || 0).toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-muted mt-1">Collect and record payments manually</p>
                <Link to="/rent" className="text-xs text-primary font-semibold mt-2 inline-flex items-center gap-1 hover:underline">
                  Record payments <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

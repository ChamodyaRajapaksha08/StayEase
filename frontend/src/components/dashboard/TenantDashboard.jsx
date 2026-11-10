import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../services/api';
import { StatCard } from '../common/StatCard';
import { Badge, getStatusBadgeVariant } from '../common/Badge';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { Building, Bed, DollarSign, Zap, Wrench, Bell, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TenantDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardApi.getTenant();
        setData(res.data);
      } catch (err) {
        console.error("Failed to load Tenant stats:", err);
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

  const prop = data?.currentProperty;
  const room = data?.currentRoom;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-main">Tenant Resident Portal</h1>
        <p className="text-xs text-muted mt-1">Overview of your tenancy, monthly rent, utilities, and service requests.</p>
      </div>

      {/* Current Residence Banner */}
      {prop ? (
        <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3">
          <div className="h-48 md:h-full relative overflow-hidden">
            <ImageWithFallback
              src={prop.imageUrl}
              alt={prop.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
              <Badge variant="primary">{prop.type?.replace('_', ' ')}</Badge>
            </div>
          </div>
          <div className="p-6 md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-main">{prop.name}</h3>
                  <p className="text-xs text-muted flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {prop.address}, {prop.city}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted block">Monthly Rent</span>
                  <span className="text-xl font-extrabold text-primary">${data?.monthlyRent || '0'}</span>
                </div>
              </div>

              {room && (
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-muted block">Assigned Room</span>
                    <span className="font-semibold text-main">{room.roomNumber} ({room.roomType})</span>
                  </div>
                  <div>
                    <span className="text-muted block">Room Capacity</span>
                    <span className="font-semibold text-main">{room.capacity} Bed(s)</span>
                  </div>
                  <div>
                    <span className="text-muted block">Facilities</span>
                    <span className="font-medium text-slate-600 truncate block">{room.facilities || 'Standard amenities'}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/rent"
                className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" /> View Rent & Receipts
              </Link>
              <Link
                to="/maintenance"
                className="px-4 py-2 text-xs font-semibold text-main bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" /> Request Maintenance
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface p-8 rounded-2xl border border-slate-200 text-center">
          <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-main">No Active Tenancy Found</h3>
          <p className="text-xs text-muted max-w-md mx-auto mt-1">
            Browse our list of verified hostels and apartments to find your perfect room and submit a booking request.
          </p>
          <Link
            to="/properties"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-colors shadow-sm"
          >
            Browse Available Properties <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Top 3 Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Rent Status"
          value={data?.rentStatus || 'NONE'}
          subtitle={data?.upcomingDueDate ? `Due on: ${data.upcomingDueDate}` : 'No overdue invoices'}
          icon={DollarSign}
          color={data?.rentStatus === 'PAID' ? 'success' : data?.rentStatus === 'OVERDUE' ? 'danger' : 'warning'}
        />
        <StatCard
          title="Unpaid Utility Bills"
          value={`$${Number(data?.totalUnpaidBills || 0).toFixed(2)}`}
          subtitle="Electricity, water & internet"
          icon={Zap}
          color="warning"
        />
        <StatCard
          title="Open Repairs"
          value={data?.openMaintenanceCount || 0}
          subtitle="Tickets in progress"
          icon={Wrench}
          color="info"
        />
      </div>

      {/* Tables & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Rent Records */}
        <div className="bg-surface p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-main">Recent Rent Invoices</h3>
            <Link to="/rent" className="text-xs text-primary font-medium hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-muted border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.recentRentRecords || []).length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-muted">No rent records yet.</td>
                  </tr>
                ) : (
                  data.recentRentRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-medium text-main">{r.billingMonth}</td>
                      <td className="py-3 px-3 font-semibold text-primary">${r.amount}</td>
                      <td className="py-3 px-3 text-muted">{r.dueDate}</td>
                      <td className="py-3 px-3 text-right">
                        <Badge variant={getStatusBadgeVariant(r.status)} size="sm">{r.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Utility Bills */}
        <div className="bg-surface p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-main">Pending Utility Bills</h3>
            <Link to="/utility-bills" className="text-xs text-primary font-medium hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {(data?.pendingUtilityBills || []).length === 0 ? (
              <p className="text-xs text-muted text-center py-6">All utility bills are settled!</p>
            ) : (
              data.pendingUtilityBills.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-main">{u.billType} ({u.billingMonth})</p>
                      <p className="text-[10px] text-muted">Due date: {u.dueDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-main">${u.amount}</p>
                    <Badge variant="warning" size="sm">UNPAID</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  Download,
  Filter,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Home,
  Wrench,
  CheckCircle,
  Calendar,
  Building,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';

const COLORS = ['#176B55', '#16A36A', '#E9A23B', '#3B82F6', '#8B5CF6', '#EC4899', '#64748B'];

export const ReportsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('income');
  const [loading, setLoading] = useState(true);
  const [downloadingCsv, setDownloadingCsv] = useState(false);

  // Filters
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Report Data
  const [incomeData, setIncomeData] = useState(null);
  const [occupancyData, setOccupancyData] = useState(null);
  const [maintenanceData, setMaintenanceData] = useState(null);

  // Fetch properties for filter
  useEffect(() => {
    const fetchProps = async () => {
      try {
        const res = await api.get('/properties');
        setProperties(res.data || []);
      } catch (err) {
        console.error('Failed to load properties for report filter', err);
      }
    };
    fetchProps();
  }, []);

  // Fetch report data on tab or filter change
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedProperty) params.propertyId = selectedProperty;

        if (activeTab === 'income') {
          if (startDate) params.startDate = startDate;
          if (endDate) params.endDate = endDate;
          const res = await api.get('/reports/income', { params });
          setIncomeData(res.data);
        } else if (activeTab === 'occupancy') {
          const res = await api.get('/reports/occupancy', { params });
          setOccupancyData(res.data);
        } else if (activeTab === 'maintenance') {
          const res = await api.get('/reports/maintenance', { params });
          setMaintenanceData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch report data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [activeTab, selectedProperty, startDate, endDate]);

  const handleExportCsv = async () => {
    setDownloadingCsv(true);
    try {
      const params = {};
      if (selectedProperty) params.propertyId = selectedProperty;
      const res = await api.get('/reports/export/payments-csv', {
        params,
        responseType: 'blob',
      });

      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `StayEase-Payments-Report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export CSV', err);
      alert('Failed to generate CSV export. Please try again.');
    } finally {
      setDownloadingCsv(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Analyze property occupancy, financial flow, and operational efficiency
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={downloadingCsv}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-secondary transition-all shadow-sm disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {downloadingCsv ? 'Exporting...' : 'Export Payments CSV'}
        </button>
      </div>

      {/* Tabs and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium max-w-fit">
          <button
            onClick={() => setActiveTab('income')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'income' ? 'bg-white text-primary font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Income & Revenue
          </button>
          <button
            onClick={() => setActiveTab('occupancy')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'occupancy' ? 'bg-white text-primary font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Occupancy & Rooms
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'maintenance' ? 'bg-white text-primary font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Maintenance Operations
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {activeTab === 'income' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
                title="Start Date"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
                title="End Date"
              />
            </div>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs">Computing report metrics...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: INCOME & REVENUE */}
          {activeTab === 'income' && incomeData && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Rent Collected"
                  value={`$${Number(incomeData.totalRentCollected || 0).toLocaleString()}`}
                  icon={DollarSign}
                  subtitle="Received rent payments"
                />
                <StatCard
                  title="Utility Revenue"
                  value={`$${Number(incomeData.totalUtilityCollected || 0).toLocaleString()}`}
                  icon={TrendingUp}
                  subtitle="Settled utility invoices"
                />
                <StatCard
                  title="Net Revenue"
                  value={`$${Number(incomeData.totalNetRevenue || 0).toLocaleString()}`}
                  icon={CheckCircle}
                  subtitle="Total revenue earned"
                />
                <StatCard
                  title="Outstanding Dues"
                  value={`$${Number(incomeData.totalOutstandingRent || 0).toLocaleString()}`}
                  icon={AlertCircle}
                  subtitle="Pending unpaid dues"
                />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Trend */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Monthly Revenue Trend</h3>
                  <p className="text-xs text-slate-500 mb-6">Rent vs Utility receipts comparison</p>
                  <div className="h-72">
                    {incomeData.monthlyBreakdown?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={incomeData.monthlyBreakdown}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val}`} />
                          <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                          <Bar dataKey="rent" name="Rent ($)" fill="#176B55" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="utility" name="Utilities ($)" fill="#E9A23B" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400">
                        No revenue recorded for selected period
                      </div>
                    )}
                  </div>
                </div>

                {/* Revenue by Property */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Revenue by Property</h3>
                  <p className="text-xs text-slate-500 mb-6">Total collections per property</p>
                  <div className="h-72">
                    {incomeData.propertyBreakdown?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={incomeData.propertyBreakdown} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val}`} />
                          <YAxis dataKey="property" type="category" tick={{ fontSize: 11 }} width={110} />
                          <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Total Income']} />
                          <Bar dataKey="total" fill="#16A36A" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400">
                        No property revenue data found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OCCUPANCY & ROOMS */}
          {activeTab === 'occupancy' && occupancyData && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Overall Occupancy Rate"
                  value={`${occupancyData.overallOccupancyRate || 0}%`}
                  icon={TrendingUp}
                  subtitle="Occupied capacity percentage"
                />
                <StatCard
                  title="Total Rooms"
                  value={occupancyData.totalRooms || 0}
                  icon={Home}
                  subtitle="Registered rooms"
                />
                <StatCard
                  title="Occupied Rooms"
                  value={occupancyData.occupiedRooms || 0}
                  icon={Building}
                  subtitle="Currently tenanted"
                />
                <StatCard
                  title="Available Rooms"
                  value={occupancyData.availableRooms || 0}
                  icon={CheckCircle}
                  subtitle="Ready for move-in"
                />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Occupancy by Property */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Occupancy Rate by Property</h3>
                  <p className="text-xs text-slate-500 mb-6">Percentage of occupied units</p>
                  <div className="h-72">
                    {occupancyData.propertyOccupancyRates?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={occupancyData.propertyOccupancyRates}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="property" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
                          <Tooltip formatter={(value) => [`${value}%`, 'Occupancy']} />
                          <Bar dataKey="occupancyRate" name="Occupancy %" fill="#176B55" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400">
                        No occupancy data available
                      </div>
                    )}
                  </div>
                </div>

                {/* Room Type Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Room Type Distribution</h3>
                  <p className="text-xs text-slate-500 mb-6">Breakdown across accommodation types</p>
                  <div className="h-72">
                    {occupancyData.roomTypeDistribution?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={occupancyData.roomTypeDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={95}
                            paddingAngle={5}
                            dataKey="count"
                            nameKey="type"
                            label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                          >
                            {occupancyData.roomTypeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Rooms']} />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400">
                        No rooms configured
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MAINTENANCE OPERATIONS */}
          {activeTab === 'maintenance' && maintenanceData && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Requests"
                  value={maintenanceData.totalRequests || 0}
                  icon={Wrench}
                  subtitle="All logged tickets"
                />
                <StatCard
                  title="Pending Requests"
                  value={maintenanceData.pendingRequests || 0}
                  icon={AlertCircle}
                  subtitle="Awaiting technician review"
                />
                <StatCard
                  title="In Progress"
                  value={maintenanceData.inProgressRequests || 0}
                  icon={Calendar}
                  subtitle="Active repairs ongoing"
                />
                <StatCard
                  title="Completed"
                  value={maintenanceData.completedRequests || 0}
                  icon={CheckCircle}
                  subtitle="Resolved tickets"
                />
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Tickets by Category</h3>
                  <p className="text-xs text-slate-500 mb-6">Distribution across issue types</p>
                  <div className="h-72">
                    {maintenanceData.categoryBreakdown?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={maintenanceData.categoryBreakdown}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="count" name="Tickets" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400">
                        No maintenance requests recorded
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Breakdown Pie */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Resolution Status Breakdown</h3>
                  <p className="text-xs text-slate-500 mb-6">Current ticket workflow status</p>
                  <div className="h-72">
                    {maintenanceData.statusBreakdown?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={maintenanceData.statusBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="count"
                            nameKey="status"
                            label={({ status, count }) => `${status}: ${count}`}
                          >
                            {maintenanceData.statusBreakdown.map((entry, index) => (
                              <Cell
                                key={`cell-status-${index}`}
                                fill={
                                  entry.status === 'COMPLETED'
                                    ? '#16A36A'
                                    : entry.status === 'IN_PROGRESS'
                                    ? '#3B82F6'
                                    : entry.status === 'SUBMITTED'
                                    ? '#E9A23B'
                                    : '#E45B5B'
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400">
                        No status data found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default ReportsPage;

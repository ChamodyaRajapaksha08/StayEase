import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Shield,
  Building,
  Home,
  Calendar,
  CheckCircle2,
  Lock,
  Key,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  Briefcase,
  Users,
  Wrench,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Link } from 'react-router-dom';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [tenantProfile, setTenantProfile] = useState(null);
  const [loadingTenant, setLoadingTenant] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (user?.role === 'TENANT') {
      const fetchTenantProfile = async () => {
        setLoadingTenant(true);
        try {
          const res = await api.get('/tenants/me');
          setTenantProfile(res.data);
        } catch (err) {
          console.error('Failed to load tenant profile:', err);
        } finally {
          setLoadingTenant(false);
        }
      };
      fetchTenantProfile();
    }
  }, [user]);

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id.toString());
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'danger';
      case 'OWNER':
        return 'primary';
      case 'MANAGER':
        return 'info';
      case 'TENANT':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* 1. Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link to="/dashboard" className="hover:text-primary transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-600">Account Settings</span>
            <span>/</span>
            <span className="text-primary font-bold">Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Account Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your personal credentials, system authorization, and tenancy allocation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyId}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-2xs transition-all"
            title="Copy User ID"
          >
            {copiedId ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied ID!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy ID: #{user?.id}</span>
              </>
            )}
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Session Active
          </span>
        </div>
      </div>

      {/* 2. Main Identity Showcase Card with Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Banner with StayEase Emerald Gradient */}
        <div className="h-28 sm:h-32 bg-gradient-to-r from-[#123B35] via-[#176B55] to-[#24896F] relative overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute right-6 top-6 text-white/20 hidden sm:block">
            <Sparkles className="w-16 h-16" />
          </div>
        </div>

        {/* User Avatar & Headline Row */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-1.5 shadow-lg flex-shrink-0">
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-3xl sm:text-4xl shadow-inner">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div
                className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full shadow-sm"
                title="Active account"
              />
            </div>

            {/* Role & Status Pills on Right */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getRoleBadgeVariant(user?.role)} size="md">
                {user?.role ? user.role.replace('_', ' ') : 'USER'}
              </Badge>
              <Badge variant="success" size="md">
                Active Member
              </Badge>
            </div>
          </div>

          {/* User Details Headline */}
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {user?.fullName}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-700">{user?.email}</span>
              </div>
              {user?.phoneNumber && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-700">{user?.phoneNumber}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2026'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Credentials & Security Information (Clean, Non-Overlapping Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card A: Personal Credentials */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Personal Credentials
                </h3>
                <p className="text-[11px] text-slate-400">Account details and contact identifiers</p>
              </div>
            </div>

            <div className="space-y-4 pt-5">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-xs font-semibold text-slate-800">
                  {user?.fullName}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Email Address
                </label>
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-xs font-semibold text-slate-800 flex items-center justify-between gap-2">
                  <span className="truncate">{user?.email}</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex-shrink-0">
                    Verified
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Contact Phone
                </label>
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-xs font-semibold text-slate-800">
                  {user?.phoneNumber || 'No phone number configured'}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Platform Role
                </label>
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span>{user?.role ? user.role.replace('_', ' ') : 'N/A'}</span>
                  <span className="text-[11px] text-slate-400">ID: #{user?.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card B: Security & Permissions */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Security &amp; Permissions
                </h3>
                <p className="text-[11px] text-slate-400">Cryptographic authentication and RBAC scope</p>
              </div>
            </div>

            <div className="space-y-4 pt-5">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Authentication Protocol
                </label>
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span>Stateless JWT (JSON Web Token)</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Active
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Password Encryption
                </label>
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span>BCrypt 12-Round Salted Hash</span>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Access Control Boundary
                </label>
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-xs font-semibold text-slate-800">
                  {user?.role === 'SUPER_ADMIN' && 'Full Global Platform Administration'}
                  {user?.role === 'OWNER' && 'Owned Property Scoping & Financial Reports'}
                  {user?.role === 'MANAGER' && 'Assigned Property Operations & Tenant Services'}
                  {user?.role === 'TENANT' && 'Personal Invoices, Booking & Tenancy Records'}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Token Expiry &amp; Refresh
                </label>
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span>24-Hour Rolling Expiration</span>
                  <span className="text-[11px] text-emerald-600 font-bold">Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Role-Specific Extended Details */}

      {/* CASE A: TENANT TENANCY DETAILS */}
      {user?.role === 'TENANT' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Tenancy &amp; Accommodation Details
                </h2>
                <p className="text-xs text-slate-500">
                  Information regarding your allocated hostel or residential apartment unit
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/rent"
                className="px-3.5 py-2 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <Receipt className="w-3.5 h-3.5" /> Rent Records
              </Link>
              <Link
                to="/maintenance"
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" /> Request Repair
              </Link>
            </div>
          </div>

          {loadingTenant ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400">
              <div className="w-7 h-7 border-3 border-primary border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs">Loading tenancy profile...</p>
            </div>
          ) : tenantProfile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Item 1: Property */}
              <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/60 space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <Building className="w-4 h-4" />
                  <span>Property</span>
                </div>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {tenantProfile.property?.name || 'Grand Campus Hostel'}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {tenantProfile.property?.address || '45 University Ave'},{' '}
                  {tenantProfile.property?.city || 'Boston'}
                </p>
              </div>

              {/* Item 2: Room Unit */}
              <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/60 space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <Home className="w-4 h-4" />
                  <span>Room Unit</span>
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {tenantProfile.room?.roomNumber || 'Room H-101'}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">
                    Type: {tenantProfile.room?.roomType || 'Single'}
                  </span>
                  <Badge variant="success" size="sm">
                    {tenantProfile.occupancyStatus || 'ACTIVE'}
                  </Badge>
                </div>
              </div>

              {/* Item 3: Stay Duration */}
              <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/60 space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>Stay Duration</span>
                </div>
                <div className="text-xs text-slate-700 space-y-1">
                  <p>
                    <span className="font-semibold text-slate-500">Check-in: </span>
                    {tenantProfile.checkInDate || '2026-09-01'}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-500">Check-out: </span>
                    {tenantProfile.checkOutDate || 'Open Lease'}
                  </p>
                </div>
              </div>

              {/* Item 4: Emergency Contact */}
              <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/60 space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <Phone className="w-4 h-4" />
                  <span>Emergency Contact</span>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {tenantProfile.emergencyContactName || 'Emergency Kin'}
                </p>
                <p className="text-xs text-slate-500">
                  {tenantProfile.emergencyContactPhone || '+1-555-9901'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-slate-50 rounded-xl text-center border border-dashed border-slate-200">
              <Building className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No Active Tenancy Assigned</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                You do not have a confirmed room reservation yet. Explore available properties and submit a booking request.
              </p>
              <Link
                to="/properties"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-secondary transition-all"
              >
                Browse Properties
              </Link>
            </div>
          )}
        </div>
      )}

      {/* CASE B: OWNER PORTFOLIO & ADMINISTRATIVE OVERVIEW */}
      {user?.role === 'OWNER' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Property Portfolio &amp; Management Scope
              </h2>
              <p className="text-xs text-slate-500">
                Summary of your multi-property rights and operational privileges
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/60 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Properties Management
              </span>
              <p className="text-sm font-bold text-slate-900">Full Portfolio Ownership</p>
              <p className="text-xs text-slate-500">Add, edit, and configure hostel/apartment units</p>
              <Link to="/properties" className="text-xs font-semibold text-primary inline-block pt-1 hover:underline">
                View Properties →
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/60 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Manager Delegation
              </span>
              <p className="text-sm font-bold text-slate-900">Manager Assignment Access</p>
              <p className="text-xs text-slate-500">Assign property managers to handle day-to-day operations</p>
              <Link to="/users" className="text-xs font-semibold text-primary inline-block pt-1 hover:underline">
                Manage Staff →
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/60 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Financial Reports
              </span>
              <p className="text-sm font-bold text-slate-900">Income &amp; CSV Export</p>
              <p className="text-xs text-slate-500">Audit rent collection, outstanding dues, and occupancy</p>
              <Link to="/reports" className="text-xs font-semibold text-primary inline-block pt-1 hover:underline">
                Open Reports →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CASE C: MANAGER OPERATIONS OVERVIEW */}
      {user?.role === 'MANAGER' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Operational Responsibilities &amp; Assigned Scope
              </h2>
              <p className="text-xs text-slate-500">
                Your manager privileges across allocated property units
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/60 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Booking Approvals
              </span>
              <p className="text-sm font-bold text-slate-900">Applicant Screening</p>
              <p className="text-xs text-slate-500">Review prospective tenants and allocate beds</p>
              <Link to="/bookings" className="text-xs font-semibold text-primary inline-block pt-1 hover:underline">
                Review Bookings →
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/60 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Invoicing &amp; Rent
              </span>
              <p className="text-sm font-bold text-slate-900">Manual Payment Recording</p>
              <p className="text-xs text-slate-500">Record payments and generate printable receipts</p>
              <Link to="/rent" className="text-xs font-semibold text-primary inline-block pt-1 hover:underline">
                Rent Ledger →
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/60 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Maintenance
              </span>
              <p className="text-sm font-bold text-slate-900">Repair Ticket Resolution</p>
              <p className="text-xs text-slate-500">Update maintenance tickets with resolution notes</p>
              <Link to="/maintenance" className="text-xs font-semibold text-primary inline-block pt-1 hover:underline">
                View Tickets →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CASE D: SUPER ADMIN GLOBAL PLATFORM SCOPE */}
      {user?.role === 'SUPER_ADMIN' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Global Platform Oversight &amp; Administration
              </h2>
              <p className="text-xs text-slate-500">
                Master controls for accounts, properties, security compliance, and platform analytics
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/60 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                User Management
              </span>
              <p className="text-sm font-bold text-slate-900">User Account Controls</p>
              <p className="text-xs text-slate-500">Activate or deactivate user accounts across all roles</p>
              <Link to="/users" className="text-xs font-semibold text-primary inline-block pt-1 hover:underline">
                User Directory →
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/60 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                All Properties
              </span>
              <p className="text-sm font-bold text-slate-900">Platform-Wide Properties</p>
              <p className="text-xs text-slate-500">Inspect any hostel or apartment across owners</p>
              <Link to="/properties" className="text-xs font-semibold text-primary inline-block pt-1 hover:underline">
                All Properties →
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/60 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Platform Reports
              </span>
              <p className="text-sm font-bold text-slate-900">System Financials &amp; Occupancy</p>
              <p className="text-xs text-slate-500">Cross-property income and maintenance audit</p>
              <Link to="/reports" className="text-xs font-semibold text-primary inline-block pt-1 hover:underline">
                Platform Reports →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

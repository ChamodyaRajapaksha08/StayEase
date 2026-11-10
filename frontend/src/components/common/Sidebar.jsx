import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building,
  Bed,
  CalendarCheck,
  Users,
  DollarSign,
  Zap,
  Wrench,
  BarChart3,
  Megaphone,
  UserCheck,
  User,
  LogOut,
  X,
} from 'lucide-react';

export const Sidebar = ({ isMobile = false, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const role = user?.role;

  const getLinks = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return [
          { to: '/dashboard', label: 'Platform Overview', icon: LayoutDashboard },
          { to: '/users', label: 'User Accounts', icon: UserCheck },
          { to: '/properties', label: 'All Properties', icon: Building },
          { to: '/reports', label: 'Platform Reports', icon: BarChart3 },
          { to: '/announcements', label: 'Announcements', icon: Megaphone },
          { to: '/profile', label: 'Admin Profile', icon: User },
        ];
      case 'OWNER':
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/properties', label: 'My Properties', icon: Building },
          { to: '/rooms', label: 'Rooms & Beds', icon: Bed },
          { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
          { to: '/tenants', label: 'Tenants', icon: Users },
          { to: '/rent', label: 'Rent & Payments', icon: DollarSign },
          { to: '/utility-bills', label: 'Utility Bills', icon: Zap },
          { to: '/maintenance', label: 'Maintenance', icon: Wrench },
          { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
          { to: '/announcements', label: 'Announcements', icon: Megaphone },
          { to: '/profile', label: 'Owner Profile', icon: User },
        ];
      case 'MANAGER':
        return [
          { to: '/dashboard', label: 'Manager Dashboard', icon: LayoutDashboard },
          { to: '/properties', label: 'Assigned Properties', icon: Building },
          { to: '/rooms', label: 'Rooms & Beds', icon: Bed },
          { to: '/bookings', label: 'Booking Requests', icon: CalendarCheck },
          { to: '/tenants', label: 'Tenants Directory', icon: Users },
          { to: '/rent', label: 'Rent Records', icon: DollarSign },
          { to: '/utility-bills', label: 'Utility Bills', icon: Zap },
          { to: '/maintenance', label: 'Maintenance Requests', icon: Wrench },
          { to: '/announcements', label: 'Announcements', icon: Megaphone },
          { to: '/profile', label: 'Manager Profile', icon: User },
        ];
      case 'TENANT':
        return [
          { to: '/dashboard', label: 'Tenant Hub', icon: LayoutDashboard },
          { to: '/properties', label: 'Browse Properties', icon: Building },
          { to: '/bookings', label: 'My Bookings', icon: CalendarCheck },
          { to: '/rent', label: 'My Rent & Receipts', icon: DollarSign },
          { to: '/utility-bills', label: 'My Utility Bills', icon: Zap },
          { to: '/maintenance', label: 'Maintenance Requests', icon: Wrench },
          { to: '/announcements', label: 'Announcements', icon: Megaphone },
          { to: '/profile', label: 'My Profile', icon: User },
        ];
      default:
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/profile', label: 'My Profile', icon: User },
        ];
    }
  };

  const navLinks = getLinks();

  const handleNavClick = () => {
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className="w-64 bg-secondary text-slate-200 flex flex-col flex-shrink-0 h-screen sticky top-0 select-none shadow-xl z-30">
      {/* Brand Header */}
      <div className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-white/10 bg-secondary">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
            S
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white block leading-none">
              StayEase
            </span>
            <span className="text-[10px] text-teal-200/80 uppercase tracking-wider font-semibold block mt-1">
              Smart Living
            </span>
          </div>
        </Link>

        {isMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links (Independent Scroll) */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
          Navigation
        </p>
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-sm font-semibold translate-x-0.5'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Quick Info & Logout Fixed at Bottom */}
      <div className="flex-shrink-0 p-4 border-t border-white/10 bg-black/20">
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/profile"
            onClick={handleNavClick}
            className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90 transition-opacity"
            title="View profile"
          >
            <div className="w-8 h-8 rounded-full bg-primary/25 border border-primary/40 text-primary-100 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {user?.fullName}
              </p>
              <p className="text-[10px] text-teal-200/70 truncate capitalize">
                {user?.role?.toLowerCase().replace('_', ' ')}
              </p>
            </div>
          </Link>

          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

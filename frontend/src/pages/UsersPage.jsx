import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Shield,
  Briefcase,
  UserCheck,
  Phone,
  Mail,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { StatCard } from '../components/common/StatCard';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Create User Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'MANAGER',
  });

  // Toggle Confirm Dialog
  const [toggleDialog, setToggleDialog] = useState({
    isOpen: false,
    user: null,
    loading: false,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      const res = await api.get('/users', { params });
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleOpenModal = () => {
    setFormData({
      fullName: '',
      username: '',
      email: '',
      password: '',
      phoneNumber: '',
      role: currentUser?.role === 'SUPER_ADMIN' ? 'OWNER' : 'MANAGER',
    });
    setUsernameEdited(false);
    setErrorMsg('');
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.username || !formData.email || !formData.password) {
      setErrorMsg('Full Name, Username, Email, and Password are required');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setFieldErrors({});
    try {
      await api.post('/users', formData);
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      if (validationErrors && typeof validationErrors === 'object') {
        setFieldErrors(validationErrors);
        setErrorMsg('');
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to create user account');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleConfirm = async () => {
    if (!toggleDialog.user) return;
    setToggleDialog((prev) => ({ ...prev, loading: true }));
    try {
      await api.patch(`/users/${toggleDialog.user.id}/toggle-status`);
      setToggleDialog({ isOpen: false, user: null, loading: false });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle account status');
      setToggleDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  // Metrics
  const totalOwners = users.filter((u) => u.role === 'OWNER').length;
  const totalManagers = users.filter((u) => u.role === 'MANAGER').length;
  const totalTenants = users.filter((u) => u.role === 'TENANT').length;
  const totalAdmins = users.filter((u) => u.role === 'SUPER_ADMIN').length;

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchName = u.fullName?.toLowerCase().includes(term);
    const matchEmail = u.email?.toLowerCase().includes(term);
    const matchPhone = u.phoneNumber?.toLowerCase().includes(term);
    return matchName || matchEmail || matchPhone;
  });
  const visibleFieldErrors = Object.entries(fieldErrors).filter(([, message]) => message);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Accounts Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Directory of registered platform users, property owners, managers, and tenants
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-secondary transition-all shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Create User Account
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Property Owners"
          value={totalOwners}
          icon={Briefcase}
          subtitle="Registered landlords & owners"
        />
        <StatCard
          title="Managers"
          value={totalManagers}
          icon={UserCheck}
          subtitle="Assigned property managers"
        />
        <StatCard
          title="Tenants"
          value={totalTenants}
          icon={Users}
          subtitle="Residents & occupants"
        />
        <StatCard
          title="Super Admins"
          value={totalAdmins}
          icon={Shield}
          subtitle="System operators"
        />
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Role:</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admins</option>
            <option value="OWNER">Property Owners</option>
            <option value="MANAGER">Property Managers</option>
            <option value="TENANT">Tenants</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-xs">Loading user accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-xs">No users found matching your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                  {currentUser?.role === 'SUPER_ADMIN' && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                          {u.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{u.fullName}</p>
                          <p className="text-[11px] text-slate-400">ID: #{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{u.email}</span>
                      </div>
                      {u.phoneNumber && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{u.phoneNumber}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          u.role === 'SUPER_ADMIN'
                            ? 'danger'
                            : u.role === 'OWNER'
                            ? 'primary'
                            : u.role === 'MANAGER'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={u.active ? 'success' : 'danger'}>
                        {u.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    {currentUser?.role === 'SUPER_ADMIN' && (
                      <td className="py-3.5 px-4 text-right">
                        {u.id !== currentUser.id && (
                          <button
                            onClick={() =>
                              setToggleDialog({
                                isOpen: true,
                                user: u,
                                loading: false,
                              })
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              u.active
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            {u.active ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New User Account">
        <form onSubmit={handleCreateUser} className="space-y-4">
          {(errorMsg || visibleFieldErrors.length > 0) && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errorMsg ? (
                <span>{errorMsg}</span>
              ) : (
                <ul className="list-disc pl-4 space-y-1">
                  {visibleFieldErrors.map(([field, message]) => (
                    <li key={field}>{field}: {message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Jane Doe"
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Username *</label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={50}
              value={formData.username}
              onChange={(e) => {
                setUsernameEdited(true);
                setFormData({ ...formData, username: e.target.value });
                setFieldErrors((prev) => ({ ...prev, username: undefined }));
              }}
              placeholder="3-50 characters"
              aria-invalid={Boolean(fieldErrors.username)}
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="mt-1 text-[11px] text-slate-500">Must be unique and 3-50 characters.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => {
                const email = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  email,
                  username: usernameEdited ? prev.username : email.split('@')[0].slice(0, 50),
                }));
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="e.g. jane.doe@example.com"
              aria-invalid={Boolean(fieldErrors.email)}
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+1-555-0199"
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {currentUser?.role === 'SUPER_ADMIN' && (
                <>
                  <option value="OWNER">Property Owner</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </>
              )}
              <option value="MANAGER">Property Manager</option>
              <option value="TENANT">Tenant</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-secondary transition-all disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog for Toggle Status */}
      <ConfirmDialog
        isOpen={toggleDialog.isOpen}
        onClose={() => setToggleDialog({ isOpen: false, user: null, loading: false })}
        onConfirm={handleToggleConfirm}
        title={toggleDialog.user?.active ? 'Deactivate User Account' : 'Activate User Account'}
        message={`Are you sure you want to ${
          toggleDialog.user?.active ? 'deactivate' : 'activate'
        } ${toggleDialog.user?.fullName}'s account (${toggleDialog.user?.email})?`}
        confirmText={toggleDialog.user?.active ? 'Deactivate' : 'Activate'}
        variant={toggleDialog.user?.active ? 'danger' : 'success'}
        loading={toggleDialog.loading}
      />
    </div>
  );
};
export default UsersPage;

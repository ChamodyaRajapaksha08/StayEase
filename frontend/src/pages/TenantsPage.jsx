import React, { useState, useEffect } from 'react';
import { tenantApi, propertyApi, roomApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge, getStatusBadgeVariant } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  Users,
  Search,
  Building,
  Bed,
  Phone,
  Mail,
  Shield,
  Calendar,
  Edit2,
  FileText,
  UserCheck,
} from 'lucide-react';

export const TenantsPage = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'OWNER' || user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN';

  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [keyword, setKeyword] = useState('');

  // Edit Modal
  const [editingTenant, setEditingTenant] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [formData, setFormData] = useState({
    emergencyContact: '',
    idCardNumber: '',
    address: '',
    currentPropertyId: '',
    currentRoomId: '',
    checkInDate: '',
    checkOutDate: '',
    occupancyStatus: 'ACTIVE',
  });

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await tenantApi.getAll({ propertyId: selectedPropertyId || undefined });
      setTenants(res.data);
    } catch (err) {
      console.error("Failed to load tenants:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await propertyApi.getAll();
      setProperties(res.data);
    } catch (err) {
      console.error("Failed to load properties:", err);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [selectedPropertyId]);

  const handleOpenEdit = async (tenant) => {
    setEditingTenant(tenant);
    setFormData({
      emergencyContact: tenant.emergencyContact || '',
      idCardNumber: tenant.idCardNumber || '',
      address: tenant.address || '',
      currentPropertyId: tenant.currentProperty?.id || '',
      currentRoomId: tenant.currentRoom?.id || '',
      checkInDate: tenant.checkInDate || '',
      checkOutDate: tenant.checkOutDate || '',
      occupancyStatus: tenant.occupancyStatus || 'ACTIVE',
    });

    if (tenant.currentProperty?.id) {
      try {
        const roomsRes = await roomApi.getAll({ propertyId: tenant.currentProperty.id });
        setAvailableRooms(roomsRes.data);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editingTenant) return;
    try {
      await tenantApi.update(editingTenant.id, formData);
      setEditingTenant(null);
      fetchTenants();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update tenant profile");
    }
  };

  const filteredTenants = tenants.filter(t => {
    if (!keyword) return true;
    const lower = keyword.toLowerCase();
    return (
      t.user?.fullName?.toLowerCase().includes(lower) ||
      t.user?.email?.toLowerCase().includes(lower) ||
      t.currentProperty?.name?.toLowerCase().includes(lower) ||
      t.currentRoom?.roomNumber?.toLowerCase().includes(lower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-main">Tenant Management Directory</h1>
        <p className="text-xs text-muted mt-1">Review active residents, emergency contacts, check-in history, and assigned beds.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search tenant by name, email, room number..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-slate-700"
          >
            <option value="">All Assigned Properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-main">No Tenants Found</h3>
            <p className="text-xs text-muted max-w-sm mx-auto mt-1">No residents matched your filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-muted uppercase text-[11px] font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Resident Name</th>
                  <th className="py-3 px-4">Property & Room</th>
                  <th className="py-3 px-4">Emergency Contact</th>
                  <th className="py-3 px-4">Check-in Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0">
                          {t.user?.fullName?.charAt(0) || 'T'}
                        </div>
                        <div>
                          <p className="font-bold text-main">{t.user?.fullName}</p>
                          <p className="text-[11px] text-muted">{t.user?.email}</p>
                          {t.user?.phone && <p className="text-[10px] text-slate-400">{t.user?.phone}</p>}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {t.currentProperty ? (
                        <div>
                          <p className="font-semibold text-main">{t.currentProperty.name}</p>
                          <p className="text-[11px] text-primary font-medium">
                            Room {t.currentRoom?.roomNumber || 'Unassigned'} ({t.currentRoom?.roomType || 'Standard'})
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted italic">No property assigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-medium text-slate-700">{t.emergencyContact || 'None provided'}</p>
                        {t.idCardNumber && <p className="text-[10px] font-mono text-slate-400">ID: {t.idCardNumber}</p>}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {t.checkInDate || '-'}
                      {t.checkOutDate && <p className="text-[10px] text-muted">Out: {t.checkOutDate}</p>}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={getStatusBadgeVariant(t.occupancyStatus)}>{t.occupancyStatus}</Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {canManage && (
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Tenant Profile Modal */}
      <Modal
        isOpen={!!editingTenant}
        onClose={() => setEditingTenant(null)}
        title={`Edit Profile: ${editingTenant?.user?.fullName}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-main mb-1">Emergency Contact</label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="e.g. Guardian / Relative (+1-555-0199)"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">ID Card / Passport No.</label>
              <input
                type="text"
                value={formData.idCardNumber}
                onChange={(e) => setFormData({ ...formData, idCardNumber: e.target.value })}
                placeholder="e.g. ID-NY-90210"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-main mb-1">Permanent Home Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 20 Ingram Street, Queens, NY"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-main mb-1">Check-in Date</label>
              <input
                type="date"
                value={formData.checkInDate}
                onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">Check-out Date</label>
              <input
                type="date"
                value={formData.checkOutDate}
                onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-main mb-1">Occupancy Status</label>
            <select
              value={formData.occupancyStatus}
              onChange={(e) => setFormData({ ...formData, occupancyStatus: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
            >
              <option value="ACTIVE">ACTIVE (Currently Residing)</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="FORMER">FORMER (Checked Out)</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditingTenant(null)}
              className="px-4 py-2 text-xs font-medium text-main bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

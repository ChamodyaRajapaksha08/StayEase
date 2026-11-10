import React, { useState, useEffect } from 'react';
import { propertyApi, userApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge, getStatusBadgeVariant } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ImageUploadField } from '../components/common/ImageUploadField';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import {
  Building,
  Plus,
  Search,
  MapPin,
  Phone,
  Bed,
  Users,
  Edit2,
  Trash2,
  UserPlus,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PropertiesPage = () => {
  const { user } = useAuth();
  const isOwnerOrAdmin = user?.role === 'OWNER' || user?.role === 'SUPER_ADMIN';

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [assigningPropertyId, setAssigningPropertyId] = useState(null);
  const [managers, setManagers] = useState([]);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'HOSTEL',
    description: '',
    address: '',
    city: '',
    contactNumber: '',
    imageUrl: '',
    status: 'ACTIVE',
  });

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await propertyApi.getAll({
        keyword: keyword || undefined,
        city: cityFilter || undefined,
      });
      setProperties(res.data);
    } catch (err) {
      console.error("Failed to load properties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [keyword, cityFilter]);

  const loadManagers = async () => {
    try {
      const res = await userApi.getAll({ role: 'MANAGER' });
      setManagers(res.data);
    } catch (err) {
      console.error("Failed to load managers:", err);
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      type: 'HOSTEL',
      description: '',
      address: '',
      city: '',
      contactNumber: user?.phone || '+1-555-0100',
      imageUrl: '',
      status: 'ACTIVE',
    });
    setEditingProperty(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (prop) => {
    setFormData({
      name: prop.name,
      type: prop.type,
      description: prop.description,
      address: prop.address,
      city: prop.city,
      contactNumber: prop.contactNumber,
      imageUrl: prop.imageUrl,
      status: prop.status,
    });
    setEditingProperty(prop);
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProperty) {
        await propertyApi.update(editingProperty.id, formData);
      } else {
        await propertyApi.create(formData);
      }
      setShowAddModal(false);
      fetchProperties();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save property");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await propertyApi.delete(deletingId);
      setDeletingId(null);
      fetchProperties();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete property");
    }
  };

  const handleOpenAssignManager = (propId) => {
    setAssigningPropertyId(propId);
    setSelectedManagerId('');
    loadManagers();
  };

  const handleAssignManager = async () => {
    if (!selectedManagerId || !assigningPropertyId) return;
    try {
      await propertyApi.assignManager(assigningPropertyId, selectedManagerId);
      setAssigningPropertyId(null);
      alert("Manager assigned successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign manager");
    }
  };

  const filteredProperties = properties.filter(p => !typeFilter || p.type === typeFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-main">Properties Directory</h1>
          <p className="text-xs text-muted mt-1">
            {user?.role === 'TENANT' ? 'Browse available residential hostels and apartments' : 'Manage your real estate portfolio, room assignments, and facility details'}
          </p>
        </div>
        {isOwnerOrAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add New Property
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by property name, city, address..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:bg-white"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-slate-700"
          >
            <option value="">All Types</option>
            <option value="HOSTEL">Hostel</option>
            <option value="APARTMENT">Apartment</option>
            <option value="BOARDING_HOUSE">Boarding House</option>
          </select>

          <input
            type="text"
            placeholder="Filter city..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="w-32 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Property Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="bg-surface p-12 rounded-2xl border border-slate-200 text-center">
          <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-main">No Properties Found</h3>
          <p className="text-xs text-muted max-w-sm mx-auto mt-1">Try modifying your search or filter settings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((prop) => (
            <div
              key={prop.id}
              className="bg-surface rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all group"
            >
              {/* Image banner */}
              <div className="h-48 relative overflow-hidden bg-slate-100">
                <ImageWithFallback
                  src={prop.imageUrl}
                  alt={prop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <Badge variant="primary">{prop.type?.replace('_', ' ')}</Badge>
                  <Badge variant={getStatusBadgeVariant(prop.status)} size="sm">{prop.status}</Badge>
                </div>
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-xs font-bold px-2.5 py-1 rounded-md shadow text-secondary">
                  {prop.availableRooms} / {prop.totalRooms} Rooms Avail.
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-main line-clamp-1">{prop.name}</h3>
                  <p className="text-xs text-muted flex items-center gap-1.5 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{prop.address}, {prop.city}</span>
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{prop.contactNumber}</span>
                  </p>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                    {prop.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-muted truncate max-w-[140px]">
                    Owner: <span className="font-semibold text-main">{prop.owner?.fullName}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {isOwnerOrAdmin && (
                      <>
                        <button
                          onClick={() => handleOpenAssignManager(prop.id)}
                          className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors"
                          title="Assign Manager"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(prop)}
                          className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors"
                          title="Edit Property"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(prop.id)}
                          className="p-1.5 text-slate-400 hover:text-danger hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Property"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <Link
                      to={`/rooms?propertyId=${prop.id}`}
                      className="px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      Rooms <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Property Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingProperty ? 'Edit Property' : 'Register New Property'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-main mb-1">Property Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Greenwood Premier Hostel"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-main mb-1">Property Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              >
                <option value="HOSTEL">Hostel</option>
                <option value="BOARDING_HOUSE">Boarding House</option>
                <option value="APARTMENT">Apartment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">Contact Phone</label>
              <input
                type="text"
                required
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                placeholder="+1-555-0100"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-main mb-1">Street Address</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. 45 University Avenue"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Boston"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <ImageUploadField
            imageUrl={formData.imageUrl}
            onChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
            onUploadingChange={setImageUploading}
          />

          <div>
            <label className="block text-xs font-semibold text-main mb-1">Description & Facilities</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Features, rules, amenities, and security overview..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-xs font-medium text-main bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={imageUploading}
              className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm"
            >
              {editingProperty ? 'Update Property' : 'Create Property'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Manager Modal */}
      <Modal
        isOpen={!!assigningPropertyId}
        onClose={() => setAssigningPropertyId(null)}
        title="Assign Manager to Property"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-muted">
            Choose an authorized manager to delegate day-to-day operations, booking requests, and repairs for this property.
          </p>

          <div>
            <label className="block text-xs font-semibold text-main mb-1">Select Manager Account</label>
            <select
              value={selectedManagerId}
              onChange={(e) => setSelectedManagerId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
            >
              <option value="">-- Choose Manager --</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setAssigningPropertyId(null)}
              className="px-4 py-2 text-xs font-medium text-main bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAssignManager}
              disabled={!selectedManagerId}
              className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              Confirm Assignment
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Property"
        message="Are you sure you want to delete or deactivate this property? If active rooms exist, it will be safely deactivated to protect historical bookings."
        confirmText="Proceed"
        danger={true}
      />
    </div>
  );
};

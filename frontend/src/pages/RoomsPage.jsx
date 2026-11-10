import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { roomApi, propertyApi, bookingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge, getStatusBadgeVariant } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ImageUploadField } from '../components/common/ImageUploadField';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import {
  Bed,
  Plus,
  Search,
  Filter,
  DollarSign,
  Users,
  Building,
  CheckCircle,
  CalendarCheck,
  Edit2,
  Trash2,
} from 'lucide-react';

export const RoomsPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialPropId = searchParams.get('propertyId') || '';

  const canManage = user?.role === 'OWNER' || user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN';

  const [rooms, setRooms] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedPropertyId, setSelectedPropertyId] = useState(initialPropId);
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [maxRent, setMaxRent] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);

  // Booking Modal for Tenants
  const [bookingRoom, setBookingRoom] = useState(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);

  // Room Form State
  const [formData, setFormData] = useState({
    propertyId: '',
    roomNumber: '',
    roomType: 'SINGLE',
    capacity: 1,
    availableBeds: 1,
    monthlyRent: '',
    facilities: '',
    imageUrl: '',
    availabilityStatus: 'AVAILABLE',
  });

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await roomApi.getAll({
        propertyId: selectedPropertyId || undefined,
        roomType: selectedType || undefined,
        status: selectedStatus || undefined,
        maxRent: maxRent || undefined,
      });
      setRooms(res.data);
    } catch (err) {
      console.error("Failed to load rooms:", err);
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
    fetchRooms();
  }, [selectedPropertyId, selectedType, selectedStatus, maxRent]);

  const handleOpenAdd = () => {
    setFormData({
      propertyId: selectedPropertyId || (properties[0]?.id || ''),
      roomNumber: '',
      roomType: 'SINGLE',
      capacity: 1,
      availableBeds: 1,
      monthlyRent: '350.00',
      facilities: 'WiFi, Attached Bath, Study Desk, Air Conditioning',
      imageUrl: '',
      availabilityStatus: 'AVAILABLE',
    });
    setEditingRoom(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (room) => {
    setFormData({
      propertyId: room.propertyId,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      capacity: room.capacity,
      availableBeds: room.availableBeds,
      monthlyRent: room.monthlyRent,
      facilities: room.facilities,
      imageUrl: room.imageUrl,
      availabilityStatus: room.availabilityStatus,
    });
    setEditingRoom(room);
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await roomApi.update(editingRoom.id, formData);
      } else {
        await roomApi.create(formData);
      }
      setShowAddModal(false);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save room details");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await roomApi.delete(deletingId);
      setDeletingId(null);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete room");
    }
  };

  const handleOpenBooking = (room) => {
    setBookingRoom(room);
    setCheckInDate(new Date().toISOString().split('T')[0]);
    setCheckOutDate('');
    setBookingNotes('');
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!bookingRoom) return;
    setBookingSubmitting(true);
    try {
      await bookingApi.create({
        propertyId: bookingRoom.propertyId,
        roomId: bookingRoom.id,
        checkInDate,
        checkOutDate: checkOutDate || null,
        notes: bookingNotes,
      });
      alert("Booking request submitted successfully! Your property manager will review and confirm.");
      setBookingRoom(null);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || "Booking request failed");
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-main">Rooms & Bed Accommodations</h1>
          <p className="text-xs text-muted mt-1">Manage individual units, real-time bed capacity, and monthly rates.</p>
        </div>
        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Room Unit
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-surface p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">Property</label>
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-slate-700"
          >
            <option value="">All Properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">Room Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-slate-700"
          >
            <option value="">All Types</option>
            <option value="SINGLE">Single</option>
            <option value="DOUBLE">Double</option>
            <option value="SHARED">Shared (Bunk)</option>
            <option value="DELUXE">Deluxe</option>
            <option value="STUDIO">Studio</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied (Full)</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">Max Monthly Rent ($)</label>
          <input
            type="number"
            placeholder="e.g. 500"
            value={maxRent}
            onChange={(e) => setMaxRent(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-surface p-12 rounded-2xl border border-slate-200 text-center">
          <Bed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-main">No Rooms Match Your Criteria</h3>
          <p className="text-xs text-muted max-w-sm mx-auto mt-1">Try resetting the filters or register a new room unit.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const isFull = room.availableBeds === 0;
            return (
              <div
                key={room.id}
                className="bg-surface rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all group"
              >
                {/* Image */}
                <div className="h-44 relative overflow-hidden bg-slate-100">
                  <ImageWithFallback
                    src={room.imageUrl}
                    alt={`Room ${room.roomNumber}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <Badge variant={isFull ? 'danger' : 'success'}>
                      {room.availabilityStatus}
                    </Badge>
                    <Badge variant="neutral">{room.roomType}</Badge>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm text-xs font-extrabold px-3 py-1 rounded-lg shadow text-primary">
                    ${room.monthlyRent} <span className="text-[10px] font-normal text-muted">/ mo</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-bold text-main">Room {room.roomNumber}</h3>
                        <p className="text-xs text-muted flex items-center gap-1 mt-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" /> {room.propertyName}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                          {room.availableBeds} / {room.capacity} Beds Free
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1">Facilities</p>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {room.facilities || 'Study desk, lighting, high-speed WiFi'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    {canManage ? (
                      <div className="flex items-center gap-2 w-full justify-end">
                        <button
                          onClick={() => handleOpenEdit(room)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-primary bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingId(room.id)}
                          className="px-3 py-1.5 text-xs font-medium text-danger hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenBooking(room)}
                        disabled={isFull || room.availabilityStatus !== 'AVAILABLE'}
                        className={`w-full py-2 text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                          isFull || room.availabilityStatus !== 'AVAILABLE'
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-primary hover:bg-primary-dark text-white'
                        }`}
                      >
                        <CalendarCheck className="w-4 h-4" />
                        {isFull ? 'Fully Occupied' : 'Request to Book'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Room Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingRoom ? `Edit Room ${editingRoom.roomNumber}` : 'Add Room Unit'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-main mb-1">Select Property</label>
            <select
              required
              disabled={!!editingRoom}
              value={formData.propertyId}
              onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
            >
              <option value="">-- Choose Property --</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-main mb-1">Room Number / ID</label>
              <input
                type="text"
                required
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                placeholder="e.g. H-204 or APT-102"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">Room Type</label>
              <select
                value={formData.roomType}
                onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              >
                <option value="SINGLE">Single</option>
                <option value="DOUBLE">Double</option>
                <option value="SHARED">Shared (Bunk)</option>
                <option value="DELUXE">Deluxe</option>
                <option value="STUDIO">Studio</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-main mb-1">Bed Capacity</label>
              <input
                type="number"
                min="1"
                required
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">Available Beds</label>
              <input
                type="number"
                min="0"
                required
                value={formData.availableBeds}
                onChange={(e) => setFormData({ ...formData, availableBeds: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">Monthly Rent ($)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={formData.monthlyRent}
                onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                placeholder="450.00"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-main mb-1">Facilities / Included Amenities</label>
            <input
              type="text"
              value={formData.facilities}
              onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
              placeholder="e.g. Attached Bath, AC, High-Speed WiFi, Wardrobe, Study Desk"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>

          <ImageUploadField
            imageUrl={formData.imageUrl}
            onChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
            onUploadingChange={setImageUploading}
          />

          <div>
            <label className="block text-xs font-semibold text-main mb-1">Availability Status</label>
            <select
              value={formData.availabilityStatus}
              onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
            >
              <option value="AVAILABLE">Available</option>
              <option value="OCCUPIED">Occupied (Full)</option>
              <option value="MAINTENANCE">Under Maintenance</option>
            </select>
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
              {editingRoom ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Tenant Submit Booking Modal */}
      <Modal
        isOpen={!!bookingRoom}
        onClose={() => setBookingRoom(null)}
        title={`Book Room ${bookingRoom?.roomNumber} at ${bookingRoom?.propertyName}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitBooking} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-100">
            <div className="flex justify-between">
              <span className="text-muted">Room Type:</span>
              <span className="font-semibold text-main">{bookingRoom?.roomType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Monthly Rent:</span>
              <span className="font-bold text-primary">${bookingRoom?.monthlyRent} / month</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Available Beds:</span>
              <span className="font-semibold text-emerald-600">{bookingRoom?.availableBeds} Bed(s)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-main mb-1">Expected Check-in Date</label>
            <input
              type="date"
              required
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-main mb-1">Check-out Date (Optional)</label>
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-main mb-1">Notes / Preferences for Property Manager</label>
            <textarea
              rows={2}
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              placeholder="e.g. Need ground floor room, semester exchange student..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setBookingRoom(null)}
              className="px-4 py-2 text-xs font-medium text-main bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bookingSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {bookingSubmitting ? 'Submitting...' : 'Confirm Booking Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Room Unit"
        message="Are you sure you want to permanently delete this room? This action cannot be reversed."
        confirmText="Delete Room"
        danger={true}
      />
    </div>
  );
};

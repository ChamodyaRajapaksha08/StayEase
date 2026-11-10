import React, { useState, useEffect } from 'react';
import { bookingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge, getStatusBadgeVariant } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  CalendarCheck,
  Building,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Check,
  X,
  FileText,
} from 'lucide-react';

export const BookingsPage = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'OWNER' || user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [actionType, setActionType] = useState(null); // 'APPROVED', 'REJECTED', 'CANCELLED'

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getAll({ status: statusFilter || undefined });
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleOpenAction = (booking, type) => {
    setSelectedBooking(booking);
    setActionType(type);
    setActionNotes('');
  };

  const handleConfirmAction = async () => {
    if (!selectedBooking || !actionType) return;
    try {
      await bookingApi.updateStatus(selectedBooking.id, {
        status: actionType,
        notes: actionNotes || `Status updated to ${actionType} by ${user?.fullName}`,
      });
      setSelectedBooking(null);
      setActionType(null);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to update booking to ${actionType}`);
    }
  };

  const statuses = ['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-main">Booking Requests & Reservations</h1>
        <p className="text-xs text-muted mt-1">
          {canManage
            ? 'Review tenant reservations, assign available beds, and approve or decline requests.'
            : 'Track your booking requests, review occupancy agreements, and check confirmation status.'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              statusFilter === st
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st === '' ? 'All Bookings' : st}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-main">No Bookings Found</h3>
            <p className="text-xs text-muted max-w-sm mx-auto mt-1">There are no reservation requests in this category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-muted uppercase text-[11px] font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Property & Room</th>
                  <th className="py-3 px-4">Tenant Info</th>
                  <th className="py-3 px-4">Check-in Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-500">
                      #{b.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-main">{b.property?.name}</p>
                          <p className="text-[11px] text-muted">
                            Room {b.room?.roomNumber} ({b.room?.roomType}) - ${b.room?.monthlyRent}/mo
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-main">{b.tenant?.fullName}</p>
                        <p className="text-[11px] text-muted">{b.tenant?.email}</p>
                        {b.tenant?.phone && <p className="text-[10px] text-slate-400">{b.tenant?.phone}</p>}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {b.checkInDate}
                      </div>
                      {b.checkOutDate && (
                        <p className="text-[10px] text-muted mt-0.5">To: {b.checkOutDate}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={getStatusBadgeVariant(b.status)}>{b.status}</Badge>
                    </td>

                    <td className="py-3.5 px-4 text-muted">
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '-'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {canManage && b.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAction(b, 'APPROVED')}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <Check className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => handleOpenAction(b, 'REJECTED')}
                            className="px-2.5 py-1 text-xs font-semibold text-danger hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      )}

                      {!canManage && b.status === 'PENDING' && (
                        <button
                          onClick={() => handleOpenAction(b, 'CANCELLED')}
                          className="px-2.5 py-1 text-xs font-semibold text-danger hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}

                      {b.notes && (
                        <span className="block text-[10px] text-muted mt-1 italic truncate max-w-[120px] ml-auto">
                          "{b.notes}"
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve / Reject / Cancel Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title={`${actionType === 'APPROVED' ? 'Approve' : actionType === 'REJECTED' ? 'Reject' : 'Cancel'} Booking #${selectedBooking?.id}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
            <p><span className="text-muted">Tenant:</span> <span className="font-semibold text-main">{selectedBooking?.tenant?.fullName}</span></p>
            <p><span className="text-muted">Property:</span> <span className="font-semibold text-main">{selectedBooking?.property?.name}</span></p>
            <p><span className="text-muted">Assigned Room:</span> <span className="font-semibold text-main">Room {selectedBooking?.room?.roomNumber} (${selectedBooking?.room?.monthlyRent}/mo)</span></p>
          </div>

          {actionType === 'APPROVED' && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs leading-relaxed border border-emerald-200">
              <span className="font-bold">System Confirmation: </span>
              Approving this reservation will deduct 1 bed from Room {selectedBooking?.room?.roomNumber}, activate the tenant's profile, and issue their initial monthly rent invoice.
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-main mb-1">Resolution / Notification Notes</label>
            <textarea
              rows={2}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="Add optional notes for the tenant..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSelectedBooking(null)}
              className="px-4 py-2 text-xs font-medium text-main bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleConfirmAction}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-sm ${
                actionType === 'APPROVED'
                  ? 'bg-primary hover:bg-primary-dark'
                  : 'bg-danger hover:bg-rose-700'
              }`}
            >
              Confirm {actionType}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

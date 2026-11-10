import React, { useState, useEffect } from 'react';
import { maintenanceApi, propertyApi, roomApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge, getStatusBadgeVariant } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ImageUploadField } from '../components/common/ImageUploadField';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building,
  User,
  Check,
  X,
  FileText,
} from 'lucide-react';

export const MaintenancePage = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'OWNER' || user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN';

  const [requests, setRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [resolvingRequest, setResolvingRequest] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('IN_PROGRESS');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  // Tenant Submit Form
  const [submitForm, setSubmitForm] = useState({
    propertyId: '',
    roomId: '',
    category: 'ELECTRICAL',
    description: '',
    imageUrl: '',
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await maintenanceApi.getAll({
        status: statusFilter || undefined,
      });
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to load maintenance requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const pRes = await propertyApi.getAll();
      setProperties(pRes.data);
      if (pRes.data.length > 0) {
        const rRes = await roomApi.getAll({ propertyId: pRes.data[0].id });
        setRooms(rRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleOpenSubmit = () => {
    setSubmitForm({
      propertyId: properties[0]?.id || '',
      roomId: rooms[0]?.id || '',
      category: 'ELECTRICAL',
      description: '',
      imageUrl: '',
    });
    setShowSubmitModal(true);
  };

  const handlePropertyChange = async (pId) => {
    setSubmitForm(prev => ({ ...prev, propertyId: pId, roomId: '' }));
    if (pId) {
      try {
        const res = await roomApi.getAll({ propertyId: pId });
        setRooms(res.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      await maintenanceApi.create(submitForm);
      setShowSubmitModal(false);
      fetchRequests();
      alert("Maintenance ticket submitted successfully. A technician will be assigned.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit request");
    }
  };

  const handleOpenResolve = (req) => {
    setResolvingRequest(req);
    setUpdateStatus(req.status === 'SUBMITTED' ? 'IN_PROGRESS' : 'COMPLETED');
    setResolutionNotes(req.resolutionNotes || '');
  };

  const handleConfirmResolve = async (e) => {
    e.preventDefault();
    if (!resolvingRequest) return;
    try {
      await maintenanceApi.updateStatus(resolvingRequest.id, {
        status: updateStatus,
        resolutionNotes,
      });
      setResolvingRequest(null);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const categories = ['', 'ELECTRICAL', 'PLUMBING', 'FURNITURE', 'CLEANING', 'INTERNET', 'HEATING', 'OTHER'];
  const statuses = ['', 'SUBMITTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'];

  const filteredRequests = requests.filter(r => !categoryFilter || r.category === categoryFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-main">Maintenance & Repairs Tracker</h1>
          <p className="text-xs text-muted mt-1">
            {canManage
              ? 'Dispatch technicians, inspect repair progress, and log official resolution notes.'
              : 'Submit repair tickets for electrical, plumbing, WiFi, or room furniture issues.'}
          </p>
        </div>
        <button
          onClick={handleOpenSubmit}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Log Repair Request
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === s
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {s === '' ? 'All Statuses' : s}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-48">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-slate-700"
          >
            <option value="">All Categories</option>
            {categories.filter(Boolean).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-main">No Maintenance Tickets Found</h3>
            <p className="text-xs text-muted max-w-sm mx-auto mt-1">All facilities are functioning smoothly!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-muted uppercase text-[11px] font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Property & Room</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Submitted By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                      #{req.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {req.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-main">{req.property?.name}</p>
                      <p className="text-[11px] text-muted">
                        {req.room ? `Room ${req.room.roomNumber}` : 'General Facility'}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-medium text-main line-clamp-2 leading-relaxed">{req.description}</p>
                      {req.resolutionNotes && (
                        <p className="text-[10px] text-emerald-700 bg-emerald-50 p-1.5 rounded-md mt-1 border border-emerald-100">
                          <span className="font-bold">Resolution: </span>{req.resolutionNotes}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-muted">
                      <p className="font-medium text-main">{req.tenant?.fullName}</p>
                      <p className="text-[10px]">{req.submittedDate ? new Date(req.submittedDate).toLocaleDateString() : ''}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={getStatusBadgeVariant(req.status)}>{req.status}</Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {canManage && (
                        <button
                          onClick={() => handleOpenResolve(req)}
                          className="px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Update Status
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

      {/* Submit Maintenance Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit New Repair Request"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmitRequest} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-main mb-1">Select Property</label>
              <select
                required
                value={submitForm.propertyId}
                onChange={(e) => handlePropertyChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              >
                <option value="">-- Choose Property --</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">Select Room Unit</label>
              <select
                value={submitForm.roomId}
                onChange={(e) => setSubmitForm({ ...submitForm, roomId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              >
                <option value="">-- General Common Area --</option>
                {rooms.map((rm) => (
                  <option key={rm.id} value={rm.id}>Room {rm.roomNumber}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-main mb-1">Issue Category</label>
            <select
              value={submitForm.category}
              onChange={(e) => setSubmitForm({ ...submitForm, category: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
            >
              <option value="ELECTRICAL">Electrical (Lights, Wiring, Sockets)</option>
              <option value="PLUMBING">Plumbing (Drain, Tap, Shower, Leak)</option>
              <option value="FURNITURE">Furniture & Fixtures (Bed, Desk, Lock)</option>
              <option value="CLEANING">Cleaning & Waste Disposal</option>
              <option value="INTERNET">Broadband WiFi & Network</option>
              <option value="HEATING">Heating & Air Conditioning</option>
              <option value="OTHER">Other Repair Need</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-main mb-1">Detailed Description of Problem</label>
            <textarea
              rows={3}
              required
              value={submitForm.description}
              onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
              placeholder="Explain exactly what is malfunctioning and location in the room..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>

          <ImageUploadField
            imageUrl={submitForm.imageUrl}
            onChange={(imageUrl) => setSubmitForm({ ...submitForm, imageUrl })}
            onUploadingChange={setImageUploading}
          />

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowSubmitModal(false)}
              className="px-4 py-2 text-xs font-medium text-main bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={imageUploading}
              className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* Resolve / Update Status Modal */}
      <Modal
        isOpen={!!resolvingRequest}
        onClose={() => setResolvingRequest(null)}
        title={`Update Ticket #${resolvingRequest?.id} (${resolvingRequest?.category})`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmResolve} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-100">
            <p><span className="text-muted">Tenant:</span> <span className="font-semibold text-main">{resolvingRequest?.tenant?.fullName}</span></p>
            <p><span className="text-muted">Issue:</span> <span className="font-medium text-main">{resolvingRequest?.description}</span></p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-main mb-1">Update Status</label>
            <select
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary font-semibold text-main"
            >
              <option value="SUBMITTED">SUBMITTED (Pending review)</option>
              <option value="IN_PROGRESS">IN_PROGRESS (Technician assigned)</option>
              <option value="COMPLETED">COMPLETED (Repaired & verified)</option>
              <option value="REJECTED">REJECTED (Not actionable)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-main mb-1">Resolution Summary / Notes</label>
            <textarea
              rows={3}
              required
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Electrician replaced light fixture and tested voltage..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setResolvingRequest(null)}
              className="px-4 py-2 text-xs font-medium text-main bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm"
            >
              Save Resolution
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

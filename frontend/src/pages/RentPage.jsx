import React, { useState, useEffect } from 'react';
import { rentApi, paymentApi, propertyApi, tenantApi, roomApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge, getStatusBadgeVariant } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ReceiptModal } from '../components/common/ReceiptModal';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Printer,
  CreditCard,
  Building,
  User,
} from 'lucide-react';

export const RentPage = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'OWNER' || user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN';

  const [rentRecords, setRentRecords] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('');

  // Modals
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [payingRecord, setPayingRecord] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Generate Form
  const [generateForm, setGenerateForm] = useState({
    propertyId: '',
    tenantId: '',
    roomId: '',
    billingMonth: new Date().toISOString().slice(0, 7),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: '',
    notes: '',
  });

  // Payment Form
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    referenceNumber: '',
    notes: '',
  });

  const fetchRentRecords = async () => {
    setLoading(true);
    try {
      const res = await rentApi.getAll({
        propertyId: propertyFilter || undefined,
        status: statusFilter || undefined,
      });
      setRentRecords(res.data);
    } catch (err) {
      console.error("Failed to load rent records:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        propertyApi.getAll(),
        tenantApi.getAll(),
      ]);
      setProperties(pRes.data);
      setTenants(tRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchRentRecords();
  }, [statusFilter, propertyFilter]);

  const handleOpenGenerate = () => {
    setGenerateForm({
      propertyId: properties[0]?.id || '',
      tenantId: '',
      roomId: '',
      billingMonth: new Date().toISOString().slice(0, 7),
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: '',
      notes: 'Monthly rent charge',
    });
    setShowGenerateModal(true);
  };

  const handlePropertyChangeInGenerate = async (propId) => {
    setGenerateForm(prev => ({ ...prev, propertyId: propId, roomId: '', tenantId: '' }));
    if (propId) {
      try {
        const res = await roomApi.getAll({ propertyId: propId });
        setRooms(res.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRoomChangeInGenerate = (roomId) => {
    const selectedRoom = rooms.find(r => r.id === parseInt(roomId));
    const matchingTenant = tenants.find(t => t.currentRoom?.id === parseInt(roomId));

    setGenerateForm(prev => ({
      ...prev,
      roomId,
      tenantId: matchingTenant ? matchingTenant.user?.id : prev.tenantId,
      amount: selectedRoom ? selectedRoom.monthlyRent : prev.amount,
    }));
  };

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    try {
      await rentApi.create(generateForm);
      setShowGenerateModal(false);
      fetchRentRecords();
      alert("Monthly rent record generated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate rent record");
    }
  };

  const handleOpenPayment = (record) => {
    setPayingRecord(record);
    const remaining = Number(record.amount) - Number(record.paidAmount || 0);
    setPaymentForm({
      amount: remaining > 0 ? remaining.toFixed(2) : record.amount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'CASH',
      referenceNumber: `REF-${Date.now().toString().slice(-6)}`,
      notes: `Settlement for rent ${record.billingMonth}`,
    });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!payingRecord) return;
    try {
      const res = await paymentApi.create({
        rentRecordId: payingRecord.id,
        tenantId: payingRecord.tenant.id,
        propertyId: payingRecord.property.id,
        amount: parseFloat(paymentForm.amount),
        paymentDate: paymentForm.paymentDate,
        paymentMethod: paymentForm.paymentMethod,
        referenceNumber: paymentForm.referenceNumber,
        notes: paymentForm.notes,
      });

      setPayingRecord(null);
      fetchRentRecords();
      setActiveReceipt(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to record payment");
    }
  };

  const handleViewReceipt = async (record) => {
    try {
      const res = await paymentApi.getAll({ propertyId: record.property?.id });
      const pay = res.data.find(p => p.rentRecordId === record.id);
      if (pay) {
        setActiveReceipt(pay);
      } else {
        alert("Receipt details not found for this record.");
      }
    } catch (err) {
      alert("Failed to retrieve receipt details.");
    }
  };

  const statuses = ['', 'UNPAID', 'OVERDUE', 'PARTIALLY_PAID', 'PAID'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-main">Rent Records & Collections</h1>
          <p className="text-xs text-muted mt-1">
            {canManage
              ? 'Generate monthly rent invoices, record manual tenant payments, and print official receipts.'
              : 'View your rent ledger, track upcoming due dates, and view official payment receipts.'}
          </p>
        </div>
        {canManage && (
          <button
            onClick={handleOpenGenerate}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Issue Monthly Invoice
          </button>
        )}
      </div>

      {/* Filter Tabs & Property Dropdown */}
      <div className="bg-surface p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {st === '' ? 'All Invoices' : st}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-slate-700"
          >
            <option value="">All Properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Rent Records Table */}
      <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : rentRecords.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-main">No Rent Records Found</h3>
            <p className="text-xs text-muted max-w-sm mx-auto mt-1">There are no rent records matching your filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-muted uppercase text-[11px] font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Billing Month</th>
                  <th className="py-3 px-4">Property & Room</th>
                  <th className="py-3 px-4">Tenant Name</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Amount Due</th>
                  <th className="py-3 px-4">Paid Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rentRecords.map((r) => {
                  const isPaid = r.status === 'PAID';
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-main">
                        {r.billingMonth}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-main">{r.property?.name}</p>
                        <p className="text-[11px] text-muted">Room {r.room?.roomNumber}</p>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {r.tenant?.fullName}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        {r.dueDate}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-main">
                        ${r.amount}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-emerald-600">
                        ${r.paidAmount || '0.00'}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant={getStatusBadgeVariant(r.status)}>{r.status}</Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canManage && !isPaid && (
                            <button
                              onClick={() => handleOpenPayment(r)}
                              className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Record Payment
                            </button>
                          )}

                          {isPaid && (
                            <button
                              onClick={() => handleViewReceipt(r)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <Printer className="w-3.5 h-3.5" /> Receipt
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Monthly Invoice Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Generate Monthly Rent Invoice"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleGenerateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-main mb-1">Select Property</label>
            <select
              required
              value={generateForm.propertyId}
              onChange={(e) => handlePropertyChangeInGenerate(e.target.value)}
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
              <label className="block text-xs font-semibold text-main mb-1">Room Unit</label>
              <select
                required
                value={generateForm.roomId}
                onChange={(e) => handleRoomChangeInGenerate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              >
                <option value="">-- Select Room --</option>
                {rooms.map((rm) => (
                  <option key={rm.id} value={rm.id}>Room {rm.roomNumber} (${rm.monthlyRent})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">Tenant Resident</label>
              <select
                required
                value={generateForm.tenantId}
                onChange={(e) => setGenerateForm({ ...generateForm, tenantId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              >
                <option value="">-- Select Tenant --</option>
                {tenants.map((t) => (
                  <option key={t.user.id} value={t.user.id}>{t.user.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-main mb-1">Billing Month</label>
              <input
                type="month"
                required
                value={generateForm.billingMonth}
                onChange={(e) => setGenerateForm({ ...generateForm, billingMonth: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">Due Date</label>
              <input
                type="date"
                required
                value={generateForm.dueDate}
                onChange={(e) => setGenerateForm({ ...generateForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={generateForm.amount}
                onChange={(e) => setGenerateForm({ ...generateForm, amount: e.target.value })}
                placeholder="450.00"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-main mb-1">Invoice Notes</label>
            <textarea
              rows={2}
              value={generateForm.notes}
              onChange={(e) => setGenerateForm({ ...generateForm, notes: e.target.value })}
              placeholder="e.g. Standard monthly rent charge"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowGenerateModal(false)}
              className="px-4 py-2 text-xs font-medium text-main bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm"
            >
              Issue Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={!!payingRecord}
        onClose={() => setPayingRecord(null)}
        title={`Record Payment: ${payingRecord?.billingMonth} Rent`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-100">
            <p><span className="text-muted">Tenant:</span> <span className="font-semibold text-main">{payingRecord?.tenant?.fullName}</span></p>
            <p><span className="text-muted">Property:</span> <span className="font-semibold text-main">{payingRecord?.property?.name}</span></p>
            <p><span className="text-muted">Total Invoice:</span> <span className="font-bold text-main">${payingRecord?.amount}</span></p>
            <p><span className="text-muted">Already Settled:</span> <span className="font-semibold text-emerald-600">${payingRecord?.paidAmount || '0.00'}</span></p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-main mb-1">Amount to Record ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">Payment Date</label>
              <input
                type="date"
                required
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-main mb-1">Payment Method</label>
              <select
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              >
                <option value="CASH">Cash (Hand-to-Hand)</option>
                <option value="BANK_TRANSFER">Bank Wire / ACH</option>
                <option value="ONLINE_MANUAL">Online / Card Manual</option>
                <option value="CHEQUE">Bank Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">Reference / Tran ID</label>
              <input
                type="text"
                value={paymentForm.referenceNumber}
                onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                placeholder="e.g. REF-109283"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-main mb-1">Payment Notes</label>
            <textarea
              rows={2}
              value={paymentForm.notes}
              onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              placeholder="e.g. Deposited into Main Branch account..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPayingRecord(null)}
              className="px-4 py-2 text-xs font-medium text-main bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" /> Save & Generate Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Printable Receipt Modal */}
      <ReceiptModal
        isOpen={!!activeReceipt}
        onClose={() => setActiveReceipt(null)}
        payment={activeReceipt}
      />
    </div>
  );
};

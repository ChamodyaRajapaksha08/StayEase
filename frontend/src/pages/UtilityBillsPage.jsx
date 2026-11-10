import React, { useState, useEffect } from 'react';
import { utilityApi, paymentApi, propertyApi, tenantApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Badge, getStatusBadgeVariant } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ReceiptModal } from '../components/common/ReceiptModal';
import {
  Zap,
  Droplet,
  Wifi,
  Flame,
  Plus,
  Search,
  Filter,
  CheckCircle,
  CreditCard,
  Building,
  User,
  Calculator,
} from 'lucide-react';

export const UtilityBillsPage = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'OWNER' || user?.role === 'MANAGER' || user?.role === 'SUPER_ADMIN';

  const [bills, setBills] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [payingBill, setPayingBill] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Form State
  const [form, setForm] = useState({
    propertyId: '',
    tenantId: '',
    billType: 'ELECTRICITY',
    billingMonth: new Date().toISOString().slice(0, 7),
    previousReading: '',
    currentReading: '',
    unitRate: '0.18',
    amount: '',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Calculate meter units
  const calculateTotal = (prev, curr, rate) => {
    if (prev !== '' && curr !== '' && rate !== '') {
      const units = parseFloat(curr) - parseFloat(prev);
      if (units > 0) {
        return (units * parseFloat(rate)).toFixed(2);
      }
    }
    return '';
  };

  const handleReadingChange = (field, value) => {
    const updated = { ...form, [field]: value };
    const autoAmount = calculateTotal(
      field === 'previousReading' ? value : form.previousReading,
      field === 'currentReading' ? value : form.currentReading,
      field === 'unitRate' ? value : form.unitRate
    );
    if (autoAmount) {
      updated.amount = autoAmount;
    }
    setForm(updated);
  };

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await utilityApi.getAll({ status: statusFilter || undefined });
      setBills(res.data);
    } catch (err) {
      console.error("Failed to load utility bills:", err);
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
    fetchBills();
  }, [statusFilter]);

  const handleOpenCreate = () => {
    setForm({
      propertyId: properties[0]?.id || '',
      tenantId: tenants[0]?.user?.id || '',
      billType: 'ELECTRICITY',
      billingMonth: new Date().toISOString().slice(0, 7),
      previousReading: '1200',
      currentReading: '1350',
      unitRate: '0.18',
      amount: '27.00',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await utilityApi.create({
        ...form,
        previousReading: form.previousReading ? parseFloat(form.previousReading) : null,
        currentReading: form.currentReading ? parseFloat(form.currentReading) : null,
        unitRate: form.unitRate ? parseFloat(form.unitRate) : null,
        amount: parseFloat(form.amount),
      });
      setShowCreateModal(false);
      fetchBills();
      alert("Utility bill created and assigned successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create utility bill");
    }
  };

  const handlePayBill = async (bill) => {
    if (!window.confirm(`Confirm payment settlement of $${bill.amount} for ${bill.billType} bill?`)) return;
    try {
      const res = await paymentApi.create({
        utilityBillId: bill.id,
        tenantId: bill.tenant.id,
        propertyId: bill.property.id,
        amount: bill.amount,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'CASH',
        notes: `${bill.billType} bill settlement for ${bill.billingMonth}`,
      });
      fetchBills();
      setActiveReceipt(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to settle bill");
    }
  };

  const getBillIcon = (type) => {
    switch (type) {
      case 'ELECTRICITY': return <Zap className="w-4 h-4 text-amber-500" />;
      case 'WATER': return <Droplet className="w-4 h-4 text-sky-500" />;
      case 'INTERNET': return <Wifi className="w-4 h-4 text-indigo-500" />;
      case 'GAS': return <Flame className="w-4 h-4 text-orange-500" />;
      default: return <Zap className="w-4 h-4 text-primary" />;
    }
  };

  const filteredBills = bills.filter(b => !typeFilter || b.billType === typeFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-main">Utility Bills Management</h1>
          <p className="text-xs text-muted mt-1">
            {canManage
              ? 'Calculate electricity, water, and broadband meter charges and allocate invoices to residents.'
              : 'Review your personal utility invoices, meter calculations, and payment statuses.'}
          </p>
        </div>
        {canManage && (
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Issue Utility Bill
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-surface p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {['', 'ELECTRICITY', 'WATER', 'INTERNET', 'GAS'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                typeFilter === t
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {t === '' ? 'All Utilities' : t}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="UNPAID">UNPAID</option>
            <option value="PAID">PAID</option>
            <option value="OVERDUE">OVERDUE</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="p-12 text-center">
            <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-main">No Utility Bills Found</h3>
            <p className="text-xs text-muted max-w-sm mx-auto mt-1">There are no utility bills matching this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-muted uppercase text-[11px] font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Utility Type</th>
                  <th className="py-3 px-4">Billing Month</th>
                  <th className="py-3 px-4">Resident</th>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Meter Readings</th>
                  <th className="py-3 px-4">Amount Due</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2 font-bold text-main">
                        <div className="p-1.5 bg-slate-100 rounded-lg">
                          {getBillIcon(b.billType)}
                        </div>
                        {b.billType}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {b.billingMonth}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-main">
                      {b.tenant?.fullName}
                    </td>

                    <td className="py-3.5 px-4 text-muted">
                      {b.property?.name}
                    </td>

                    <td className="py-3.5 px-4 text-muted">
                      {b.previousReading != null && b.currentReading != null ? (
                        <span>
                          {b.previousReading} → {b.currentReading} ({b.currentReading - b.previousReading} units @ ${b.unitRate})
                        </span>
                      ) : (
                        <span>Fixed monthly tariff</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-primary text-sm">
                      ${b.amount}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {b.dueDate}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={getStatusBadgeVariant(b.status)}>{b.status}</Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {canManage && b.status !== 'PAID' && (
                        <button
                          onClick={() => handlePayBill(b)}
                          className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold shadow-sm transition-colors inline-flex items-center gap-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Settle Bill
                        </button>
                      )}
                      {b.status === 'PAID' && (
                        <span className="text-emerald-600 font-medium text-xs flex items-center justify-end gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Settled
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

      {/* Create Utility Bill Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Issue Utility Bill"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-main mb-1">Select Property</label>
              <select
                required
                value={form.propertyId}
                onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              >
                <option value="">-- Choose Property --</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">Assigned Tenant</label>
              <select
                required
                value={form.tenantId}
                onChange={(e) => setForm({ ...form, tenantId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              >
                <option value="">-- Choose Tenant --</option>
                {tenants.map((t) => (
                  <option key={t.user.id} value={t.user.id}>{t.user.fullName} ({t.user.email})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-main mb-1">Utility Category</label>
              <select
                value={form.billType}
                onChange={(e) => setForm({ ...form, billType: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              >
                <option value="ELECTRICITY">Electricity</option>
                <option value="WATER">Water</option>
                <option value="INTERNET">Broadband Internet</option>
                <option value="GAS">Gas / Heating</option>
                <option value="OTHER">Other Utility</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">Billing Month</label>
              <input
                type="month"
                required
                value={form.billingMonth}
                onChange={(e) => setForm({ ...form, billingMonth: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-main">
              <Calculator className="w-4 h-4 text-primary" /> Optional Meter Reading Calculation
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-muted mb-1">Previous Reading</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.previousReading}
                  onChange={(e) => handleReadingChange('previousReading', e.target.value)}
                  placeholder="1200"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] text-muted mb-1">Current Reading</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.currentReading}
                  onChange={(e) => handleReadingChange('currentReading', e.target.value)}
                  placeholder="1350"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] text-muted mb-1">Unit Rate ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.unitRate}
                  onChange={(e) => handleReadingChange('unitRate', e.target.value)}
                  placeholder="0.18"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-main mb-1">Total Bill Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="27.00"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary font-bold text-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-main mb-1">Payment Due Date</label>
              <input
                type="date"
                required
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 text-xs font-medium text-main bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-sm"
            >
              Issue Utility Bill
            </button>
          </div>
        </form>
      </Modal>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={!!activeReceipt}
        onClose={() => setActiveReceipt(null)}
        payment={activeReceipt}
      />
    </div>
  );
};

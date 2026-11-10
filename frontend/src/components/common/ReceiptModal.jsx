import React from 'react';
import { Printer, CheckCircle, Building, Calendar, DollarSign, CreditCard } from 'lucide-react';
import { Modal } from './Modal';

export const ReceiptModal = ({ isOpen, onClose, payment }) => {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Receipt" maxWidth="max-w-lg">
      <div className="receipt-content p-2">
        {/* Header */}
        <div className="text-center pb-6 border-b border-dashed border-slate-200">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-main">StayEase Official Receipt</h2>
          <p className="text-xs text-muted mt-1">Smart Hostel & Apartment Management System</p>
          <div className="mt-3 inline-block bg-slate-100 text-slate-800 text-xs font-mono font-semibold px-3 py-1 rounded-md">
            {payment.receiptNumber}
          </div>
        </div>

        {/* Amount */}
        <div className="py-6 text-center bg-slate-50 rounded-xl my-4 border border-slate-100">
          <p className="text-xs font-medium uppercase text-muted tracking-wider">Amount Paid</p>
          <p className="text-3xl font-extrabold text-primary mt-1">${parseFloat(payment.amount).toFixed(2)}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Status: COMPLETED / VERIFIED</p>
        </div>

        {/* Details Grid */}
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-muted flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-400" /> Payment Date</span>
            <span className="font-medium text-main">{payment.paymentDate}</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-muted flex items-center gap-1.5"><Building className="w-4 h-4 text-slate-400" /> Property</span>
            <span className="font-medium text-main">{payment.property?.name || 'Assigned Property'}</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-muted">Tenant Name</span>
            <span className="font-medium text-main">{payment.tenant?.fullName || 'Tenant'}</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-muted flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-slate-400" /> Payment Method</span>
            <span className="font-medium text-main">{payment.paymentMethod?.replace('_', ' ')}</span>
          </div>

          {payment.referenceNumber && (
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-muted">Reference / Tran ID</span>
              <span className="font-mono text-xs text-main">{payment.referenceNumber}</span>
            </div>
          )}

          {payment.recordedBy && (
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-muted">Recorded By</span>
              <span className="text-xs text-main">{payment.recordedBy.fullName}</span>
            </div>
          )}
        </div>

        {payment.notes && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-muted">
            <span className="font-semibold text-main">Notes: </span>{payment.notes}
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-6 flex justify-end space-x-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-main bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-700 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
        </div>
      </div>
    </Modal>
  );
};

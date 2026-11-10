import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'md' }) => {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    primary: 'bg-teal-50 text-primary border-teal-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${variants[variant] || variants.neutral} ${sizes[size]}`}>
      {children}
    </span>
  );
};

export const getStatusBadgeVariant = (status) => {
  if (!status) return 'neutral';
  const s = status.toUpperCase();
  if (['ACTIVE', 'AVAILABLE', 'APPROVED', 'PAID', 'COMPLETED'].includes(s)) return 'success';
  if (['PENDING', 'PARTIALLY_PAID', 'IN_PROGRESS', 'SUBMITTED', 'MAINTENANCE'].includes(s)) return 'warning';
  if (['INACTIVE', 'REJECTED', 'CANCELLED', 'OVERDUE', 'OCCUPIED'].includes(s)) return 'danger';
  return 'neutral';
};
